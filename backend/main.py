from fastapi import FastAPI, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from extractor import extract_competences
from matcher import match_consultants
from parser import parse_file

app = FastAPI()

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


@app.post("/api/match")
async def match(req: MatchRequest):
    try:
        result = await match_consultants(req.model_dump())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e
    return result
