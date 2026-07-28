import os
from pathlib import Path

from dotenv import load_dotenv
from openai import OpenAI


ENV_FILE = Path(__file__).resolve().parents[2] / ".env"
DEFAULT_OPENAI_MODEL = "gpt-4o-mini"
_client: OpenAI | None = None


load_dotenv(ENV_FILE, override=False)


def get_openai_client() -> OpenAI | None:
    """
    Return a reusable OpenAI client when a real key is configured.
    """
    global _client

    if _client is None:
        api_key = os.getenv("OPENAI_API_KEY", "").strip()
        if not api_key or api_key == "your_key_here":
            _client = None
        else:
            _client = OpenAI(api_key=api_key)

    return _client


def get_openai_model() -> str:
    """
    Return the model name used by the Sentinel agent.
    """
    return os.getenv("OPENAI_MODEL", DEFAULT_OPENAI_MODEL)
