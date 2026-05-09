import json
import logging
import os
from typing import Any

logger = logging.getLogger(__name__)

_dataset = None
_embeddings = None
_sbert_model = None
_sbert_available: bool | None = None
_seed_data: list[dict] | None = None

SEED_PATH = "app/data/dementia_faq_seed.json"


def is_sbert_available() -> bool:
    global _sbert_available
    if _sbert_available is None:
        try:
            from sentence_transformers import SentenceTransformer  # noqa: F401
            _sbert_available = True
        except ImportError:
            _sbert_available = False
    return _sbert_available


def _get_dataset_path() -> str:
    try:
        from app.core.config import settings
        return settings.sbert_dataset_path
    except Exception:
        return "app/data/dementia_question_dataset_7000.csv"


def load_dataset():
    global _dataset
    if _dataset is not None:
        return _dataset

    path = _get_dataset_path()

    try:
        import pandas as pd
        df = pd.read_csv(path, encoding="utf-8")
        _dataset = df
        logger.info("데이터셋 로드 완료: %d행", len(df))
        return _dataset
    except FileNotFoundError:
        logger.warning("데이터셋 파일 없음: %s — seed FAQ fallback 사용", path)
        _dataset = None
        return None
    except Exception as e:
        logger.warning("데이터셋 로드 실패: %s", e)
        _dataset = None
        return None


def get_dataset_row_count() -> int:
    ds = load_dataset()
    if ds is None:
        return 0
    try:
        return len(ds)
    except Exception:
        return 0


def retrieve_context(query: str, top_k: int = 3) -> list[dict]:
    if is_sbert_available():
        try:
            return _sbert_retrieve(query, top_k)
        except Exception as e:
            logger.warning("SBERT 검색 실패: %s — keyword fallback 사용", e)
    return keyword_retrieve(query, top_k)


def _sbert_retrieve(query: str, top_k: int = 3) -> list[dict]:
    global _sbert_model, _embeddings

    ds = load_dataset()
    if ds is None or len(ds) == 0:
        return _seed_fallback(query, top_k)

    from sentence_transformers import SentenceTransformer
    import numpy as np
    from sklearn.metrics.pairwise import cosine_similarity

    try:
        from app.core.config import settings
        model_name = settings.sbert_model_name
    except Exception:
        model_name = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"

    if _sbert_model is None:
        logger.info("SBERT 모델 로딩: %s", model_name)
        _sbert_model = SentenceTransformer(model_name)

    if _embeddings is None:
        questions = ds["question"].fillna("").tolist()
        logger.info("임베딩 계산 중 (%d개)...", len(questions))
        _embeddings = _sbert_model.encode(questions, convert_to_numpy=True, show_progress_bar=False)

    query_vec = _sbert_model.encode([query], convert_to_numpy=True)
    sims = cosine_similarity(query_vec, _embeddings)[0]
    top_indices = np.argsort(sims)[::-1][:top_k]

    results = []
    for idx in top_indices:
        row = ds.iloc[int(idx)]
        results.append({
            "question": str(row.get("question", "")),
            "answer": str(row.get("answer", "")),
            "category": str(row.get("category", "")),
            "score": float(sims[idx]),
        })
    return results


def keyword_retrieve(query: str, top_k: int = 3) -> list[dict]:
    ds = load_dataset()
    if ds is None or len(ds) == 0:
        return _seed_fallback(query, top_k)

    query_words = set(query.split())
    scores: list[tuple[int, int]] = []

    for i in range(len(ds)):
        row = ds.iloc[i]
        q_words = set(str(row.get("question", "")).split())
        a_words = set(str(row.get("answer", "")).split())
        score = len(query_words & q_words) * 2 + len(query_words & a_words)
        scores.append((score, i))

    scores.sort(reverse=True)
    results = []
    for score, idx in scores[:top_k]:
        row = ds.iloc[idx]
        results.append({
            "question": str(row.get("question", "")),
            "answer": str(row.get("answer", "")),
            "category": str(row.get("category", "")),
            "score": float(score),
        })
    return results


def _load_seed() -> list[dict]:
    global _seed_data
    if _seed_data is not None:
        return _seed_data
    try:
        with open(SEED_PATH, encoding="utf-8") as f:
            _seed_data = json.load(f)
    except Exception as e:
        logger.warning("Seed FAQ 로드 실패: %s", e)
        _seed_data = []
    return _seed_data


def _seed_fallback(query: str, top_k: int = 3) -> list[dict]:
    seed = _load_seed()
    if not seed:
        return []
    query_words = set(query.split())
    scored = []
    for item in seed:
        q_words = set(str(item.get("question", "")).split())
        score = len(query_words & q_words)
        scored.append((score, item))
    scored.sort(reverse=True, key=lambda x: x[0])
    return [
        {
            "question": item["question"],
            "answer": item["answer"],
            "category": item.get("category", ""),
            "score": float(score),
        }
        for score, item in scored[:top_k]
    ]
