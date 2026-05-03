"""
ChatbotService: SBERT 기반 QA CSV 의미론적 검색 서비스
"""
from __future__ import annotations

from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd


FALLBACK_ANSWER = (
    "죄송합니다, 해당 질문에 대한 적절한 답변을 찾지 못했습니다. "
    "치매 관련 전문 의료기관에 상담을 받아보시는 것이 좋습니다."
)


class ChatbotService:
    def __init__(
        self,
        csv_path: Path | str,
        model_path: str,
        threshold: float = 0.5,
    ) -> None:
        self.csv_path = Path(csv_path)
        self.model_path = model_path
        self.threshold = threshold

        self.model: Any = None
        self.data: pd.DataFrame | None = None
        self._embeddings: np.ndarray | None = None

    def load(self) -> None:
        from sentence_transformers import SentenceTransformer

        self.model = SentenceTransformer(self.model_path)

        self.data = pd.read_csv(self.csv_path)
        required = {"question", "answer"}
        if not required.issubset(self.data.columns):
            raise ValueError(
                f"CSV must contain columns {required}, got {list(self.data.columns)}"
            )

        questions = self.data["question"].astype(str).tolist()
        self._embeddings = self.model.encode(
            questions,
            convert_to_numpy=True,
            normalize_embeddings=True,
            show_progress_bar=True,
        )

    def answer(self, message: str) -> dict[str, Any]:
        if self.model is None or self.data is None or self._embeddings is None:
            raise RuntimeError("ChatbotService.load() must be called before answer()")

        query_emb = self.model.encode(
            message,
            convert_to_numpy=True,
            normalize_embeddings=True,
        )

        # 코사인 유사도 (임베딩이 이미 정규화됐으므로 내적 = 코사인 유사도)
        scores: np.ndarray = self._embeddings @ query_emb
        best_idx = int(np.argmax(scores))
        best_score = float(scores[best_idx])

        if best_score < self.threshold:
            return {
                "answer": FALLBACK_ANSWER,
                "category": "",
                "score": best_score,
                "matched": False,
            }

        row = self.data.iloc[best_idx]
        return {
            "answer": str(row["answer"]),
            "category": str(row.get("category", "")),
            "score": best_score,
            "matched": True,
        }
