import aiosqlite
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "interview.db")


async def get_db():
    db = await aiosqlite.connect(DB_PATH)
    db.row_factory = aiosqlite.Row
    return db


async def init_db():
    db = await get_db()
    await db.executescript("""
        CREATE TABLE IF NOT EXISTS questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category TEXT NOT NULL,
            difficulty TEXT NOT NULL DEFAULT 'medium',
            type TEXT NOT NULL DEFAULT 'short_answer',
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            answer TEXT NOT NULL DEFAULT '',
            hints TEXT NOT NULL DEFAULT '[]',
            tags TEXT NOT NULL DEFAULT '[]',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS user_progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question_id INTEGER NOT NULL UNIQUE,
            status TEXT NOT NULL DEFAULT 'new',
            last_reviewed_at DATETIME,
            review_count INTEGER DEFAULT 0,
            wrong_count INTEGER DEFAULT 0,
            next_review_at DATETIME,
            notes TEXT DEFAULT '',
            FOREIGN KEY (question_id) REFERENCES questions(id)
        );

        CREATE TABLE IF NOT EXISTS review_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question_id INTEGER NOT NULL,
            reviewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            result TEXT NOT NULL,
            duration_seconds INTEGER DEFAULT 0,
            FOREIGN KEY (question_id) REFERENCES questions(id)
        );
    """)
    await db.commit()
    await db.close()
