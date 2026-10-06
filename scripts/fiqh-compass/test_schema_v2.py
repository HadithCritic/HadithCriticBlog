#!/usr/bin/env python3
"""In-memory smoke checks for the additive Fiqh Compass schema v2."""
from __future__ import annotations

import sqlite3
import unittest
import json
import hashlib
from pathlib import Path

from migrate_research_store_v2 import VERSION, apply_migration
from seed_acquisition_entities import seed
from export_research_store_v2 import export
from import_external_candidate_packet import import_packet


ROOT = Path(__file__).resolve().parents[2]
SCHEMA_V1 = ROOT / "docs/research/fiqh-compass/schema-v1.sql"
SCHEMA_V2 = ROOT / "docs/research/fiqh-compass/schema-v2.sql"


class SchemaV2Tests(unittest.TestCase):
    def setUp(self) -> None:
        self.con = sqlite3.connect(":memory:")
        self.con.row_factory = sqlite3.Row
        self.con.execute("PRAGMA foreign_keys = ON")
        self.con.executescript(SCHEMA_V1.read_text(encoding="utf-8"))
        apply_migration(self.con, SCHEMA_V2.read_text(encoding="utf-8"), "2026-10-04T00:00:00+00:00")

    def tearDown(self) -> None:
        self.con.close()

    def seed_existing_position(self) -> None:
        self.con.execute(
            "INSERT INTO dataset_snapshot VALUES (?,?,?,?,?,?,?,?)",
            ("test-dataset", "synthetic fixture", "memory", "0" * 64, 0, "2026-10-04", "unknown", ""),
        )
        self.con.execute(
            "INSERT INTO source_record(source_id,dataset_id,shamela_book_id,catalog_present,corpus_present) VALUES (?,?,?,?,?)",
            ("shamela:test", "test-dataset", "test", 0, 0),
        )
        self.con.execute("INSERT INTO axis(axis_id,title,low_endpoint,high_endpoint,scope_note) VALUES ('A01','Test','Low','High','Synthetic')")
        self.con.execute("INSERT INTO issue(issue_id,issue_group_id,question) VALUES ('I01','test','Synthetic issue')")
        self.con.execute("INSERT INTO profile(profile_id,display_name,scope) VALUES ('p-test','Synthetic profile','Test only')")
        self.con.execute(
            "INSERT INTO position(position_id,issue_id,holder_label,proposition,method_or_ruling) VALUES ('pos-test','I01','Synthetic','Test proposition','other')"
        )

    def test_external_source_and_passage_can_be_linked_without_inventing_identity(self) -> None:
        self.seed_existing_position()
        self.con.execute("INSERT INTO author_entity(author_id,display_name) VALUES ('auth-test','Synthetic author')")
        self.con.execute("INSERT INTO work_entity(work_id,title) VALUES ('work-test','Synthetic work')")
        self.con.execute(
            "INSERT INTO work_contributor(work_id,author_id,role,attribution_status,note) VALUES ('work-test','auth-test','author','unresolved','Synthetic fixture only')"
        )
        self.con.execute(
            "INSERT INTO manifestation(manifestation_id,work_id,manifestation_type,title,shelfmark,locator_system) VALUES ('man-test','work-test','manuscript_witness','Synthetic witness','TEST 1','folios')"
        )
        self.con.execute(
            "INSERT INTO digital_access(access_id,manifestation_id,provider,stable_uri,manifestation_match_status,rights_status) VALUES ('access-test','man-test','Synthetic library','https://example.invalid/item','unverified','unknown')"
        )
        self.con.execute(
            "INSERT INTO external_passage(passage_id,manifestation_id,access_id,author_id,locator_system,folio,arabic_verbatim,source_text_sha256,attribution_type,extraction_status,rights_status) VALUES ('pass-test','man-test','access-test',NULL,'folios','1r','test span','hash','unresolved','machine_candidate','needs_review')"
        )
        self.con.execute(
            "INSERT INTO position_external_evidence(position_id,passage_id,support_type) VALUES ('pos-test','pass-test','unreviewed')"
        )
        row = self.con.execute("SELECT author_id, attribution_type, extraction_status, rights_status FROM external_passage WHERE passage_id='pass-test'").fetchone()
        self.assertEqual(tuple(row), (None, "unresolved", "machine_candidate", "needs_review"))
        self.assertEqual(self.con.execute("SELECT profile_score_allowed FROM position WHERE position_id='pos-test'").fetchone()[0], 0)
        self.assertEqual(self.con.execute("PRAGMA foreign_key_check").fetchall(), [])

    def test_rights_cannot_be_marked_cleared_without_review_evidence(self) -> None:
        self.con.execute("INSERT INTO work_entity(work_id,title) VALUES ('work-test','Synthetic work')")
        self.con.execute(
            "INSERT INTO manifestation(manifestation_id,work_id,manifestation_type) VALUES ('man-test','work-test','printed_edition')"
        )
        with self.assertRaises(sqlite3.IntegrityError):
            self.con.execute(
                "INSERT INTO digital_access(access_id,manifestation_id,provider,stable_uri,rights_status) VALUES ('access-test','man-test','Synthetic library','https://example.invalid/item','cleared')"
            )

    def test_candidate_packet_checks_text_hash_and_imports_idempotently_unscored(self) -> None:
        self.con.execute("INSERT INTO work_entity(work_id,title) VALUES ('work-nil','Synthetic compilation')")
        self.con.execute("INSERT INTO manifestation(manifestation_id,work_id,manifestation_type) VALUES ('man-nil','work-nil','printed_edition')")
        self.con.execute("INSERT INTO digital_access(access_id,manifestation_id,provider,stable_uri) VALUES ('access-nil','man-nil','Synthetic library','https://example.invalid/nil')")
        text = "نص عربي تجريبي"
        packet = {
            "packet_id": "synthetic-external-passage",
            "manifestation_id": "man-nil",
            "access_id": "access-nil",
            "arabic_verbatim": text,
            "source_text_sha256": hashlib.sha256(text.encode("utf-8")).hexdigest(),
            "locator": {"printed_volume": "1", "printed_page": "50", "digital_pdf_page_one_based": 76},
            "rights_status": "needs_review",
            "candidate_scope": "Synthetic test only",
        }
        self.assertTrue(import_packet(self.con, packet))
        self.assertFalse(import_packet(self.con, packet))
        row = self.con.execute("SELECT author_id,locator_system,printed_page,digital_page,attribution_type,extraction_status,rights_status FROM external_passage").fetchone()
        self.assertEqual(tuple(row), (None, "mixed", "50", "76", "unresolved", "machine_candidate", "needs_review"))
        bad_packet = {**packet, "arabic_verbatim": "different text"}
        with self.assertRaises(ValueError):
            import_packet(self.con, bad_packet)

    def test_migration_is_idempotent_and_v1_rows_are_preserved(self) -> None:
        self.seed_existing_position()
        apply_migration(self.con, SCHEMA_V2.read_text(encoding="utf-8"), "2026-10-05T00:00:00+00:00")
        self.assertEqual(self.con.execute("SELECT COUNT(*) FROM schema_migration WHERE version=?", (VERSION,)).fetchone()[0], 1)
        self.assertEqual(self.con.execute("SELECT COUNT(*) FROM source_record").fetchone()[0], 1)
        self.assertEqual(self.con.execute("SELECT COUNT(*) FROM position").fetchone()[0], 1)
        self.assertEqual(self.con.execute("PRAGMA integrity_check").fetchone()[0], "ok")

    def test_metadata_seed_is_idempotent_and_never_imports_passages_or_clearance(self) -> None:
        seed_path = ROOT / "docs/research/fiqh-compass/acquisition-source-seeds-v1.json"
        queue_path = ROOT / "docs/research/fiqh-compass/acquisition-review-queue.json"
        seed_data = json.loads(seed_path.read_text(encoding="utf-8"))
        queue_data = json.loads(queue_path.read_text(encoding="utf-8"))
        self.con.execute(
            "INSERT INTO dataset_snapshot VALUES (?,?,?,?,?,?,?,?)",
            ("catalog-test", "synthetic catalogue", "memory", "0" * 64, 0, "2026-10-05", "unknown", ""),
        )
        self.con.execute(
            "INSERT INTO source_record(source_id,dataset_id,shamela_book_id,catalog_present,corpus_present) VALUES (?,?,?,?,?)",
            ("shamela:8463", "catalog-test", "8463", 1, 1),
        )
        first = seed(self.con, seed_data, queue_data)
        second = seed(self.con, seed_data, queue_data)
        exported = export(self.con, seed_path, queue_path)
        self.assertEqual(first["authors"], 5)
        self.assertEqual(first["works"], 5)
        self.assertEqual(first["manifestations"], 7)
        self.assertEqual(first["digital_access"], 10)
        self.assertEqual(first["leads"], 5)
        self.assertEqual(first["passages_created"], 0)
        self.assertEqual(second["authors"] + second["works"] + second["manifestations"] + second["digital_access"] + second["leads"], 0)
        self.assertEqual(self.con.execute("SELECT COUNT(*) FROM external_passage").fetchone()[0], 0)
        self.assertEqual(self.con.execute("SELECT COUNT(*) FROM digital_access WHERE rights_status='cleared'").fetchone()[0], 0)
        self.assertEqual(self.con.execute("PRAGMA foreign_key_check").fetchall(), [])
        self.assertEqual(exported["summary"]["authors"], 5)
        self.assertEqual(exported["summary"]["works"], 5)
        self.assertEqual(exported["summary"]["manifestations"], 7)
        self.assertEqual(exported["summary"]["acquisition_leads"], 5)
        self.assertEqual(exported["summary"]["external_passages"], 0)
        self.assertEqual(self.con.execute(
            "SELECT link_status FROM source_work_link WHERE source_id='shamela:8463' AND work_id='work:al-mughni-ibn-qudama'"
        ).fetchone()[0], "metadata_only")
        self.assertEqual(self.con.execute(
            "SELECT link_status FROM source_manifestation_link WHERE source_id='shamela:8463' AND manifestation_id='manifestation:al-mughni-cairo-1968-vol3-catalogue-claim'"
        ).fetchone()[0], "metadata_only")
        mug_access = self.con.execute(
            "SELECT da.manifestation_match_status,da.rights_status,ala.access_role "
            "FROM digital_access da JOIN acquisition_lead_access ala USING(access_id) "
            "WHERE da.access_id='access:al-mughni-maknoon-vol3-scan' AND ala.queue_id='AQ-H01'"
        ).fetchone()
        self.assertEqual(tuple(mug_access), ("candidate_match", "needs_review", "digitized_source"))
        archive_access = self.con.execute(
            "SELECT da.manifestation_match_status,da.rights_status,ala.access_role "
            "FROM digital_access da JOIN acquisition_lead_access ala USING(access_id) "
            "WHERE da.access_id='access:al-mughni-archive-vol3-pdf' AND ala.queue_id='AQ-H01'"
        ).fetchone()
        self.assertEqual(tuple(archive_access), ("candidate_match", "needs_review", "digitized_source"))
        mug_lead = self.con.execute(
            "SELECT next_action FROM acquisition_lead WHERE queue_id='AQ-H01'"
        ).fetchone()[0]
        self.assertIn("provenance", mug_lead)
        self.assertEqual(self.con.execute("SELECT COUNT(*) FROM external_passage").fetchone()[0], 0)
        self.assertEqual(self.con.execute("SELECT COUNT(*) FROM digital_access WHERE rights_status='cleared'").fetchone()[0], 0)
        volume_two = self.con.execute(
            "SELECT da.manifestation_match_status,da.rights_status,ala.access_role "
            "FROM digital_access da JOIN acquisition_lead_access ala USING(access_id) "
            "WHERE da.access_id='access:al-mabsut-princeton-volume-2' AND ala.queue_id='AQ-T01'"
        ).fetchone()
        self.assertEqual(tuple(volume_two), ("candidate_match", "needs_review", "digitized_source"))
        bahr_access = self.con.execute(
            "SELECT da.manifestation_match_status,da.rights_status,ala.access_role "
            "FROM digital_access da JOIN acquisition_lead_access ala USING(access_id) "
            "WHERE da.access_id='access:al-bahr-bsb-manuscript' AND ala.queue_id='AQ-Z01'"
        ).fetchone()
        self.assertEqual(tuple(bahr_access), ("candidate_match", "needs_review", "digitized_source"))
        bahr_dates = json.loads(self.con.execute(
            "SELECT date_claims_json FROM author_entity WHERE author_id='author:ahmad-ibn-yahya-ibn-al-murtada'"
        ).fetchone()[0])
        self.assertEqual(bahr_dates[0]["claim"], "born 1373; died 1437")
        self.assertEqual(bahr_dates[0]["era"], "not stated on DDB authority page")
        self.assertEqual(self.con.execute("SELECT COUNT(*) FROM external_passage").fetchone()[0], 0)
        self.assertTrue(exported["research_only"])


if __name__ == "__main__":
    unittest.main(verbosity=2)
