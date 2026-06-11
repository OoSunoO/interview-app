"""Integration tests for FastAPI endpoints using a temporary SQLite database.

Tests all routes defined in main.py, routes/questions.py, and routes/progress.py.
Each test uses an isolated temp database with seeded questions.
"""
import json
import asyncio

import pytest
from fastapi.testclient import TestClient


SEED_QUESTIONS = [
    {
        "id": 1, "category": "java", "difficulty": "easy",
        "type": "short_answer", "title": "Java Q1", "content": "Content 1",
        "answer": "Answer 1", "hints": [], "tags": ["java", "basics"],
        "options": [], "source": "",
    },
    {
        "id": 2, "category": "java", "difficulty": "medium",
        "type": "multiple_choice", "title": "Java Q2", "content": "Content 2",
        "answer": "Answer 2", "hints": ["Think about it"],
        "tags": ["java", "concurrency"], "options": ["opt A", "opt B"],
        "source": "Google",
    },
    {
        "id": 3, "category": "database", "difficulty": "hard",
        "type": "short_answer", "title": "DB Q3", "content": "Content 3",
        "answer": "Answer 3", "hints": [], "tags": ["sql"],
        "options": [], "source": "",
    },
]


def _build_q(q):
    return (
        q["id"], q["category"], q["difficulty"], q["type"],
        q["title"], q["content"], q["answer"],
        json.dumps(q["hints"]), json.dumps(q["tags"]),
        json.dumps(q["options"]), q["source"],
    )


async def _init_test_db(db_path):
    """Initialize schema and seed questions into a temp SQLite database."""
    import database
    database.DB_PATH = str(db_path)
    from database import init_db, get_db
    await init_db()
    db = await get_db()
    for q in SEED_QUESTIONS:
        await db.execute(
            """INSERT INTO questions (id, category, difficulty, type, title, content, answer, hints, tags, options, source)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            _build_q(q),
        )
    await db.commit()
    await db.close()


async def _seed_progress(db_path, entries: list[tuple[int, str, int, int, str]]):
    """Insert progress rows directly. Each entry: (question_id, status, review_count, wrong_count, next_review_at)."""
    import database
    database.DB_PATH = str(db_path)
    from database import get_db
    db = await get_db()
    now = "2025-01-01T00:00:00"
    e = 2.5
    for qid, status, rc, wc, nra in entries:
        await db.execute(
            """INSERT INTO user_progress (question_id, status, last_reviewed_at, review_count, wrong_count, next_review_at, easiness, repetitions)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (qid, status, now, rc, wc, nra, e, rc),
        )
    await db.commit()
    await db.close()


# ── Fixtures ──


@pytest.fixture
def db_path(tmp_path):
    return tmp_path / "test.db"


@pytest.fixture
def client(db_path, monkeypatch):
    monkeypatch.setattr("database.DB_PATH", str(db_path))
    asyncio.run(_init_test_db(db_path))
    from main import app
    with TestClient(app) as c:
        yield c


@pytest.fixture
def empty_client(tmp_path, monkeypatch):
    """Client with no seeded questions — empty database."""
    db_path = tmp_path / "empty.db"
    monkeypatch.setattr("database.DB_PATH", str(db_path))
    asyncio.run(_init_test_db(db_path))
    from main import app
    # Wipe the seeded questions
    async def _wipe():
        from database import get_db
        db = await get_db()
        await db.execute("DELETE FROM questions")
        await db.commit()
        await db.close()
    asyncio.run(_wipe())
    with TestClient(app) as c:
        yield c


# ── Health & Version ──


class TestHealth:
    def test_health(self, client):
        resp = client.get("/api/health")
        assert resp.status_code == 200
        assert resp.json() == {"status": "ok"}

    def test_version(self, client):
        resp = client.get("/api/version")
        assert resp.status_code == 200
        data = resp.json()
        assert "version" in data
        assert data["name"] == "面试题 API"


# ── GET /api/questions ──


class TestListQuestions:
    def test_list_all(self, client):
        resp = client.get("/api/questions")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 3
        item = data[0]
        assert item["title"] == "Java Q1"
        assert "id" in item and "category" in item and "difficulty" in item
        assert "status" in item and "wrong_count" in item
        assert "answer" not in item and "content" not in item

    def test_empty(self, empty_client):
        resp = empty_client.get("/api/questions")
        assert resp.json() == []

    def test_filter_by_category(self, client):
        resp = client.get("/api/questions", params={"category": "java"})
        assert len(resp.json()) == 2

        resp = client.get("/api/questions", params={"category": "database"})
        assert len(resp.json()) == 1

        resp = client.get("/api/questions", params={"category": "nonexistent"})
        assert resp.json() == []

    def test_filter_by_difficulty(self, client):
        resp = client.get("/api/questions", params={"difficulty": "easy"})
        assert len(resp.json()) == 1

    def test_filter_by_type(self, client):
        resp = client.get("/api/questions", params={"type": "multiple_choice"})
        assert len(resp.json()) == 1

    def test_filter_by_tag(self, client):
        resp = client.get("/api/questions", params={"tag": "sql"})
        assert len(resp.json()) == 1

        resp = client.get("/api/questions", params={"tag": "java"})
        assert len(resp.json()) == 2

    def test_search(self, client):
        resp = client.get("/api/questions", params={"search": "Java"})
        assert len(resp.json()) == 2

        resp = client.get("/api/questions", params={"search": "DB"})
        assert len(resp.json()) == 1

        resp = client.get("/api/questions", params={"search": "Content"})
        assert len(resp.json()) == 3

        resp = client.get("/api/questions", params={"search": "NoMatch"})
        assert resp.json() == []

    def test_pagination(self, client):
        resp = client.get("/api/questions", params={"page": 1, "page_size": 2})
        assert len(resp.json()) == 2

        resp = client.get("/api/questions", params={"page": 2, "page_size": 2})
        assert len(resp.json()) == 1

        resp = client.get("/api/questions", params={"page": 99, "page_size": 10})
        assert resp.json() == []

    def test_filter_by_status_new(self, client):
        resp = client.get("/api/questions", params={"status": "new"})
        assert len(resp.json()) == 3

        resp = client.get("/api/questions", params={"status": "correct"})
        assert resp.json() == []

    def test_filter_by_status_with_progress(self, client):
        client.post("/api/progress/1", json={"status": "correct"})

        resp = client.get("/api/questions", params={"status": "correct"})
        data = resp.json()
        assert len(data) == 1
        assert data[0]["id"] == 1

    def test_list_item_has_source(self, client):
        resp = client.get("/api/questions")
        items = {i["id"]: i for i in resp.json()}
        assert items[2]["source"] == "Google"
        assert items[1]["source"] == ""


# ── GET /api/questions/{id} ──


class TestGetQuestion:
    def test_get_existing(self, client):
        resp = client.get("/api/questions/1")
        assert resp.status_code == 200
        data = resp.json()
        assert data["id"] == 1
        assert data["title"] == "Java Q1"
        assert data["content"] == "Content 1"
        assert data["answer"] == "Answer 1"
        assert data["hints"] == []
        assert data["tags"] == ["java", "basics"]
        assert data["options"] == []
        assert data["source"] == ""
        assert data["status"] == "new"
        assert data["review_count"] == 0
        assert data["wrong_count"] == 0
        assert data["notes"] == ""

    def test_get_with_progress(self, client):
        client.post("/api/progress/1", json={"status": "correct"})

        data = client.get("/api/questions/1").json()
        assert data["status"] == "correct"
        assert data["review_count"] == 1

    def test_get_with_multiple_choice_options(self, client):
        data = client.get("/api/questions/2").json()
        assert data["options"] == ["opt A", "opt B"]
        assert data["type"] == "multiple_choice"

    def test_get_nonexistent(self, client):
        resp = client.get("/api/questions/9999")
        assert resp.status_code == 404
        assert resp.json()["detail"] == "Question not found"


# ── POST /api/progress/{id} ──


class TestUpdateProgress:
    def test_first_correct(self, client):
        resp = client.post("/api/progress/1", json={"status": "correct"})
        assert resp.status_code == 200
        assert resp.json() == {"ok": True}

    def test_first_wrong(self, client):
        resp = client.post("/api/progress/1", json={"status": "wrong"})
        assert resp.status_code == 200

    def test_nonexistent_question(self, client):
        resp = client.post("/api/progress/9999", json={"status": "correct"})
        assert resp.status_code == 404

    def test_wrong_then_correct_becomes_reviewing(self, client):
        client.post("/api/progress/1", json={"status": "wrong"})
        client.post("/api/progress/1", json={"status": "correct"})

        data = client.get("/api/questions/1").json()
        assert data["status"] == "reviewing"

    def test_wrong_increments_wrong_count(self, client):
        client.post("/api/progress/1", json={"status": "wrong"})
        client.post("/api/progress/1", json={"status": "wrong"})

        data = client.get("/api/questions/1").json()
        assert data["wrong_count"] == 2

    def test_increments_review_count(self, client):
        client.post("/api/progress/1", json={"status": "correct"})
        client.post("/api/progress/1", json={"status": "correct"})

        data = client.get("/api/questions/1").json()
        assert data["review_count"] == 2

    def test_persists_notes(self, client):
        client.post("/api/progress/1", json={"status": "wrong", "notes": "Forgot the syntax"})

        data = client.get("/api/questions/1").json()
        assert data["notes"] == "Forgot the syntax"

    def test_updates_notes_append(self, client):
        """Subsequent notes with COALESCE should preserve original if new is null."""
        client.post("/api/progress/1", json={"status": "wrong", "notes": "First note"})
        client.post("/api/progress/1", json={"status": "correct"})

        data = client.get("/api/questions/1").json()
        assert data["notes"] == "First note"

    def test_duration_seconds(self, client):
        client.post("/api/progress/1", json={"status": "correct", "duration_seconds": 42})

        # Verify no error — session row was created
        assert client.get("/api/progress/stats").json()["correct"] == 1


# ── GET /api/progress/stats ──


class TestStats:
    def test_initial_stats(self, client):
        resp = client.get("/api/progress/stats")
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] == 3
        assert data["done"] == 0
        assert data["correct"] == 0
        assert data["wrong"] == 0

    def test_stats_after_updates(self, client):
        client.post("/api/progress/1", json={"status": "correct"})
        client.post("/api/progress/2", json={"status": "wrong"})

        data = client.get("/api/progress/stats").json()
        assert data["correct"] == 1
        assert data["wrong"] == 1
        assert data["done"] == 1  # only 'correct' counts as done
        assert data["total"] == 3

    def test_stats_by_category(self, client):
        client.post("/api/progress/1", json={"status": "correct"})

        data = client.get("/api/progress/stats").json()
        cat = data["by_category"]
        assert cat["java"]["total"] == 2
        assert cat["java"]["done"] == 1
        assert cat["database"]["total"] == 1
        assert cat["database"]["done"] == 0


# ── GET /api/progress/wrong ──


class TestWrongQuestions:
    def test_no_wrong(self, client):
        resp = client.get("/api/progress/wrong")
        assert resp.status_code == 200
        assert resp.json() == []

    def test_lists_wrong_questions(self, client):
        client.post("/api/progress/1", json={"status": "wrong"})
        client.post("/api/progress/2", json={"status": "correct"})

        data = client.get("/api/progress/wrong").json()
        assert len(data) == 1
        assert data[0]["id"] == 1

    def test_lists_reviewing_questions(self, client):
        """Questions with status 'reviewing' also appear in wrong book."""
        client.post("/api/progress/1", json={"status": "wrong"})
        client.post("/api/progress/1", json={"status": "correct"})  # becomes 'reviewing'

        data = client.get("/api/progress/wrong").json()
        assert len(data) == 1
        assert data[0]["id"] == 1
        assert data[0]["wrong_count"] == 1


# ── GET /api/progress/knowledge ──


class TestKnowledge:
    def test_knowledge_all_new(self, client):
        data = client.get("/api/progress/knowledge").json()
        names = {c["name"] for c in data}
        assert names == {"java", "database"}
        for cat in data:
            assert cat["done"] == 0

    def test_knowledge_reflects_progress(self, client):
        client.post("/api/progress/1", json={"status": "correct"})  # java/basics
        client.post("/api/progress/3", json={"status": "correct"})  # database/sql

        data = {c["name"]: c for c in client.get("/api/progress/knowledge").json()}
        assert data["java"]["done"] == 1
        assert data["database"]["done"] == 1

    def test_knowledge_tags(self, client):
        client.post("/api/progress/1", json={"status": "correct"})  # java/basics

        data = {c["name"]: c for c in client.get("/api/progress/knowledge").json()}
        java_tags = {t["name"]: t for t in data["java"]["tags"]}
        assert java_tags["basics"]["done"] == 1
        assert java_tags["concurrency"]["done"] == 0

    def test_knowledge_labels(self, client):
        data = {c["name"]: c for c in client.get("/api/progress/knowledge").json()}
        assert data["database"]["label"] == "数据库"
        assert data["java"]["label"] == "Java"


# ── GET /api/progress/review/due ──


class TestDueReviews:
    def test_no_due_reviews(self, client, db_path):
        resp = client.get("/api/progress/review/due")
        assert resp.status_code == 200
        assert resp.json() == []

    def test_returns_due_wrong_questions(self, client, db_path):
        """Insert a wrong-answered question with a past next_review_at."""
        asyncio.run(_seed_progress(db_path, [
            (1, "wrong", 1, 1, "2024-01-01T00:00:00"),
        ]))

        resp = client.get("/api/progress/review/due")
        data = resp.json()
        assert len(data) == 1
        assert data[0]["id"] == 1
        assert data[0]["title"] == "Java Q1"

    def test_ignores_correct_questions(self, client, db_path):
        """Correct questions should not show up in due reviews."""
        asyncio.run(_seed_progress(db_path, [
            (1, "wrong", 1, 1, "2024-01-01T00:00:00"),
            (2, "correct", 2, 0, "2024-01-01T00:00:00"),
        ]))

        data = client.get("/api/progress/review/due").json()
        ids = [d["id"] for d in data]
        assert 2 not in ids

    def test_ignores_future_review_dates(self, client, db_path):
        """Questions with future next_review_at should not appear in due."""
        future = "2099-12-31T00:00:00"
        past = "2024-01-01T00:00:00"
        asyncio.run(_seed_progress(db_path, [
            (1, "wrong", 1, 1, future),
            (2, "wrong", 1, 1, past),
        ]))
        data = client.get("/api/progress/review/due").json()
        ids = [d["id"] for d in data]
        assert 1 not in ids
        assert 2 in ids


# ── SM-2 interval progression ──


class TestSM2Progression:
    def test_three_correct_reviews_progresses_intervals(self, client):
        """SM-2: 3 correct reviews → review_count increments properly."""
        for _ in range(3):
            client.post("/api/progress/1", json={"status": "correct"})
        data = client.get("/api/questions/1").json()
        assert data["review_count"] == 3

    def test_wrong_after_correct_clears_status(self, client):
        """SM-2: correct then wrong should update status and increment wrong_count."""
        client.post("/api/progress/1", json={"status": "correct"})
        client.post("/api/progress/1", json={"status": "wrong"})
        data = client.get("/api/questions/1").json()
        assert data["status"] == "wrong"
        assert data["wrong_count"] == 1

    def test_reviewing_counts_as_done_in_stats(self, client):
        """A question with 'reviewing' (wrong→correct) status counts as done."""
        client.post("/api/progress/1", json={"status": "wrong"})
        client.post("/api/progress/1", json={"status": "correct"})  # becomes reviewing
        stats = client.get("/api/progress/stats").json()
        assert stats["done"] == 1
        assert stats["correct"] == 0  # reviewing != correct
        assert stats["wrong"] == 0

    def test_bad_next_review_at_falls_back_to_interval_1(self, client, db_path):
        """Invalid next_review_at in existing progress should fall back to interval=1 (lines 66-67)."""
        asyncio.run(_seed_progress(db_path, [
            (1, "wrong", 1, 1, "not-a-date"),
        ]))
        client.post("/api/progress/1", json={"status": "correct"})
        data = client.get("/api/questions/1").json()
        assert data["status"] == "reviewing"


# ── POST /api/progress/{id}/bookmark & GET /api/progress/bookmarks ──


class TestBookmarks:
    def test_toggle_bookmark_on(self, client):
        resp = client.post("/api/progress/1/bookmark", json={"bookmarked": True})
        assert resp.status_code == 200
        assert resp.json()["bookmarked"] is True

    def test_toggle_bookmark_off(self, client):
        client.post("/api/progress/1/bookmark", json={"bookmarked": True})
        resp = client.post("/api/progress/1/bookmark", json={"bookmarked": False})
        assert resp.json()["bookmarked"] is False

    def test_bookmark_nonexistent_question(self, client):
        resp = client.post("/api/progress/9999/bookmark", json={"bookmarked": True})
        assert resp.status_code == 404

    def test_list_bookmarks_empty(self, client):
        resp = client.get("/api/progress/bookmarks")
        assert resp.json() == []

    def test_list_bookmarks(self, client):
        client.post("/api/progress/1/bookmark", json={"bookmarked": True})
        client.post("/api/progress/2/bookmark", json={"bookmarked": True})

        data = client.get("/api/progress/bookmarks").json()
        assert len(data) == 2
        ids = [d["id"] for d in data]
        assert 1 in ids and 2 in ids

    def test_list_bookmarks_excludes_unbookmarked(self, client):
        client.post("/api/progress/1/bookmark", json={"bookmarked": True})
        client.post("/api/progress/2/bookmark", json={"bookmarked": False})

        data = client.get("/api/progress/bookmarks").json()
        assert len(data) == 1
        assert data[0]["id"] == 1


# ── POST /api/quick-review/start ──


class TestQuickReviewStart:
    def test_start_returns_random_questions(self, client):
        resp = client.post("/api/quick-review/start", json={"count": 2})
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 2
        assert "id" in data[0] and "title" in data[0] and "category" in data[0]

    def test_start_filter_by_category(self, client):
        resp = client.post("/api/quick-review/start", json={"count": 10, "category": "java"})
        data = resp.json()
        assert all(q["category"] == "java" for q in data)

    def test_start_respects_count(self, client):
        resp = client.post("/api/quick-review/start", json={"count": 1})
        assert len(resp.json()) == 1

    def test_start_empty_category(self, client):
        resp = client.post("/api/quick-review/start", json={"count": 10, "category": "nonexistent"})
        assert resp.json() == []

    def test_start_filter_by_difficulty(self, client):
        resp = client.post("/api/quick-review/start", json={"count": 10, "difficulty": "easy"})
        data = resp.json()
        assert len(data) > 0
        assert all(q["difficulty"] == "easy" for q in data)

    def test_start_filter_by_type(self, client):
        resp = client.post("/api/quick-review/start", json={"count": 10, "type": "short_answer"})
        data = resp.json()
        assert len(data) > 0
        assert all(q["type"] == "short_answer" for q in data)

    def test_start_filter_by_tag(self, client):
        resp = client.post("/api/quick-review/start", json={"count": 10, "tag": "java"})
        data = resp.json()
        assert len(data) > 0
        assert all("java" in q["tags"] for q in data)

    def test_start_combined_filters(self, client):
        resp = client.post("/api/quick-review/start", json={
            "count": 5, "category": "java", "difficulty": "medium", "type": "short_answer"
        })
        data = resp.json()
        for q in data:
            assert q["category"] == "java"
            assert q["difficulty"] == "medium"
            assert q["type"] == "short_answer"


# ── POST /api/quick-review/rate ──


class TestQuickReviewRate:
    def test_rate_forgot(self, client):
        resp = client.post("/api/quick-review/rate",
                           json={"question_id": 1, "rating": 0, "duration_seconds": 10})
        assert resp.status_code == 200
        assert resp.json()["ok"] is True

    def test_rate_unsure(self, client):
        resp = client.post("/api/quick-review/rate",
                           json={"question_id": 2, "rating": 1})
        assert resp.status_code == 200

    def test_rate_remembered(self, client):
        resp = client.post("/api/quick-review/rate",
                           json={"question_id": 3, "rating": 2})
        assert resp.status_code == 200

    def test_rate_creates_progress(self, client):
        client.post("/api/quick-review/rate",
                    json={"question_id": 3, "rating": 2})

        data = client.get("/api/questions/3").json()
        assert data["status"] == "correct"
        assert data["review_count"] == 1


# ── GET /api/quick-review/history ──


class TestQuickReviewHistory:
    def test_history_empty(self, client):
        resp = client.get("/api/quick-review/history")
        assert resp.status_code == 200
        assert resp.json() == []

    def test_history_shows_reviews(self, client):
        client.post("/api/quick-review/rate",
                    json={"question_id": 1, "rating": 0})
        client.post("/api/quick-review/rate",
                    json={"question_id": 2, "rating": 2})

        data = client.get("/api/quick-review/history").json()
        assert len(data) == 2

    def test_history_shows_result_text(self, client):
        client.post("/api/quick-review/rate",
                    json={"question_id": 1, "rating": 0})  # forgot
        client.post("/api/quick-review/rate",
                    json={"question_id": 2, "rating": 1})  # unsure
        client.post("/api/quick-review/rate",
                    json={"question_id": 3, "rating": 2})  # remembered

        data = client.get("/api/quick-review/history").json()
        results = {r["question_id"]: r["result"] for r in data}
        assert results[1] == "forgot"
        assert results[2] == "unsure"
        assert results[3] == "remembered"
