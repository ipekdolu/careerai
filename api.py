from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pdf_generator import generate_resume_pdf
from typing import Optional
import tempfile
import os
import time
from anthropic import InternalServerError
from analyzer import analyze, interview_prep, start_interview, evaluate_answer, summarize_interview, rewrite_resume
from models import AnalysisResult, InterviewPrepResult, AnswerFeedback, InterviewSummary, ResumeDiff
from utils import read_file

app = FastAPI(title="CareerAI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"status": "CareerAI API is running"}


@app.post("/analyze", response_model=AnalysisResult)
async def analyze_resume(
    resume: UploadFile = File(...),
    job_description: str = Form(...)
):
    suffix = os.path.splitext(resume.filename)[1]
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(await resume.read())
        tmp_path = tmp.name
    try:
        resume_text = read_file(tmp_path)
    finally:
        os.unlink(tmp_path)

    for attempt in range(3):
        try:
            return analyze(resume_text, job_description)
        except InternalServerError:
            if attempt < 2:
                time.sleep(2)
                continue
            raise


@app.post("/interview-prep", response_model=InterviewPrepResult)
async def generate_interview_prep(
    job_description: str = Form(...),
    resume: Optional[UploadFile] = File(None)
):
    resume_text = None
    if resume and resume.filename:
        suffix = os.path.splitext(resume.filename)[1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(await resume.read())
            tmp_path = tmp.name
        try:
            resume_text = read_file(tmp_path)
        finally:
            os.unlink(tmp_path)

    return interview_prep(job_description, resume_text)


@app.post("/interview/start")
async def start_mock_interview(
    job_description: str = Form(...),
    focus: str = Form(...),
    resume: Optional[UploadFile] = File(None)
):
    resume_text = None
    if resume and resume.filename:
        suffix = os.path.splitext(resume.filename)[1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(await resume.read())
            tmp_path = tmp.name
        try:
            resume_text = read_file(tmp_path)
        finally:
            os.unlink(tmp_path)

    first_question, history, first_topic = start_interview(
        job_description=job_description,
        resume_text=resume_text,
        focus=focus
    )

    return {
        "first_question": first_question,
        "conversation_history": history,
        "first_topic": first_topic
    }


@app.post("/interview/answer", response_model=AnswerFeedback)
async def submit_answer(
    question: str = Form(...),
    answer: str = Form(...),
    job_description: str = Form(...),
    focus: str = Form(...),
    covered_topics: str = Form(...),
    conversation_history: str = Form(...),
    resume_text: Optional[str] = Form(None)
):
    import json
    covered = json.loads(covered_topics)
    history = json.loads(conversation_history)

    return evaluate_answer(
        question=question,
        answer=answer,
        job_description=job_description,
        resume_text=resume_text,
        covered_topics=covered,
        conversation_history=history,
        focus=focus
    )


@app.post("/interview/summary", response_model=InterviewSummary)
async def get_interview_summary(
    questions: str = Form(...),
    answers: str = Form(...),
    feedbacks: str = Form(...)
):
    import json
    from models import AnswerFeedback

    q_list = json.loads(questions)
    a_list = json.loads(answers)
    f_list = [AnswerFeedback(**f) for f in json.loads(feedbacks)]

    return summarize_interview(q_list, a_list, f_list)

@app.post("/rewrite-resume", response_model=ResumeDiff)
async def rewrite_resume_endpoint(
    resume: UploadFile = File(...),
    job_description: str = Form(...)
):
    suffix = os.path.splitext(resume.filename)[1]
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(await resume.read())
        tmp_path = tmp.name
    try:
        resume_text = read_file(tmp_path)
    finally:
        os.unlink(tmp_path)

    for attempt in range(3):
        try:
            return rewrite_resume(resume_text, job_description)
        except Exception as e:
            if attempt < 2:
                time.sleep(2)
                continue
            raise

@app.post("/generate-pdf")
async def generate_pdf(payload: dict):
    try:
        pdf_bytes = generate_resume_pdf(
            name=payload.get("name", ""),
            contact=payload.get("contact", ""),
            summary=payload.get("summary", ""),
            experience=payload.get("experience", []),
            skills=payload.get("skills", []),
            education=payload.get("education", "")
        )
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=rewritten_resume.pdf"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))