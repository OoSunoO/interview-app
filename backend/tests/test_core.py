"""Tests for core.py module.

Covers review(), update_level(), and error-path scenarios
(empty file, corrupted JSON, missing file).
"""
import json
import os
import random
import tempfile

import pytest

# Direct import of core internals so we can patch DATA_DIR
import core as _core  # noqa: F401 — needed early for DATA_DIR resolution


@pytest.fixture(autouse=True)
def temp_data_dir(monkeypatch, tmp_path):
    """Redirect DATA_DIR to a temp directory for each test."""
    data_dir = tmp_path / "data"
    data_dir.mkdir()
    monkeypatch.setattr(core, "DATA_DIR", str(data_dir))
    monkeypatch.setattr(core, "QUESTIONS_FILE", str(data_dir / "questions.json"))
    monkeypatch.setattr(core, "PROGRESS_FILE", str(data_dir / "progress.json"))
    monkeypatch.setattr(core, "SESSIONS_FILE", str(data_dir / "sessions.json"))
    return str(data_dir)


import core


# ── Fixtures ──────────────────────────────────────────────────────


def write_questions(questions: list):
    """Write questions to the temp data dir."""
    core.ensure_dir()
    with open(core.QUESTIONS_FILE, "w", encoding="utf-8") as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)


def write_progress(progress: dict):
    """Write progress to the temp data dir."""
    core.ensure_dir()
    with open(core.PROGRESS_FILE, "w", encoding="utf-8") as f:
        json.dump(progress, f, ensure_ascii=False, indent=2)


SAMPLE_QUESTIONS = [
    {"id": 1, "category": "java", "title": "Q1"},
    {"id": 2, "category": "java", "title": "Q2"},
    {"id": 3, "category": "db", "title": "Q3"},
    {"id": 4, "category": "db", "title": "Q4"},
    {"id": 5, "category": "algo", "title": "Q5"},
]


# ── review() tests ────────────────────────────────────────────────


class TestReview:
    def test_returns_unreviewed_questions(self):
        write_questions(SAMPLE_QUESTIONS)
        # Q2 is already reviewed
        write_progress({"2": {"level": "correct"}})

        result = core.review(count=10)
        # Q1, Q3, Q4, Q5 are unreviewed
        assert len(result) == 4
        ids = {q["id"] for q in result}
        assert ids == {1, 3, 4, 5}

    def test_respects_count_limit(self):
        write_questions(SAMPLE_QUESTIONS)
        result = core.review(count=2)
        assert len(result) == 2

    def test_returns_empty_when_all_reviewed(self):
        write_questions(SAMPLE_QUESTIONS)
        write_progress({str(q["id"]): {"level": "correct"} for q in SAMPLE_QUESTIONS})
        result = core.review(count=5)
        assert result == []

    def test_returns_empty_when_no_questions(self):
        write_questions([])
        result = core.review(count=5)
        assert result == []

    def test_random_shuffle_with_seed(self):
        """With fixed random.seed(), the result order is deterministic."""
        write_questions(SAMPLE_QUESTIONS)

        random.seed(42)
        result_a = core.review(count=5)
        result_a_ids = [q["id"] for q in result_a]

        random.seed(42)
        result_b = core.review(count=5)
        result_b_ids = [q["id"] for q in result_b]

        assert result_a_ids == result_b_ids
        # With 5 items shuffled, it's extremely unlikely to match original order
        assert result_a_ids != [1, 2, 3, 4, 5]

    def test_does_not_include_reviewed_even_when_count_not_met(self):
        """Does NOT fall back to returning mastered/reviewed questions."""
        write_questions(SAMPLE_QUESTIONS)
        write_progress({str(q["id"]): {"level": "correct"} for q in SAMPLE_QUESTIONS})
        result = core.review(count=100)
        assert result == []


# ── update_level() tests ──────────────────────────────────────────


class TestUpdateLevel:
    def test_sets_level_on_new_question(self):
        write_questions(SAMPLE_QUESTIONS)
        write_progress({})

        result = core.update_level(1, "reviewing")
        assert result["level"] == "reviewing"
        assert result["review_count"] == 0
        assert result["wrong_count"] == 0

        # Verify persisted
        progress = core.load_progress()
        assert progress["1"]["level"] == "reviewing"

    def test_updates_existing_level(self):
        write_questions(SAMPLE_QUESTIONS)
        write_progress({"1": {"level": "new", "review_count": 3, "wrong_count": 1}})

        result = core.update_level(1, "mastered")
        assert result["level"] == "mastered"
        # review_count and wrong_count preserved
        assert result["review_count"] == 3
        assert result["wrong_count"] == 1

    def test_invalid_level_raises_valueerror(self):
        write_questions(SAMPLE_QUESTIONS)
        with pytest.raises(ValueError, match="Invalid level"):
            core.update_level(1, "not_a_level")

    def test_nonexistent_question_raises_keyerror(self):
        write_questions(SAMPLE_QUESTIONS)
        with pytest.raises(KeyError, match="Question 9999 not found"):
            core.update_level(9999, "reviewing")

    def test_empty_string_level_raises_valueerror(self):
        write_questions(SAMPLE_QUESTIONS)
        with pytest.raises(ValueError, match="Invalid level"):
            core.update_level(1, "")


# ── Error-path tests ──────────────────────────────────────────────


class TestErrorPaths:
    def test_load_missing_questions_file(self):
        """No questions.json exists — should return empty list."""
        # Don't write anything
        assert core.load_questions() == []

    def test_load_missing_progress_file(self):
        """No progress.json exists — should return empty dict."""
        assert core.load_progress() == {}

    def test_load_corrupted_json_questions(self):
        """Corrupted questions.json returns empty list."""
        core.ensure_dir()
        with open(core.QUESTIONS_FILE, "w", encoding="utf-8") as f:
            f.write("not valid json at all")
        assert core.load_questions() == []

    def test_load_corrupted_json_progress(self):
        """Corrupted progress.json returns empty dict."""
        core.ensure_dir()
        with open(core.PROGRESS_FILE, "w", encoding="utf-8") as f:
            f.write("{corrupted!!")
        assert core.load_progress() == {}

    def test_load_empty_file_questions(self):
        """Empty questions.json returns empty list."""
        core.ensure_dir()
        with open(core.QUESTIONS_FILE, "w", encoding="utf-8") as f:
            f.write("")
        assert core.load_questions() == []

    def test_load_empty_file_progress(self):
        """Empty progress.json returns empty dict."""
        core.ensure_dir()
        with open(core.PROGRESS_FILE, "w", encoding="utf-8") as f:
            f.write("")
        assert core.load_progress() == {}

    def test_get_question_returns_none_for_missing(self):
        write_questions(SAMPLE_QUESTIONS)
        assert core.get_question(9999) is None

    def test_add_question_assigns_incrementing_ids(self):
        write_questions(SAMPLE_QUESTIONS)
        new = core.add_question({"category": "new", "title": "NewQ"})
        assert new["id"] == 6  # max id was 5

    def test_add_question_handles_empty_list(self):
        write_questions([])
        new = core.add_question({"category": "new", "title": "First"})
        assert new["id"] == 1

    def test_save_and_load_roundtrip(self):
        data = [{"id": 1, "title": "Test", "category": "x"}]
        core.save_questions(data)
        assert core.load_questions() == data

    def test_save_progress_roundtrip(self):
        data = {"1": {"level": "correct", "review_count": 5, "wrong_count": 0}}
        core.save_progress(data)
        assert core.load_progress() == data

    def test_typeerror_on_non_string_filepath(self):
        with pytest.raises(TypeError, match="Expected str"):
            core._load(123)  # noqa


# ── get_stats() tests ─────────────────────────────────────────────


class TestGetStats:
    def test_empty_stats(self):
        write_questions([])
        stats = core.get_stats()
        assert stats["total"] == 0
        assert stats["done"] == 0
        assert stats["correct"] == 0
        assert stats["wrong"] == 0
        assert stats["by_category"] == {}

    def test_stats_with_mixed_progress(self):
        write_questions(SAMPLE_QUESTIONS)
        write_progress({
            "1": {"level": "correct"},
            "2": {"level": "wrong"},
            "3": {"level": "reviewing"},
        })
        stats = core.get_stats()
        assert stats["total"] == 5
        assert stats["done"] == 2  # correct + reviewing
        assert stats["correct"] == 1
        assert stats["wrong"] == 1
        assert stats["by_category"]["java"]["total"] == 2
        assert stats["by_category"]["java"]["done"] == 1  # only Q1 is correct
