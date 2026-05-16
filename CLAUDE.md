# CareerAI — Claude Code Brief

## What This Project Is
A full-stack AI-powered job application assistant with three features:
- Resume Analyzer — fit score, keyword match, gaps, tailored bullets
- Interview Prep — personalized questions, topics, talking points
- Mock Interview — adaptive AI interviewer with scored feedback

## Architecture
- `analyzer.py` — core logic, Claude API calls, tool loop
- `models.py` — Pydantic output schemas
- `prompts.py` — system prompts
- `utils.py` — file reading helper (txt + pdf)
- `api.py` — FastAPI backend, 6 endpoints
- `frontend/` — React + Vite frontend
- `app.py` — legacy Streamlit UI (kept for reference)

## How to Run

### Backend
```bash
uvicorn api:app --reload
```
Runs on http://127.0.0.1:8000

### Frontend
```bash
cd frontend
npm run dev
```
Runs on http://localhost:5173

## Key Technical Decisions
- Function calling with separate ANALYZE_TOOLS and INTERVIEW_TOOLS
- Shared _run_tool_loop() helper in analyzer.py
- Pydantic validation on all Claude responses
- FastAPI with CORS enabled for local dev
- React + Vite, no UI library, CSS variables for theming

## Environment
- Python 3.11+
- Node.js 24+
- API key in .env as ANTHROPIC_API_KEY
- Model: claude-sonnet-4-6

## What NOT to Do
- Do not change model string without verifying it's valid
- Do not remove JSON stripping logic in analyzer.py
- Do not commit .env to Git
- Do not run npm install in project root — only inside frontend/