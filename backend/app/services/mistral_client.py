import json
import re
from typing import Any
from mistralai import Mistral
from app.config import settings


_fence_re = re.compile(r"^```(?:json)?\s*|\s*```\s*$", re.IGNORECASE)


def strip_fences(text: str) -> str:
    return _fence_re.sub("", text.strip()).strip()


def parse_json_loose(text: str) -> Any:
    cleaned = strip_fences(text)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass
    starts = [i for i in (cleaned.find("{"), cleaned.find("[")) if i != -1]
    if not starts:
        raise ValueError("No JSON object or array found in model output")
    first = min(starts)
    last = max(cleaned.rfind("}"), cleaned.rfind("]"))
    if last == -1:
        raise ValueError("Unclosed JSON in model output")
    return json.loads(cleaned[first : last + 1])


class MistralService:
    def __init__(self) -> None:
        if not settings.mistral_api_key:
            raise RuntimeError("MISTRAL_API_KEY is not set in .env")
        self.client = Mistral(api_key=settings.mistral_api_key)
        self.heavy = settings.mistral_model_heavy
        self.light = settings.mistral_model_light

    async def _chat(self, model: str, prompt: str, *, json_mode: bool = False, temperature: float = 0.2) -> str:
        messages = [{"role": "user", "content": prompt}]
        kwargs: dict[str, Any] = {"model": model, "messages": messages, "temperature": temperature}
        if json_mode:
            kwargs["response_format"] = {"type": "json_object"}
        resp = await self.client.chat.complete_async(**kwargs)
        return resp.choices[0].message.content or ""

    async def heavy_json(self, prompt: str, temperature: float = 0.2) -> Any:
        text = await self._chat(self.heavy, prompt, json_mode=True, temperature=temperature)
        return parse_json_loose(text)

    async def light_json(self, prompt: str, temperature: float = 0.2) -> Any:
        text = await self._chat(self.light, prompt, json_mode=True, temperature=temperature)
        return parse_json_loose(text)

    async def light_text(self, prompt: str, temperature: float = 0.5) -> str:
        return await self._chat(self.light, prompt, temperature=temperature)

    async def verify_spam(self, subject: str, body: str) -> dict:
        prompt = f"""A small classifier flagged this email as potentially spam. Verify with a clear binary judgment.

Subject: {subject}
Body (first 600 chars): {body[:600]}

Return JSON only:
{{"is_spam": true|false, "reason": "one short sentence"}}"""
        try:
            result = await self.light_json(prompt, temperature=0.0)
            return {
                "is_spam": bool(result.get("is_spam", False)),
                "reason": str(result.get("reason", "")),
            }
        except Exception:
            return {"is_spam": False, "reason": "verifier failed, defaulting to not-spam"}


_singleton: MistralService | None = None


def get_mistral() -> MistralService:
    global _singleton
    if _singleton is None:
        _singleton = MistralService()
    return _singleton
