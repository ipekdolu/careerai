import typer
from analyzer import analyze
from utils import read_file

app = typer.Typer()

@app.command()
def main(
    resume: str = typer.Option(..., help="Path to resume file (.txt or .pdf)"),
    job: str = typer.Option(..., help="Path to job description file (.txt or .pdf)")
):
    """Resume vs Job Description Analyzer"""

    typer.echo("\n🔍 Reading files...")

    resume_text = read_file(resume)
    job_text = read_file(job)

    typer.echo("⚙️  Analyzing with Claude...\n")

    result = analyze(resume_text, job_text)

    typer.echo(f"{'='*50}")
    typer.echo(f"📊 OVERALL FIT SCORE: {result.overall_fit_score}/100")
    typer.echo(f"{'='*50}\n")

    typer.echo(f"✅ VERDICT: {result.one_line_verdict}\n")

    typer.echo("💪 STRENGTHS:")
    for s in result.strengths:
        typer.echo(f"  • {s}")

    typer.echo("\n🎯 MATCHED KEYWORDS:")
    for k in result.matched_keywords:
        typer.echo(f"  • {k}")

    typer.echo("\n⚠️  MISSING KEYWORDS:")
    for k in result.missing_keywords:
        typer.echo(f"  • {k}")

    typer.echo("\n🕳️  EXPERIENCE GAPS:")
    for g in result.experience_gaps:
        typer.echo(f"  • {g}")

    typer.echo("\n✍️  SUGGESTED RESUME BULLETS:")
    for b in result.suggested_resume_bullets:
        typer.echo(f"  • {b}")

if __name__ == "__main__":
    app()