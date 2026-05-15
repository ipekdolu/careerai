import streamlit as st
from analyzer import analyze, interview_prep
from utils import read_file
import tempfile
import os

st.set_page_config(
    page_title="Resume Analyzer",
    page_icon="📄",
    layout="wide"
)

st.title("📄 Resume Assistant")
st.markdown("Powered by Claude — analyze your fit, then prepare for the interview.")

# ── Shared file upload in sidebar ─────────────────────────────────────────────

with st.sidebar:
    st.header("Upload Your Files")
    resume_file = st.file_uploader("Resume (.txt or .pdf)", type=["txt", "pdf"])
    jd_text = st.text_area("Job Description", height=300, placeholder="Paste the job description here...")
    st.divider()
    st.caption("Your files are not stored. Everything is processed in memory.")

# ── Helper to save uploaded file temporarily ──────────────────────────────────

def get_resume_text(uploaded_file):
    suffix = os.path.splitext(uploaded_file.name)[1]
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(uploaded_file.read())
        tmp_path = tmp.name
    try:
        return read_file(tmp_path)
    finally:
        os.unlink(tmp_path)

# ── Tabs ───────────────────────────────────────────────────────────────────────

tab1, tab2 = st.tabs(["📊 Resume Analyzer", "🎯 Interview Prep"])

# ── Tab 1: Resume Analyzer ────────────────────────────────────────────────────

with tab1:
    st.subheader("How well does your resume match this job?")
    analyze_btn = st.button("🔍 Analyze Fit", type="primary", use_container_width=True, key="analyze_btn")

    if analyze_btn:
        if not resume_file:
            st.error("Please upload your resume in the sidebar.")
        elif not jd_text.strip():
            st.error("Please paste a job description in the sidebar.")
        else:
            with st.spinner("⚙️ Analyzing with Claude..."):
                resume_text = get_resume_text(resume_file)
                result = analyze(resume_text, jd_text)

            score = result.overall_fit_score
            if score >= 80:
                color = "green"
            elif score >= 60:
                color = "orange"
            else:
                color = "red"

            st.markdown(f"## Fit Score: :{color}[{score}/100]")
            st.markdown(f"**Verdict:** {result.one_line_verdict}")
            st.divider()

            col1, col2 = st.columns(2)

            with col1:
                st.subheader("💪 Strengths")
                for s in result.strengths:
                    st.markdown(f"- {s}")

                st.subheader("✅ Matched Keywords")
                st.markdown(" ".join([f"`{k}`" for k in result.matched_keywords]))

            with col2:
                st.subheader("⚠️ Missing Keywords")
                st.markdown(" ".join([f"`{k}`" for k in result.missing_keywords]))

                st.subheader("🕳️ Experience Gaps")
                for g in result.experience_gaps:
                    st.markdown(f"- {g}")

            st.divider()
            st.subheader("✍️ Suggested Resume Bullets")
            for b in result.suggested_resume_bullets:
                st.markdown(f"- {b}")

# ── Tab 2: Interview Prep ─────────────────────────────────────────────────────

with tab2:
    st.subheader("Get a personalized interview preparation guide")
    st.caption("Resume is optional — JD alone is enough to generate questions. Adding your resume personalizes the talking points.")

    prep_btn = st.button("🎯 Generate Prep Guide", type="primary", use_container_width=True, key="prep_btn")

    if prep_btn:
        if not jd_text.strip():
            st.error("Please paste a job description in the sidebar.")
        else:
            with st.spinner("⚙️ Generating interview prep with Claude..."):
                resume_text = get_resume_text(resume_file) if resume_file else None
                result = interview_prep(jd_text, resume_text)

            col1, col2 = st.columns(2)

            with col1:
                st.subheader("💻 Technical Questions")
                for q in result.technical_questions:
                    st.markdown(f"- {q}")

                st.subheader("🧠 Behavioral Questions")
                for q in result.behavioral_questions:
                    st.markdown(f"- {q}")

                st.subheader("🏢 Culture & Fit Questions")
                for q in result.culture_questions:
                    st.markdown(f"- {q}")

            with col2:
                st.subheader("📚 Topics to Study")
                for t in result.topics_to_study:
                    st.markdown(f"- {t}")

                st.subheader("💬 Your Talking Points")
                for p in result.candidate_talking_points:
                    st.markdown(f"- {p}")

                st.subheader("⚠️ Red Flags to Address")
                for r in result.red_flags_to_address:
                    st.markdown(f"- {r}")