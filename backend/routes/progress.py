from fastapi import APIRouter
from database import get_db
from models import ProgressUpdate, StatsOverview
from datetime import datetime, timedelta
import json

router = APIRouter()


@router.post("/{question_id}")
async def update_progress(question_id: int, body: ProgressUpdate):
    db = await get_db()
    cursor = await db.execute(
        "SELECT id, status, wrong_count FROM user_progress WHERE question_id = ?",
        (question_id,),
    )
    existing = await cursor.fetchone()

    now = datetime.utcnow()
    tomorrow = (now + timedelta(days=1)).isoformat()
    next_review = tomorrow if body.status == "wrong" else None

    if existing:
        new_wrong_count = existing["wrong_count"] + (1 if body.status == "wrong" else 0)
        new_status = body.status
        if existing["status"] == "wrong" and body.status == "correct":
            new_status = "reviewing"
        await db.execute(
            """UPDATE user_progress
               SET status = ?, last_reviewed_at = ?, review_count = review_count + 1,
                   wrong_count = ?, next_review_at = ?, notes = COALESCE(?, notes)
               WHERE question_id = ?""",
            (new_status, now.isoformat(), new_wrong_count, next_review,
             body.notes, question_id),
        )
    else:
        new_wrong_count = 1 if body.status == "wrong" else 0
        await db.execute(
            """INSERT INTO user_progress (question_id, status, last_reviewed_at, review_count, wrong_count, next_review_at, notes)
               VALUES (?, ?, ?, 1, ?, ?, ?)""",
            (question_id, body.status, now.isoformat(), new_wrong_count,
             next_review, body.notes or ""),
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
        SELECT q.id, q.title, q.category, q.difficulty, q.type,
               p.wrong_count, p.last_reviewed_at, p.next_review_at
        FROM questions q
        JOIN user_progress p ON q.id = p.question_id
        WHERE p.status IN ('wrong', 'reviewing')
        ORDER BY p.wrong_count DESC, p.last_reviewed_at ASC
    """)
    rows = await cursor.fetchall()
    await db.close()
    return [dict(r) for r in rows]


@router.get("/review/due")
async def get_due_reviews():
    db = await get_db()
    now = datetime.utcnow().isoformat()
    cursor = await db.execute("""
        SELECT q.id, q.title, q.category, q.difficulty, q.type,
               p.wrong_count, p.next_review_at
        FROM questions q
        JOIN user_progress p ON q.id = p.question_id
        WHERE p.status = 'wrong' AND p.next_review_at <= ?
        ORDER BY p.next_review_at ASC
    """, (now,))
    rows = await cursor.fetchall()
    await db.close()
    return [dict(r) for r in rows]
