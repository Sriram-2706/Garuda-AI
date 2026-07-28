import base64
from pathlib import PurePosixPath
from typing import Any
from urllib.parse import quote, urlparse

import requests


GITHUB_API_BASE_URL = "https://api.github.com"
REQUEST_TIMEOUT = 15


def extract_repo_info(repo_url: str) -> dict[str, str]:
    """
    Extract the owner and repository name from a GitHub repository URL.

    Example:
    https://github.com/owner/repository -> {"owner": "owner", "repo": "repository"}
    """
    if not repo_url or not repo_url.strip():
        raise ValueError("Repository URL is required.")

    parsed_url = urlparse(repo_url.strip())

    if parsed_url.scheme not in {"http", "https"}:
        raise ValueError("Repository URL must start with http:// or https://.")

    if parsed_url.netloc.lower() != "github.com":
        raise ValueError("Only github.com repository URLs are supported.")

    path_parts = [part for part in parsed_url.path.strip("/").split("/") if part]

    if len(path_parts) < 2:
        raise ValueError(
            "Invalid GitHub repository URL. Expected format: "
            "https://github.com/owner/repository"
        )

    owner = path_parts[0]
    repo = path_parts[1]

    if repo.endswith(".git"):
        repo = repo[:-4]

    if not owner or not repo:
        raise ValueError("Repository owner and name could not be determined.")

    return {
        "owner": owner,
        "repo": repo,
    }


def get_repo_tree(repo_url: str) -> list[dict[str, str]]:
    """
    Fetch the repository tree recursively using the GitHub REST API.

    Returns a list of files in the format:
    [
        {
            "path": "src/main.py",
            "extension": ".py",
            "type": "blob"
        }
    ]
    """
    repo_info = extract_repo_info(repo_url)
    owner = repo_info["owner"]
    repo = repo_info["repo"]

    repo_details = _github_get(f"/repos/{owner}/{repo}")
    default_branch = repo_details.get("default_branch")

    if not default_branch:
        raise RuntimeError("Could not determine the repository default branch.")

    tree_response = _github_get(
        f"/repos/{owner}/{repo}/git/trees/{default_branch}",
        params={"recursive": "1"},
    )

    tree_items = tree_response.get("tree")
    if not isinstance(tree_items, list):
        raise RuntimeError("GitHub API returned an invalid repository tree response.")

    if tree_response.get("truncated"):
        raise RuntimeError(
            "Repository tree is too large for the GitHub tree API and was truncated."
        )

    files: list[dict[str, str]] = []

    for item in tree_items:
        if item.get("type") != "blob":
            continue

        file_path = item.get("path", "")
        if not file_path:
            continue

        files.append(
            {
                "path": file_path,
                "extension": PurePosixPath(file_path).suffix,
                "type": item["type"],
            }
        )

    return files


def get_file_content(repo_url: str, file_path: str) -> str:
    """
    Fetch a repository file from the GitHub API and return its decoded text content.
    """
    if not file_path or not file_path.strip():
        raise ValueError("File path is required.")

    repo_info = extract_repo_info(repo_url)
    owner = repo_info["owner"]
    repo = repo_info["repo"]

    encoded_path = quote(file_path.strip(), safe="/")
    try:
        file_response = _github_get(f"/repos/{owner}/{repo}/contents/{encoded_path}")
    except RuntimeError as exc:
        raise RuntimeError(f"GitHub API did not return content for {file_path}.") from exc

    if file_response.get("type") != "file":
        raise RuntimeError(f"{file_path} is not a regular file.")

    encoded_content = file_response.get("content")
    if not encoded_content:
        raise RuntimeError(f"GitHub API did not return content for {file_path}.")

    if file_response.get("encoding") != "base64":
        raise RuntimeError(f"Unsupported content encoding for {file_path}.")

    try:
        decoded_bytes = base64.b64decode(encoded_content)
        return decoded_bytes.decode("utf-8", errors="replace")
    except (ValueError, TypeError) as exc:
        raise RuntimeError(f"Could not decode file content for {file_path}.") from exc


def _github_get(endpoint: str, params: dict[str, str] | None = None) -> dict[str, Any]:
    """
    Make a GET request to the GitHub API and return the JSON response.
    """
    url = f"{GITHUB_API_BASE_URL}{endpoint}"

    try:
        response = requests.get(
            url,
            params=params,
            headers={
                "Accept": "application/vnd.github+json",
                "User-Agent": "guardian-ai",
            },
            timeout=REQUEST_TIMEOUT,
        )
    except requests.Timeout as exc:
        raise RuntimeError("Request to GitHub timed out.") from exc
    except requests.RequestException as exc:
        raise RuntimeError(f"Failed to connect to GitHub: {exc}") from exc

    if response.status_code == 404:
        raise ValueError("GitHub repository not found.")

    if response.status_code == 403:
        raise RuntimeError(
            "GitHub API request was denied. You may have hit a rate limit."
        )

    try:
        response.raise_for_status()
    except requests.HTTPError as exc:
        raise RuntimeError(
            f"GitHub API request failed with status code {response.status_code}."
        ) from exc

    try:
        data = response.json()
    except ValueError as exc:
        raise RuntimeError("GitHub API returned invalid JSON data.") from exc

    if not isinstance(data, dict):
        raise RuntimeError("GitHub API returned an unexpected response format.")

    return data
