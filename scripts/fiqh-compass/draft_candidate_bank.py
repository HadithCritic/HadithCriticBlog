#!/usr/bin/env python3
"""Create a non-public 96-item instrument candidate bank for editorial review.

Candidate prompts ask about a respondent's own methodological preferences. They
do not encode historical jurists' views and are not enabled in the public quiz.
Every item remains unscored until evidence mapping and human review are complete.
"""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
QUESTION_SOURCE = ROOT / "src/data/fiqh-compass.ts"
OUTPUT = ROOT / "docs/research/fiqh-compass/instrument-candidate-bank-v1.json"
EVIDENCE_AUDIT = ROOT / "docs/research/fiqh-compass/question-evidence-audit-v1.json"

# Six additional drafts for each of the roadmap's twelve provisional axes.
# Tuple fields: domain, item_type, direction, prompt, related_issue_ids.
DRAFTS = {
    "A01": [
        ("method", "principle", 1, "A source accepted as authoritative may explain a Qur'anic command in ways not stated in the command's exact wording.", ["I01", "I03"]),
        ("worship", "case", -1, "A report about a ritual should clarify a Qur'anic requirement rather than create a separate obligation without Qur'anic authorization.", ["I01", "I08"]),
        ("transactions", "case", 1, "A binding rule for a new transaction may rest on an accepted source even when the Qur'an does not address that transaction directly.", ["I01", "I20"]),
        ("family", "case", -1, "A reported rule about family obligations should not add a requirement beyond what the Qur'an authorizes.", ["I01", "I03"]),
        ("public_law", "case", 1, "An accepted source outside the Qur'an can establish a binding public rule in a matter the Qur'an leaves unspecified.", ["I01", "I20"]),
        ("method", "principle", -1, "A source may explain a Qur'anic rule, but an independent binding requirement needs Qur'anic authorization.", ["I01", "I03"]),
    ],
    "A02": [
        ("method", "principle", 1, "A report transmitted through a limited number of routes may guide legal action when stated reliability conditions are met.", ["I02"]),
        ("worship", "case", -1, "A report carried through a limited number of routes should not by itself establish a disputed ritual obligation.", ["I02", "I17"]),
        ("transactions", "case", 1, "A report need not be mass-transmitted to affect a transaction if it meets the relevant legal conditions.", ["I02", "I03"]),
        ("method", "principle", -1, "For a report to establish a binding rule, broad transmission should ordinarily be required in addition to individual reliability.", ["I02"]),
        ("family", "case", 1, "A report with limited transmission may still establish a family-law rule when its reliability and relevance are established.", ["I02"]),
        ("method", "principle", -1, "A report's reliability through one route is not enough to make it binding unless other independent routes support it.", ["I02"]),
    ],
    "A03": [
        ("method", "principle", 1, "A continuous practice of a specifically identified early community can itself count as legal evidence.", ["I04"]),
        ("worship", "case", -1, "A community's ritual practice should not outweigh a contrary report unless the basis of that practice is established.", ["I04", "I17"]),
        ("transactions", "case", 1, "A well-documented practice in a named legal community may guide a transaction even when no single report states the rule.", ["I04"]),
        ("method", "principle", -1, "Inherited practice should have little independent weight when its community, period, or transmission cannot be identified.", ["I04"]),
        ("method", "principle", 1, "A relevant community's established practice can carry legal weight apart from a report that states the same rule.", ["I04"]),
        ("public_law", "case", -1, "A reported public practice should not establish a legal rule unless its transmission can be traced independently.", ["I04"]),
    ],
    "A04": [
        ("method", "principle", 1, "Agreement among all qualified scholars within a defined community and period can establish a binding conclusion.", ["I05"]),
        ("method", "principle", -1, "A claim of consensus should not bind unless the relevant scholars and evidence of agreement can be identified.", ["I05", "I06"]),
        ("worship", "case", 1, "A demonstrable agreement among qualified scholars can settle a disputed ritual detail even when the underlying reports differ.", ["I05"]),
        ("transactions", "case", -1, "The absence of a recorded objection should not by itself count as agreement on a commercial rule.", ["I06"]),
        ("method", "principle", 1, "Agreement may be legally decisive even if each participant's reasoning is not separately preserved.", ["I05"]),
        ("public_law", "case", -1, "A binding consensus claim requires evidence of who agreed, not merely an absence of known disagreement.", ["I05", "I06"]),
    ],
    "A05": [
        ("transactions", "case", 1, "A rule for a new transaction may be extended from an earlier case when a qualified jurist establishes a shared legal cause.", ["I07"]),
        ("worship", "case", -1, "A ritual requirement should not be extended to a new act solely because it resembles another act.", ["I08"]),
        ("method", "principle", 1, "An inferred shared cause can support extending a ruling when no text addresses the new case directly.", ["I07", "I08"]),
        ("public_law", "case", -1, "A public rule should not be extended to a new situation by analogy unless the shared cause is established.", ["I07"]),
        ("worship", "case", 1, "Analogy can sometimes establish a ritual detail when a qualified jurist identifies a relevant shared cause.", ["I08"]),
        ("method", "principle", -1, "Similarity between two cases is not enough to extend a ruling without a recognized basis for analogy.", ["I07", "I08"]),
    ],
    "A06": [
        ("method", "principle", 1, "Reasoned judgment about injustice can sometimes establish a binding legal conclusion without a specific text naming the case.", ["I09"]),
        ("transactions", "case", -1, "A transaction's perceived unfairness should not by itself make it religiously prohibited without an accepted legal basis.", ["I09", "I10"]),
        ("public_law", "case", 1, "Reasoned findings about harm can support a binding rule when no specific revealed text addresses the case.", ["I09", "I10"]),
        ("method", "principle", -1, "Reason can assess facts and consequences, but a binding religious ruling needs an accepted revelatory or transmitted basis.", ["I09"]),
        ("family", "case", 1, "A well-supported judgment about serious harm may affect a legal conclusion even without a text describing that exact situation.", ["I09"]),
        ("method", "principle", -1, "A conclusion's moral appeal is not enough to establish it as a binding religious rule.", ["I09"]),
    ],
    "A07": [
        ("public_law", "case", 1, "A public rule for an otherwise unregulated matter may be justified by a clearly established public benefit.", ["I10"]),
        ("transactions", "case", -1, "A claimed public benefit should not establish a new binding transaction rule unless it fits accepted legal evidence and methods.", ["I10"]),
        ("method", "principle", 1, "Public welfare can guide a binding rule in a genuinely new case when no specific source settles it.", ["I10"]),
        ("public_law", "case", -1, "Administrative convenience alone should not be treated as proof that a new religious rule is justified by public welfare.", ["I10"]),
        ("transactions", "case", 1, "A well-established public need may justify regulating a new kind of transaction within recognized legal limits.", ["I10"]),
        ("method", "principle", -1, "Public welfare should guide a religious rule only when its connection to accepted legal principles is established.", ["I10"]),
    ],
    "A08": [
        ("transactions", "case", 1, "A valid local custom may determine an unstated term in a contract when the parties leave that term open.", ["I11"]),
        ("family", "case", -1, "A family-law obligation should not change solely because local custom treats the same conduct differently.", ["I12"]),
        ("method", "principle", 1, "A well-established custom can shape a legal outcome when the governing rule leaves a detail unspecified.", ["I11", "I12"]),
        ("transactions", "case", -1, "Custom may help establish what the parties meant, but should not create a contractual duty they did not accept.", ["I11"]),
        ("family", "case", 1, "Custom may help determine what counts as fulfilling an obligation when its governing rule leaves the measure open.", ["I12"]),
        ("method", "principle", -1, "Custom should clarify ordinary meanings and facts, but should rarely change a legal outcome.", ["I11", "I12"]),
    ],
    "A09": [
        ("method", "principle", 1, "When a ruling depends on a factual condition that no longer exists, its application may change.", ["I13"]),
        ("public_law", "case", -1, "A change in social circumstances should not alter a rule's application unless the relevant legal condition has changed.", ["I13"]),
        ("transactions", "case", 1, "If a ruling addresses a specific market practice and that practice changes, its application may need reassessment.", ["I12", "I13"]),
        ("method", "principle", -1, "A ruling should usually retain the same application when circumstances change unless a recognized legal basis permits adjustment.", ["I13"]),
        ("family", "case", 1, "A change in relevant facts can justify changing how a family-law ruling is applied without changing the rule itself.", ["I13"]),
        ("method", "principle", -1, "Different circumstances do not by themselves justify changing how an established ruling is applied.", ["I13"]),
    ],
    "A10": [
        ("method", "principle", 1, "A layperson who relies on legal authorities should generally follow a consistent school or qualified authority.", ["I14"]),
        ("method", "principle", -1, "A layperson may reassess between qualified authorities on a particular question without adopting one school for every issue.", ["I14"]),
        ("method", "principle", -1, "A qualified jurist should ordinarily reassess an inherited position when its evidence appears insufficient.", ["I15"]),
        ("method", "principle", 1, "A qualified jurist should ordinarily remain within an inherited school position unless a recognized method supports departure.", ["I15"]),
        ("family", "case", -1, "A person facing a family-law question may follow a different qualified authority for that question when a reasoned basis is available.", ["I14"]),
        ("method", "principle", 1, "A layperson should follow a chosen qualified authority across issues unless there is a recognized reason to change.", ["I14", "I15"]),
    ],
    "A11": [
        ("transactions", "case", -1, "If a prohibition on an ordinary transaction is not established, the starting assumption should be that it is permitted.", ["I16"]),
        ("worship", "case", 1, "When a person is unsure whether a required ritual step was completed, taking a cautious course is often preferable.", ["I17"]),
        ("public_law", "case", -1, "Uncertainty about evidence should count against imposing a punishment rather than in favor of it.", ["I18"]),
        ("transactions", "case", 1, "When evidence about a transaction's permissibility remains uncertain, avoiding it is often preferable to proceeding.", ["I16"]),
        ("worship", "case", -1, "A person should not repeat an act of worship solely because of a doubt that arose after completing it.", ["I17"]),
        ("method", "principle", 1, "When legal responsibility remains uncertain, precaution should generally be preferred over presuming no obligation.", ["I16", "I17", "I18"]),
    ],
    "A12": [
        ("method", "principle", 1, "A later revealed ruling may supersede an earlier one when chronology and evidence for the change are established.", ["I19"]),
        ("method", "principle", -1, "An apparent conflict between revealed rulings should not be called supersession until other explanations are ruled out.", ["I19"]),
        ("worship", "case", 1, "A later report may supersede an earlier report on a ritual rule when the chronology is reliably established.", ["I19", "I20"]),
        ("method", "principle", -1, "A difference between two rulings is not enough to establish that one superseded the other.", ["I19"]),
        ("method", "principle", 1, "One accepted source type may supersede a rule established by another source type under defined conditions.", ["I20"]),
        ("method", "principle", -1, "A report should not be treated as superseding a Qur'anic ruling unless the basis for that relationship is clearly established.", ["I20"]),
    ],
}


def prototype_questions() -> list[dict[str, str | int]]:
    text = QUESTION_SOURCE.read_text(encoding="utf-8")
    section = text.split("export const questions = [", 1)[1].split("] as const;", 1)[0]
    pattern = re.compile(r'\{ id: "(Q\d+)", axis: "(A\d+)", direction: (-?\d+), prompt: "((?:[^"\\]|\\.)*)" \}')
    rows = [
        {"id": item_id, "axis_id": axis, "direction": int(direction), "prompt": prompt}
        for item_id, axis, direction, prompt in pattern.findall(section)
    ]
    if len(rows) != 24:
        raise SystemExit(f"Expected 24 prototype items in {QUESTION_SOURCE}, found {len(rows)}")
    return rows


def main() -> None:
    prototypes = prototype_questions()
    evidence_audit = json.loads(EVIDENCE_AUDIT.read_text(encoding="utf-8"))
    audit_by_id = {item["question_id"]: item for item in evidence_audit["questions"]}
    bank: list[dict[str, object]] = []
    for row in prototypes:
        audit = audit_by_id.get(row["id"], {})
        mapped_issues = audit.get("mapped_issues", [])
        bank.append({
            "id": row["id"],
            "axis_id": row["axis_id"],
            "direction": row["direction"],
            "prompt": row["prompt"],
            "domain": "method",
            "item_type": "prototype_statement",
            "related_issue_ids": [item["issue_id"] for item in mapped_issues],
            "candidate_position_ids": sorted({position_id for issue in mapped_issues for position_id in issue.get("curated_candidate_positions", [])}),
            "evidence_status": audit.get("audit_status", "audit_record_missing"),
            "source_evidence_links_reviewed": False,
            "comprehension_status": "not_tested",
            "respondent_axis_summary_enabled": True,
            "historical_profile_scoreable": False,
            "public_quiz": True,
        })

    item_number = 25
    for axis_id, drafts in DRAFTS.items():
        if len(drafts) != 6:
            raise SystemExit(f"{axis_id} needs six additional drafts")
        for domain, item_type, direction, prompt, issue_ids in drafts:
            bank.append({
                "id": f"Q{item_number:02d}",
                "axis_id": axis_id,
                "direction": direction,
                "prompt": prompt,
                "domain": domain,
                "item_type": item_type,
                "related_issue_ids": issue_ids,
                "candidate_position_ids": [],
                "evidence_status": "no historical position claim; issue linkage is topical only",
                "source_evidence_links_reviewed": False,
                "comprehension_status": "not_tested",
                "respondent_axis_summary_enabled": False,
                "historical_profile_scoreable": False,
                "public_quiz": False,
            })
            item_number += 1

    if item_number != 97 or len(bank) != 96:
        raise SystemExit(f"Expected 96 total items, found {len(bank)}")
    for axis_id in DRAFTS:
        axis_items = [item for item in bank if item["axis_id"] == axis_id]
        if len(axis_items) != 8:
            raise SystemExit(f"{axis_id} has {len(axis_items)} items, not eight")
        direction_counts = {direction: sum(item["direction"] == direction for item in axis_items) for direction in (-1, 1)}
        if direction_counts != {-1: 4, 1: 4}:
            raise SystemExit(f"{axis_id} direction balance is {direction_counts}")
        issue_ids = {issue for item in axis_items for issue in item["related_issue_ids"]}
        if not issue_ids:
            raise SystemExit(f"{axis_id} has no topical issue links")

    OUTPUT.write_text(json.dumps({
        "schema_version": "1.0.0",
        "status": "research candidate bank; not an evaluated or validated instrument",
        "created": "2026-10-04",
        "total_items": len(bank),
        "items_per_axis": 8,
        "answer_model": ["-2", "-1", "0", "1", "2", "unknown", "not_applicable"],
        "rules": [
            "Only Q01-Q24 are in the prototype quiz; Q25-Q96 are editorial candidates and are not public or scoreable.",
            "The issue links for Q25-Q96 identify topics for future evidence work; they are not citations or support for an answer.",
            "No item represents an author's or tradition's position. Historical positions require separate reviewed evidence records.",
            "Four positive and four negative scoring directions per axis are an initial balance check, not evidence of construct validity.",
            "Candidate wording must be reviewed for scope, role, neutrality, redundancy, comprehension, and tradition/domain relevance before use.",
        ],
        "items": bank,
    }, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(bank)} candidate items to {OUTPUT.relative_to(ROOT)}")
    print("Items per axis: 8; direction balance: 4 positive / 4 negative; extra candidates scored or publicly enabled: 0")


if __name__ == "__main__":
    main()
