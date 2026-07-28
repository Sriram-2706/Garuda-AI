from fastapi import APIRouter, HTTPException

from app.schemas.request import AnalyzeRequest
from app.schemas.response import RepositoryAnalysisResponse
from app.services.orchestrator_service import run_repository_analysis


router = APIRouter()


@router.post("/analyze", response_model=RepositoryAnalysisResponse)
def analyze_repository(request: AnalyzeRequest) -> RepositoryAnalysisResponse:
    try:
        result = run_repository_analysis(request.github_url)
        return RepositoryAnalysisResponse(**result)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="Unexpected error during repository analysis.",
        ) from exc
