from typing import Any


CATEGORY_WEIGHTS = {
    "security": 0.45,
    "maintainability": 0.35,
    "performance": 0.20,
}

SEVERITY_PENALTIES = {
    "critical": 24,
    "high": 16,
    "medium": 8,
    "low": 3,
    "unknown": 5,
}

GRADE_THRESHOLDS = (
    (90, "A"),
    (80, "B"),
    (70, "C"),
    (60, "D"),
    (50, "E"),
)


def _normalize_severity(value: Any) -> str:
    if not isinstance(value, str):
        return "unknown"

    normalized = value.strip().lower()
    if "critical" in normalized:
        return "critical"
    if "high" in normalized:
        return "high"
    if "medium" in normalized:
        return "medium"
    if "low" in normalized:
        return "low"

    return "unknown"


def _flatten_findings(groups: list[dict[str, Any]]) -> list[dict[str, Any]]:
    flattened_findings: list[dict[str, Any]] = []

    for group in groups:
        if not isinstance(group, dict):
            continue

        findings = group.get("findings")
        if not isinstance(findings, list):
            continue

        for finding in findings:
            if isinstance(finding, dict):
                flattened_findings.append(finding)

    return flattened_findings


def _build_category_breakdown(
    label: str,
    findings: list[dict[str, Any]],
    weight: float,
) -> dict[str, Any]:
    severity_counts = {
        "critical": 0,
        "high": 0,
        "medium": 0,
        "low": 0,
        "unknown": 0,
    }

    for finding in findings:
        severity_counts[_normalize_severity(finding.get("severity"))] += 1

    weighted_penalty = sum(
        SEVERITY_PENALTIES[severity] * count
        for severity, count in severity_counts.items()
    )
    bounded_penalty = min(100, weighted_penalty)
    score = max(0, 100 - bounded_penalty)

    return {
        "label": label,
        "score": score,
        "weight": int(weight * 100),
        "findings": len(findings),
        "severity_counts": severity_counts,
        "penalty": bounded_penalty,
    }


def _grade_for_score(score: int) -> str:
    for threshold, grade in GRADE_THRESHOLDS:
        if score >= threshold:
            return grade

    return "F"


def _status_for_score(score: int) -> str:
    if score >= 90:
        return "Excellent"
    if score >= 80:
        return "Strong"
    if score >= 70:
        return "Stable"
    if score >= 60:
        return "Watch"
    if score >= 50:
        return "Needs Attention"

    return "Critical"


def _build_explanation(
    total_findings: int,
    category_breakdown: dict[str, dict[str, Any]],
) -> str:
    if total_findings == 0:
        return (
            "No security, maintainability, or performance findings were identified. "
            "The current analysis indicates a strong engineering health baseline."
        )

    weakest_category_key = min(
        category_breakdown,
        key=lambda key: category_breakdown[key]["score"],
    )
    weakest_category = category_breakdown[weakest_category_key]

    return (
        f"Score reflects {total_findings} findings across security, maintainability, "
        f"and performance. {weakest_category['label']} is currently the largest drag "
        f"on engineering health with a score of {weakest_category['score']}."
    )


def calculate_engineering_health(
    security_findings: list[dict[str, Any]],
    quality_findings: list[dict[str, Any]],
    performance_findings: list[dict[str, Any]],
) -> dict[str, Any]:
    security_flat = _flatten_findings(security_findings)
    maintainability_flat = _flatten_findings(quality_findings)
    performance_flat = _flatten_findings(performance_findings)

    category_breakdown = {
        "security": _build_category_breakdown(
            "Security",
            security_flat,
            CATEGORY_WEIGHTS["security"],
        ),
        "maintainability": _build_category_breakdown(
            "Maintainability",
            maintainability_flat,
            CATEGORY_WEIGHTS["maintainability"],
        ),
        "performance": _build_category_breakdown(
            "Performance",
            performance_flat,
            CATEGORY_WEIGHTS["performance"],
        ),
    }

    overall_score = round(
        sum(
            category["score"] * CATEGORY_WEIGHTS[key]
            for key, category in category_breakdown.items()
        )
    )
    total_findings = (
        len(security_flat)
        + len(maintainability_flat)
        + len(performance_flat)
    )

    return {
        "score": overall_score,
        "grade": _grade_for_score(overall_score),
        "status": _status_for_score(overall_score),
        "total_findings": total_findings,
        "explanation": _build_explanation(total_findings, category_breakdown),
        "categories": category_breakdown,
    }
