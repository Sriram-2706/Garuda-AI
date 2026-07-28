import json
from typing import Any

from app.models.openai_client import get_openai_client, get_openai_model
from app.prompts.velocity_prompt import (
    VELOCITY_SYSTEM_PROMPT,
    build_velocity_prompt,
)


def analyze_performance(file_path: str, file_content: str) -> dict[str, Any]:
    """
    Analyze a file for performance and scalability issues using the Velocity agent.
    """
    client = get_openai_client()
    if client is None:
        return {
            "file": file_path,
            "findings": [],
            "status": "analysis_failed",
            "message": "Unable to complete AI analysis.",
        }

    prompt = build_velocity_prompt(file_path, file_content)

    try:
        response = client.chat.completions.create(
            model=get_openai_model(),
            temperature=0,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": VELOCITY_SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
        )
    except Exception as exc:
        raise RuntimeError(
            f"Velocity analysis failed for {file_path}: {exc}"
        ) from exc

    content = response.choices[0].message.content
    if not content:
        return {
            "file": file_path,
            "findings": [],
            "status": "analysis_failed",
            "message": "Unable to complete AI analysis.",
        }

    try:
        parsed_response = json.loads(content)
    except json.JSONDecodeError:
        return {
            "file": file_path,
            "findings": [],
            "status": "analysis_failed",
            "message": "Unable to complete AI analysis.",
        }

    if not isinstance(parsed_response, dict):
        return {
            "file": file_path,
            "findings": [],
            "status": "analysis_failed",
            "message": "Unable to complete AI analysis.",
        }

    findings = parsed_response.get("findings")
    if not isinstance(findings, list):
        findings = []

    return {
        "file": parsed_response.get("file") if isinstance(parsed_response.get("file"), str) else file_path,
        "summary": parsed_response.get("summary") if isinstance(parsed_response.get("summary"), str) else None,
        "findings": findings,
    }
