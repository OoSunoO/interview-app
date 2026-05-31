import asyncio
import json
import os
from database import init_db, get_db

SEED_DIR = os.path.join(os.path.dirname(__file__), "seed_data")


async def seed():
    await init_db()
    db = await get_db()

    cursor = await db.execute("SELECT COUNT(*) FROM questions")
    count = (await cursor.fetchone())[0]
    if count > 0:
        print(f"数据库已有 {count} 道题，跳过播种")
        await db.close()
        return

    for fname in sorted(os.listdir(SEED_DIR)):
        if not fname.endswith(".json"):
            continue
        with open(os.path.join(SEED_DIR, fname), "r", encoding="utf-8") as f:
            questions = json.load(f)
        for q in questions:
            await db.execute(
                "INSERT INTO questions (category, difficulty, type, title, content, answer, hints, tags, options, company) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (q["category"], q["difficulty"], q["type"], q["title"],
                 q["content"], q["answer"],
                 json.dumps(q.get("hints", []), ensure_ascii=False),
                 json.dumps(q.get("tags", []), ensure_ascii=False),
                 json.dumps(q.get("options", []), ensure_ascii=False),
                 q.get("company", "")),
            )
        print(f"  播种 {fname}: {len(questions)} 题")

    await db.commit()
    await db.close()
    print("播种完成")


if __name__ == "__main__":
    asyncio.run(seed())
