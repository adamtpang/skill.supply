from __future__ import annotations

import argparse
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import Paragraph, SimpleDocTemplate


INK = colors.HexColor("#0B2545")
BLUE = colors.HexColor("#2E74B5")
MUTED = colors.HexColor("#4D5663")
BLACK = colors.HexColor("#181C21")


def paragraph_style(
    name: str,
    *,
    font: str = "Helvetica",
    size: float = 8.5,
    leading: float = 9.8,
    color=BLACK,
    before: float = 0,
    after: float = 0,
    left_indent: float = 0,
    first_line_indent: float = 0,
    bullet_indent: float = 0,
) -> ParagraphStyle:
    return ParagraphStyle(
        name,
        fontName=font,
        fontSize=size,
        leading=leading,
        textColor=color,
        spaceBefore=before,
        spaceAfter=after,
        leftIndent=left_indent,
        firstLineIndent=first_line_indent,
        bulletIndent=bullet_indent,
        bulletFontName="Helvetica",
        bulletFontSize=7,
        bulletColor=BLUE,
        alignment=TA_LEFT,
        allowWidows=0,
        allowOrphans=0,
    )


STYLES = {
    "name": paragraph_style("Name", font="Helvetica-Bold", size=22, leading=23, color=INK, after=0.8),
    "headline": paragraph_style("Headline", font="Helvetica-Bold", size=9.8, leading=10.8, color=BLUE, after=1.6),
    "contact": paragraph_style("Contact", size=9, leading=10, color=BLACK, after=0.8),
    "location": paragraph_style("Location", size=9, leading=10, color=MUTED, after=3),
    "summary": paragraph_style("Summary", size=9.5, leading=11.2, color=BLACK, after=2.2),
    "section": paragraph_style("Section", font="Helvetica-Bold", size=10.2, leading=11, color=BLUE, before=5, after=1.8),
    "bullet": paragraph_style(
        "Bullet",
        size=9.2,
        leading=10.8,
        color=BLACK,
        after=1.8,
        left_indent=13,
        first_line_indent=0,
        bullet_indent=1,
    ),
    "entry": paragraph_style("Entry", size=9.2, leading=10.8, color=BLACK, after=1.8),
    "compact": paragraph_style("Compact", size=9, leading=10.2, color=BLACK, after=0.8),
}


def link(label: str, url: str, *, color: str = "#0B2545") -> str:
    return f'<link href="{url}" color="{color}"><b>{label}</b></link>'


def add_project(story, label: str, text: str, url: str | None = None) -> None:
    heading = link(label, url) if url else f"<b>{label}</b>"
    story.append(Paragraph(f"{heading}{text}", STYLES["bullet"], bulletText="\u2022"))


def build(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    document = SimpleDocTemplate(
        str(path),
        pagesize=letter,
        leftMargin=0.65 * inch,
        rightMargin=0.65 * inch,
        topMargin=0.6 * inch,
        bottomMargin=0.6 * inch,
        title="Adam Pangelinan - Software Engineer, Fullstack, Pro-Create",
        author="",
        subject="Role-specific resume for Suno Professional Creation",
        creator="",
        producer="",
        pageCompression=1,
    )

    story = [
        Paragraph("Adam Pangelinan", STYLES["name"]),
        Paragraph(
            "FULL-STACK SOFTWARE ENGINEER | CREATIVE TOOLS, AI WORKFLOWS, HUMAN CONTROL",
            STYLES["headline"],
        ),
        Paragraph(
            "adamtpang@gmail.com&nbsp;&nbsp;|&nbsp;&nbsp;+60 19 798 1734&nbsp;&nbsp;|&nbsp;&nbsp;"
            '<link href="https://skill.supply" color="#2E74B5">Portfolio</link>&nbsp;&nbsp;|&nbsp;&nbsp;'
            '<link href="https://github.com/adamtpang" color="#2E74B5">GitHub</link>&nbsp;&nbsp;|&nbsp;&nbsp;'
            '<link href="https://www.linkedin.com/in/adamtpang/" color="#2E74B5">LinkedIn</link>',
            STYLES["contact"],
        ),
        Paragraph(
            "Malaysia | US citizen | No US sponsorship required | Open to US relocation",
            STYLES["location"],
        ),
        Paragraph(
            "Full-stack TypeScript engineer with 2 to 3 years of experience building responsive "
            "product surfaces and inspectable AI workflows. Maintains a private music-production "
            "layer on an openDAW derivative, with bounded generation, editable MIDI, provenance, "
            "and human approval before arrangement release.",
            STYLES["summary"],
        ),
        Paragraph("SELECTED PRODUCT AND ENGINEERING WORK", STYLES["section"]),
    ]

    add_project(
        story,
        "Strummer music factory | Private openDAW derivative | ",
        "Maintained a human-approved MCP workflow for song specs, chord-to-MIDI compilation, "
        "bounded audio previews, generation and extension, Demucs stem separation, and Ableton "
        "session scaffolding. Fresh verification passed 31/31 tests, exposed 20 tools, indexed "
        "99 sounds and 84 song specs, and verified six generated assets.",
    )
    add_project(
        story,
        "Human-approved song session | Private product proof | ",
        "Built a responsive Next.js interaction that keeps arrangement work locked until a person "
        "chooses four bounded assets and approves the exact set, then releases five editable moves "
        "and a provenance receipt. ESLint, TypeScript, production build, desktop, and 390 px mobile checks passed.",
    )
    add_project(
        story,
        "skill.supply | Full-stack career agent | ",
        "Built and deployed a Next.js 16 product from an empty repository in under two weeks, "
        "with structured Anthropic outputs, Zod validation, streamed run state, and live inventory "
        "from 4 ATS APIs plus 6 aggregators.",
        "https://skill.supply",
    )
    add_project(
        story,
        "Helium Harness | Python browser tooling | ",
        "Adapted browser-use/browser-harness v0.1.9 into a Helium-specific CDP derivative. Added "
        "profile and executable discovery, Windows detection, launch behavior, documentation, "
        "packaging, and unit coverage; the full local suite passes 141 tests with 2 Windows symlink skips.",
        "https://github.com/adamtpang/helium-harness",
    )
    add_project(
        story,
        "Register-truth evaluation | Agent reliability | ",
        "Designed 12 known-ground-truth scenarios across five statuses. The real pipeline classified "
        "12/12 correctly with zero false auto-closes in 2 security or payment cases; a focused rerun "
        "passed 15/15 tests.",
        "https://github.com/adamtpang/summon.company/blob/master/outbound/register-truth-eval/EVAL-REPORT.md",
    )

    story.append(Paragraph("EXPERIENCE", STYLES["section"]))
    story.append(
        Paragraph(
            "<b>Anchor Marianas | Founder and Software Engineer | Oct 2024 to present | Remote</b><br/>"
            "Sold and delivered software directly to clients, including Hilton-affiliated hospitality "
            "operators, carrying work from discovery through implementation.",
            STYLES["entry"],
        )
    )
    story.append(
        Paragraph(
            "<b>EIGN | Software Engineer and B2B Sales | One-month trial, ended Dec 2025 | Remote</b><br/>"
            "Built Lightmark.app's evidence-backed AI-visibility website diagnostic and worked across "
            "engineering, technical discovery, product demos, and outbound sales.",
            STYLES["entry"],
        )
    )
    story.append(
        Paragraph(
            "<b>Guam Power Authority | Workflow Automation | 2024 | Guam</b><br/>"
            "Automated a legacy Excel workflow from approximately 2 hours per run to approximately 2 minutes.",
            STYLES["entry"],
        )
    )

    story.append(Paragraph("SKILLS", STYLES["section"]))
    story.append(
        Paragraph(
            "<b>Product engineering:</b> TypeScript, JavaScript, React, Next.js, CSS, Node.js, Python, REST APIs, Zod",
            STYLES["compact"],
        )
    )
    story.append(
        Paragraph(
            "<b>AI and creative tooling:</b> MCP, human approval, MIDI workflow integration, audio generation and extension orchestration, stem separation, provenance",
            STYLES["compact"],
        )
    )
    story.append(
        Paragraph(
            "<b>Quality:</b> responsive UI, accessibility, structured outputs, evaluations, Playwright, Vitest, pytest",
            STYLES["compact"],
        )
    )

    story.append(Paragraph("EDUCATION", STYLES["section"]))
    story.append(
        Paragraph(
            "<b>App Academy | Full-Stack Web Development | 2022 to 2023 | San Francisco</b><br/>"
            "Completed an intensive full-stack software engineering program.",
            STYLES["entry"],
        )
    )
    document.build(story)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Build Adam's Suno Pro-Create resume as a PDF.")
    parser.add_argument("output", type=Path)
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    build(args.output)
