HIGH_RISK_KEYWORDS = {
    "auth",
    "authorize",
    "authorization",
    "login",
    "jwt",
    "token",
    "security",
    "credential",
    "password",
    "database",
    "secret",
    "config",
    "middleware",
    "service",
    "controller",
    "repository",
    "route",
    "api",
    "docker",
    "kubernetes",
    "terraform",
    "ci",
    "pipeline",
    "infrastructure",
}

LOWER_PRIORITY_KEYWORDS = {
    "ui",
    "component",
    "style",
    "css",
    "asset",
    "icon",
    "doc",
    "readme",
    "test",
}

LARGE_FILE_SIZE_THRESHOLD = 10000
BACKEND_EXTENSIONS = {".py", ".java", ".ts", ".tsx"}
BACKEND_PATH_KEYWORDS = {"backend", "api", "service", "server", "model", "controller", "repository", "config", "routes"}


def score_file(file: dict) -> int:
    """
    Calculate a simple risk score for a repository file.
    """
    score = 0
    file_path = str(file.get("path", "")).lower()

    if any(keyword in file_path for keyword in HIGH_RISK_KEYWORDS):
        score += 50

    if any(keyword in file_path for keyword in LOWER_PRIORITY_KEYWORDS):
        score -= 20

    file_extension = str(file.get("extension", "")).lower()
    if file_extension in BACKEND_EXTENSIONS:
        score += 25

    if any(keyword in file_path for keyword in BACKEND_PATH_KEYWORDS):
        score += 15

    file_size = _get_file_size(file)
    if file_size >= LARGE_FILE_SIZE_THRESHOLD:
        score += 10

    return score


def rank_files(files: list[dict]) -> list[dict]:
    """
    Add a score to each file and return files sorted by descending score.
    """
    ranked_files: list[dict] = []

    for file_info in files:
        if not isinstance(file_info, dict):
            continue

        ranked_file = dict(file_info)
        ranked_file["score"] = score_file(ranked_file)
        ranked_files.append(ranked_file)

    return sorted(ranked_files, key=lambda file_info: file_info["score"], reverse=True)


def select_top_files(files: list[dict], limit: int = 10) -> list[dict]:
    """
    Return the top ranked files up to the given limit.
    """
    if limit <= 0:
        return []

    return rank_files(files)[:limit]


def _get_file_size(file: dict) -> int:
    raw_size = file.get("size", 0)

    try:
        return int(raw_size)
    except (TypeError, ValueError):
        return 0
