from __future__ import annotations

import argparse
from pathlib import Path

from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.platypus import Paragraph, SimpleDocTemplate

from build_openai_codex_resume_pdf import STYLES, add_project


def build(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    document = SimpleDocTemplate(
        str(path),
        pagesize=letter,
        leftMargin=0.65 * inch,
        rightMargin=0.65 * inch,
        topMargin=0.6 * inch,
        bottomMargin=0.6 * inch,
        title="Adam Pangelinan - Fullstack Software Engineer",
        author="",
        subject="Role-specific resume for Sola Software Engineer, Fullstack",
        creator="",
        producer="",
        pageCompression=1,
    )

    story = [
        Paragraph("Adam Pangelinan", STYLES["name"]),
        Paragraph(
            "FULL-STACK SOFTWARE ENGINEER | AI AUTOMATION, BROWSER TOOLING, PRODUCT UX",
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
            "Forest City, Johor, Malaysia | US citizen | No US sponsorship required | "
            "Open to New York City relocation",
            STYLES["location"],
        ),
        Paragraph(
            "Full-stack TypeScript engineer and founder with 2 to 3 years of experience shipping "
            "AI automation from customer workflow to tested product. Builds fast React interfaces, "
            "backend services, browser developer tools, and explicit human-control boundaries.",
            STYLES["summary"],
        ),
        Paragraph("SELECTED ENGINEERING WORK", STYLES["section"]),
    ]

    add_project(
        story,
        "skill.supply | AI automation product | ",
        "Built and deployed a Next.js 16 career agent from an empty repository in under two weeks, "
        "with live inventory from 4 ATS APIs plus 6 aggregators, structured Anthropic outputs, "
        "Zod validation, streamed run state, and human review.",
        "https://skill.supply",
    )
    add_project(
        story,
        "Helium Harness | Python browser tooling | ",
        "Adapted browser-use/browser-harness v0.1.9 into a public Helium-specific CDP derivative. "
        "Added browser discovery, Windows detection, launch behavior, documentation, packaging, "
        "and unit coverage; the full local suite passes 141 tests with 2 Windows symlink skips.",
        "https://github.com/adamtpang/helium-harness",
    )
    add_project(
        story,
        "summon.company | Agent workflow platform | ",
        "Added 155 personal commits to a fork of Paperclip. Shipped an auditable register-truth "
        "reconciler, task receipts, documentation automation, and Playwright and Vitest coverage.",
        "https://github.com/adamtpang/summon.company",
    )
    add_project(
        story,
        "Register-truth evaluation | Reliable handoff | ",
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
            "Built Lightmark.app's evidence-backed AI-visibility diagnostic and worked across "
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
            "<b>AI automation:</b> structured outputs, streamed state, evaluations, tool use, "
            "human review, browser automation, CDP",
            STYLES["compact"],
        )
    )
    story.append(
        Paragraph(
            "<b>Quality:</b> Playwright, Vitest, pytest, known-ground-truth tests, protected-action handoff",
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
    parser = argparse.ArgumentParser(description="Build Adam's Sola Fullstack resume as PDF.")
    parser.add_argument("output", type=Path)
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    build(args.output)

