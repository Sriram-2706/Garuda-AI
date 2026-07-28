from pathlib import PurePosixPath


SUPPORTED_EXTENSIONS = {
    ".py",
    ".js",
    ".ts",
    ".tsx",
    ".jsx",
    ".java",
}

IGNORED_DIRECTORIES = {
    "node_modules",
    "dist",
    "build",
    "coverage",
    "vendor",
    ".git",
}


def filter_repository_files(files: list[dict]) -> list[dict]:
    """
    Return only supported files that are not inside ignored directories.
    """
    filtered_files: list[dict] = []

    for file_info in files:
        if not isinstance(file_info, dict):
            continue

        if not _is_supported_file(file_info):
            continue

        normalized_file = dict(file_info)
        file_path = str(normalized_file.get("path", ""))
        normalized_file["extension"] = _get_file_extension(file_path)
        filtered_files.append(normalized_file)

    return filtered_files


def _is_supported_file(file_info: dict) -> bool:
    file_path = str(file_info.get("path", "")).strip()

    if not file_path:
        return False

    if _is_ignored_path(file_path):
        return False

    file_extension = str(file_info.get("extension") or _get_file_extension(file_path)).lower()
    return file_extension in SUPPORTED_EXTENSIONS


def _is_ignored_path(file_path: str) -> bool:
    path_parts = PurePosixPath(file_path).parts
    return any(part in IGNORED_DIRECTORIES for part in path_parts)


def _get_file_extension(file_path: str) -> str:
    return PurePosixPath(file_path).suffix.lower()
