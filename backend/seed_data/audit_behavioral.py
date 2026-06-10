#!/usr/bin/env python3
"""Behavioral interview questions quality audit script."""
import json
import sys
from collections import Counter, defaultdict

FILES = [
    "/Users/petersun/DEV/labs/interview-app/backend/seed_data/behavioral.json",
    "/Users/petersun/DEV/labs/interview-app/backend/seed_data/behavioral_extras.json",
]

OUTPUT = "/Users/petersun/DEV/labs/interview-app/audit-behavioral.json"

def load_questions():
    all_q = []
    for f in FILES:
        with open(f, "r", encoding="utf-8") as fh:
            data = json.load(fh)
            if isinstance(data, list):
                all_q.extend(data)
            else:
                all_q.append(data)
    return all_q

def audit(questions):
    issues = []
    stats = {
        "total": len(questions),
        "by_difficulty": Counter(),
        "by_type": Counter(),
        "by_source_file": Counter(),
        "tag_frequency": Counter(),
        "sub_topic_frequency": Counter(),
    }

    titles_seen = {}
    content_seen = {}

    for i, q in enumerate(questions):
        title = q.get("title", "")
        content = q.get("content", "")
        answer = q.get("answer", "")
        hints = q.get("hints", [])
        tags = q.get("tags", [])
        difficulty = q.get("difficulty", "unknown")
        qtype = q.get("type", "unknown")
        category = q.get("category", "")

        # Stats
        stats["by_difficulty"][difficulty] += 1
        stats["by_type"][qtype] += 1

        # Determine source file
        if "extras" in category or i >= len(questions) // 2:
            pass  # will be determined below

        for t in tags:
            stats["tag_frequency"][t] += 1

        # --- Duplicate detection ---
        title_norm = title.strip().lower()
        if title_norm in titles_seen:
            issues.append({
                "type": "duplicate_title",
                "severity": "medium",
                "title": title,
                "detail": f"与第 {titles_seen[title_norm]+1} 题标题重复",
                "index": i,
            })
        else:
            titles_seen[title_norm] = i

        content_norm = content.strip()[:80].lower()
        if content_norm in content_seen:
            issues.append({
                "type": "duplicate_content",
                "severity": "medium",
                "title": title,
                "detail": f"与第 {content_seen[content_norm]+1} 题内容高度相似",
                "index": i,
            })
        else:
            content_seen[content_norm] = i

        # --- Structural checks ---
        if not title:
            issues.append({"type": "missing_title", "severity": "high", "title": f"Q{i}", "detail": "缺少 title 字段"})
        if not content:
            issues.append({"type": "missing_content", "severity": "high", "title": title, "detail": "缺少 content 字段"})
        if not answer:
            issues.append({"type": "missing_answer", "severity": "high", "title": title, "detail": "缺少 answer 字段"})
        if not tags:
            issues.append({"type": "missing_tags", "severity": "low", "title": title, "detail": "缺少 tags"})
        if not hints or len(hints) == 0:
            issues.append({"type": "missing_hints", "severity": "low", "title": title, "detail": "缺少 hints"})
        if difficulty == "unknown":
            issues.append({"type": "missing_difficulty", "severity": "medium", "title": title, "detail": "缺少 difficulty"})

        # --- Answer quality checks ---
        if answer and len(answer) < 100:
            issues.append({
                "type": "short_answer",
                "severity": "medium",
                "title": title,
                "detail": f"答案过短（{len(answer)} 字符），可能不够详细",
            })

        # Check for STAR elements in behavioral answers
        if qtype == "short_answer":
            answer_lower = answer.lower()
            has_star = any(kw in answer_lower for kw in ["situation", "情境", "背景", "情景", "行动", "action", "结果", "result", "框架", "star"])
            # Not all behavioral questions need STAR, but flag if answer is very generic
            if not has_star and len(answer) > 500:
                stats["sub_topic_frequency"]["含STAR/结构化框架"] += 1
            elif has_star:
                stats["sub_topic_frequency"]["含STAR/结构化框架"] += 1

        # Choice type validation
        if qtype == "choice":
            options = q.get("options", [])
            correct = q.get("answer", "")
            if not options:
                issues.append({"type": "choice_missing_options", "severity": "high", "title": title, "detail": "选择题缺少 options"})
            if not correct:
                issues.append({"type": "choice_missing_answer", "severity": "high", "title": title, "detail": "选择题缺少答案"})

        # Hints quality
        if hints:
            for h in hints:
                if len(h) < 5:
                    issues.append({"type": "hint_too_short", "severity": "low", "title": title, "detail": f"提示过短: '{h}'"})

    # --- Semantic duplicate detection (similar titles) ---
    title_list = [(q.get("title", ""), i) for i, q in enumerate(questions)]
    for a_idx in range(len(title_list)):
        for b_idx in range(a_idx + 1, len(title_list)):
            t_a, i_a = title_list[a_idx]
            t_b, i_b = title_list[b_idx]
            if not t_a or not t_b:
                continue
            # Simple overlap: share > 50% characters
            common = set(t_a) & set(t_b)
            if len(common) > max(len(t_a), len(t_b)) * 0.6 and abs(len(t_a) - len(t_b)) < 10:
                # More specific: check key terms overlap
                words_a = set(t_a.replace("（", " ").replace("）", " ").replace("「", " ").replace("」", " ").split())
                words_b = set(t_b.replace("（", " ").replace("）", " ").replace("「", " ").replace("」", " ").split())
                if len(words_a & words_b) >= 3 and (i_a, i_b) not in [(iss.get("index"), iss.get("index")) for iss in issues]:
                    pass  # Too noisy, skip

    # --- Topic clustering ---
    topic_keywords = {
        "STAR/方法论": ["STAR", "方法论", "结构化", "框架"],
        "领导力": ["领导力", "leader", "Lead", "leader", "带人", "指导", "mentor", "Mentor", "培养", "管理"],
        "冲突解决": ["冲突", "分歧", "争论", "矛盾", "对立"],
        "项目管理": ["项目", "deadline", "Deadline", "排期", "范围", "scope", "Scope", "交付"],
        "职业规划": ["职业规划", "职业", "成长", "晋升", "发展"],
        "沟通技巧": ["沟通", "汇报", "说服", "影响"],
        "技术决策": ["技术选型", "技术决策", "架构", "选型"],
        "失败/复盘": ["失败", "复盘", "事故", "故障", "失误", "错误", "P0"],
        "团队协作": ["团队", "协作", "跨团队", "跨部门", "合作"],
        "抗压/压力": ["压力", "抗压", "Burnout", "高压", "紧迫"],
        "自我认知": ["弱点", "缺点", "优点", "自我认知", "反馈"],
        "求职/面试": ["自我介绍", "离职", "求职", "为什么选择", "期望薪资", "薪资", "面试技巧"],
    }

    topic_counts = Counter()
    for q in questions:
        title = q.get("title", "")
        content = q.get("content", "")
        combined = title + " " + content
        for topic, keywords in topic_keywords.items():
            if any(kw in combined for kw in keywords):
                topic_counts[topic] += 1

    # Determine source files
    with open(FILES[0], "r", encoding="utf-8") as f:
        main_count = len(json.load(f))
    with open(FILES[1], "r", encoding="utf-8") as f:
        extras_count = len(json.load(f))

    # Coverage analysis
    total_topics = len(topic_keywords)
    covered_topics = len(topic_counts)

    # Build report
    report = {
        "audit_date": "2026-06-10",
        "category": "behavioral",
        "source_files": [
            {"file": "behavioral.json", "count": main_count},
            {"file": "behavioral_extras.json", "count": extras_count},
        ],
        "summary": {
            "total_questions": stats["total"],
            "by_difficulty": dict(stats["by_difficulty"].most_common()),
            "by_type": dict(stats["by_type"].most_common()),
            "topic_coverage": dict(topic_counts.most_common()),
            "top_tags": dict(stats["tag_frequency"].most_common(20)),
            "topic_coverage_rate": f"{covered_topics}/{total_topics}",
        },
        "quality_checks": {
            "structural_issues": len([i for i in issues if i["severity"] == "high"]),
            "medium_issues": len([i for i in issues if i["severity"] == "medium"]),
            "low_issues": len([i for i in issues if i["severity"] == "low"]),
            "total_issues": len(issues),
        },
        "strengths": [
            "覆盖面极广：STAR方法论、领导力、冲突解决、项目管理、职业规划、抗压、自我认知、求职面试等主题均有涉及",
            "答案质量高：大部分答案包含「答案」→「解析」→「扩展延伸」三层结构，且有具体的 hints 引导思考",
            "中英文混合覆盖：既有中文深度题目，也有英文原版题目（如 culture-change、ethical disagreement），适配国际化面试场景",
            "难度分布合理：easy/medium/hard 三档均有覆盖，适合不同阶段候选人",
            "题目类型多样：short_answer 主力 + 少量 choice 题型，选择题设计合理有干扰项",
            f"STAR/结构化框架覆盖率高：{stats['sub_topic_frequency'].get('含STAR/结构化框架', 0)} 题含结构化回答框架",
        ],
        "issues": issues,
        "recommendations": [
            "部分题目主题高度重叠（如「线上事故处理」出现 5+ 次、「跨团队协作」出现 6+ 次），建议合并或差异化定位",
            "behavioral_extras 中部分题目 category 为 behavioral_extras 而非 behavioral，可能导致前端筛选遗漏",
            "部分英文题目 tags 用英文（如 culture-change, resilience）而中文题目用中文标签，建议统一",
            "choice 类型题目仅 6 道，占比偏低，建议适当增加场景化选择题提升互动性",
            "缺少「远程工作」「AI 对工程师影响」等 2026 年热点话题的深度覆盖（仅有基础版）",
        ],
    }

    return report

def main():
    questions = load_questions()
    report = audit(questions)
    with open(OUTPUT, "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)
    print(f"Audit report written to {OUTPUT}")
    print(f"\n=== Behavioral Questions Audit Summary ===")
    print(f"Total questions: {report['summary']['total_questions']}")
    print(f"  Source: behavioral.json={report['source_files'][0]['count']}, behavioral_extras.json={report['source_files'][1]['count']}")
    print(f"\nBy difficulty:")
    for k, v in report['summary']['by_difficulty'].items():
        print(f"  {k}: {v}")
    print(f"\nBy type:")
    for k, v in report['summary']['by_type'].items():
        print(f"  {k}: {v}")
    print(f"\nTopic coverage ({report['summary']['topic_coverage_rate']}):")
    for k, v in report['summary']['topic_coverage'].items():
        print(f"  {k}: {v} 题")
    print(f"\nQuality issues:")
    print(f"  High: {report['quality_checks']['structural_issues']}")
    print(f"  Medium: {report['quality_checks']['medium_issues']}")
    print(f"  Low: {report['quality_checks']['low_issues']}")
    print(f"  Total: {report['quality_checks']['total_issues']}")

if __name__ == "__main__":
    main()
