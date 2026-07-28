import json
from typing import Any

from app.models.openai_client import get_openai_client, get_openai_model
from app.prompts.sentinel_prompt import (
    SENTINEL_SYSTEM_PROMPT,
    build_sentinel_prompt,
)


def _build_analysis_failed_response(file_path: str, agent: str) -> dict[str, Any]:
    return {
        "file": file_path,
        "findings": [],
        "status": "analysis_failed",
        "message": "Unable to complete AI analysis.",
        "agent": agent,
    }


def _normalize_security_finding(finding: Any) -> dict[str, Any] | None:
    if not isinstance(finding, dict):
        return None

    issue = finding.get("issue")
    severity = finding.get("severity")
    evidence = finding.get("evidence")
    recommendation = finding.get("recommendation")
    confidence = finding.get("confidence")
    owasp = finding.get("owasp")
    cwe = finding.get("cwe")

    if issue is None:
        return None

    return {
        "severity": severity if isinstance(severity, str) else None,
        "issue": issue if isinstance(issue, str) else None,
        "evidence": evidence if isinstance(evidence, str) else None,
        "recommendation": recommendation if isinstance(recommendation, str) else None,
        "confidence": confidence if isinstance(confidence, str) else None,
        "owasp": owasp if isinstance(owasp, str) else None,
        "cwe": cwe if isinstance(cwe, str) else None,
    }


def analyze_security(file_path: str, file_content: str) -> dict[str, Any]:
    """
    Analyze a file for security issues using the Sentinel agent.
    """
    client = get_openai_client()
    if client is None:
        return _build_analysis_failed_response(file_path, "sentinel")

    prompt = build_sentinel_prompt(file_path, file_content)

    try:
        response = client.chat.completions.create(
            model=get_openai_model(),
            temperature=0,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": SENTINEL_SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
        )
    except Exception as exc:
        raise RuntimeError(f"Sentinel analysis failed for {file_path}: {exc}") from exc

    content = response.choices[0].message.content
    if not content:
        raise RuntimeError(f"Sentinel returned an empty response for {file_path}.")

    try:
        parsed_response = json.loads(content)
    except json.JSONDecodeError as exc:
        raise RuntimeError(
            f"Sentinel returned invalid JSON for {file_path}."
        ) from exc

    if not isinstance(parsed_response, dict):
        raise RuntimeError(f"Sentinel returned an unexpected response for {file_path}.")

    findings = parsed_response.get("findings")
    normalized_findings: list[dict[str, Any]] = []
    if isinstance(findings, list):
        for finding in findings:
            normalized = _normalize_security_finding(finding)
            if normalized:
                normalized_findings.append(normalized)

    return {
        "file": parsed_response.get("file") if isinstance(parsed_response.get("file"), str) else file_path,
        "summary": parsed_response.get("summary") if isinstance(parsed_response.get("summary"), str) else None,
        "findings": normalized_findings,
    }
