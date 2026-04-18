import json
import os

import anthropic
from dotenv import load_dotenv

load_dotenv()

client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

EXTRACT_PROMPT = """You are a technical recruiter assistant. Extract structured competences from the consultant request below.

Return ONLY valid JSON with this exact structure:
{
  "competences": ["list of technical skills, tools, technologies"],
  "roles": ["list of job roles or titles mentioned"],
  "industries": ["list of industries or domains mentioned"],
  "languages": ["list of spoken/written languages required"]
}

No markdown, no explanation — only the JSON object.

Consultant request:
{text}"""


async def extract_competences(text: str) -> dict:
    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1024,
        messages=[{"role": "user", "content": EXTRACT_PROMPT.format(text=text)}],
    )
    return json.loads(message.content[0].text)
