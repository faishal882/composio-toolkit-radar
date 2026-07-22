from __future__ import annotations

import json
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class GeneratedDataTests(unittest.TestCase):
    def load(self, relative: str):
        return json.loads((ROOT / relative).read_text(encoding="utf-8"))

    def test_identity_registry_is_brief_derived(self) -> None:
        identities = self.load("data/app-identities.json")
        self.assertEqual(len(identities), 100)
        self.assertTrue(all(row["source"] == "assignment_brief" for row in identities))
        self.assertTrue(all(row["hosts"] for row in identities))
        self.assertNotIn("curation", json.dumps(identities).lower())

    def test_verification_totals_are_claim_derived(self) -> None:
        verification = self.load("data/verification.json")
        claims = verification["claimAudit"]
        self.assertEqual(len(claims), 160)
        self.assertEqual(sum(item["firstSupported"] for item in claims), 101)
        self.assertEqual(sum(item["finalSupported"] for item in claims), 156)
        self.assertEqual(verification["method"]["firstPass"]["accuracy"], 63.1)
        self.assertEqual(verification["method"]["finalPass"]["accuracy"], 97.5)

    def test_human_gate_count_uses_set_union(self) -> None:
        patterns = self.load("data/patterns.json")
        self.assertEqual(patterns["humanGate"], {"formalReview": 11, "outreachFirst": 9, "overlap": 4, "uniqueApps": 16})


if __name__ == "__main__":
    unittest.main()
