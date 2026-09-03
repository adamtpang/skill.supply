from __future__ import annotations

import argparse
import json
import re
import zipfile
from pathlib import Path

from docx import Document
from pypdf import PdfReader


EXPECTED_TEXT = [
    "Adam Pangelinan",
    "FULL-STACK SOFTWARE ENGINEER",
    "AI AUTOMATION",
    "2 to 3 years",
    "Forest City, Johor, Malaysia",
    "Open to New York City relocation",
    "skill.supply | AI automation product",
    "Helium Harness | Python browser tooling",
    "141 tests with 2 Windows symlink skips",
    "summon.company | Agent workflow platform",
    "155 personal commits",
    "Register-truth evaluation | Reliable handoff",
    "12/12 correctly",
    "Anchor Marianas | Founder and Software Engineer",
    "Guam Power Authority | Workflow Automation | 2024",
    "App Academy | Full-Stack Web Development",
]

FORBIDDEN_TEXT = [
    "TODO",
    "TBD",
    "PLACEHOLDER",
    "{{",
    "}}",
    "Sola user",
    "daily Sola user",
    "production Kubernetes",
    "production Temporal",
    "SCIM",
    "RBAC",
    "browser extension owner",
    "3+ years",
    "\u2014",
]

EXPECTED_URLS = {
    "https://skill.supply",
    "https://github.com/adamtpang",
    "https://www.linkedin.com/in/adamtpang/",
    "https://github.com/adamtpang/helium-harness",
    "https://github.com/adamtpang/summon.company",
    "https://github.com/adamtpang/summon.company/blob/master/outbound/register-truth-eval/EVAL-REPORT.md",
}


def inspect_docx(path: Path) -> dict:
    document = Document(path)
    text = "\n".join(paragraph.text for paragraph in document.paragraphs)
    section = document.sections[0]
    with zipfile.ZipFile(path) as archive:
        names = set(archive.namelist())
        document_xml = archive.read("word/document.xml").decode("utf-8")
        numbering_xml = archive.read("word/numbering.xml").decode("utf-8")
        rels_xml = archive.read("word/_rels/document.xml.rels").decode("utf-8")
        all_story_xml = "\n".join(
            archive.read(name).decode("utf-8", errors="ignore")
            for name in names
            if name.startswith("word/") and name.endswith(".xml")
        )
    relationship_targets = set(re.findall(r'Target="(https?://[^"]+)"', rels_xml))
    result = {
        "path": str(path.resolve()),
        "sections": len(document.sections),
        "page_width_inches": round(section.page_width.inches, 3),
        "page_height_inches": round(section.page_height.inches, 3),
        "missing_expected_text": [item for item in EXPECTED_TEXT if item not in text],
        "forbidden_text_found": [item for item in FORBIDDEN_TEXT if item in text],
        "author": document.core_properties.author or "",
        "last_modified_by": document.core_properties.last_modified_by or "",
        "hyperlink_relationships": len(re.findall(r'Type="[^"]*/hyperlink"', rels_xml)),
        "missing_expected_urls": sorted(EXPECTED_URLS - relationship_targets),
        "unexpected_urls": sorted(relationship_targets - EXPECTED_URLS),
        "real_bullet_numbering": 'w:numFmt w:val="bullet"' in numbering_xml,
        "numbered_paragraphs": document_xml.count("<w:numPr>"),
        "comments_present": "word/comments.xml" in names,
        "tracked_changes_present": bool(re.search(r"<w:(?:ins|del|moveFrom|moveTo)(?:\s|>)", all_story_xml)),
        "raw_http_text_present": bool(re.search(r"https?://", text)),
        "custom_properties_present": "docProps/custom.xml" in names,
        "rsid_present": bool(re.search(r"\sw:rsid(?:R|RPr|Del|P|Sect)=", all_story_xml)),
    }
    result["passed"] = all(
        [
            result["sections"] == 1,
            result["page_width_inches"] == 8.5,
            result["page_height_inches"] == 11.0,
            not result["missing_expected_text"],
            not result["forbidden_text_found"],
            not result["author"],
            not result["last_modified_by"],
            result["hyperlink_relationships"] >= 6,
            not result["missing_expected_urls"],
            not result["unexpected_urls"],
            result["real_bullet_numbering"],
            result["numbered_paragraphs"] == 4,
            not result["comments_present"],
            not result["tracked_changes_present"],
            not result["raw_http_text_present"],
            not result["custom_properties_present"],
            not result["rsid_present"],
        ]
    )
    return result


def inspect_pdf(path: Path) -> dict:
    reader = PdfReader(path)
    text = "\n".join(page.extract_text() or "" for page in reader.pages)
    metadata = reader.metadata or {}
    annotation_urls = [
        annotation.get_object().get("/A", {}).get("/URI")
        for page in reader.pages
        for annotation in page.get("/Annots", [])
        if annotation.get_object().get("/A", {}).get("/URI")
    ]
    unique_urls = set(annotation_urls)
    result = {
        "path": str(path.resolve()),
        "pages": len(reader.pages),
        "missing_expected_text": [item for item in EXPECTED_TEXT if item not in text],
        "forbidden_text_found": [item for item in FORBIDDEN_TEXT if item in text],
        "author": metadata.get("/Author", "") or "",
        "creator": metadata.get("/Creator", "") or "",
        "producer": metadata.get("/Producer", "") or "",
        "link_annotations": len(annotation_urls),
        "missing_expected_urls": sorted(EXPECTED_URLS - unique_urls),
        "unexpected_urls": sorted(unique_urls - EXPECTED_URLS),
        "raw_http_text_present": bool(re.search(r"https?://", text)),
        "form_fields_present": bool(reader.get_fields()),
    }
    result["passed"] = all(
        [
            result["pages"] == 1,
            not result["missing_expected_text"],
            not result["forbidden_text_found"],
            not result["author"],
            not result["creator"],
            not result["producer"],
            result["link_annotations"] >= 6,
            not result["missing_expected_urls"],
            not result["unexpected_urls"],
            not result["raw_http_text_present"],
            not result["form_fields_present"],
        ]
    )
    return result


def main() -> int:
    parser = argparse.ArgumentParser(description="QA Adam's Sola Fullstack resume files.")
    parser.add_argument("docx", type=Path)
    parser.add_argument("pdf", type=Path)
    args = parser.parse_args()
    result = {"docx": inspect_docx(args.docx), "pdf": inspect_pdf(args.pdf)}
    result["passed"] = result["docx"]["passed"] and result["pdf"]["passed"]
    print(json.dumps(result, indent=2))
    return 0 if result["passed"] else 1


if __name__ == "__main__":
    raise SystemExit(main())

