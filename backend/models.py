from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class Question(BaseModel):
    id: int
    category: str
    difficulty: str
    type: str
    title: str
    content: str
    answer: str
    options: list[str] = []
    hints: list[str]
    tags: list[str]
    created_at: datetime
    updated_at: datetime


class QuestionListItem(BaseModel):
    id: int
    category: str
    difficulty: str
    type: str
    title: str
    tags: list[str]
    status: str = "new"
    wrong_count: int = 0


class QuestionDetail(Question):
    notes: str = ""
    status: str = "new"
    review_count: int = 0
    wrong_count: int = 0


class ProgressUpdate(BaseModel):
    status: str
    duration_seconds: int = 0
    notes: Optional[str] = None


class ReviewSession(BaseModel):
    id: int
    question_id: int
    reviewed_at: datetime
    result: str
    duration_seconds: int


class StatsOverview(BaseModel):
    total: int
    done: int
    correct: int
    wrong: int
    by_category: dict[str, dict[str, int]]
