import os
import re
import json
from dotenv import load_dotenv
import anthropic
from models import AnalysisResult, InterviewPrepResult, AnswerFeedback, InterviewSummary, ResumeDiff
from prompts import SYSTEM_PROMPT, INTERVIEW_PREP_PROMPT, EVALUATOR_PROMPT, REWRITER_PROMPT

load_dotenv()
 
client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
 
# ── Tools ──────────────────────────────────────────────────────────────────────
 
ANALYZE_TOOLS = [
    {
        "name": "extract_resume_sections",
        "description": "Extracts structured sections from raw resume text including skills, experience, and education.",
        "input_schema": {
            "type": "object",
            "properties": {
                "skills": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "List of technical and soft skills found in the resume"
                },
                "experience_summary": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "List of key responsibilities and achievements from work experience"
                },
                "years_of_experience": {
                    "type": "integer",
                    "description": "Total years of professional experience"
                },
                "education": {
                    "type": "string",
                    "description": "Highest education qualification"
                }
            },
            "required": ["skills", "experience_summary", "years_of_experience", "education"]
        }
    },
    {
        "name": "score_keyword_match",
        "description": "Scores how well the resume keywords match the job description requirements.",
        "input_schema": {
            "type": "object",
            "properties": {
                "resume_keywords": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Keywords and skills extracted from the resume"
                },
                "jd_keywords": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Keywords and requirements extracted from the job description"
                }
            },
            "required": ["resume_keywords", "jd_keywords"]
        }
    }
]
 
INTERVIEW_TOOLS = [
    {
        "name": "categorize_questions",
        "description": "Categorizes interview questions by type and identifies key preparation areas for the candidate.",
        "input_schema": {
            "type": "object",
            "properties": {
                "technical_focus_areas": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Key technical areas to focus questions on based on the JD"
                },
                "candidate_strengths": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Candidate strengths identified from the resume to build talking points around"
                },
                "candidate_weaknesses": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Candidate gaps identified from the resume that need addressing"
                }
            },
            "required": ["technical_focus_areas", "candidate_strengths", "candidate_weaknesses"]
        }
    }
]
 
 
# ── Python functions (Claude calls these as tools) ─────────────────────────────
 
def extract_resume_sections(skills: list, experience_summary: list, years_of_experience: int, education: str) -> dict:
    """Processes resume sections extracted by Claude."""
    return {
        "skills": skills,
        "experience_summary": experience_summary,
        "years_of_experience": years_of_experience,
        "education": education
    }
 
 
def score_keyword_match(resume_keywords: list, jd_keywords: list) -> dict:
    """Scores keyword match between resume and job description."""
    resume_set = set(k.lower() for k in resume_keywords)
    jd_set = set(k.lower() for k in jd_keywords)
 
    matched = resume_set.intersection(jd_set)
    missing = jd_set - resume_set
 
    score = int((len(matched) / len(jd_set)) * 100) if jd_set else 0
 
    return {
        "matched_keywords": list(matched),
        "missing_keywords": list(missing),
        "keyword_score": score
    }
 
 
def categorize_questions(technical_focus_areas: list, candidate_strengths: list, candidate_weaknesses: list) -> dict:
    """Processes question categories and candidate profile identified by Claude."""
    return {
        "technical_focus_areas": technical_focus_areas,
        "candidate_strengths": candidate_strengths,
        "candidate_weaknesses": candidate_weaknesses,
        "total_focus_areas": len(technical_focus_areas),
        "strength_count": len(candidate_strengths),
        "weakness_count": len(candidate_weaknesses)
    }
 
 
# ── Tool router ────────────────────────────────────────────────────────────────
 
def run_tool(tool_name: str, tool_input: dict) -> dict:
    """Executes the tool Claude requested and returns the result."""
    if tool_name == "extract_resume_sections":
        return extract_resume_sections(**tool_input)
    elif tool_name == "score_keyword_match":
        return score_keyword_match(**tool_input)
    elif tool_name == "categorize_questions":
        return categorize_questions(**tool_input)
    else:
        raise ValueError(f"Unknown tool: {tool_name}")
 
 
# ── Shared tool loop helper ────────────────────────────────────────────────────
 
def _run_tool_loop(messages: list, system: str, tools: list, max_tokens: int, result_model):
    """
    Generic tool loop — runs until Claude returns end_turn,
    then parses and validates the JSON response into result_model.
    """
    while True:
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=max_tokens,
            system=system,
            tools=tools,
            messages=messages
        )
 
        if response.stop_reason == "end_turn":
            text_block = next((b for b in response.content if b.type == "text"), None)
            if text_block is None:
                raise ValueError("Claude returned end_turn with no text block")
 
            raw_text = text_block.text
            match = re.search(r"\{[\s\S]*\}", raw_text)
            if not match:
                raise ValueError(f"No JSON object found in response: {raw_text[:200]}")
 
            parsed = json.loads(match.group(0))
            return result_model(**parsed)
 
        if response.stop_reason == "tool_use":
            messages.append({"role": "assistant", "content": response.content})
 
            tool_results = []
            for block in response.content:
                if block.type == "tool_use":
                    print(f"  🔧 Claude calling: {block.name}")
                    result = run_tool(block.name, block.input)
                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": json.dumps(result)
                    })
 
            messages.append({"role": "user", "content": tool_results})
 
        else:
            if response.stop_reason == "max_tokens":
                partial = next((b.text for b in response.content if hasattr(b, "text")), "no text")
                raise ValueError(f"Cut off after {len(partial)} chars. Partial output:\n{partial[:500]}")
# ── Public API ─────────────────────────────────────────────────────────────────
 
def analyze(resume_text: str, job_description: str) -> AnalysisResult:
    """Analyzes a resume against a job description and returns a structured fit assessment."""
    user_message = f"""
    ## Resume:
    {resume_text}
 
    ## Job Description:
    {job_description}
 
    First extract the resume sections, then score the keyword match.
    Finally return your full analysis as JSON.
    """
 
    messages = [{"role": "user", "content": user_message}]
    return _run_tool_loop(messages, SYSTEM_PROMPT, ANALYZE_TOOLS, 1500, AnalysisResult)
 
 
def interview_prep(job_description: str, resume_text: str = None) -> InterviewPrepResult:
    """Generates a personalized interview preparation guide based on a JD and optional resume."""
    if resume_text:
        user_message = f"""
        ## Job Description:
        {job_description}
 
        ## Candidate Resume:
        {resume_text}
 
        First categorize the questions and candidate profile using the tool.
        Then return a full personalized interview preparation guide as JSON.
        """
    else:
        user_message = f"""
        ## Job Description:
        {job_description}
 
        No resume provided — generate interview preparation based on the job description only.
        For candidate_talking_points and red_flags_to_address, provide general guidance.
        First categorize the questions using the tool, then return the full guide as JSON.
        """
 
    messages = [{"role": "user", "content": user_message}]
    return _run_tool_loop(messages, INTERVIEW_PREP_PROMPT, INTERVIEW_TOOLS, 2000, InterviewPrepResult)

def start_interview(job_description: str, resume_text: str, focus: str) -> tuple[str, list]:
    """Starts the interview — Claude generates the first question."""

    resume_section = f"\n## Candidate Resume:\n{resume_text}" if resume_text else ""

    system_context = f"""
## Job Description:
{job_description}
{resume_section}

## Interview Focus: {focus}
## IMPORTANT: Stay strictly within the {focus} focus for all questions.
## Do NOT introduce topics outside this focus area.
## Covered Topics So Far: None

You are starting the interview. Ask the first question.
Make it specific to the candidate's background and the role.
Since this is the first question, return a JSON object with exactly these keys:
- next_question (string — the opening interview question)
- topic_covered (string — short label for the topic)

No preamble, no extra keys, just the JSON.
"""

    messages = [{"role": "user", "content": "Please begin the interview with your first question."}]

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=500,
        system=EVALUATOR_PROMPT + system_context,
        messages=messages
    )

    raw_text = next((b.text for b in response.content if hasattr(b, "text")), "")
    match = re.search(r"\{[\s\S]*\}", raw_text)
    if not match:
        raise ValueError(f"No JSON found: {raw_text[:200]}")

    parsed = json.loads(match.group(0))
    first_question = parsed["next_question"]
    first_topic = parsed.get("topic_covered", "opening")

    conversation_history = [
        {"role": "assistant", "content": f"Q: {first_question}"}
    ]

    return first_question, conversation_history, first_topic


def evaluate_answer(
    question: str,
    answer: str,
    job_description: str,
    resume_text: str,
    covered_topics: list,
    conversation_history: list,
    focus: str
) -> AnswerFeedback:
    """Evaluates a candidate's answer and generates the next question."""

    resume_section = f"\n## Candidate Resume:\n{resume_text}" if resume_text else ""
    covered_str = ", ".join(covered_topics) if covered_topics else "None"

    system_context = f"""
## Job Description:
{job_description}
{resume_section}

## Interview Focus: {focus}
## IMPORTANT: You must stay within the {focus} focus for the entire interview.
## Do NOT switch to technical questions if focus is Behavioral or Culture & Fit.
## Do NOT switch topics outside the selected focus area under any circumstances.
## Covered Topics So Far: {covered_str}

Evaluate the candidate's answer and generate the next question.
"""

    messages = conversation_history + [
        {
            "role": "user",
            "content": f"Q: {question}\nA: {answer}"
        }
    ]

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1000,
        system=EVALUATOR_PROMPT + system_context,
        messages=messages
    )

    raw_text = next((b.text for b in response.content if hasattr(b, "text")), "")

    if not raw_text:
        raise ValueError("Claude returned no text")

    match = re.search(r"\{[\s\S]*\}", raw_text)
    if not match:
        raise ValueError(f"No JSON found: {raw_text[:200]}")

    parsed = json.loads(match.group(0))
    return AnswerFeedback(**parsed)


def summarize_interview(
    questions: list,
    answers: list,
    feedbacks: list
) -> InterviewSummary:
    """Generates a final summary after all interview questions are answered."""

    qa_pairs = "\n\n".join([
        f"Q: {q}\nA: {a}\nScore: {f.score}/10"
        for q, a, f in zip(questions, answers, feedbacks)
    ])

    messages = [
        {
            "role": "user",
            "content": f"""
## Mock Interview Transcript:
{qa_pairs}

Generate a final interview summary assessment as JSON.
"""
        }
    ]

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1000,
        system=EVALUATOR_PROMPT,
        messages=messages
    )

    raw_text = next((b.text for b in response.content if hasattr(b, "text")), "")

    if not raw_text:
        raise ValueError("Claude returned no text")

    match = re.search(r"\{[\s\S]*\}", raw_text)
    if not match:
        raise ValueError(f"No JSON found: {raw_text[:200]}")

    parsed = json.loads(match.group(0))
    return InterviewSummary(**parsed)

def rewrite_resume(resume_text: str, job_description: str) -> ResumeDiff:
    """Rewrites a resume tailored to a specific job description, returning a structured diff."""

    user_message = f"""
    ## Current Resume:
    {resume_text}

    ## Target Job Description:
    {job_description}

    Rewrite this resume to be perfectly tailored for this job description.
    Return a structured diff showing original vs suggested for every section.
    Remember — stay honest, never fabricate experience or skills.
    Return as JSON only.
    """

    messages = [{"role": "user", "content": user_message}]

    for attempt in range(3):
        try:
            response = client.messages.create(
                model="claude-sonnet-4-6",
                max_tokens=4000,
                system=REWRITER_PROMPT,
                messages=messages
            )

            raw_text = next((b.text for b in response.content if hasattr(b, "text")), "")

            if not raw_text:
                raise ValueError("Claude returned no text")

            match = re.search(r"\{[\s\S]*\}", raw_text)
            if not match:
                raise ValueError(f"No JSON found in response: {raw_text[:200]}")

            parsed = json.loads(match.group(0))
            return ResumeDiff(**parsed)

        except Exception as e:
            if attempt < 2:
                import time
                time.sleep(2)
                continue
            raise