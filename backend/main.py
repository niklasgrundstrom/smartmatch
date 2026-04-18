import json

from fastapi import FastAPI, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from extractor import extract_competences, extract_consultant_profile
from matcher import match_consultants, load_consultants, DATA_PATH
from file_parser import parse_file

app = FastAPI(redirect_slashes=False)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class ExtractRequest(BaseModel):
    text: str


class MatchRequest(BaseModel):
    competences: list[str]
    roles: list[str] = []
    industries: list[str] = []
    languages: list[str] = []


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/api/upload")
async def upload(file: UploadFile):
    content = await file.read()
    try:
        text = await parse_file(content, file.filename or "")
    except Exception as e:
        raise HTTPException(status_code=422, detail=str(e)) from e
    return {"text": text}


@app.post("/api/extract")
async def extract(req: ExtractRequest):
    try:
        result = await extract_competences(req.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e
    return result


@app.post("/api/consultants")
async def add_consultant(file: UploadFile):
    content = await file.read()
    try:
        text = await parse_file(content, file.filename or "")
        consultant = await extract_consultant_profile(text)
        consultants = load_consultants()
        max_id = max(
            (int(c["id"]) for c in consultants if str(c.get("id", "")).isdigit()),
            default=0,
        )
        consultant["id"] = str(max_id + 1).zfill(3)
        consultants.append(consultant)
        DATA_PATH.write_text(
            json.dumps(consultants, ensure_ascii=False, indent=2), encoding="utf-8"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e
    return consultant


@app.post("/api/match")
async def match(req: MatchRequest):
    try:
        result = await match_consultants(req.model_dump())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e
    return result
