import json
import os
from pathlib import Path

import anthropic
from dotenv import load_dotenv

load_dotenv()

client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

DATA_PATH = Path(__file__).parent.parent / "data" / "consultants.json"

DETAIL_PROMPT = """You are a technical recruiter analyst. You will receive a consultant request (possibly in Swedish) and one consultant's profile.

Consultant profile:
{profile_json}

Already-computed match data:
- Overall match score: {match_score}/100
- Matched skills: {matched_skills}
- Missing skills: {missing_skills}
- Match explanation: {explanation}

Consultant request text:
{request_text}

Step 1: Extract requirements from the request text.
- Skall-krav (must-haves): lines/points under a "Skall-krav" heading, or sentences containing words like "krav", "måste", "obligatorisk", "ska".
- Bör-krav (nice-to-haves): lines/points under a "Bör-krav" heading, or sentences containing "önskad", "meriterande", "bra om", "gärna".
- If there are no clear headings, use your best judgment to separate hard requirements from preferred ones based on phrasing.
- Keep each requirement as a short label (max 8 words).
- Extract between 2 and 6 requirements per category.

Step 2: For each requirement, rate how well this specific consultant meets it on a scale of 1 to 5:
  1 = No evidence of this skill/experience
  2 = Weak match (tangentially related)
  3 = Partial match (some evidence)
  4 = Strong match (clear evidence)
  5 = Expert-level match (explicitly strong)

Return ONLY valid JSON with this exact structure:
{{
  "must_haves": [
    {{ "requirement": "...", "rating": 4, "rationale": "One sentence." }}
  ],
  "nice_to_haves": [
    {{ "requirement": "...", "rating": 2, "rationale": "One sentence." }}
  ]
}}

No markdown, no explanation outside the JSON."""


def _load_consultants() -> list:
    return json.loads(DATA_PATH.read_text(encoding="utf-8"))


def _strip_fences(text: str) -> str:
    text = text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1]
    if text.endswith("```"):
        text = text.rsplit("```", 1)[0]
    return text.strip()


async def get_consultant_detail(
    consultant_id: str,
    request_text: str,
    match_score: int,
    matched_skills: list[str],
    missing_skills: list[str],
    explanation: str,
) -> dict:
    consultants = _load_consultants()
    profile = next((c for c in consultants if c["id"] == consultant_id), None)
    if profile is None:
        raise ValueError(f"Consultant {consultant_id} not found")

    prompt = DETAIL_PROMPT.format(
        profile_json=json.dumps(profile, ensure_ascii=False),
        match_score=match_score,
        matched_skills=", ".join(matched_skills),
        missing_skills=", ".join(missing_skills),
        explanation=explanation,
        request_text=request_text,
    )

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=2048,
        messages=[{"role": "user", "content": prompt}],
    )
    return json.loads(_strip_fences(message.content[0].text))
