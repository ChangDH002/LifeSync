"""
RecommendationService: SBERT 기반 추천 CSV 의미론적 검색 서비스
"""
from __future__ import annotations

from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer


FALLBACK_RECOMMENDATION = {
    "recommendation_title": "전문가 상담 권장",
    "recommendation_text": (
        "현재 입력하신 내용과 유사한 추천 항목을 찾지 못했습니다. "
        "전문 의료기관 또는 치매안심센터에 방문하시면 개인 맞춤 도움을 받으실 수 있습니다."
    ),
    "category": "",
    "priority": "",
}


class RecommendationService:
    def __init__(
        self,
        csv_path: Path | str,
        model_path: str,
        threshold: float = 0.5,
        sbert_model: Any = None,
    ) -> None:
        self.csv_path = Path(csv_path)
        self.model_path = model_path
        self.threshold = threshold

        # ChatbotService 모델 인스턴스를 재사용해 메모리 절약
        self.model: Any = sbert_model
        self.vectorizer: TfidfVectorizer | None = None
        self.data: pd.DataFrame | None = None
        self._embeddings: np.ndarray | None = None
        self.backend: str = "uninitialized"

    def load(self) -> None:
        self.data = pd.read_csv(self.csv_path)
        required = {"user_text", "recommendation_title", "recommendation_text"}
        if not required.issubset(self.data.columns):
            raise ValueError(
                f"CSV must contain columns {required}, got {list(self.data.columns)}"
            )

        user_texts = self.data["user_text"].astype(str).tolist()
        try:
            if self.model is None:
                from sentence_transformers import SentenceTransformer

                self.model = SentenceTransformer(self.model_path)

            self._embeddings = self.model.encode(
                user_texts,
                convert_to_numpy=True,
                normalize_embeddings=True,
                show_progress_bar=True,
            )
            self.backend = "sbert"
        except Exception:
            self.model = None
            self.vectorizer = TfidfVectorizer()
            self._embeddings = self.vectorizer.fit_transform(user_texts).toarray()
            norms = np.linalg.norm(self._embeddings, axis=1, keepdims=True)
            norms[norms == 0] = 1.0
            self._embeddings = self._embeddings / norms
            self.backend = "tfidf"

    def recommend(self, message: str) -> dict[str, Any]:
        if self.model is None or self.data is None or self._embeddings is None:
            if self.backend != "tfidf" or self.data is None or self._embeddings is None:
                raise RuntimeError(
                    "RecommendationService.load() must be called before recommend()"
                )

        if self.backend == "sbert":
            query_emb = self.model.encode(
                message,
                convert_to_numpy=True,
                normalize_embeddings=True,
            )
        else:
            if self.vectorizer is None:
                raise RuntimeError("TF-IDF vectorizer is not initialized")
            query_emb = self.vectorizer.transform([message]).toarray()[0]
            norm = np.linalg.norm(query_emb)
            if norm != 0:
                query_emb = query_emb / norm

        scores: np.ndarray = self._embeddings @ query_emb
        best_idx = int(np.argmax(scores))
        best_score = float(scores[best_idx])

        if best_score < self.threshold:
            return {**FALLBACK_RECOMMENDATION, "score": best_score, "matched": False}

        row = self.data.iloc[best_idx]
        return {
            "recommendation_title": str(row["recommendation_title"]),
            "recommendation_text": str(row["recommendation_text"]),
            "category": str(row.get("category", "")),
            "priority": str(row.get("priority", "")),
            "score": best_score,
            "matched": True,
        }
