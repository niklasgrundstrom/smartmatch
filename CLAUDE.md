# SmartMatch — Claude Code Context

## What We're Building
SmartMatch is an AI-powered consultant matching tool built at Rejlers' hackathon 2026.
The core problem: our current system matches consultant requests to consultants using strict keyword matching.
SmartMatch replaces this with semantic AI matching that understands intent, synonyms, and context.

## The Flow
1. User uploads or pastes a consultant request (PDF, Word, free text, or email)
2. Claude API extracts structured competences from the request
3. These competences are semantically matched against a pool of consultant profiles
4. The system returns a ranked list of consultants with match scores, matched skills, missing skills, and an AI-generated explanation

## Tech Stack
- **Frontend:** React + Tailwind CSS (Vite)
- **Backend:** FastAPI (Python 3.11)
- **AI:** Anthropic Claude API (`claude-sonnet-4-6`)
- **File parsing:** PyMuPDF (PDF), python-docx (Word)
- **Data:** Mocked consultant profiles as JSON (in `/data/consultants.json`)
- **Repo:** Monorepo — `frontend/`, `backend/`, `data/`

## Project Structure
```
smartmatch/
├── frontend/          # React app (Vite)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── api/       # API call helpers
│   └── .env           # VITE_API_URL
├── backend/           # FastAPI app
│   ├── main.py        # Entry point + routes
│   ├── extractor.py   # CV/request competence extraction via Claude
│   ├── matcher.py     # Semantic matching logic via Claude
│   ├── parser.py      # PDF/Word/text file parsing
│   └── .env           # ANTHROPIC_API_KEY
├── data/
│   └── consultants.json  # Mocked consultant profiles
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
└── CLAUDE.md
```

## API Contract

### POST `/api/extract`
Accepts a consultant request (raw text or file), returns extracted competences.
```json
// Request
{ "text": "We need a senior backend developer with Python and AWS experience..." }

// Response
{
  "competences": ["Python", "AWS", "backend development", "senior level"],
  "roles": ["Backend Developer"],
  "industries": [],
  "languages": []
}
```

### POST `/api/match`
Accepts extracted competences, returns ranked consultant matches.
```json
// Request
{
  "competences": ["Python", "AWS", "backend development"],
  "roles": ["Backend Developer"]
}

// Response
{
  "matches": [
    {
      "consultant_id": "001",
      "name": "Anna Svensson",
      "match_score": 92,
      "matched_skills": ["Python", "backend development"],
      "missing_skills": ["AWS"],
      "explanation": "Anna is a strong match with 5 years of Python backend experience. She lacks direct AWS experience but has worked extensively with Azure which is closely related.",
      "profile_summary": "Senior backend developer at Rejlers with experience in Python, Azure, SQL..."
    }
  ]
}
```

### POST `/api/upload`
Accepts a file upload (PDF or Word), returns extracted raw text.
```json
// Response
{ "text": "extracted raw text from file..." }
```

## Consultant Profile Schema
Each consultant in `/data/consultants.json` follows this structure:
```json
{
  "id": "001",
  "name": "Anna Svensson",
  "title": "Senior Backend Developer",
  "roles": ["Backend Developer", "Solution Architect"],
  "skills": [
    { "name": "Python", "level": 4 },
    { "name": "Azure", "level": 3 },
    { "name": "SQL", "level": 4 }
  ],
  "industries": ["Finance", "Energy"],
  "languages": ["Swedish", "English"],
  "summary": "Senior backend developer with 8 years of experience..."
}
```
Skill levels follow the Rejlers scale: 1=Basic, 2=Intermediate, 3=High, 4=Very High, 5=Expert

## Claude API Usage
- Always use model: `claude-sonnet-4-6`
- API key is stored in `backend/.env` as `ANTHROPIC_API_KEY` — never hardcode it
- For extraction: instruct Claude to return **only valid JSON**, no markdown fences
- For matching: send all consultant profiles + extracted competences in one prompt, ask for ranked results with scores and explanations

## Conventions
- All API responses use camelCase JSON
- Backend runs on port `8000`, frontend on port `5173`
- Frontend calls backend via `VITE_API_URL` env variable (default: `http://localhost:8000`)
- Use `python-dotenv` in backend to load `.env`
- All new backend routes go in `main.py` for now — keep it simple
- Commit often, push to your feature branch, PR into `dev`

## Branching
- `main` — demo-ready only
- `dev` — integration branch
- `feature/name-feature` — personal working branches
- Always PR into `dev`, never directly into `main`

## Team
- Person 1: Frontend (upload UI + results view)
- Person 2: Backend (PDF parsing + Claude API extraction)
- Person 3: Matching logic + mock consultant data

## Environment Variables
**backend/.env**
```
ANTHROPIC_API_KEY=your_key_here
```
**frontend/.env**
```
VITE_API_URL=http://localhost:8000
```

## What Good Looks Like
- Upload a real Rejlers consultant PDF → structured JSON profile extracted
- Paste a client request → competences extracted in under 3 seconds
- Results show ranked consultant cards with match %, green matched skills, red missing skills, and a human-readable explanation
- The demo story: paste "Vi behöver en senior Python-utvecklare med erfarenhet av BI och energisektorn" → Niklas Grundström comes up as top match with a clear explanation of why