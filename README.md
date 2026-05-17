# CareerAI
 
An AI-powered job application assistant built with the Claude API. From analyzing your resume to practicing for the interview — everything you need to land your next job in one place.
 
**Live demo:** [careerai-delta.vercel.app](https://careerai-delta.vercel.app)
 
## Features
 
- **Resume Analyzer** — fit score, keyword matching, experience gap analysis, and tailored resume bullet suggestions
- **Resume Rewriter** — Claude rewrites your entire resume for a specific job. Review and approve or reject every suggested change before downloading as a PDF
- **Interview Prep** — personalized technical, behavioral, and culture fit questions with topics to study, talking points, and red flags to address
- **Mock Interview** — adaptive AI interviewer that asks follow-up questions based on your answers, scores each response, and gives a full debrief at the end
## Tech Stack
 
**Backend**
- [Anthropic Claude API](https://docs.anthropic.com) — LLM backbone (claude-sonnet-4-6)
- [FastAPI](https://fastapi.tiangolo.com) — REST API with 7 endpoints
- [Pydantic](https://docs.pydantic.dev) — structured output validation
- [pdfplumber](https://github.com/jsvine/pdfplumber) — PDF text extraction
- [ReportLab](https://www.reportlab.com) — PDF generation
- [SlowAPI](https://github.com/laurentS/slowapi) — rate limiting
- Python 3.11+
**Frontend**
- [React](https://react.dev) + [Vite](https://vitejs.dev)
- [@tabler/icons-react](https://tabler.io/icons) — icons
- CSS variables — dark/light mode theming
**Deployment**
- Backend → [Render](https://render.com)
- Frontend → [Vercel](https://vercel.com)
## Skills Demonstrated
 
- LLM API integration (Anthropic Python SDK)
- Function calling with a multi-turn tool loop
- Structured JSON outputs with Pydantic schema validation
- Prompt engineering — persona, output contracts, scoring guides, honesty constraints
- FastAPI — REST endpoints, file uploads, PDF file responses
- React — component architecture, useState, useRef, useEffect, fetch
- Full-stack deployment — separate backend and frontend hosting
## Project Structure
 
```
careerai/
├── backend/
│   ├── api.py            # FastAPI — 7 endpoints
│   ├── analyzer.py       # Core logic — Claude API calls and tool loop
│   ├── models.py         # Pydantic output schemas
│   ├── prompts.py        # System prompts
│   ├── utils.py          # File reading helper (txt + pdf)
│   └── pdf_generator.py  # ReportLab PDF generation
├── frontend/
│   └── src/
│       ├── App.jsx
│       └── components/
│           ├── Nav.jsx
│           ├── Hero.jsx
│           ├── Analyzer.jsx
│           ├── Prep.jsx
│           ├── MockInterview.jsx
│           └── ResumeRewriter.jsx
├── samples/
│   ├── sample_resume.txt
│   ├── sample_resume.pdf
│   └── sample_jd.txt
├── CLAUDE.md
└── render.yaml
```
 
## Local Setup
 
**1. Clone the repo**
```bash
git clone https://github.com/ipekdolu/careerai.git
cd careerai
```
 
**2. Backend setup**
```bash
cd backend
python -m venv .venv
 
# Windows
.venv\Scripts\activate
 
# Mac/Linux
source .venv/bin/activate
 
pip install -r requirements.txt
```
 
**3. Add your API key**
 
Create a `.env` file inside `backend/`:
```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```
 
**4. Run the backend**
```bash
uvicorn api:app --reload
```
Runs on http://127.0.0.1:8000 — visit /docs for the interactive API documentation.
 
**5. Frontend setup**
```bash
cd ../frontend
npm install
```
 
Create `frontend/.env.development`:
```
VITE_API_URL=http://127.0.0.1:8000
```
 
**6. Run the frontend**
```bash
npm run dev
```
Runs on http://localhost:5173
 
## How It Works
 
### Function Calling
The analyzer and interview features use a multi-turn tool loop — Claude calls tools (`extract_resume_sections`, `score_keyword_match`, `categorize_questions`) and the Python code executes them locally. Claude uses the results to generate the final structured response.
 
### Structured Outputs
All Claude responses are validated against Pydantic models (`AnalysisResult`, `InterviewPrepResult`, `ResumeDiff`, `AnswerFeedback`, `InterviewSummary`). If Claude returns the wrong shape, it fails loudly rather than passing bad data downstream.
 
### Adaptive Mock Interview
The mock interview doesn't pre-generate questions. Claude sees the full conversation history on every turn and decides the next question based on what the candidate just said — probing shallow answers with follow-ups and moving on when an answer is solid.
 
### Resume Rewriter Diff
Claude returns a structured diff (original vs suggested) for every section of the resume. The user approves or rejects each change individually before the final PDF is generated.
 
## License
 
MIT