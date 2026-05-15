# quick_test.py
from analyzer import interview_prep

result = interview_prep(
    job_description=open("sample_jd.txt").read(),
    resume_text=open("sample_resume.txt").read()
)

print("\n📋 TECHNICAL QUESTIONS:")
for q in result.technical_questions:
    print(f"  • {q}")

print("\n🧠 TOPICS TO STUDY:")
for t in result.topics_to_study:
    print(f"  • {t}")

print("\n💬 TALKING POINTS:")
for p in result.candidate_talking_points:
    print(f"  • {p}")