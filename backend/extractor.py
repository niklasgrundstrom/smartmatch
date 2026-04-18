import json
import os

import anthropic
from dotenv import load_dotenv

load_dotenv()

client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

EXTRACT_PROMPT = """You are a technical recruiter assistant. Extract structured competences from the consultant request below.

Return ONLY valid JSON with this exact structure:
{{
  "competences": ["list of technical skills, tools, technologies"],
  "roles": ["list of job roles or titles mentioned"],
  "industries": ["list of industries or domains mentioned"],
  "languages": ["list of spoken/written languages required"]
}}

No markdown, no explanation — only the JSON object.

Consultant request:
{text}"""


PROFILE_PROMPT = """You are a technical recruiter assistant. Extract a structured consultant profile from the CV text below.

Return ONLY valid JSON with this exact structure:
{{
  "name": "Full Name",
  "title": "Job Title",
  "roles": ["Role 1", "Role 2"],
  "skills": [
    {{"name": "Skill", "level": 3}}
  ],
  "industries": ["Industry 1"],
  "languages": ["Swedish", "English"],
  "summary": "2-3 sentence professional summary"
}}

Skill levels: 1=Basic, 2=Intermediate, 3=High, 4=Very High, 5=Expert
No markdown, no explanation — only the JSON object.

CV text:
{text}"""


async def extract_consultant_profile(text: str) -> dict:
    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=2048,
        messages=[{"role": "user", "content": PROFILE_PROMPT.format(text=text)}],
    )
    return json.loads(_strip_fences(message.content[0].text))


async def extract_competences(text: str) -> dict:
    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        messages=[{"role": "user", "content": EXTRACT_PROMPT.format(text=text)}],
    )
    return json.loads(_strip_fences(message.content[0].text))


def _strip_fences(text: str) -> str:
    text = text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1]
    if text.endswith("```"):
        text = text.rsplit("```", 1)[0]
    return text.strip()
