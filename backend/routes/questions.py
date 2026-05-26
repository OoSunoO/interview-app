from fastapi import APIRouter, HTTPException, Query
from database import get_db
from models import QuestionListItem, QuestionDetail
import json

router = APIRouter()


@router.get("", response_model=list[QuestionListItem])
async def list_questions(
    category: str = None,
    difficulty: str = None,
    tag: str = None,
    status: str = None,
    search: str = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    db = await get_db()
    conditions = []
    params = []

    if category:
        conditions.append("q.category = ?")
        params.append(category)
    if difficulty:
        conditions.append("q.difficulty = ?")
        params.append(difficulty)
    if tag:
        conditions.append("q.tags LIKE ?")
        params.append(f'%"{tag}"%')
    if status:
        conditions.append("COALESCE(p.status, 'new') = ?")
        params.append(status)
    if search:
        conditions.append("(q.title LIKE ? OR q.content LIKE ?)")
        params.extend([f"%{search}%", f"%{search}%"])

    where = ("WHERE " + " AND ".join(conditions)) if conditions else ""
    offset = (page - 1) * page_size

    sql = f"""
        SELECT q.id, q.category, q.difficulty, q.type, q.title, q.tags,
               COALESCE(p.status, 'new') as status, COALESCE(p.wrong_count, 0) as wrong_count
        FROM questions q
        LEFT JOIN user_progress p ON q.id = p.question_id
        {where}
        ORDER BY q.id
        LIMIT ? OFFSET ?
    """
    params.extend([page_size, offset])
    cursor = await db.execute(sql, params)
    rows = await cursor.fetchall()
    await db.close()

    return [
        QuestionListItem(
            id=r["id"], category=r["category"], difficulty=r["difficulty"],
            type=r["type"], title=r["title"], tags=json.loads(r["tags"]),
            status=r["status"], wrong_count=r["wrong_count"],
        ) for r in rows
    ]


@router.get("/{question_id}", response_model=QuestionDetail)
async def get_question(question_id: int):
    db = await get_db()
    cursor = await db.execute("""
        SELECT q.*, COALESCE(p.status, 'new') as status,
               COALESCE(p.review_count, 0) as review_count,
               COALESCE(p.wrong_count, 0) as wrong_count,
               COALESCE(p.notes, '') as notes
        FROM questions q
        LEFT JOIN user_progress p ON q.id = p.question_id
        WHERE q.id = ?
    """, (question_id,))
    row = await cursor.fetchone()
    await db.close()

    if not row:
        raise HTTPException(status_code=404, detail="Question not found")

    return QuestionDetail(
        id=row["id"], category=row["category"], difficulty=row["difficulty"],
        type=row["type"], title=row["title"], content=row["content"],
        answer=row["answer"], hints=json.loads(row["hints"]),
        tags=json.loads(row["tags"]),
        options=json.loads(row["options"]),
        created_at=row["created_at"], updated_at=row["updated_at"],
        status=row["status"], review_count=row["review_count"],
        wrong_count=row["wrong_count"], notes=row["notes"],
    )
