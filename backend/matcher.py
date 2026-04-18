import json
import os
from pathlib import Path

import anthropic
from dotenv import load_dotenv

load_dotenv()

client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

DATA_PATH = Path(__file__).parent.parent / "data" / "consultants.json"

MATCH_PROMPT = """You are a consultant matching assistant. Given a set of required competences and a list of consultant profiles, rank the consultants by how well they match.

Required competences:
{competences}

Consultant profiles:
{profiles}

Return ONLY valid JSON with this exact structure:
{{
  "matches": [
    {{
      "consultantId": "id",
      "name": "name",
      "matchScore": 85,
      "matchedSkills": ["skill1", "skill2"],
      "missingSkills": ["skill3"],
      "explanation": "One or two sentences explaining why this consultant is a good or partial match."
    }}
  ]
}}

Rules:
- Include ALL consultants, sorted by matchScore descending
- matchScore is 0-100
- matchedSkills are competences from the request that the consultant covers (including semantically similar ones)
- missingSkills are competences from the request that the consultant lacks
- No markdown, no explanation outside the JSON"""


def load_consultants() -> list:
    return json.loads(DATA_PATH.read_text(encoding="utf-8"))


async def match_consultants(competences: dict) -> dict:
    consultants = load_consultants()
    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=4096,
        messages=[
            {
                "role": "user",
                "content": MATCH_PROMPT.format(
                    competences=json.dumps(competences, ensure_ascii=False),
                    profiles=json.dumps(consultants, ensure_ascii=False),
                ),
            }
        ],
    )
    return json.loads(message.content[0].text)
