from __future__ import annotations

import argparse
import json
from pathlib import Path

import qa_sola_fullstack_resume as base


base.EXPECTED_TEXT = [
    "Adam Pangelinan",
    "SOFTWARE ENGINEER",
    "DEVELOPER TOOLS",
    "2+ years",
    "Forest City, Johor, Malaysia",
    "Open to US relocation, with Texas preferred",
    "Register-truth evaluation | False-action control",
    "12/12 correctly",
    "zero false auto-closes",
    "summon.company | Auditable agent workflows",
    "155 personal commits",
    "Helium Harness | Python browser developer tool",
    "141 tests with 2 platform skips",
    "skill.supply | Deployed full-stack agent product",
    "Anchor Marianas | Founder and Software Engineer",
    "Guam Power Authority | Workflow Automation | 2024",
    "App Academy | Full-Stack Web Development",
]

base.FORBIDDEN_TEXT = [
    "TODO",
    "TBD",
    "PLACEHOLDER",
    "{{",
    "}}",
    "production Ruby",
    "production Go",
    "security engineer",
    "production on-call",
    "daily GitHub user",
    "3+ years",
    "\u2014",
]

base.EXPECTED_URLS = {
    "https://skill.supply",
    "https://github.com/adamtpang",
    "https://www.linkedin.com/in/adamtpang/",
    "https://github.com/adamtpang/helium-harness",
    "https://github.com/adamtpang/summon.company",
    "https://github.com/adamtpang/summon.company/blob/master/outbound/register-truth-eval/EVAL-REPORT.md",
}


def main() -> int:
    parser = argparse.ArgumentParser(description="QA Adam's GitHub Secret Scanning resume files.")
    parser.add_argument("docx", type=Path)
    parser.add_argument("pdf", type=Path)
    args = parser.parse_args()
    result = {
        "docx": base.inspect_docx(args.docx),
        "pdf": base.inspect_pdf(args.pdf),
    }
    result["passed"] = result["docx"]["passed"] and result["pdf"]["passed"]
    print(json.dumps(result, indent=2))
    return 0 if result["passed"] else 1


if __name__ == "__main__":
    raise SystemExit(main())

