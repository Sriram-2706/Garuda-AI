import json
from typing import Any

from app.models.openai_client import get_openai_client, get_openai_model
from app.prompts.craft_prompt import CRAFT_SYSTEM_PROMPT, build_craft_prompt


VALID_SEVERITIES = {"Low", "Medium", "High"}
SEVERITY_ALIASES = {
    "low": "Low",
    "medium": "Medium",
    "high": "High",
    "critical": "High",
}


def _normalize_severity(value: Any) -> str:
    """
    Normalize model-provided severity values to the allowed Craft severity set.
    """
    if isinstance(value, str):
        normalized_value = SEVERITY_ALIASES.get(value.strip().lower())
        if normalized_value in VALID_SEVERITIES:
            return normalized_value

    return "Low"


def _normalize_finding(finding: Any) -> dict[str, str] | None:
    """
    Normalize a single Craft finding into the expected response shape.
    """
    if not isinstance(finding, dict):
        return None

    issue = str(finding.get("issue") or "").strip()
    description = str(finding.get("description") or "").strip()
    recommendation = str(finding.get("recommendation") or "").strip()

    if not issue:
        return None

    return {
        "severity": _normalize_severity(finding.get("severity")),
        "issue": issue,
        "description": description,
        "recommendation": recommendation,
    }


def analyze_code_quality(file_path: str, file_content: str) -> dict[str, Any]:
    """
    Analyze a file for code quality issues using the Craft agent.
    """
    client = get_openai_client()
    if client is None:
        return {
            "agent": "craft",
            "findings": [],
            "status": "analysis_failed",
            "message": "Unable to complete AI analysis.",
        }

    prompt = build_craft_prompt(file_path, file_content)

    try:
        response = client.chat.completions.create(
            model=get_openai_model(),
            temperature=0,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": CRAFT_SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
        )
    except Exception as exc:
        raise RuntimeError(f"Craft analysis failed for {file_path}: {exc}") from exc

    content = response.choices[0].message.content
    if not content:
        raise RuntimeError(f"Craft returned an empty response for {file_path}.")

    try:
        parsed_response = json.loads(content)
    except json.JSONDecodeError:
        return {
            "agent": "craft",
            "findings": [],
            "status": "analysis_failed",
            "message": "Unable to complete AI analysis.",
        }

    if not isinstance(parsed_response, dict):
        return {
            "agent": "craft",
            "findings": [],
            "status": "analysis_failed",
            "message": "Unable to complete AI analysis.",
        }

    raw_findings = parsed_response.get("findings")
    normalized_findings = []

    if isinstance(raw_findings, list):
        for finding in raw_findings:
            normalized_finding = _normalize_finding(finding)
            if normalized_finding:
                normalized_findings.append(normalized_finding)

    return {
        "agent": "craft",
        "findings": normalized_findings,
    }


def analyze_quality(file_path: str, file_content: str) -> dict[str, Any]:
    """
    Alias for analyze_code_quality to support orchestrator integration.
    """
    return analyze_code_quality(file_path, file_content)
