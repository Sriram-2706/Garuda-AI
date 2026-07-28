import json
from typing import Any

from app.models.openai_client import get_openai_client, get_openai_model
from app.prompts.advisor_prompt import (
    ADVISOR_SYSTEM_PROMPT,
    build_advisor_prompt,
)


def generate_executive_summary(
    security_findings: dict,
    quality_findings: dict,
    performance_findings: dict,
) -> dict[str, Any]:
    """
    Generate an executive summary using the Advisor agent.
    """
    client = get_openai_client()
    if client is None:
        return {
            "status": "analysis_failed",
            "message": "Unable to complete AI analysis.",
            "overall_risk": None,
            "executive_summary": None,
            "priority_actions": [],
            "confidence": None,
            "total_findings": 0,
        }

    prompt = build_advisor_prompt(
        security_findings,
        quality_findings,
        performance_findings,
    )

    try:
        response = client.chat.completions.create(
            model=get_openai_model(),
            temperature=0,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": ADVISOR_SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
        )
    except Exception:
        return {
            "status": "analysis_failed",
            "message": "Unable to complete AI analysis.",
            "overall_risk": None,
            "executive_summary": None,
            "priority_actions": [],
            "confidence": None,
            "total_findings": 0,
        }

    content = response.choices[0].message.content
    if not content:
        return {
            "status": "analysis_failed",
            "message": "Unable to complete AI analysis.",
            "overall_risk": None,
            "executive_summary": None,
            "priority_actions": [],
            "confidence": None,
            "total_findings": 0,
        }

    try:
        parsed_response = json.loads(content)
    except json.JSONDecodeError:
        return {
            "status": "analysis_failed",
            "message": "Unable to complete AI analysis.",
            "overall_risk": None,
            "executive_summary": None,
            "priority_actions": [],
            "confidence": None,
            "total_findings": 0,
        }

    if not isinstance(parsed_response, dict):
        return {
            "status": "analysis_failed",
            "message": "Unable to complete AI analysis.",
            "overall_risk": None,
            "executive_summary": None,
            "priority_actions": [],
            "confidence": None,
            "total_findings": 0,
        }

    security_count = sum(len(item.get("findings") or []) for item in security_findings if isinstance(item, dict))
    quality_count = sum(len(item.get("findings") or []) for item in quality_findings if isinstance(item, dict))
    performance_count = sum(len(item.get("findings") or []) for item in performance_findings if isinstance(item, dict))

    overall_risk = parsed_response.get("overall_risk")
    executive_summary = parsed_response.get("executive_summary")
    priority_actions = parsed_response.get("priority_actions")
    confidence = parsed_response.get("confidence")
    total_findings = parsed_response.get("total_findings")

    return {
        "status": "ok",
        "message": None,
        "overall_risk": overall_risk if isinstance(overall_risk, str) else None,
        "executive_summary": executive_summary if isinstance(executive_summary, str) else None,
        "priority_actions": priority_actions if isinstance(priority_actions, list) else [],
        "confidence": confidence if isinstance(confidence, str) else None,
        "total_findings": total_findings if isinstance(total_findings, int) else security_count + quality_count + performance_count,
    }
