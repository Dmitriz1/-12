import os
from datetime import datetime

import httpx
from fastapi import Depends

from app.repositories.analytics_repo import AnalyticsRepository

_GROQ_TOKEN = os.getenv("GROQ_TOKEN", "")
_GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
_GROQ_MODEL = "llama-3.1-8b-instant"


def _build_prompt(categories: list, total_expense: float, total_income: float) -> str:
    lines = "\n".join(f"- {r.category}: {float(r.total):.0f} руб." for r in categories)
    return (
        "Ты личный финансовый советник. "
        "Дай 3 конкретных совета по оптимизации бюджета на русском языке.\n\n"
        f"Доходы: {total_income:.0f} руб.\n"
        f"Расходы: {total_expense:.0f} руб.\n"
        f"Расходы по категориям:\n{lines}"
    )


class AIService:
    def __init__(self, repo: AnalyticsRepository = Depends()):
        self.repo = repo

    async def recommendations(
        self,
        user_id: int,
        dt_from: datetime,
        dt_to: datetime,
    ) -> str:
        categories = await self.repo.aggregate_by_category(user_id, dt_from, dt_to)
        totals = await self.repo.total_by_type(user_id, dt_from, dt_to)

        if not categories:
            return "Недостаточно данных для анализа."

        totals_map = {r.type: float(r.total) for r in totals}
        total_expense = totals_map.get("expense", 0.0)
        total_income = totals_map.get("income", 0.0)

        prompt = _build_prompt(categories, total_expense, total_income)

        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                _GROQ_URL,
                headers={"Authorization": f"Bearer {_GROQ_TOKEN}"},
                json={
                    "model": _GROQ_MODEL,
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": 700,
                },
            )
            response.raise_for_status()
            data = response.json()

        return data["choices"][0]["message"]["content"].strip()