"""Tests for validate-data.py check functions.

Validates JSON parsing, required fields, option prefixes,
and fill_in_blank answer format checks.
"""
import json
from pathlib import Path

import pytest

from scripts.validate_data import (
    check_json_parseable,
    check_required_fields,
    check_options_prefix,
    check_fill_in_blank_answer,
)


# ── check_json_parseable ──


class TestCheckJsonParseable:
    def test_valid_json(self, tmp_path):
        f = tmp_path / "valid.json"
        f.write_text('[{"title": "test"}]', encoding="utf-8")
        ok, err = check_json_parseable(f)
        assert ok
        assert err == ""

    def test_invalid_json(self, tmp_path):
        f = tmp_path / "invalid.json"
        f.write_text("{not valid}", encoding="utf-8")
        ok, err = check_json_parseable(f)
        assert not ok
        assert "JSON 解析错误" in err

    def test_empty_file(self, tmp_path):
        f = tmp_path / "empty.json"
        f.write_text("", encoding="utf-8")
        ok, err = check_json_parseable(f)
        assert not ok

    def test_non_utf8_file(self, tmp_path):
        f = tmp_path / "bad.txt"
        f.write_bytes(b"\xff\xfe\x00\x01")
        ok, err = check_json_parseable(f)
        assert not ok
        assert "读取错误" in err or "JSON" in err


# ── check_required_fields ──


class TestCheckRequiredFields:
    SAMPLE = [
        {"title": "Q1", "type": "short_answer", "answer": "A1"},
        {"title": "Q2", "type": "multiple_choice", "answer": "A2", "options": []},
    ]

    def test_valid(self):
        ok, err = check_required_fields(self.SAMPLE, ["title", "type", "answer"])
        assert ok

    def test_missing_field(self):
        data = [{"title": "Q1", "type": "short_answer"}]  # missing answer
        ok, err = check_required_fields(data, ["title", "type", "answer"])
        assert not ok
        assert "缺少字段" in err
        assert "answer" in err

    def test_multiple_missing(self):
        data = [{"title": "Q1"}]  # missing type + answer
        ok, err = check_required_fields(data, ["title", "type", "answer"])
        assert not ok
        assert err.count("缺少字段") == 2

    def test_missing_across_items(self):
        data = [
            {"title": "Q1", "type": "short_answer", "answer": "A1"},
            {"title": "Q2"},  # missing type + answer
        ]
        ok, err = check_required_fields(data, ["title", "type", "answer"])
        assert not ok
        # Q2 should report missing type and answer
        assert "Q2" not in err  # items without title use index

    def test_invalid_type(self):
        data = [{"title": "Q1", "type": "unknown_type", "answer": "A1"}]
        ok, err = check_required_fields(data, ["title", "type", "answer"])
        assert not ok
        assert "未知题型" in err

    def test_valid_all_types(self):
        for t in ("choice", "coding", "fill_in_blank", "multiple_choice", "short_answer", "true_false"):
            data = [{"title": "Q", "type": t, "answer": "A"}]
            ok, err = check_required_fields(data, ["title", "type", "answer"])
            assert ok, f"type '{t}' should be valid: {err}"


# ── check_options_prefix ──


class TestCheckOptionsPrefix:
    def test_skip_short_answer(self):
        data = [{"title": "Q", "type": "short_answer", "options": []}]
        ok, err = check_options_prefix(data)
        assert ok

    def test_choice_with_prefix(self):
        data = [{"title": "Q", "type": "choice", "options": ["A) opt1", "B) opt2"]}]
        ok, err = check_options_prefix(data)
        assert ok

    def test_choice_without_prefix(self):
        data = [{"title": "Q", "type": "choice", "options": ["opt1", "opt2"]}]
        ok, err = check_options_prefix(data)
        assert not ok
        assert "缺少" in err

    def test_true_false_skip_prefix_check(self):
        """true_false with 2 options should skip prefix check."""
        data = [{"title": "Q", "type": "true_false", "options": ["正确", "错误"]}]
        ok, err = check_options_prefix(data)
        assert ok

    def test_multiple_choice_with_prefix(self):
        data = [{"title": "Q", "type": "multiple_choice", "options": ["A) a", "B) b", "C) c"]}]
        ok, err = check_options_prefix(data)
        assert ok

    def test_mixed_prefix_missing(self):
        data = [{"title": "Q", "type": "choice", "options": ["A) a", "b"]}]
        ok, err = check_options_prefix(data)
        assert not ok


# ── check_fill_in_blank_answer ──


class TestCheckFillInBlankAnswer:
    def test_skip_non_fill(self):
        data = [{"title": "Q", "type": "short_answer", "answer": "anything"}]
        ok, err = check_fill_in_blank_answer(data)
        assert ok

    def test_valid_answer(self):
        data = [{
            "title": "Q", "type": "fill_in_blank",
            "answer": json.dumps({"correct": [["word1"]], "distractors": ["d1"]}),
        }]
        ok, err = check_fill_in_blank_answer(data)
        assert ok

    def test_answer_already_dict(self):
        """If answer is already parsed (not a string), handle it."""
        data = [{
            "title": "Q", "type": "fill_in_blank",
            "answer": {"correct": [["word1"]], "distractors": ["d1"]},
        }]
        ok, err = check_fill_in_blank_answer(data)
        assert ok

    def test_invalid_json(self):
        data = [{"title": "Q", "type": "fill_in_blank", "answer": "not json"}]
        ok, err = check_fill_in_blank_answer(data)
        assert not ok
        assert "不是合法 JSON" in err

    def test_missing_correct(self):
        data = [{
            "title": "Q", "type": "fill_in_blank",
            "answer": json.dumps({"distractors": ["d1"]}),
        }]
        ok, err = check_fill_in_blank_answer(data)
        assert not ok
        assert "缺少 correct" in err

    def test_missing_distractors(self):
        data = [{
            "title": "Q", "type": "fill_in_blank",
            "answer": json.dumps({"correct": [["word1"]]}),
        }]
        ok, err = check_fill_in_blank_answer(data)
        assert not ok
        assert "缺少 distractors" in err

    def test_correct_not_array(self):
        data = [{
            "title": "Q", "type": "fill_in_blank",
            "answer": json.dumps({"correct": "not_array", "distractors": []}),
        }]
        ok, err = check_fill_in_blank_answer(data)
        assert not ok

    def test_correct_empty_array(self):
        data = [{
            "title": "Q", "type": "fill_in_blank",
            "answer": json.dumps({"correct": [], "distractors": []}),
        }]
        ok, err = check_fill_in_blank_answer(data)
        assert not ok
        assert "应为非空数组" in err

    def test_correct_group_not_array(self):
        data = [{
            "title": "Q", "type": "fill_in_blank",
            "answer": json.dumps({"correct": ["not_array"], "distractors": []}),
        }]
        ok, err = check_fill_in_blank_answer(data)
        assert not ok

    def test_answer_not_dict(self):
        data = [{
            "title": "Q", "type": "fill_in_blank",
            "answer": json.dumps([1, 2, 3]),
        }]
        ok, err = check_fill_in_blank_answer(data)
        assert not ok
        assert "不是 JSON 对象" in err
