"""
RAG service: chunking, embedding, and similarity search against Chroma.

Runs Sentence Transformers locally (no external embedding API call) —
cheaper and faster than round-tripping to Gemini for every embedding, and
keeps embedding consistent even if the LLM provider changes later.
"""
import uuid

import chromadb
from chromadb.utils import embedding_functions
from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger("rag_service")

SIMILARITY_THRESHOLD = 0.35  # below this, we tell the user "not found in document"


class RAGService:
    def __init__(self):
        self.client = chromadb.PersistentClient(path=settings.CHROMA_PERSIST_DIR)
        self.embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
            model_name=settings.EMBEDDING_MODEL
        )
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=800, chunk_overlap=100, separators=["\n\n", "\n", ". ", " "]
        )

    def _collection(self, document_id: str):
        return self.client.get_or_create_collection(
            name=f"doc_{document_id}", embedding_function=self.embedding_fn
        )

    def chunk_text(self, text: str) -> list[str]:
        return [c for c in self.splitter.split_text(text) if c.strip()]

    def ingest(self, document_id: str, text: str) -> list[dict]:
        """
        Chunks + embeds + upserts into Chroma. Returns metadata rows
        ({chunk_index, content, vector_id}) for the caller to persist in
        Postgres via DocumentRepository.add_chunks.
        """
        chunks = self.chunk_text(text)
        collection = self._collection(document_id)
        ids = [f"{document_id}_{i}" for i in range(len(chunks))]
        collection.add(documents=chunks, ids=ids)
        logger.info("document_ingested", document_id=document_id, chunk_count=len(chunks))
        return [
            {"chunk_index": i, "content": chunk, "vector_id": chunk_id}
            for i, (chunk, chunk_id) in enumerate(zip(chunks, ids))
        ]

    def query(self, document_id: str, question: str, top_k: int = 4) -> list[str]:
        collection = self._collection(document_id)
        results = collection.query(query_texts=[question], n_results=top_k)
        docs = results.get("documents", [[]])[0]
        distances = results.get("distances", [[]])[0]

        relevant = [
            doc for doc, dist in zip(docs, distances) if (1 - dist) >= SIMILARITY_THRESHOLD
        ]
        return relevant or docs[:1]  # fall back to best-effort single chunk if nothing clears threshold

    def delete_document(self, document_id: str) -> None:
        try:
            self.client.delete_collection(name=f"doc_{document_id}")
        except Exception:  # noqa: BLE001
            pass


def get_rag_service() -> RAGService:
    return RAGService()


def extract_text_from_file(path: str, file_type: str) -> str:
    """Extract raw text from an uploaded PDF/DOCX/TXT file for chunking."""
    if file_type == "pdf":
        from pypdf import PdfReader

        reader = PdfReader(path)
        return "\n".join(page.extract_text() or "" for page in reader.pages)
    elif file_type == "docx":
        import docx

        doc = docx.Document(path)
        return "\n".join(p.text for p in doc.paragraphs)
    else:
        with open(path, encoding="utf-8", errors="ignore") as f:
            return f.read()
