"""
Seeds a handful of Learning Paths + Lessons so the app isn't empty on
first run. Run with: `python -m app.seed` after migrations are applied.
"""
import asyncio

from app.core.database import AsyncSessionLocal
from app.models.learning_path import LearningPath, Lesson

PATHS = [
    {
        "name": "Python for AI/ML",
        "slug": "python",
        "description": "Core Python skills used across every ML project.",
        "lessons": [
            ("Variables, Types, and Control Flow", 10),
            ("Functions and Modules", 10),
            ("NumPy Fundamentals", 15),
            ("Pandas for Data Manipulation", 15),
        ],
    },
    {
        "name": "Machine Learning",
        "slug": "machine-learning",
        "description": "Supervised and unsupervised learning foundations.",
        "lessons": [
            ("What is Machine Learning?", 10),
            ("Linear Regression from Scratch", 20),
            ("Classification with Logistic Regression", 20),
            ("Train/Test Splits and Overfitting", 15),
        ],
    },
    {
        "name": "Large Language Models",
        "slug": "llms",
        "description": "How LLMs work and how to build with them.",
        "lessons": [
            ("Transformers, Intuitively", 15),
            ("Tokenization and Embeddings", 15),
            ("Prompt Engineering Basics", 10),
            ("Retrieval-Augmented Generation (RAG)", 25),
        ],
    },
]


async def seed() -> None:
    async with AsyncSessionLocal() as db:
        for i, path_data in enumerate(PATHS):
            path = LearningPath(
                name=path_data["name"],
                slug=path_data["slug"],
                description=path_data["description"],
                order_index=i,
            )
            db.add(path)
            await db.flush()

            for j, (title, xp) in enumerate(path_data["lessons"]):
                db.add(
                    Lesson(
                        path_id=path.id,
                        title=title,
                        content_md=f"# {title}\n\nContent coming soon.",
                        order_index=j,
                        xp_value=xp,
                    )
                )
        await db.commit()
    print("Seed complete.")


if __name__ == "__main__":
    asyncio.run(seed())
