from pydantic import BaseModel


class AnalyzeRequest(BaseModel):
    github_url: str
