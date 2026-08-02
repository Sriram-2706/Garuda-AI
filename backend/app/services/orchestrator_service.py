import os

from app.agents.advisor_agent import generate_executive_summary
from app.agents.craft_agent import analyze_quality
from app.agents.sentinel_agent import analyze_security
from app.agents.velocity_agent import analyze_performance
from app.services.health_score_service import calculate_engineering_health
from app.services.github_service import extract_repo_info, get_file_content, get_repo_tree
from app.services.prioritization_service import rank_files, select_top_files
from app.services.repository_service import filter_repository_files


TOP_FILES = int(os.getenv("TOP_FILES", "10"))


def run_repository_analysis(repo_url: str) -> dict:
    """
    Run the end-to-end repository analysis workflow.
    """
    repo_info = extract_repo_info(repo_url)
    repository_name = repo_info["repo"]

    repository_files = get_repo_tree(repo_url)
    filtered_files = filter_repository_files(repository_files)
    ranked_files = rank_files(filtered_files)
    top_files = select_top_files(ranked_files, limit=TOP_FILES)
    security_findings = []
    quality_findings = []
    performance_findings = []
    file_errors = []

    for file_info in top_files:
        file_path = file_info.get("path", "")

        try:
            file_content = get_file_content(repo_url, file_path)
        except Exception as exc:
            file_errors.append(
                {
                    "file": file_path,
                    "agent": "fetch",
                    "message": str(exc),
                }
            )
            continue

        try:
            security_findings.append(analyze_security(file_path, file_content))
        except Exception as exc:
            file_errors.append(
                {
                    "file": file_path,
                    "agent": "sentinel",
                    "message": str(exc),
                }
            )
            security_findings.append(
                {
                    "file": file_path,
                    "findings": [],
                    "status": "analysis_failed",
                    "message": "Unable to complete AI analysis.",
                }
            )

        try:
            quality_findings.append(analyze_quality(file_path, file_content))
        except Exception as exc:
            file_errors.append(
                {
                    "file": file_path,
                    "agent": "craft",
                    "message": str(exc),
                }
            )
            quality_findings.append(
                {
                    "agent": "craft",
                    "findings": [],
                    "status": "analysis_failed",
                    "message": "Unable to complete AI analysis.",
                }
            )

        try:
            performance_findings.append(analyze_performance(file_path, file_content))
        except Exception as exc:
            file_errors.append(
                {
                    "file": file_path,
                    "agent": "velocity",
                    "message": str(exc),
                }
            )
            performance_findings.append(
                {
                    "file": file_path,
                    "findings": [],
                    "status": "analysis_failed",
                    "message": "Unable to complete AI analysis.",
                }
            )

    advisor_report = generate_executive_summary(
        security_findings,
        quality_findings,
        performance_findings,
    )
    engineering_health = calculate_engineering_health(
        security_findings,
        quality_findings,
        performance_findings,
    )

    return {
        "repository": repository_name,
        "total_files": len(repository_files),
        "candidate_files": len(filtered_files),
        "skipped_files": len(repository_files) - len(filtered_files),
        "top_files": top_files,
        "security_findings": security_findings,
        "quality_findings": quality_findings,
        "performance_findings": performance_findings,
        "advisor_report": advisor_report,
        "engineering_health": engineering_health,
        "file_errors": file_errors,
    }
