# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Active job seekers — people currently in the process of applying to roles. Any industry, any seniority level. They arrive with a resume (PDF or plain text) and a job description and want to move faster and smarter through the application cycle.

## Product Purpose

CareerAI is a full-stack AI job application assistant that takes a candidate from resume evaluation through to interview practice in a single, connected workflow. It exists because job seekers need specific, tailored feedback for each application — not generic advice — and because the most important preparation steps (resume fit, rewriting, interview prep, mock interview) have historically required separate tools or paid career coaches. CareerAI collapses that into one place.

Success means a user walks away with a clearer picture of how competitive they are for a specific role, a stronger resume, and the confidence to perform in the interview.

## Positioning

End-to-end in one tool: Resume Analyzer → Resume Rewriter → Interview Prep → Mock Interview, all powered by Claude and all scoped to the exact job description the user provides. No competitor can truthfully claim the same complete, AI-native workflow in a single product.

## Operating Context

Users paste or upload a job description and a resume at the start of each feature. The workflow is document-in, insight-out. They may switch between features mid-session (e.g., analyze fit, then jump to mock interview). The product is used alone — no collaboration or sharing features currently exist.

## Capabilities and Constraints

- **Resume Analyzer:** Returns a fit score (0–100, color-coded green/amber/red), keyword match breakdown, strengths, experience gaps, and tailored resume bullets.
- **Resume Rewriter:** Claude rewrites the full resume for the target role; the user reviews each change (approve/reject per line) before downloading a PDF.
- **Interview Prep:** Generates personalized technical, behavioral, and culture-fit questions, topics to study, talking points, and red flags. Resume is optional — JD alone is sufficient.
- **Mock Interview:** Adaptive AI interviewer conducts 3–6 questions (user chooses focus: Mixed / Technical / Behavioral / Culture Fit), then scores each answer 0–10 and produces a debrief.
- **Backend:** FastAPI + Claude API (claude-sonnet-4-6). Rate limited.
- **Frontend:** React 19 + Vite, no UI library, CSS variable theming with full dark mode support.
- **File support:** PDF and plain text resumes. PDF output for rewritten resume.
- **Deployment:** Frontend on Vercel, backend on Render.

## Brand Commitments

- **Name:** CareerAI — "Career" in primary text, "AI" in teal accent.
- **Fonts:** DM Serif Display (headings, brand name, score display), DM Sans (body, UI labels).
- **Primary accent:** Teal (#0EA5A0). All CTAs, highlights, selected states, and the "AI" in the logo.
- **Tagline:** "Land your next job with CareerAI"
- **Sub-tagline:** "From application to offer — everything you need in one place."
- **Voice:** Direct and confident. Gets to the point, respects the user's time, no filler language.
- **Icons:** @tabler/icons-react throughout.

## Evidence on Hand

- Fully functional implementation exists across all four features.
- No published testimonials, case studies, press, or customer logos — do not fabricate.
- No pricing, licensing, or deployment SLA claims exist — do not fabricate.

## Product Principles

1. **Specific beats generic.** Every output is anchored to the user's actual resume and the exact job description they provided. Advice that could apply to anyone applies to no one.
2. **Complete the loop.** A user should be able to go from "I found a job posting" to "I feel ready for the interview" without leaving the product.
3. **Honest over flattering.** Fit scores, gap analysis, and interview feedback reflect reality — even when that reality is uncomfortable.
4. **Respect the user's time.** Direct copy, minimal friction, no unnecessary steps. The interface gets out of the way.
5. **Claude as the engine, not a gimmick.** The AI capability is expressed through output quality, not through AI branding or excessive "AI" language in the UI.
