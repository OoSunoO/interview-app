"""Core data management module for interview-app.

Provides JSON file-based persistence for questions, progress, and review sessions.
Used as a lightweight offline-capable data layer alongside the SQLite backend.
"""
import json
import os
import random
import tempfile
from typing import Any, Optional

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
QUESTIONS_FILE = os.path.join(DATA_DIR, "questions.json")
PROGRESS_FILE = os.path.join(DATA_DIR, "progress.json")
SESSIONS_FILE = os.path.join(DATA_DIR, "sessions.json")

LEVELS = {"new", "learning", "reviewing", "mastered", "correct", "wrong"}


def ensure_dir():
    os.makedirs(DATA_DIR, exist_ok=True)


def _load(filepath: str) -> Any:
    """Load JSON data from file. Returns default empty structure if file missing."""
    # FIX #4: Use isinstance check instead of assert
    if not isinstance(filepath, str):
        raise TypeError(f"Expected str for filepath, got {type(filepath).__name__}")

    if not os.path.exists(filepath):
        return [] if "sessions" in filepath else ({} if "progress" in filepath else [])
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, OSError):
        return [] if "sessions" in filepath else ({} if "progress" in filepath else [])


def _save(filepath: str, data: Any) -> None:
    """Save data to file atomically: write temp file then rename."""
    # FIX #2: Atomic write — write to temp file first, then os.rename()
    ensure_dir()
    fd, tmp_path = tempfile.mkstemp(dir=DATA_DIR, suffix=".tmp")
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            f.flush()
            os.fsync(f.fileno())
        os.replace(tmp_path, filepath)
    except Exception:
        # Clean up temp file on failure
        try:
            os.unlink(tmp_path)
        except OSError:
            pass
        raise


def _next_id(questions: list) -> int:
    """Generate next question ID using max(existing_ids) + 1."""
    # FIX #3: Use max(id)+1 instead of len(questions)+1
    if not questions:
        return 1
    return max(q.get("id", 0) for q in questions) + 1


# ── Questions ────────────────────────────────────────────────────


def load_questions() -> list:
    return _load(QUESTIONS_FILE)


def save_questions(questions: list) -> None:
    _save(QUESTIONS_FILE, questions)


def add_question(question: dict) -> dict:
    questions = load_questions()
    question["id"] = _next_id(questions)
    questions.append(question)
    save_questions(questions)
    return question


def get_question(qid: int) -> Optional[dict]:
    questions = load_questions()
    for q in questions:
        if q.get("id") == qid:
            return q
    return None


# ── Progress ─────────────────────────────────────────────────────


def load_progress() -> dict:
    return _load(PROGRESS_FILE)


def save_progress(progress: dict) -> None:
    _save(PROGRESS_FILE, progress)


def update_level(qid: int, level: str) -> dict:
    """Update a question's learning level. Validates inputs."""
    # FIX #5: Validate level is in LEVELS, handle missing qid
    if level not in LEVELS:
        raise ValueError(
            f"Invalid level '{level}'. Must be one of: {', '.join(sorted(LEVELS))}"
        )

    if get_question(qid) is None:
        raise KeyError(f"Question {qid} not found")

    progress = load_progress()
    entry = progress.get(str(qid))
    if entry is None:
        progress[str(qid)] = {"level": level, "review_count": 0, "wrong_count": 0}
    else:
        entry["level"] = level

    save_progress(progress)
    return progress[str(qid)]


def review(count: int = 10) -> list:
    """Return up to `count` unreviewed questions for a review session.

    Shuffles unreviewed questions randomly so each session gets a varied set.
    Does NOT return mastered questions when unreviewed count is insufficient.
    Only returns questions that have not been reviewed yet.
    """
    # FIX #1: Only return unreviewed questions, max `count`
    questions = load_questions()
    progress = load_progress()

    unreviewed = []
    for q in questions:
        qid = str(q.get("id"))
        if qid not in progress:
            unreviewed.append(q)

    random.shuffle(unreviewed)
    return unreviewed[:count]


# ── Stats ────────────────────────────────────────────────────────


def get_stats() -> dict:
    """Return overview statistics."""
    # FIX #6: Use .get() consistently for dict access
    questions = load_questions()
    progress = load_progress()

    total = len(questions)
    correct = 0
    wrong = 0
    reviewing = 0
    by_category: dict[str, dict] = {}

    for q in questions:
        cat = q.get("category", "unknown")
        if cat not in by_category:
            by_category[cat] = {"total": 0, "done": 0}
        by_category[cat]["total"] += 1

        p = progress.get(str(q.get("id")))
        status = p.get("level") if isinstance(p, dict) else None

        if status == "correct":
            correct += 1
            by_category[cat]["done"] += 1
        elif status == "reviewing":
            reviewing += 1
            by_category[cat]["done"] += 1
        elif status == "wrong":
            wrong += 1

    return {
        "total": total,
        "done": correct + reviewing,
        "correct": correct,
        "wrong": wrong,
        "by_category": by_category,
    }
