#!/usr/bin/env python3
"""
validate-data.py — Interview App 种子数据校验

校验 backend/seed_data/ 下所有 JSON 文件：
  1. JSON 可解析
  2. 每道题有 title/type/answer 字段
  3. choice/multiple_choice 类型的选项有 A)/B) 前缀
  4. fill_in_blank 类型的 answer 为合法 JSON（correct + distractors 格式）
"""

import json
import re
import sys
from pathlib import Path

SEED_DIR = Path(__file__).resolve().parent.parent / "seed_data"


def check_json_parseable(path: Path) -> tuple[bool, str]:
    try:
        with open(path, "r", encoding="utf-8") as f:
            json.load(f)
        return True, ""
    except json.JSONDecodeError as e:
        return False, f"JSON 解析错误 (行 {e.lineno}): {e.msg}"
    except Exception as e:
        return False, f"读取错误: {e}"


def check_required_fields(data: list, fields: list[str]) -> tuple[bool, str]:
    missing = []
    for i, item in enumerate(data):
        for f in fields:
            if f not in item:
                missing.append(f"第 {i} 条缺少字段 '{f}'")
    if missing:
        return False, "; ".join(missing[:5])
    return True, ""


def check_fill_in_blank_answer(data: list) -> tuple[bool, str]:
    """检查 fill_in_blank 的 answer 是否为合法 JSON 格式。

    预期格式：
      {"correct": [["词1", "同义词1"], ["词2"]], "distractors": ["干扰项1", "干扰项2"]}
    """
    issues = []
    for i, item in enumerate(data):
        if item.get("type") != "fill_in_blank":
            continue
        raw = item.get("answer", "")
        try:
            parsed = json.loads(raw)
        except json.JSONDecodeError as e:
            title = item.get("title", f"第{i}条")
            issues.append(f"'{title}' fill_in_blank answer 不是合法 JSON: {e}")
            continue

        if not isinstance(parsed, dict):
            title = item.get("title", f"第{i}条")
            issues.append(f"'{title}' fill_in_blank answer 不是 JSON 对象")
            continue

        if "correct" not in parsed:
            title = item.get("title", f"第{i}条")
            issues.append(f"'{title}' fill_in_blank answer 缺少 correct 字段")
        elif not isinstance(parsed["correct"], list) or len(parsed["correct"]) == 0:
            title = item.get("title", f"第{i}条")
            issues.append(f"'{title}' fill_in_blank answer.correct 应为非空数组")
        else:
            for j, group in enumerate(parsed["correct"]):
                if not isinstance(group, list) or len(group) == 0:
                    title = item.get("title", f"第{i}条")
                    issues.append(f"'{title}' fill_in_blank answer.correct[{j}] 应为非空数组")
                    break

        if "distractors" not in parsed:
            title = item.get("title", f"第{i}条")
            issues.append(f"'{title}' fill_in_blank answer 缺少 distractors 字段")
        elif not isinstance(parsed["distractors"], list):
            title = item.get("title", f"第{i}条")
            issues.append(f"'{title}' fill_in_blank answer.distractors 应为数组")

    if issues:
        return False, "; ".join(issues[:5])
    return True, ""


def check_options_prefix(data: list) -> tuple[bool, str]:
    """检查 choice/multiple_choice 的 options 是否有 A)/B)/C)/D) 前缀。"""
    issues = []
    for i, item in enumerate(data):
        t = item.get("type", "")
        if t not in ("choice", "multiple_choice"):
            continue
        opts = item.get("options", [])
        if not opts:
            continue
        # true_false 类（2选项）不需要前缀
        if t == "choice" and len(opts) == 2:
            continue
        # 跳过已含前缀的
        for opt in opts:
            if not re.match(r"^[A-H]\)\s", opt):
                title = item.get("title", f"第{i}条")
                issues.append(f"'{title}' 选项 '{opt}' 缺少 A)/B) 前缀")
                break
    if issues:
        return False, "; ".join(issues[:5])
    return True, ""


def main():
    json_files = sorted(SEED_DIR.glob("*.json"))
    if not json_files:
        print(f"⚠️  未找到 JSON 文件: {SEED_DIR}")
        sys.exit(1)

    print(f"🔍 校验 {len(json_files)} 个数据文件...\n")
    total_errors = 0

    for jf in json_files:
        rel = jf.relative_to(SEED_DIR.parent)
        ok, err = check_json_parseable(jf)
        if not ok:
            print(f"  ❌ {rel}: {err}")
            total_errors += 1
            continue

        data = json.loads(jf.read_text(encoding="utf-8"))
        file_ok = True

        if isinstance(data, list):
            ok, err = check_required_fields(data, ["title", "type", "answer"])
            if not ok:
                print(f"  ❌ {rel}: {err}")
                total_errors += 1
                file_ok = False

            ok, err = check_options_prefix(data)
            if not ok:
                print(f"  ❌ {rel}: {err}")
                total_errors += 1
                file_ok = False

            ok, err = check_fill_in_blank_answer(data)
            if not ok:
                print(f"  ❌ {rel}: {err}")
                total_errors += 1
                file_ok = False

        if file_ok:
            print(f"  ✅ {rel}")

    print()
    if total_errors:
        print(f"❌ 发现 {total_errors} 个错误")
        sys.exit(1)
    else:
        print("✅ 全部通过！")


if __name__ == "__main__":
    main()
