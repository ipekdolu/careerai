from pydantic import BaseModel, Field
from typing import List


class AnalysisResult(BaseModel):
    overall_fit_score: int = Field(
        description="Overall fit score from 0 to 100"
    )
    matched_keywords: List[str] = Field(
        description="Keywords and skills present in both resume and job description"
    )
    missing_keywords: List[str] = Field(
        description="Important keywords from job description missing in resume"
    )
    experience_gaps: List[str] = Field(
        description="Areas where the candidate's experience doesn't meet requirements"
    )
    suggested_resume_bullets: List[str] = Field(
        description="Rewritten or new resume bullet points tailored to this job"
    )
    strengths: List[str] = Field(
        description="Candidate's strongest selling points for this specific role"
    )
    one_line_verdict: str = Field(
        description="One sentence summary of the overall fit"
    )


class InterviewPrepResult(BaseModel):
    technical_questions: List[str] = Field(
        description="Likely technical interview questions based on the job requirements"
    )
    behavioral_questions: List[str] = Field(
        description="Behavioral interview questions the candidate is likely to face, in STAR format"
    )
    culture_questions: List[str] = Field(
        description="Culture and fit questions specific to this company and role"
    )
    topics_to_study: List[str] = Field(
        description="Technical topics and concepts the candidate should review before the interview"
    )
    candidate_talking_points: List[str] = Field(
        description="Strong points from the candidate's background to bring up proactively during the interview"
    )
    red_flags_to_address: List[str] = Field(
        description="Weaknesses or gaps the candidate should prepare to explain or reframe confidently"
    )


class AnswerFeedback(BaseModel):
    score: int = Field(
        description="Score out of 10 for the candidate's answer"
    )
    what_worked: List[str] = Field(
        description="Specific things the candidate did well in their answer"
    )
    what_to_improve: List[str] = Field(
        description="Specific, actionable ways the candidate can improve their answer"
    )
    ideal_answer_hint: str = Field(
        description="A one sentence hint about what a strong answer would have included"
    )
    next_question: str = Field(
        description="The next interview question to ask the candidate"
    )
    topic_covered: str = Field(
        description="Short label for the topic this question covered e.g. 'API integration', 'testing', 'teamwork'"
    )
    is_follow_up: bool = Field(
        description="True if this is a follow-up on the previous topic, False if it is a new area"
    )


class InterviewSummary(BaseModel):
    overall_score: float = Field(
        description="Overall interview score out of 10, averaged across all answers"
    )
    strongest_answer: str = Field(
        description="The question the candidate answered best and why"
    )
    weakest_answer: str = Field(
        description="The question the candidate answered worst and why"
    )
    key_improvements: List[str] = Field(
        description="Top 3 things the candidate should work on before the real interview"
    )
    overall_verdict: str = Field(
        description="One paragraph honest assessment of interview readiness"
    )