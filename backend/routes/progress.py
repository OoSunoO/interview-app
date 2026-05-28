from fastapi import APIRouter
from database import get_db
from models import ProgressUpdate, StatsOverview
from datetime import datetime, timedelta
import json
import math

router = APIRouter()


def sm2_next(quality: int, easiness: float, repetitions: int, interval: int):
    """SM-2 间隔重复算法。

    quality: 0-5 评分 (0=完全忘记, 5=完美回答)
    返回 (new_easiness, new_repetitions, new_interval_days)
    """
    ef = easiness + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    ef = max(1.3, ef)

    if quality < 3:
        return (ef, 0, 1)
    else:
        if repetitions == 0:
            next_interval = 1
        elif repetitions == 1:
            next_interval = 6
        else:
            next_interval = round(interval * ef)
        return (ef, repetitions + 1, next_interval)


@router.post("/{question_id}")
async def update_progress(question_id: int, body: ProgressUpdate):
    db = await get_db()
    cursor = await db.execute(
        "SELECT id, status, wrong_count, easiness, repetitions, next_review_at FROM user_progress WHERE question_id = ?",
        (question_id,),
    )
    existing = await cursor.fetchone()

    now = datetime.utcnow()

    # Map app status to SM-2 quality
    quality = 4 if body.status == "correct" else 1

    if existing:
        easiness = existing["easiness"] or 2.5
        repetitions = existing["repetitions"] or 0

        # Calculate last interval from existing next_review_at
        last_interval = 1
        if existing["next_review_at"]:
            try:
                last_review = existing["next_review_at"]
                if isinstance(last_review, str):
                    last_review = datetime.fromisoformat(last_review.replace("Z", ""))
                last_interval = max(1, (datetime.utcnow() - last_review).days)
            except (ValueError, TypeError):
                last_interval = 1

        new_ef, new_reps, interval_days = sm2_next(quality, easiness, repetitions, last_interval)
        next_review = (now + timedelta(days=interval_days)).isoformat()

        new_wrong_count = existing["wrong_count"] + (1 if body.status == "wrong" else 0)
        new_status = body.status
        if existing["status"] == "wrong" and body.status == "correct":
            new_status = "reviewing"

        await db.execute(
            """UPDATE user_progress
               SET status = ?, last_reviewed_at = ?, review_count = review_count + 1,
                   wrong_count = ?, next_review_at = ?, notes = COALESCE(?, notes),
                   easiness = ?, repetitions = ?
               WHERE question_id = ?""",
            (new_status, now.isoformat(), new_wrong_count, next_review,
             body.notes, new_ef, new_reps, question_id),
        )
    else:
        new_ef, new_reps, interval_days = sm2_next(quality, 2.5, 0, 0)
        next_review = (now + timedelta(days=interval_days)).isoformat()
        new_wrong_count = 1 if body.status == "wrong" else 0

        await db.execute(
            """INSERT INTO user_progress (question_id, status, last_reviewed_at, review_count, wrong_count, next_review_at, notes, easiness, repetitions)
               VALUES (?, ?, ?, 1, ?, ?, ?, ?, ?)""",
            (question_id, body.status, now.isoformat(), new_wrong_count,
             next_review, body.notes or "", new_ef, new_reps),
        )

    await db.execute(
        "INSERT INTO review_sessions (question_id, result, duration_seconds) VALUES (?, ?, ?)",
        (question_id, body.status, body.duration_seconds),
    )
    await db.commit()
    await db.close()
    return {"ok": True}


@router.get("/stats")
async def get_stats():
    db = await get_db()
    cursor = await db.execute("SELECT COUNT(*) FROM questions")
    total = (await cursor.fetchone())[0]

    cursor = await db.execute(
        "SELECT p.status, COUNT(*) as cnt FROM user_progress p GROUP BY p.status"
    )
    status_counts = {row["status"]: row["cnt"] async for row in cursor}

    cursor = await db.execute("""
        SELECT q.category,
               COUNT(*) as total,
               SUM(CASE WHEN p.status = 'correct' THEN 1 ELSE 0 END) as correct_count,
               SUM(CASE WHEN p.status = 'reviewing' THEN 1 ELSE 0 END) as reviewing_count
        FROM questions q
        LEFT JOIN user_progress p ON q.id = p.question_id
        GROUP BY q.category
    """)
    by_category = {}
    async for row in cursor:
        by_category[row["category"]] = {
            "total": row["total"],
            "done": (row["correct_count"] or 0) + (row["reviewing_count"] or 0),
        }

    await db.close()
    return StatsOverview(
        total=total,
        done=status_counts.get("correct", 0) + status_counts.get("reviewing", 0),
        correct=status_counts.get("correct", 0),
        wrong=status_counts.get("wrong", 0),
        by_category=by_category,
    )


@router.get("/wrong")
async def get_wrong_questions():
    db = await get_db()
    cursor = await db.execute("""
        SELECT q.id, q.title, q.category, q.difficulty, q.type, q.tags,
               p.wrong_count, p.last_reviewed_at, p.next_review_at,
               p.easiness, p.repetitions, p.review_count
        FROM questions q
        JOIN user_progress p ON q.id = p.question_id
        WHERE p.status IN ('wrong', 'reviewing')
        ORDER BY
            CASE WHEN p.status = 'wrong' THEN 0 ELSE 1 END,
            p.next_review_at ASC NULLS FIRST,
            p.wrong_count DESC,
            p.easiness ASC
    """)
    rows = await cursor.fetchall()
    await db.close()
    result = []
    for r in rows:
        d = dict(r)
        d["tags"] = json.loads(d["tags"]) if isinstance(d.get("tags"), str) else d.get("tags", [])
        result.append(d)
    return result


@router.get("/review/due")
async def get_due_reviews():
    db = await get_db()
    now = datetime.utcnow().isoformat()
    cursor = await db.execute("""
        SELECT q.id, q.title, q.category, q.difficulty, q.type,
               p.wrong_count, p.next_review_at,
               p.easiness, p.repetitions
        FROM questions q
        JOIN user_progress p ON q.id = p.question_id
        WHERE p.status = 'wrong' AND p.next_review_at <= ?
        ORDER BY p.next_review_at ASC
    """, (now,))
    rows = await cursor.fetchall()
    await db.close()
    return [dict(r) for r in rows]
