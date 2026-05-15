# Resume Assistant 📄

An AI-powered tool that analyzes your resume against a job description and generates a personalized interview preparation guide — built with the Claude API.

## Features

- **Resume Analyzer** — fit score, keyword matching, experience gap analysis, and tailored resume bullet suggestions
- **Interview Prep** — personalized technical, behavioral, and culture questions with talking points and red flags to address
- **PDF + TXT support** — upload your resume in either format
- **Web UI** — clean Streamlit interface with a CLI alternative

## Tech Stack

- [Anthropic Claude API](https://docs.anthropic.com) — LLM backbone
- [Pydantic](https://docs.pydantic.dev) — structured output validation
- [Streamlit](https://streamlit.io) — web interface
- [Typer](https://typer.tiangolo.com) — CLI interface
- [pdfplumber](https://github.com/jsvine/pdfplumber) — PDF text extraction
- Python 3.11+

## Skills Demonstrated

- LLM API integration (Anthropic Python SDK)
- Function calling with a multi-turn tool loop
- Structured JSON outputs with Pydantic schema validation
- Prompt engineering — persona, output contracts, scoring guides
- CLI design with Typer
- Web UI with Streamlit

## Setup

**1. Clone the repo**
```bash
git clone https://github.com/YOUR_USERNAME/resume-analyzer.git
cd resume-analyzer
```

**2. Create and activate virtual environment**
```bash
python -m venv .venv

# Windows
.venv\Scripts\activate

# Mac/Linux
source .venv/bin/activate
```

**3. Install dependencies**
```bash
pip install -r requirements.txt
```

**4. Add your API key**

Create a `.env` file in the project root:
```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

**5. Run the web UI**
```bash
streamlit run app.py
```

**Or run the CLI**
```bash
python main.py --resume your_resume.pdf --job job_description.txt
```

## Project Structure

```
resume-analyzer/
├── app.py          # Streamlit web UI
├── main.py         # CLI entry point
├── analyzer.py     # Core logic — Claude API calls and tool loop
├── models.py       # Pydantic output schemas
├── prompts.py      # System prompts
├── utils.py        # File reading helper (txt + pdf)
└── CLAUDE.md       # Claude Code project brief
```

## How It Works

### Function Calling
Both modes use a tool loop — Claude calls tools (`extract_resume_sections`, `score_keyword_match`, `categorize_questions`) and your code executes them locally. Claude then uses the results to generate the final structured response.

### Structured Outputs
All responses are validated against Pydantic models (`AnalysisResult`, `InterviewPrepResult`) — if Claude returns the wrong shape, it fails loudly rather than passing bad data downstream.

## License

MIT