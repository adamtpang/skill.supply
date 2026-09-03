from __future__ import annotations

import argparse
from pathlib import Path

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import Paragraph, SimpleDocTemplate

from build_openai_codex_resume_pdf import STYLES as BASE_STYLES, link


STYLES = {
    "name": ParagraphStyle(
        "FalName",
        parent=BASE_STYLES["name"],
        fontSize=25,
        leading=27,
        spaceAfter=4.5,
    ),
    "headline": ParagraphStyle(
        "FalHeadline",
        parent=BASE_STYLES["headline"],
        fontSize=10.2,
        leading=12.5,
        spaceAfter=5,
    ),
    "contact": ParagraphStyle(
        "FalContact",
        parent=BASE_STYLES["contact"],
        fontSize=9.5,
        leading=12.3,
        spaceAfter=2.8,
    ),
    "location": ParagraphStyle(
        "FalLocation",
        parent=BASE_STYLES["location"],
        fontSize=9.4,
        leading=12.3,
        spaceAfter=10,
    ),
    "summary": ParagraphStyle(
        "FalSummary",
        parent=BASE_STYLES["summary"],
        fontSize=10.2,
        leading=14.2,
        spaceAfter=9,
    ),
    "section": ParagraphStyle(
        "FalSection",
        parent=BASE_STYLES["section"],
        fontSize=11,
        leading=14,
        spaceBefore=11,
        spaceAfter=5.5,
        keepWithNext=True,
    ),
    "bullet": ParagraphStyle(
        "FalBullet",
        parent=BASE_STYLES["bullet"],
        fontSize=9.9,
        leading=13.9,
        spaceAfter=5.2,
        leftIndent=16,
        bulletIndent=1.5,
        bulletFontSize=7.5,
    ),
    "entry": ParagraphStyle(
        "FalEntry",
        parent=BASE_STYLES["entry"],
        fontSize=9.8,
        leading=13.7,
        spaceAfter=6.2,
    ),
    "compact": ParagraphStyle(
        "FalCompact",
        parent=BASE_STYLES["compact"],
        fontSize=9.6,
        leading=13,
        spaceAfter=3.2,
    ),
}


def add_project(story, label: str, text: str, url: str) -> None:
    story.append(
        Paragraph(
            f"{link(label, url)}{text}",
            STYLES["bullet"],
            bulletText="\u2022",
        )
    )


def build(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    document = SimpleDocTemplate(
        str(path),
        pagesize=letter,
        leftMargin=0.7 * inch,
        rightMargin=0.7 * inch,
        topMargin=0.6 * inch,
        bottomMargin=0.6 * inch,
        title="Adam Pangelinan - Full-Stack Serverless Software Engineer",
        author="",
        subject="Resume for fal Software Engineer, Full Stack (Serverless)",
        creator="",
        producer="",
        pageCompression=1,
    )

    story = [
        Paragraph("Adam Pangelinan", STYLES["name"]),
        Paragraph(
            "SOFTWARE ENGINEER | FULL-STACK SERVERLESS PRODUCT SYSTEMS",
            STYLES["headline"],
        ),
        Paragraph(
            "adamtpang@gmail.com&nbsp;&nbsp;|&nbsp;&nbsp;+60 19 798 1734&nbsp;&nbsp;|&nbsp;&nbsp;"
            '<link href="https://adampang.com" color="#2E74B5">Portfolio</link>&nbsp;&nbsp;|&nbsp;&nbsp;'
            '<link href="https://github.com/adamtpang" color="#2E74B5">GitHub</link>&nbsp;&nbsp;|&nbsp;&nbsp;'
            '<link href="https://www.linkedin.com/in/adamtpang/" color="#2E74B5">LinkedIn</link>',
            STYLES["contact"],
        ),
        Paragraph(
            "Forest City, Johor, Malaysia | US citizen | No US sponsorship required | Open to San Francisco relocation",
            STYLES["location"],
        ),
        Paragraph(
            "Full-stack TypeScript and Python engineer with 2 to 3 years shipping AI agent products, "
            "developer tools, and infrastructure-adjacent systems. Builds Serverless product features "
            "across Next.js interfaces, backend REST APIs, PostgreSQL persistence, streamed workflows, "
            "and production testing. Owns work from design through deployment and iteration.",
            STYLES["summary"],
        ),
        Paragraph("SELECTED ENGINEERING WORK", STYLES["section"]),
    ]

    add_project(
        story,
        "Built skill.supply | ",
        "Deployed a Next.js 16 Serverless career product from an empty repository in under 2 weeks, "
        "owning React features, backend APIs, production testing, and iteration.",
        "https://skill.supply",
    )
    add_project(
        story,
        "Shipped skill.supply platform systems | ",
        "Implemented structured Anthropic outputs, Zod validation, NDJSON streaming, and Neon "
        "PostgreSQL persistence; indexed live inventory from 4 ATS APIs and 6 aggregators.",
        "https://github.com/adamtpang/skill.supply",
    )
    add_project(
        story,
        "Extended summon.company reliability | ",
        "Contributed 155 commits to a Paperclip-derived agent system; the evaluation classified "
        "12/12 scenarios across 5 statuses with 0 false auto-closes in 2 sensitive cases.",
        "https://github.com/adamtpang/summon.company/blob/master/outbound/register-truth-eval/EVAL-REPORT.md",
    )
    add_project(
        story,
        "Diagnosed Quantus GPU failure | ",
        "Traced a Windows wgpu OOM to 5 adapters across 2 physical GPUs; maintainer review verified "
        "the root cause and led to the corrected upstream implementation.",
        "https://github.com/Quantus-Network/quantus-miner/issues/61",
    )
    add_project(
        story,
        "Adapted Helium Harness | ",
        "Turned browser-use/browser-harness into a public Helium-first Python CDP developer tool for "
        "Windows, adding discovery, packaging, documentation, and tests; 141 tests passed with 2 skips.",
        "https://github.com/adamtpang/helium-harness",
    )
    add_project(
        story,
        "Automated a Guam Power Authority workflow | ",
        "Reduced one legacy Excel run from approximately 2 hours to approximately 2 minutes, "
        "replacing manual work with a repeatable operational process.",
        "https://adampang.com",
    )

    story.append(Paragraph("EXPERIENCE", STYLES["section"]))
    story.append(
        Paragraph(
            "<b>Anchor Marianas | Founder and Software Engineer | Oct 2024 to present | Remote</b><br/>"
            "Owned discovery, full-stack delivery, and production handoff for software clients, including Hilton.",
            STYLES["entry"],
        )
    )
    story.append(
        Paragraph(
            "<b>EIGN | Software Engineer and B2B Sales | One-month trial, ended Dec 2025 | Remote</b><br/>"
            "Built Lightmark.app's evidence-backed diagnostic across engineering, technical discovery, product demos, and outbound sales.",
            STYLES["entry"],
        )
    )

    story.append(Paragraph("SKILLS", STYLES["section"]))
    story.append(
        Paragraph(
            "<b>Product engineering:</b> TypeScript, JavaScript, React, Next.js, Node.js, Python, REST APIs, PostgreSQL/Neon, Zod",
            STYLES["compact"],
        )
    )
    story.append(
        Paragraph(
            "<b>Serverless and systems:</b> structured outputs, NDJSON streaming, browser automation, CDP, Rust and wgpu debugging",
            STYLES["compact"],
        )
    )
    story.append(
        Paragraph(
            "<b>Quality:</b> Playwright, Vitest, pytest, API testing, accessibility, performance, documentation",
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
    parser = argparse.ArgumentParser(description="Build Adam's fal full-stack Serverless resume PDF.")
    parser.add_argument("output", type=Path)
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    build(args.output)
