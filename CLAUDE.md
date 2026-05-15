# Resume Analyzer — Claude Code Brief

## What This Project Is
A CLI and web tool that analyzes a resume against a job description using the Claude API.
It uses function calling, structured JSON outputs via Pydantic, and an engineered system prompt
to produce an honest, actionable fit assessment.

## Project Structure
- `main.py` — CLI entry point (Typer)
- `app.py` — Streamlit web UI
- `analyzer.py` — Core logic, Claude API calls, tool loop
- `models.py` — Pydantic output schema (AnalysisResult)
- `prompts.py` — System prompt
- `utils.py` — File reading helper (txt + pdf)
- `sample_resume.txt / .pdf` — Test resume
- `sample_jd.txt` — Test job description

## How to Run

### CLI
```bash
python main.py --resume sample_resume.txt --job sample_jd.txt
python main.py --resume sample_resume.pdf --job sample_jd.txt
```

### Web UI
```bash
streamlit run app.py
```

## Key Technical Decisions
- Function calling: Claude calls `extract_resume_sections` and `score_keyword_match` as tools
- Structured output: response validated against `AnalysisResult` Pydantic model
- Tool loop: `while True` loop in `analyze()` handles multi-turn tool calls
- PDF support: pdfplumber extracts text, falls back to error if scanned/empty
- JSON parsing: defensively strips markdown code fences before parsing

## Environment
- Python 3.11+
- Virtual environment: `.venv`
- API key in `.env` as `ANTHROPIC_API_KEY`
- Model: `claude-sonnet-4-6`

## Dependencies
- anthropic
- pydantic
- typer
- streamlit
- pdfplumber
- python-dotenv

## What NOT to Do
- Do not change the model string without checking it's valid
- Do not remove the `re.search(r"\{[\s\S]*\}")` JSON extraction in analyzer.py — Claude sometimes wraps output in prose or code fences
- Do not skip activating the virtual environment before running
- Do not commit `.env` to Git