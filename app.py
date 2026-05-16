import streamlit as st
from analyzer import analyze, interview_prep, evaluate_answer, summarize_interview, start_interview
from utils import read_file
import tempfile
import os

st.set_page_config(
    page_title="CareerAI",
    layout="wide"
)

# ── Theme state ────────────────────────────────────────────────────────────────
if "dark_mode" not in st.session_state:
    st.session_state.dark_mode = False

# ── CSS injection ──────────────────────────────────────────────────────────────
def inject_css(dark: bool):
    if dark:
        bg           = "#0F1117"
        card_bg      = "#1a1d2e"
        card_bg2     = "#1f2235"
        text         = "#e2e8f0"
        muted        = "#94a3b8"
        shadow       = "0 4px 24px rgba(0,0,0,0.4)"
        border       = "#2d3246"
        chip_bg      = "#2d3246"
        chip_text    = "#94a3b8"
        pill_m_bg    = "#052e16"
        pill_m_text  = "#86efac"
        pill_x_bg    = "#450a0a"
        pill_x_text  = "#fca5a5"
        hero_grad    = "linear-gradient(135deg, #0f1117 0%, #1a1d2e 100%)"
        sum_s_bg     = "#052e16"
        sum_s_text   = "#86efac"
        sum_s_border = "#16a34a"
        sum_w_bg     = "#450a0a"
        sum_w_text   = "#fca5a5"
        sum_w_border = "#dc2626"
        badge_o_bg   = "#431407"
        badge_o_text = "#fdba74"
    else:
        bg           = "#F8F7F4"
        card_bg      = "#ffffff"
        card_bg2     = "#f9fafb"
        text         = "#1e293b"
        muted        = "#64748b"
        shadow       = "0 4px 24px rgba(0,0,0,0.07)"
        border       = "#e2e8f0"
        chip_bg      = "#f1f5f9"
        chip_text    = "#475569"
        pill_m_bg    = "#d1fae5"
        pill_m_text  = "#065f46"
        pill_x_bg    = "#fee2e2"
        pill_x_text  = "#991b1b"
        hero_grad    = "linear-gradient(135deg, #F8F7F4 0%, #e8f5f5 100%)"
        sum_s_bg     = "#f0fdf4"
        sum_s_text   = "#166534"
        sum_s_border = "#22c55e"
        sum_w_bg     = "#fff1f2"
        sum_w_text   = "#9f1239"
        sum_w_border = "#f43f5e"
        badge_o_bg   = "#fff7ed"
        badge_o_text = "#9a3412"

    st.markdown(f"""
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

    /* ── Base ─────────────────────────────────────────────────────── */
    .stApp {{ background: {bg} !important; font-family: 'Inter', sans-serif; }}
    .block-container {{
        padding: 1.25rem 2.5rem 2.5rem !important;
        max-width: 900px;
        margin: 0 auto !important;
    }}
    h1, h2, h3, h4 {{ color: {text} !important; font-family: 'Inter', sans-serif !important; }}
    p, li {{ color: {muted}; font-family: 'Inter', sans-serif; }}
    hr {{ border-color: {border} !important; }}

    /* ── Top bar ──────────────────────────────────────────────────── */
    .topbar-logo {{
        font-size: 1.4rem; font-weight: 800; color: #0EA5A0; letter-spacing: -0.5px;
        padding-bottom: 0.75rem; border-bottom: 1px solid {border};
    }}

    /* ── Hero — compact ───────────────────────────────────────────── */
    .hero-section {{
        background: {hero_grad};
        border-radius: 16px;
        padding: 0.75rem 2rem 0.75rem;
        text-align: center;
        margin: 0.5rem 0 0.75rem;
        border: 1px solid {border};
    }}
    .hero-title {{
        font-size: 2.1rem; font-weight: 800; color: {text};
        margin: 0 0 0.5rem; letter-spacing: -0.75px; line-height: 1.2;
    }}
    .hero-title span {{ color: #0EA5A0; }}
    .hero-tagline {{
        font-size: 0.95rem; color: {muted}; margin: 0 0 1.25rem; font-weight: 400;
    }}
    .hero-cta {{
        display: inline-block; background: #0EA5A0; color: white !important;
        text-decoration: none !important; padding: 0.6rem 1.75rem;
        border-radius: 10px; font-weight: 700; font-size: 0.95rem; cursor: pointer;
    }}
    .hero-cta:hover {{ background: #0c9490; }}

    /* ── Feature cards — compact row ──────────────────────────────── */
    .feature-cards-row {{
        display: flex; gap: 1rem; justify-content: center; margin: 1rem 0 1.25rem;
    }}
    .feature-card {{
        flex: 1; max-width: 220px; background: {card_bg}; border-radius: 12px;
        padding: 1.1rem 1rem; box-shadow: {shadow};
        text-align: center; border: 1px solid {border};
    }}
    .feature-card-title {{ font-size: 0.9rem; font-weight: 700; color: {text}; margin: 0 0 0.35rem; }}
    .feature-card-desc {{ font-size: 0.78rem; color: {muted}; margin: 0; line-height: 1.5; }}

    /* ── Tabs ─────────────────────────────────────────────────────── */
    .stTabs [data-baseweb="tab-list"] {{
        gap: 0 !important; background: {card_bg} !important;
        border-radius: 12px !important; padding: 4px !important;
        border: 1px solid {border};
    }}
    .stTabs [data-baseweb="tab"] {{
        border-radius: 9px !important; padding: 0.45rem 1.25rem !important;
        font-weight: 600 !important; font-size: 0.88rem !important;
        color: {muted} !important; background: transparent !important; border: none !important;
    }}
    .stTabs [aria-selected="true"] {{ background: #0EA5A0 !important; color: white !important; }}
    .stTabs [data-baseweb="tab-highlight"] {{ display: none !important; }}
    .stTabs [data-baseweb="tab-border"] {{ display: none !important; }}

    /* ── Buttons ──────────────────────────────────────────────────── */
    .stButton > button {{
        border-radius: 10px !important; font-weight: 600 !important; font-size: 0.9rem !important;
        border: 1px solid {border} !important; background: {card_bg} !important;
        color: {text} !important; transition: all 0.2s !important; width: 100%;
    }}
    .stButton > button[kind="primary"] {{
        background: #0EA5A0 !important; border-color: #0EA5A0 !important; color: white !important;
    }}
    .stButton > button[kind="primary"]:hover {{
        background: #0c9490 !important; border-color: #0c9490 !important;
    }}

    /* ── Progress bar ─────────────────────────────────────────────── */
    .stProgress > div > div > div {{
        background: {border} !important; border-radius: 999px !important; height: 8px !important;
    }}
    .stProgress > div > div > div > div {{
        background: #0EA5A0 !important; border-radius: 999px !important;
    }}

    /* ── Content cards ────────────────────────────────────────────── */
    .career-card {{
        background: {card_bg}; border-radius: 14px; padding: 1.25rem 1.5rem;
        box-shadow: {shadow}; border: 1px solid {border}; margin: 0.6rem 0;
    }}
    .career-card-accent {{ border-left: 4px solid #0EA5A0; border-radius: 0 14px 14px 0; }}
    .career-card h3 {{ font-size: 0.9rem; font-weight: 700; color: {text}; margin: 0 0 0.7rem; }}
    .career-card ul {{ padding-left: 1.25rem; margin: 0; }}
    .career-card li {{ color: {muted}; font-size: 0.88rem; margin: 0.25rem 0; }}

    /* ── Score circle ─────────────────────────────────────────────── */
    .score-circle-wrap {{ display: flex; justify-content: center; margin: 1rem 0; }}

    /* ── Pills ────────────────────────────────────────────────────── */
    .pills-wrap {{ display: flex; flex-wrap: wrap; gap: 0.3rem; margin: 0.4rem 0 0.75rem; }}
    .pill {{ display: inline-block; padding: 0.22rem 0.7rem; border-radius: 999px; font-size: 0.78rem; font-weight: 600; }}
    .pill-matched {{ background: {pill_m_bg}; color: {pill_m_text}; }}
    .pill-missing  {{ background: {pill_x_bg}; color: {pill_x_text}; }}

    /* ── Topic chips ──────────────────────────────────────────────── */
    .chips-wrap {{ display: flex; flex-wrap: wrap; gap: 0.3rem; margin: 0.4rem 0 0.75rem; }}
    .chip {{
        display: inline-block; background: {chip_bg}; color: {chip_text};
        padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.78rem;
        font-weight: 500; border: 1px solid {border};
    }}

    /* ── Score badge ──────────────────────────────────────────────── */
    .score-badge {{
        display: inline-block; padding: 0.18rem 0.7rem;
        border-radius: 999px; font-weight: 700; font-size: 0.88rem;
    }}
    .score-badge-green  {{ background: {pill_m_bg}; color: {pill_m_text}; }}
    .score-badge-orange {{ background: {badge_o_bg}; color: {badge_o_text}; }}
    .score-badge-red    {{ background: {pill_x_bg}; color: {pill_x_text}; }}

    /* ── Two-column prep cards ────────────────────────────────────── */
    .two-col-cards {{ display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 0.75rem 0; }}
    .talking-card {{
        background: {card_bg}; border-radius: 14px; padding: 1.1rem 1.25rem;
        border: 1px solid {border}; box-shadow: {shadow};
    }}
    .talking-card h4 {{
        font-size: 0.75rem; font-weight: 700; color: #0EA5A0; margin: 0 0 0.6rem;
        text-transform: uppercase; letter-spacing: 0.06em;
    }}
    .talking-card ul {{ padding-left: 1.1rem; margin: 0; }}
    .talking-card li {{ font-size: 0.85rem; color: {muted}; margin: 0.3rem 0; }}

    /* ── Summary cards ────────────────────────────────────────────── */
    .summary-strong {{
        background: {sum_s_bg}; border-radius: 14px; padding: 1.25rem;
        border: 1px solid {sum_s_border};
    }}
    .summary-strong h3 {{
        color: {sum_s_text}; font-size: 0.75rem; font-weight: 700;
        text-transform: uppercase; letter-spacing: 0.06em; margin: 0 0 0.6rem;
    }}
    .summary-strong p {{ color: {sum_s_text}; font-size: 0.88rem; margin: 0; }}
    .summary-weak {{
        background: {sum_w_bg}; border-radius: 14px; padding: 1.25rem;
        border: 1px solid {sum_w_border};
    }}
    .summary-weak h3 {{
        color: {sum_w_text}; font-size: 0.75rem; font-weight: 700;
        text-transform: uppercase; letter-spacing: 0.06em; margin: 0 0 0.6rem;
    }}
    .summary-weak p {{ color: {sum_w_text}; font-size: 0.88rem; margin: 0; }}

    /* ── Typography helpers ───────────────────────────────────────── */
    .section-label {{
        font-size: 0.7rem; font-weight: 700; text-transform: uppercase;
        letter-spacing: 0.08em; color: {muted}; margin: 0 0 0.35rem;
        text-align: center;
    }}
    .verdict-text {{
        font-size: 1rem; font-weight: 500; color: {text};
        margin: 0.25rem 0 1rem; text-align: center;
    }}

    /* ── Expander ─────────────────────────────────────────────────── */
    .streamlit-expanderHeader {{
        background: {card_bg} !important; border-radius: 10px !important;
        border: 1px solid {border} !important; font-weight: 600 !important;
        color: {text} !important;
    }}
    .streamlit-expanderContent {{
        border: 1px solid {border} !important; border-top: none !important;
        border-radius: 0 0 10px 10px !important; background: {card_bg2} !important;
    }}

    /* ── Chat messages ────────────────────────────────────────────── */
    [data-testid="stChatMessage"] {{
        border-radius: 14px !important; background: {card_bg} !important;
        border: 1px solid {border}; margin: 0.4rem 0 !important;
    }}

    /* ── Spinner ──────────────────────────────────────────────────── */
    .stSpinner > div {{ border-top-color: #0EA5A0 !important; }}

    /* ── Alert boxes ──────────────────────────────────────────────── */
    .stAlert {{ border-radius: 10px !important; }}
    </style>
    """, unsafe_allow_html=True)

inject_css(st.session_state.dark_mode)

# ── Helper: save uploaded file temporarily ─────────────────────────────────────
def get_resume_text(uploaded_file):
    suffix = os.path.splitext(uploaded_file.name)[1]
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(uploaded_file.read())
        tmp_path = tmp.name
    try:
        return read_file(tmp_path)
    finally:
        os.unlink(tmp_path)

# ── Helper: SVG arc score circle ───────────────────────────────────────────────
def score_circle_svg(score, max_score=100):
    import math
    r = 54
    circ = 2 * math.pi * r
    color  = "#22c55e" if score >= 80 else "#f97316" if score >= 60 else "#ef4444"
    dash   = (score / max_score) * circ
    gap    = circ - dash
    arc_bg = "#2d3246" if st.session_state.dark_mode else "#e2e8f0"
    return (
        f'<div class="score-circle-wrap">'
        f'<svg width="150" height="150" viewBox="0 0 150 150">'
        f'<circle cx="75" cy="75" r="{r}" fill="none" stroke="{arc_bg}" stroke-width="13"/>'
        f'<circle cx="75" cy="75" r="{r}" fill="none" stroke="{color}" stroke-width="13"'
        f' stroke-dasharray="{dash:.1f} {gap:.1f}" stroke-linecap="round"'
        f' transform="rotate(-90 75 75)"/>'
        f'<text x="75" y="70" text-anchor="middle" dy="0.35em"'
        f' font-size="30" font-weight="800" fill="{color}" font-family="Inter, sans-serif">{score}</text>'
        f'<text x="75" y="93" text-anchor="middle"'
        f' font-size="11" fill="#94a3b8" font-family="Inter, sans-serif">out of 100</text>'
        f'</svg></div>'
    )

# ── Helper: pill tags ──────────────────────────────────────────────────────────
def pills_html(keywords, pill_class):
    inner = "".join(f'<span class="pill {pill_class}">{k}</span>' for k in keywords)
    return f'<div class="pills-wrap">{inner}</div>'

# ── Helper: chip tags ──────────────────────────────────────────────────────────
def chips_html(topics):
    inner = "".join(f'<span class="chip">{t}</span>' for t in topics)
    return f'<div class="chips-wrap">{inner}</div>'

# ── Helper: score badge ────────────────────────────────────────────────────────
def score_badge_html(score, max_score=10):
    cls = "score-badge-green" if score >= 7 else "score-badge-orange" if score >= 5 else "score-badge-red"
    return f'<span class="score-badge {cls}">{score}/{max_score}</span>'

# ── Top bar ────────────────────────────────────────────────────────────────────
top_l, top_r = st.columns([8, 1])
with top_l:
    st.markdown('<div class="topbar-logo">CareerAI</div>', unsafe_allow_html=True)
with top_r:
    toggle_label = "Light" if st.session_state.dark_mode else "Dark"
    if st.button(toggle_label, key="mode_toggle"):
        st.session_state.dark_mode = not st.session_state.dark_mode
        st.rerun()

# ── Hero section ───────────────────────────────────────────────────────────────
st.markdown("""
<div class="hero-section">
    <div class="hero-title">Land your next job with <span>CareerAI</span></div>
    <div class="hero-tagline">Everything you need to land your next job</div>
    <div class="feature-cards-row">
        <div class="feature-card">
            <div class="feature-card-title">Resume Analyzer</div>
            <div class="feature-card-desc">Match your resume to any job description and see exactly where you stand.</div>
        </div>
        <div class="feature-card">
            <div class="feature-card-title">Interview Prep</div>
            <div class="feature-card-desc">Get a personalized guide with questions, topics, and talking points.</div>
        </div>
        <div class="feature-card">
            <div class="feature-card-title">Mock Interview</div>
            <div class="feature-card-desc">Practice with an AI interviewer and get scored feedback on every answer.</div>
        </div>
    </div>
    <a class="hero-cta" onclick="window.scrollBy({top: 420, behavior: 'smooth'}); return false;" href="#">
        Get Started
    </a>
</div>
""", unsafe_allow_html=True)

# ── Sidebar ────────────────────────────────────────────────────────────────────
with st.sidebar:
    st.markdown("### Your Files")
    resume_file = st.file_uploader("Resume (.txt or .pdf)", type=["txt", "pdf"])
    jd_text = st.text_area("Job Description", height=300, placeholder="Paste the job description here...")
    st.divider()
    st.caption("Your files are not stored. Everything is processed in memory.")

# ── Tabs ───────────────────────────────────────────────────────────────────────
tab1, tab2, tab3 = st.tabs(["Resume Analyzer", "Interview Prep", "Mock Interview"])

# ── Tab 1: Resume Analyzer ────────────────────────────────────────────────────
with tab1:
    st.markdown('<p class="verdict-text">How well does your resume match this job?</p>', unsafe_allow_html=True)
    _, _c2, _ = st.columns([1, 2, 1])
    with _c2:
        analyze_btn = st.button("Analyze Fit", type="primary", key="analyze_btn", use_container_width=True)

    if analyze_btn:
        if not resume_file:
            st.error("Please upload your resume in the sidebar.")
        elif not jd_text.strip():
            st.error("Please paste a job description in the sidebar.")
        else:
            with st.spinner("Analyzing with Claude..."):
                resume_text = get_resume_text(resume_file)
                result = analyze(resume_text, jd_text)

            score = result.overall_fit_score

            col_arc, col_verdict = st.columns([1, 2])
            with col_arc:
                st.markdown(score_circle_svg(score), unsafe_allow_html=True)
            with col_verdict:
                st.markdown('<div style="height:24px"></div>', unsafe_allow_html=True)
                st.markdown('<p class="section-label">Fit Score Verdict</p>', unsafe_allow_html=True)
                st.markdown(f'<p class="verdict-text" style="text-align:left;">{result.one_line_verdict}</p>', unsafe_allow_html=True)

            col1, col2 = st.columns(2)

            with col1:
                strengths_li = "".join(f"<li>{s}</li>" for s in result.strengths)
                st.markdown(f"""
                <div class="career-card career-card-accent">
                    <h3>Strengths</h3>
                    <ul>{strengths_li}</ul>
                </div>
                """, unsafe_allow_html=True)

                st.markdown('<p class="section-label">Matched Keywords</p>', unsafe_allow_html=True)
                st.markdown(pills_html(result.matched_keywords, "pill-matched"), unsafe_allow_html=True)

            with col2:
                gaps_li = "".join(f"<li>{g}</li>" for g in result.experience_gaps)
                st.markdown(f"""
                <div class="career-card career-card-accent">
                    <h3>Experience Gaps</h3>
                    <ul>{gaps_li}</ul>
                </div>
                """, unsafe_allow_html=True)

                st.markdown('<p class="section-label">Missing Keywords</p>', unsafe_allow_html=True)
                st.markdown(pills_html(result.missing_keywords, "pill-missing"), unsafe_allow_html=True)

            st.markdown("---")
            bullets_li = "".join(f"<li>{b}</li>" for b in result.suggested_resume_bullets)
            st.markdown(f"""
            <div class="career-card career-card-accent">
                <h3>Suggested Resume Bullets</h3>
                <ul>{bullets_li}</ul>
            </div>
            """, unsafe_allow_html=True)

# ── Tab 2: Interview Prep ─────────────────────────────────────────────────────
with tab2:
    st.markdown('<p class="verdict-text">Get a personalized interview preparation guide</p>', unsafe_allow_html=True)
    st.caption("Resume is optional — JD alone is enough to generate questions. Adding your resume personalizes the talking points.")

    _, _c2, _ = st.columns([1, 2, 1])
    with _c2:
        prep_btn = st.button("Generate Prep Guide", type="primary", key="prep_btn", use_container_width=True)

    if prep_btn:
        if not jd_text.strip():
            st.error("Please paste a job description in the sidebar.")
        else:
            with st.spinner("Generating interview prep with Claude..."):
                resume_text = get_resume_text(resume_file) if resume_file else None
                result = interview_prep(jd_text, resume_text)

            with st.expander("Technical Questions", expanded=True):
                for q in result.technical_questions:
                    st.markdown(f"- {q}")

            with st.expander("Behavioral Questions", expanded=True):
                for q in result.behavioral_questions:
                    st.markdown(f"- {q}")

            with st.expander("Culture & Fit Questions", expanded=True):
                for q in result.culture_questions:
                    st.markdown(f"- {q}")

            st.markdown("---")
            st.markdown('<p class="section-label">Topics to Study</p>', unsafe_allow_html=True)
            st.markdown(chips_html(result.topics_to_study), unsafe_allow_html=True)

            tp_li = "".join(f"<li>{p}</li>" for p in result.candidate_talking_points)
            rf_li = "".join(f"<li>{r}</li>" for r in result.red_flags_to_address)
            st.markdown(f"""
            <div class="two-col-cards">
                <div class="talking-card">
                    <h4>Your Talking Points</h4>
                    <ul>{tp_li}</ul>
                </div>
                <div class="talking-card">
                    <h4>Red Flags to Address</h4>
                    <ul>{rf_li}</ul>
                </div>
            </div>
            """, unsafe_allow_html=True)

# ── Tab 3: Mock Interview ─────────────────────────────────────────────────────
with tab3:
    st.markdown(
        '<p class="verdict-text">Claude conducts a personalized interview based on your resume and the job description.</p>',
        unsafe_allow_html=True
    )

    defaults = {
        "interview_active": False,
        "current_question": None,
        "questions": [],
        "answers": [],
        "feedbacks": [],
        "covered_topics": [],
        "conversation_history": [],
        "interview_done": False,
        "focus": "Mixed",
        "num_questions": 5,
        "resume_text_cache": None,
        "interview_showing_last_feedback": False,
        "last_feedback": None,
        "pending_feedback": None,
        "pending_answer": None,
    }
    for key, val in defaults.items():
        if key not in st.session_state:
            st.session_state[key] = val

    # ── Setup screen ───────────────────────────────────────────────────────────
    if (not st.session_state.interview_active
            and not st.session_state.interview_done
            and not st.session_state.interview_showing_last_feedback):

        if not jd_text.strip():
            st.warning("Please paste a job description in the sidebar first.")
        else:
            st.markdown("#### Setup Your Mock Interview")

            focus = st.selectbox(
                "Question focus",
                ["Mixed", "Technical", "Behavioral", "Culture & Fit"],
                key="focus_select"
            )

            num_questions = st.slider(
                "Number of questions",
                min_value=3, max_value=6, value=5,
                key="num_q_slider"
            )

            _, _c2, _ = st.columns([1, 2, 1])
            with _c2:
                start_btn = st.button(
                    "Start Mock Interview",
                    type="primary", key="start_btn", use_container_width=True
                )

            if start_btn:
                with st.spinner("Claude is preparing your first question..."):
                    resume_text = get_resume_text(resume_file) if resume_file else None
                    first_question, history, first_topic = start_interview(
                        job_description=jd_text,
                        resume_text=resume_text,
                        focus=focus
                    )

                st.session_state.interview_active     = True
                st.session_state.current_question     = first_question
                st.session_state.conversation_history = history
                st.session_state.covered_topics       = [first_topic]
                st.session_state.focus                = focus
                st.session_state.num_questions        = num_questions
                st.session_state.resume_text_cache    = resume_text
                st.session_state.questions            = [first_question]
                st.session_state.answers              = []
                st.session_state.feedbacks            = []
                st.rerun()

    # ── Active interview ───────────────────────────────────────────────────────
    elif st.session_state.interview_active:
        answered = len(st.session_state.answers)
        total    = st.session_state.num_questions

        st.progress(answered / total)
        st.markdown(f'<p class="section-label">Question {answered + 1} of {total}</p>', unsafe_allow_html=True)

        display_count = answered - 1 if st.session_state.get("pending_feedback") else answered

        for i, (q, a, f) in enumerate(zip(
            st.session_state.questions[:display_count],
            st.session_state.answers[:display_count],
            st.session_state.feedbacks[:display_count]
        )):
            with st.chat_message("assistant"):
                st.markdown(f"**Q{i+1}:** {q}")
            with st.chat_message("user"):
                st.markdown(a)
            with st.chat_message("assistant"):
                st.markdown(f"Score: {score_badge_html(f.score)}", unsafe_allow_html=True)
                st.markdown("**What worked:**")
                for w in f.what_worked:
                    st.markdown(f"- {w}")
                st.markdown("**What to improve:**")
                for w in f.what_to_improve:
                    st.markdown(f"- {w}")
                st.caption(f.ideal_answer_hint)

        with st.chat_message("assistant"):
            st.markdown(f"**Q{answered + 1}:** {st.session_state.current_question}")

        answer = st.chat_input("Type your answer here...", key="chat_input")

        if answer and not st.session_state.get("pending_feedback"):
            with st.spinner("Evaluating your answer..."):
                feedback = evaluate_answer(
                    question=st.session_state.current_question,
                    answer=answer,
                    job_description=jd_text,
                    resume_text=st.session_state.resume_text_cache,
                    covered_topics=st.session_state.covered_topics,
                    conversation_history=st.session_state.conversation_history,
                    focus=st.session_state.focus
                )

            st.session_state.answers.append(answer)
            st.session_state.feedbacks.append(feedback)
            st.session_state.covered_topics.append(feedback.topic_covered)
            st.session_state.conversation_history += [
                {"role": "user",      "content": f"Q: {st.session_state.current_question}\nA: {answer}"},
                {"role": "assistant", "content": f"Score: {feedback.score}/10. Next question: {feedback.next_question}"}
            ]
            st.session_state.pending_feedback = feedback
            st.session_state.pending_answer   = answer
            st.rerun()

        if st.session_state.get("pending_feedback"):
            feedback = st.session_state.pending_feedback
            answer   = st.session_state.pending_answer

            with st.chat_message("user"):
                st.markdown(answer)

            with st.chat_message("assistant"):
                st.markdown(f"Score: {score_badge_html(feedback.score)}", unsafe_allow_html=True)
                st.markdown("**What worked:**")
                for w in feedback.what_worked:
                    st.markdown(f"- {w}")
                st.markdown("**What to improve:**")
                for w in feedback.what_to_improve:
                    st.markdown(f"- {w}")
                st.caption(feedback.ideal_answer_hint)

            answered_now = len(st.session_state.answers)

            if answered_now >= total:
                _, _c2, _ = st.columns([1, 2, 1])
                with _c2:
                    if st.button("See Summary", type="primary", key="next_to_summary", use_container_width=True):
                        st.session_state.pending_feedback                = None
                        st.session_state.pending_answer                  = None
                        st.session_state.interview_active                = False
                        st.session_state.interview_showing_last_feedback = False
                        st.session_state.interview_done                  = True
                        st.html("<script>window.scrollTo(0, 0);</script>")
                        st.rerun()
            else:
                _, _c2, _ = st.columns([1, 2, 1])
                with _c2:
                    if st.button("Next Question", type="primary", key="next_q_btn", use_container_width=True):
                        st.session_state.current_question = feedback.next_question
                        st.session_state.questions.append(feedback.next_question)
                        st.session_state.pending_feedback = None
                        st.session_state.pending_answer   = None
                        st.html("<script>window.scrollTo(0, 0);</script>")
                        st.rerun()

    # ── Last feedback screen ───────────────────────────────────────────────────
    elif st.session_state.interview_showing_last_feedback:
        st.markdown("#### Last Question")
        f = st.session_state.last_feedback
        q = st.session_state.questions[-1]
        a = st.session_state.answers[-1]

        with st.chat_message("assistant"):
            st.markdown(f"**Q{st.session_state.num_questions}:** {q}")
        with st.chat_message("user"):
            st.markdown(a)
        with st.chat_message("assistant"):
            st.markdown(f"Score: {score_badge_html(f.score)}", unsafe_allow_html=True)
            st.markdown("**What worked:**")
            for w in f.what_worked:
                st.markdown(f"- {w}")
            st.markdown("**What to improve:**")
            for w in f.what_to_improve:
                st.markdown(f"- {w}")
            st.caption(f.ideal_answer_hint)

        st.markdown("---")
        _, _c2, _ = st.columns([1, 2, 1])
        with _c2:
            if st.button("See Full Summary", type="primary", key="see_summary_btn", use_container_width=True):
                st.session_state.interview_showing_last_feedback = False
                st.session_state.interview_done = True
                st.rerun()

    # ── Interview complete — Summary ───────────────────────────────────────────
    elif st.session_state.interview_done:
        st.html("<script>window.scrollTo(0, 0);</script>")

        with st.spinner("Generating your interview summary..."):
            summary = summarize_interview(
                questions=st.session_state.questions,
                answers=st.session_state.answers,
                feedbacks=st.session_state.feedbacks
            )

        score = summary.overall_score
        score_color = "#22c55e" if score >= 7 else "#f97316" if score >= 5 else "#ef4444"

        st.markdown(f"""
        <div style="text-align:center; margin: 1.5rem 0 0.5rem;">
            <div style="font-size:4.5rem; font-weight:900; color:{score_color}; line-height:1;">{score:.1f}</div>
            <div style="font-size:0.85rem; color:#94a3b8; margin-top:0.25rem; font-weight:500;">
                out of 10 &mdash; Interview Complete
            </div>
        </div>
        """, unsafe_allow_html=True)

        st.markdown(
            f'<p class="verdict-text">{summary.overall_verdict}</p>',
            unsafe_allow_html=True
        )

        st.markdown("---")

        col1, col2 = st.columns(2)
        with col1:
            st.markdown(f"""
            <div class="summary-strong">
                <h3>Strongest Answer</h3>
                <p>{summary.strongest_answer}</p>
            </div>
            """, unsafe_allow_html=True)
        with col2:
            st.markdown(f"""
            <div class="summary-weak">
                <h3>Weakest Answer</h3>
                <p>{summary.weakest_answer}</p>
            </div>
            """, unsafe_allow_html=True)

        st.markdown("---")
        st.markdown("#### Key Improvements Before the Real Interview")
        for i, imp in enumerate(summary.key_improvements, 1):
            st.markdown(f"{i}. {imp}")

        st.markdown('<div style="height:1rem"></div>', unsafe_allow_html=True)
        _, _c2, _ = st.columns([1, 2, 1])
        with _c2:
            if st.button("Start New Interview", key="reset_btn", use_container_width=True):
                for key in defaults.keys():
                    if key in st.session_state:
                        del st.session_state[key]
                st.rerun()
