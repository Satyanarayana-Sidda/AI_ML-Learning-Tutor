"""
AI orchestration layer. Wraps Gemini so the rest of the app never talks
to the LLM SDK directly — swapping providers (Gemini -> OpenAI -> Claude)
means editing this one file, not every call site.
"""
from collections.abc import AsyncGenerator

import google.generativeai as genai
from tenacity import retry, stop_after_attempt, wait_exponential

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger("ai_service")

genai.configure(api_key=settings.GEMINI_API_KEY)

TUTOR_SYSTEM_PROMPT = """You are an expert AI/ML tutor helping a computer science student learn.
Explain concepts clearly with intuition first, then rigor. Use short code examples where useful.
Use Markdown formatting and LaTeX ($$...$$) for math. Keep answers focused and avoid padding."""

RAG_SYSTEM_PROMPT = """You are a document-grounded tutor. Answer ONLY using the provided context
excerpts below. If the answer is not contained in the context, say clearly that the document
does not cover this, rather than guessing. Cite which excerpt(s) you used by their [number]."""


class AIService:
    def __init__(self):
        self.model = genai.GenerativeModel(settings.GEMINI_MODEL)

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=1, max=8))
    def _start_chat(self, history: list[dict], system_prompt: str):
        return self.model.start_chat(
            history=history,
        )

    async def stream_tutor_reply(
        self, history: list[dict], user_message: str
    ) -> AsyncGenerator[str, None]:
        """
        history: list of {"role": "user"|"model", "parts": [str]}
        Yields text chunks as they arrive from Gemini for SSE streaming.
        """
        chat = self._start_chat(history, TUTOR_SYSTEM_PROMPT)
        prompt = f"{TUTOR_SYSTEM_PROMPT}\n\nStudent: {user_message}" if not history else user_message
        try:
            response = await chat.send_message_async(prompt, stream=True)
            async for chunk in response:
                if chunk.text:
                    yield chunk.text
        except Exception as exc:  # noqa: BLE001
            logger.error("gemini_stream_error", error=str(exc))
            if settings.GEMINI_API_KEY == "your_gemini_api_key_here":
                yield "\n\n_**API Key Missing:** Please open `backend/.env` and replace `your_gemini_api_key_here` with a real Gemini API Key to use the AI Tutor._"
            else:
                yield "\n\n_Sorry — the tutor hit an error generating a response. Please try again._"

    async def stream_rag_reply(
        self, context_chunks: list[str], user_message: str
    ) -> AsyncGenerator[str, None]:
        numbered_context = "\n\n".join(f"[{i+1}] {c}" for i, c in enumerate(context_chunks))
        prompt = (
            f"{RAG_SYSTEM_PROMPT}\n\nContext:\n{numbered_context}\n\nQuestion: {user_message}"
        )
        try:
            response = await self.model.generate_content_async(prompt, stream=True)
            async for chunk in response:
                if chunk.text:
                    yield chunk.text
        except Exception as exc:  # noqa: BLE001
            logger.error("gemini_rag_stream_error", error=str(exc))
            if settings.GEMINI_API_KEY == "your_gemini_api_key_here":
                yield "\n\n_**API Key Missing:** Please open `backend/.env` and replace `your_gemini_api_key_here` with a real Gemini API Key._"
            else:
                yield "\n\n_Sorry — the tutor hit an error generating a response. Please try again._"

    async def _generate_json(self, prompt: str) -> str:
        """Helper to generate structured JSON using Gemini."""
        try:
            response = await self.model.generate_content_async(
                prompt,
                generation_config=genai.GenerationConfig(
                    response_mime_type="application/json"
                )
            )
            text = response.text.strip()
            if text.startswith("```json"):
                text = text[7:]
            if text.startswith("```"):
                text = text[3:]
            if text.endswith("```"):
                text = text[:-3]
            return text.strip()
        except Exception as exc:
            logger.error("gemini_json_error", error=str(exc))
            raise ValueError(f"AI Generation failed: {str(exc)}")

    async def generate_quiz(self, topic: str, num_questions: int = 5) -> str:
        prompt = f"""Generate a {num_questions}-question multiple choice quiz on the topic of '{topic}'.
        Return ONLY a JSON array of objects, each with:
        'question' (string),
        'options' (array of 4 strings),
        'correct_answer' (the 0-indexed integer of the correct option),
        'explanation' (string explaining why it's correct)."""
        
        try:
            if settings.GEMINI_API_KEY == "your_gemini_api_key_here" or not settings.GEMINI_API_KEY:
                raise ValueError("No API Key configured")
            return await self._generate_json(prompt)
        except Exception as e:
            logger.warning(f"Falling back to mock quiz due to error: {e}")
            return """[
                {
                    "question": "What is the primary goal of this topic? (Mock Quiz - AI hit a Rate Limit)",
                    "options": ["To learn", "To fail", "To sleep", "To eat"],
                    "correct_answer": 0,
                    "explanation": "Learning is the primary goal of any topic!"
                }
            ]"""

    async def generate_roadmap(self, role: str, level: str, time: str) -> str:
        prompt = f"""Generate a personalized learning roadmap for a {level} level developer aiming to become a {role}, with {time} to study.
        Return ONLY a JSON array of phase objects, each with:
        'phase' (string, e.g. 'Phase 1: Foundations'),
        'time' (string, e.g. '4 weeks'),
        'items' (string, comma separated topics),
        'icon' (string, choose one of: GitCommit, Settings, BrainCircuit, Database, Rocket)."""
        return await self._generate_json(prompt)

    async def generate_projects(self, role: str, level: str) -> str:
        prompt = f"""Generate 3 project ideas for a {level} {role}.
        Return ONLY a JSON array of objects, each with:
        'title' (string),
        'description' (string, 1-2 sentences),
        'tags' (array of strings, e.g. ['Python', 'NLP'])."""
        return await self._generate_json(prompt)

    async def analyze_resume(self, resume_text: str, role: str = "ML Engineer") -> str:
        prompt = f"""Analyze the following resume text for a {role} position.
        Return ONLY a JSON object with:
        'score' (integer 0-100),
        'strengths' (array of strings),
        'improvements' (array of strings).
        
        Resume Text:
        {resume_text}"""
        return await self._generate_json(prompt)

    async def generate_interview_question(self, role: str, level: str) -> str:
        prompt = f"""Generate a single technical interview question for a {level} {role}.
        Return ONLY a JSON object with:
        'question' (string)."""
        return await self._generate_json(prompt)

    async def evaluate_interview_answer(self, question: str, answer: str) -> str:
        prompt = f"""Evaluate this candidate's answer to the interview question.
        Question: {question}
        Answer: {answer}
        
        Return ONLY a JSON object with:
        'score' (integer 1-10),
        'feedback' (string)."""
        return await self._generate_json(prompt)

    async def generate_flashcards(self, topic: str, content: str, num_cards: int = 5) -> str:
        prompt = f"""Generate exactly {num_cards} flashcards summarizing the following educational content about '{topic}'.
        Return ONLY a JSON array of objects, each with:
        'question' (string),
        'answer' (string, concise but informative).
        
        Content:
        {content}"""
        
        try:
            if settings.GEMINI_API_KEY == "your_gemini_api_key_here" or not settings.GEMINI_API_KEY:
                raise ValueError("No API Key configured")
            return await self._generate_json(prompt)
        except Exception as e:
            logger.warning(f"Falling back to mock flashcards due to error: {e}")
            return """[
                {"question": "What is the main concept of this module?", "answer": "This is a mock flashcard! (Your AI Tutor hit a rate limit or error)."},
                {"question": "How is this topic applied in the real world?", "answer": "You can apply it by building robust models and optimizing algorithms."},
                {"question": "What is the most common pitfall?", "answer": "Forgetting to normalize your data or overfitting the training set."}
            ]"""


def get_ai_service() -> AIService:
    return AIService()
