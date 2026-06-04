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
            options TEXT NOT NULL DEFAULT '[]',
            company TEXT NOT NULL DEFAULT '',
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
            easiness REAL DEFAULT 2.5,
            repetitions INTEGER DEFAULT 0,
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

    # Migrate existing databases: add SM-2 columns if missing
    for col in ("easiness", "repetitions"):
        try:
            await db.execute(f"ALTER TABLE user_progress ADD COLUMN {col}")
        except Exception:
            pass  # Column already exists

    # Migrate existing databases: add company column if missing
    try:
        await db.execute("ALTER TABLE questions ADD COLUMN company TEXT NOT NULL DEFAULT ''")
    except Exception:
        pass  # Column already exists

    # Migrate existing databases: add bookmarked column if missing
    try:
        await db.execute("ALTER TABLE user_progress ADD COLUMN bookmarked INTEGER NOT NULL DEFAULT 0")
    except Exception:
        pass  # Column already exists

    await db.commit()
    await db.close()
