from fastapi import APIRouter, HTTPException, Query
from database import get_db
from models import QuickReviewStart, QuickReviewRate
from datetime import datetime, timezone, timedelta
import random
import json

router = APIRouter()


@router.post("/start")
async def start_quick_review(body: QuickReviewStart):
    """Start a QuickReview session — returns random questions matching optional filters."""
    db = await get_db()

    conditions = []
    params = []
    if body.category:
        conditions.append("category = ?")
        params.append(body.category)
    if body.difficulty:
        conditions.append("difficulty = ?")
        params.append(body.difficulty)
    if body.type:
        conditions.append("type = ?")
        params.append(body.type)
    if body.tag:
        conditions.append("INSTR(tags, ?) > 0")
        params.append(json.dumps(body.tag)[1:-1])  # match tag inside JSON array

    where = ("WHERE " + " AND ".join(conditions)) if conditions else ""

    cursor = await db.execute(f"""
        SELECT id, category, difficulty, type, title, tags, company
        FROM questions {where}
        ORDER BY RANDOM()
        LIMIT ?
    """, [*params, body.count])
    rows = await cursor.fetchall()
    await db.close()

    return [
        {
            "id": r["id"],
            "category": r["category"],
            "difficulty": r["difficulty"],
            "type": r["type"],
            "title": r["title"],
            "tags": json.loads(r["tags"]) if isinstance(r["tags"], str) else [],
            "company": r["company"] or "",
        }
        for r in rows
    ]


@router.post("/rate")
async def rate_question(body: QuickReviewRate):
    """Rate a question in QuickReview and record progress."""
    db = await get_db()

    cursor = await db.execute("SELECT id, status FROM user_progress WHERE question_id = ?",
                              (body.question_id,))
    existing = await cursor.fetchone()

    now = datetime.now(timezone.utc)

    if existing:
        if body.rating < 2:  # forgot or unsure
            new_wrong_count = 1
            new_status = "wrong"
        else:  # remembered
            new_wrong_count = 0
            new_status = "correct" if existing["status"] == "new" else existing["status"]

        await db.execute(
            """UPDATE user_progress
               SET status = ?, last_reviewed_at = ?, review_count = review_count + 1,
                   wrong_count = wrong_count + ?, notes = notes
               WHERE question_id = ?""",
            (new_status, now.isoformat(), new_wrong_count, body.question_id),
        )
    else:
        new_wrong_count = 1 if body.rating < 2 else 0

        # SM-2 style: schedule next review based on rating
        if body.rating == 2:  # remembered
            interval_days = 7
            next_review = (now + timedelta(days=interval_days)).isoformat()
            easiness = 2.5
            repetitions = 1
            status = "correct"
        elif body.rating == 1:  # unsure
            interval_days = 1
            next_review = (now + timedelta(days=interval_days)).isoformat()
            easiness = 2.5
            repetitions = 0
            status = "reviewing"
        else:  # forgot
            interval_days = 0
            next_review = now.isoformat()
            easiness = 2.5
            repetitions = 0
            status = "wrong"

        await db.execute(
            """INSERT INTO user_progress (question_id, status, last_reviewed_at, review_count, wrong_count, next_review_at, easiness, repetitions)
               VALUES (?, ?, ?, 1, ?, ?, ?, ?)""",
            (body.question_id, status, now.isoformat(), new_wrong_count,
             next_review, easiness, repetitions),
        )

    # Record the review
    await db.execute(
        """INSERT INTO review_sessions (question_id, result, duration_seconds)
           VALUES (?, ?, ?)""",
        (body.question_id, "forgot" if body.rating == 0 else "unsure" if body.rating == 1 else "remembered",
         body.duration_seconds),
    )

    await db.commit()
    await db.close()
    return {"ok": True}


@router.get("/history")
async def get_quick_review_history(days: int = Query(30, ge=1, le=365)):
    """Get QuickReview session history."""
    db = await get_db()
    since = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
    cursor = await db.execute("""
        SELECT id, question_id, reviewed_at, result, duration_seconds
        FROM review_sessions
        WHERE reviewed_at >= ?
        ORDER BY reviewed_at DESC
        LIMIT 200
    """, (since,))
    rows = await cursor.fetchall()
    await db.close()
    return [dict(r) for r in rows]
