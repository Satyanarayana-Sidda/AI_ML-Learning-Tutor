# AI/ML Learning Tutor

A production-shaped AI/ML learning platform: streaming AI tutor, document-grounded RAG chat, and structured learning paths — built with FastAPI (async), PostgreSQL, ChromaDB, and React.

See [`docs/PHASE_1_ARCHITECTURE.md`](docs/PHASE_1_ARCHITECTURE.md) for the full system design, ER diagram, and API surface.

## 🌟 Core Features

- 🔐 **Authentication** — Secure JWT (access + refresh tokens), session management, and Google OAuth integration.
- 📊 **Interactive Dashboard** — Real-time tracking of XP, study streaks, and course progress powered by Postgres and Zustand.
- 🤖 **Real-Time AI Tutor** — Server-Sent Events (SSE) streaming chat with conversation history, Markdown formatting, syntax highlighting, and LaTeX math rendering.
- 📚 **Comprehensive Course Modules** — 30+ structured AI/ML courses with dynamic content streaming and instant, robust offline fallbacks.
- 🗂️ **Document-Grounded RAG** — Upload PDF/DOCX/TXT files for custom learning. Features async chunking, embedding, and similarity-thresholded retrieval to prevent AI hallucinations.
- 🎴 **3D AI Flashcards** — Interactive, beautifully animated 3D flashcards dynamically generated per-concept with lightning-fast offline caching.
- 📝 **AI Quiz Center** — Automated generation of multiple-choice assessments tailored to specific module topics to test your knowledge.
- 🗺️ **Personalized AI Roadmaps** — Custom-tailored learning paths generated based on your target role, current level, and available study time.
- 🏆 **Gamification & Achievements** — Earn XP, build streaks, unlock badges, and download automatically-generated PDF course completion certificates.
- 📈 **Advanced Analytics** — Beautiful, interactive charts tracking study hours and mastery levels, with responsive Light/Dark theme integration.
- 💻 **CodeLab Playground** — Interactive coding environment to test and practice algorithms.
- 📄 **AI Resume Analyzer** — Upload your resume to receive AI-driven feedback tailored for Data Science and ML roles.
- 🎤 **Interview Prep** — Simulated technical interviews with the AI tutor for real-world practice.
- 💡 **Project Ideas Generator** — Brainstorm unique, level-appropriate portfolio projects with AI guidance.

## Quick start

### 1. Infrastructure (Postgres + Redis)

```bash
docker compose up -d
```

### 2. Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# edit .env: set JWT_SECRET_KEY and GEMINI_API_KEY at minimum

alembic upgrade head
python -m app.seed          # optional — adds demo learning paths/lessons
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

App: http://localhost:5173

## Project structure

```
aiml-tutor/
├── backend/           # FastAPI, async, JWT auth, RAG pipeline
│   ├── app/
│   │   ├── api/v1/    # thin route handlers
│   │   ├── core/      # config, security, db, logging
│   │   ├── models/    # SQLAlchemy ORM
│   │   ├── schemas/   # Pydantic request/response
│   │   ├── repositories/  # DB query layer
│   │   ├── services/  # business logic (auth, AI, RAG)
│   │   └── workers/   # background ingestion
│   ├── alembic/       # DB migrations
│   └── tests/
├── frontend/          # React + Vite + Tailwind
│   └── src/
│       ├── features/  # auth, dashboard, tutor, documents, paths
│       ├── components/
│       ├── lib/        # API client, SSE streaming helper
│       └── stores/     # zustand auth store
└── docs/
    └── PHASE_1_ARCHITECTURE.md
```

## Deployment (Phase 6 — not yet executed)

- **Frontend** → Vercel (`vercel --prod` from `/frontend`)
- **Backend** → Render (Docker or native Python service; set env vars from `.env.example`)
- **Database** → Supabase PostgreSQL (`DATABASE_URL` in `.env`)
- Swap `BackgroundTasks` in `documents.py` for a real Celery/RQ worker once Redis is provisioned in production — the ingestion function in `app/workers/ingestion.py` is already written to be lifted into a task decorator unchanged.

## Notes on design decisions

Anything worth defending in an interview is called out as an inline comment at the point of the decision (async everywhere, JWT refresh-token rotation, similarity-threshold RAG guardrails, services/repositories split for testability). Start in `app/main.py` and follow the imports if you want the guided tour.
