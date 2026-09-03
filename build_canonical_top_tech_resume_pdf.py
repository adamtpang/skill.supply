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
        title="Adam Pangelinan - Software Engineer",
        author="",
        subject="Canonical top-tech software engineering resume",
        creator="",
        producer="",
        pageCompression=1,
    )

    story = [
        Paragraph("Adam Pangelinan", STYLES["name"]),
        Paragraph(
            "SOFTWARE ENGINEER | AGENT SYSTEMS, DEVELOPER TOOLS, PRODUCT RELIABILITY",
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
            "Forest City, Johor, Malaysia | US citizen | No US sponsorship required | Open worldwide relocation",
            STYLES["location"],
        ),
        Paragraph(
            "Full-stack TypeScript engineer with 2 to 3 years of experience shipping agent products "
            "and developer tools. Builds inspectable workflows, evaluates decisions against known "
            "truth, and traces failures from React and APIs into browser and systems infrastructure.",
            STYLES["summary"],
        ),
        Paragraph("SELECTED ENGINEERING WORK", STYLES["section"]),
    ]

    add_project(
        story,
        "summon.company | Agent reliability | ",
        "Contributed 155 personal commits to a Paperclip-derived agent-company system, including "
        "an auditable register-truth reconciler and end-to-end evaluation. The real pipeline "
        "classified 12/12 known scenarios across 5 statuses, with 0 false auto-closes in 2 "
        "security or payment cases.",
        "https://github.com/adamtpang/summon.company/blob/master/outbound/register-truth-eval/EVAL-REPORT.md",
    )
    add_project(
        story,
        "Quantus miner | Rust and GPU debugging | ",
        "Traced a Windows wgpu OOM to 5 enumerated adapters on 2 physical GPUs: duplicate "
        "Vulkan and DX12 devices plus a CPU-emulated driver. A maintainer verified the diagnosis; "
        "review exposed the first fix's flaw and led to the corrected upstream implementation.",
        "https://github.com/Quantus-Network/quantus-miner/issues/61",
    )
    add_project(
        story,
        "Helium Harness | Python browser developer tool | ",
        "Adapted browser-use/browser-harness into a public Helium-specific CDP derivative. Added "
        "Windows executable and profile discovery, Helium-first launch behavior, packaging, docs, "
        "and tests; the full local suite passed 141 tests with 2 platform skips.",
        "https://github.com/adamtpang/helium-harness",
    )
    add_project(
        story,
        "skill.supply | Full-stack agent product | ",
        "Built and deployed a Next.js 16 career agent from an empty repository in under 2 weeks, "
        "with structured Anthropic outputs, Zod validation, streamed state, and live inventory "
        "from 4 ATS APIs plus 6 aggregators.",
        "https://skill.supply",
    )

    story.append(Paragraph("EXPERIENCE", STYLES["section"]))
    story.append(
        Paragraph(
            "<b>Anchor Marianas | Founder and Software Engineer | Oct 2024 to present | Remote</b><br/>"
            "Sold and delivered software directly to clients, including Hilton, owning work from "
            "discovery through implementation and production handoff.",
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
            "<b>Product engineering:</b> TypeScript, JavaScript, React, Next.js, Node.js, REST APIs, Zod, Python, Go",
            STYLES["compact"],
        )
    )
    story.append(
        Paragraph(
            "<b>Agents and systems:</b> structured outputs, tool use, evaluations, human review, browser automation, CDP, Rust and wgpu debugging",
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
    parser = argparse.ArgumentParser(description="Build Adam's canonical top-tech resume as a PDF.")
    parser.add_argument("output", type=Path)
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    build(args.output)
