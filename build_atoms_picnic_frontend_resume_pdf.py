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
        title="Adam Pangelinan - Frontend Software Engineer",
        author="",
        subject="Role-specific resume for Atoms and Picnic Frontend Engineer",
        creator="",
        producer="",
        pageCompression=1,
    )

    story = [
        Paragraph("Adam Pangelinan", STYLES["name"]),
        Paragraph(
            "FRONTEND SOFTWARE ENGINEER | REACT, TYPESCRIPT, ASYNC SYSTEMS",
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
            "Malaysia | US citizen | No US sponsorship required | Open to New York relocation",
            STYLES["location"],
        ),
        Paragraph(
            "Frontend-leaning TypeScript engineer with 2 to 3 years of experience shipping "
            "user-facing products. Builds React interfaces around asynchronous state, API "
            "integrations, typed validation, automated tests, and explicit failure boundaries.",
            STYLES["summary"],
        ),
        Paragraph("SELECTED ENGINEERING WORK", STYLES["section"]),
    ]

    add_project(
        story,
        "skill.supply | React product with live data | ",
        "Built and deployed a Next.js 16 product from an empty repository in under two weeks, "
        "with structured Anthropic outputs, Zod validation, streamed run state, and live job "
        "inventory from 4 ATS APIs plus 6 aggregators.",
        "https://skill.supply",
    )
    add_project(
        story,
        "summon.company | Agent reliability evaluation | ",
        "Extended a Paperclip-derived agent-company system with truth reconciliation and an "
        "end-to-end evaluation. The real pipeline classified 12/12 known scenarios across five "
        "statuses with zero false auto-closes in 2 security or payment cases.",
        "https://github.com/adamtpang/summon.company/blob/master/outbound/register-truth-eval/EVAL-REPORT.md",
    )
    add_project(
        story,
        "Quantus miner | Production systems debugging | ",
        "Root-caused a Windows wgpu OOM to duplicate backend enumeration and a CPU-emulated "
        "adapter. A maintainer verified the diagnosis, reviewed the proposed fix, and shipped a "
        "corrected upstream adapter-selection implementation.",
        "https://github.com/Quantus-Network/quantus-miner/issues/61",
    )
    add_project(
        story,
        "IDI Guam | Client product delivery | ",
        "Rebuilt a wholesale distributor's customer site in Next.js and TypeScript, centralizing "
        "operational facts in typed data and adding structured metadata, account inquiry, "
        "analytics, and explicit form-delivery states.",
        "https://idiguam.vercel.app",
    )

    story.append(Paragraph("EXPERIENCE", STYLES["section"]))
    story.append(
        Paragraph(
            "<b>Anchor Marianas | Founder and Software Engineer | Oct 2024 to present | Remote</b><br/>"
            "Sold and delivered software directly to clients, carrying work from discovery through "
            "implementation and production handoff.",
            STYLES["entry"],
        )
    )
    story.append(
        Paragraph(
            "<b>EIGN | Software Engineer and B2B Sales | One-month trial, ended Dec 2025 | Remote</b><br/>"
            "Built Lightmark.app's evidence-backed website diagnostic and worked across engineering, "
            "technical discovery, product demos, and outbound sales.",
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
            "<b>Frontend:</b> TypeScript, JavaScript, React, Next.js, HTML, CSS, responsive UI, state management",
            STYLES["compact"],
        )
    )
    story.append(
        Paragraph(
            "<b>Data and integration:</b> REST APIs, streamed state, structured outputs, Zod validation, live data, Python",
            STYLES["compact"],
        )
    )
    story.append(
        Paragraph(
            "<b>Quality and delivery:</b> accessibility, performance, debugging, documentation, Playwright, Vitest, pytest",
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
    parser = argparse.ArgumentParser(description="Build Adam's Atoms and Picnic frontend resume as a PDF.")
    parser.add_argument("output", type=Path)
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    build(args.output)
