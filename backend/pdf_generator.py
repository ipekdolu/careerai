from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from io import BytesIO


def generate_resume_pdf(name: str, contact: str, summary: str, experience: list, skills: list, education: str) -> bytes:
    buffer = BytesIO()

    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=0.75 * inch,
        leftMargin=0.75 * inch,
        topMargin=0.75 * inch,
        bottomMargin=0.75 * inch,
    )

    black = colors.HexColor('#000000')
    dark_gray = colors.HexColor('#333333')
    mid_gray = colors.HexColor('#666666')
    light_gray = colors.HexColor('#cccccc')

    name_style = ParagraphStyle(
        'Name',
        fontSize=22,
        fontName='Helvetica-Bold',
        spaceAfter=6,
        spaceBefore=0,
        alignment=TA_CENTER,
        textColor=black,
        leading=26,
    )
    contact_style = ParagraphStyle(
        'Contact',
        fontSize=10,
        fontName='Helvetica',
        spaceAfter=16,
        alignment=TA_CENTER,
        textColor=mid_gray,
        leading=14,
    )
    section_style = ParagraphStyle(
        'Section',
        fontSize=10,
        fontName='Helvetica-Bold',
        spaceBefore=16,
        spaceAfter=4,
        textColor=black,
        leading=13,
    )
    job_title_style = ParagraphStyle(
        'JobTitle',
        fontSize=11,
        fontName='Helvetica-Bold',
        spaceAfter=2,
        spaceBefore=10,
        textColor=black,
        leading=14,
    )
    job_meta_style = ParagraphStyle(
        'JobMeta',
        fontSize=10,
        fontName='Helvetica',
        spaceAfter=5,
        textColor=mid_gray,
        leading=13,
    )
    bullet_style = ParagraphStyle(
        'Bullet',
        fontSize=10,
        fontName='Helvetica',
        spaceAfter=3,
        leftIndent=14,
        leading=14,
        textColor=dark_gray,
    )
    body_style = ParagraphStyle(
        'Body',
        fontSize=10,
        fontName='Helvetica',
        spaceAfter=6,
        leading=15,
        textColor=dark_gray,
    )
    skills_style = ParagraphStyle(
        'Skills',
        fontSize=10,
        fontName='Helvetica',
        spaceAfter=6,
        leading=15,
        textColor=dark_gray,
    )

    story = []

    # ── Header ────────────────────────────────────────────────────────────────
    story.append(Paragraph(name, name_style))
    story.append(Paragraph(contact, contact_style))
    story.append(HRFlowable(
        width="100%", thickness=1,
        color=black,
        spaceAfter=0,
    ))

    # ── Summary ───────────────────────────────────────────────────────────────
    if summary:
        story.append(Paragraph("SUMMARY", section_style))
        story.append(HRFlowable(width="100%", thickness=0.5, color=light_gray, spaceAfter=6))
        story.append(Paragraph(summary, body_style))

    # ── Experience ────────────────────────────────────────────────────────────
    if experience:
        story.append(Paragraph("EXPERIENCE", section_style))
        story.append(HRFlowable(width="100%", thickness=0.5, color=light_gray, spaceAfter=6))
        for exp in experience:
            role = exp.get('role', '')
            company = exp.get('company', '')
            dates = exp.get('dates', '')
            bullets = exp.get('bullets', [])

            story.append(Paragraph(f"{role} — {company}", job_title_style))
            story.append(Paragraph(dates, job_meta_style))
            for bullet in bullets:
                story.append(Paragraph(f"• {bullet}", bullet_style))
            story.append(Spacer(1, 4))

    # ── Skills ────────────────────────────────────────────────────────────────
    if skills:
        story.append(Paragraph("SKILLS", section_style))
        story.append(HRFlowable(width="100%", thickness=0.5, color=light_gray, spaceAfter=6))
        skills_text = "  •  ".join(skills)
        story.append(Paragraph(skills_text, skills_style))

    # ── Education ─────────────────────────────────────────────────────────────
    if education:
        story.append(Paragraph("EDUCATION", section_style))
        story.append(HRFlowable(width="100%", thickness=0.5, color=light_gray, spaceAfter=6))
        story.append(Paragraph(education, body_style))

    doc.build(story)
    return buffer.getvalue()