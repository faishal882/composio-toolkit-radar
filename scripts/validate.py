#!/usr/bin/env python3
"""Validate the public dataset and its audit trail as one consistency boundary."""

from __future__ import annotations

import json
import re
from collections import Counter
from datetime import date
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[1]
REQUIRED = {
    "id", "name", "category", "description", "auth", "access", "api",
    "mcp", "verdict", "blocker", "evidence", "confidence", "checkedAt",
}
ACCESS = {"Self-serve", "Plan/admin", "Open source", "Review required", "Contact sales"}
VERDICTS = {"Build now", "Build with constraints", "Outreach first", "No public API"}
CONFIDENCE = {"High", "Medium", "Low"}


def load(path: str):
    return json.loads((ROOT / path).read_text(encoding="utf-8"))


def main() -> int:
    rows = load("data/apps.json")
    seed = load("data/apps-seed.json")
    verification = load("data/verification.json")
    errors: list[str] = []

    expected_names = [name for group in seed for name in group["apps"]]
    expected_categories = [group["category"] for group in seed]
    if len(rows) != 100:
        errors.append(f"expected 100 rows, found {len(rows)}")
    if [row.get("id") for row in rows] != list(range(1, 101)):
        errors.append("ids must be ordered integers 1..100")
    if [row.get("name") for row in rows] != expected_names:
        errors.append("dataset names/order differ from apps-seed.json")
    if len(set(expected_categories)) != 10:
        errors.append("seed must contain 10 unique categories")

    for row in rows:
        label = f"{row.get('id', '?')}:{row.get('name', '?')}"
        missing = REQUIRED - row.keys()
        if missing:
            errors.append(f"{label}: missing {', '.join(sorted(missing))}")
        if not isinstance(row.get("auth"), list) or not row.get("auth"):
            errors.append(f"{label}: auth must be a non-empty list")
        if row.get("access") not in ACCESS:
            errors.append(f"{label}: unsupported access {row.get('access')!r}")
        if row.get("verdict") not in VERDICTS:
            errors.append(f"{label}: unsupported verdict {row.get('verdict')!r}")
        if row.get("confidence") not in CONFIDENCE:
            errors.append(f"{label}: unsupported confidence {row.get('confidence')!r}")
        if not str(row.get("description", "")).strip() or not str(row.get("blocker", "")).strip():
            errors.append(f"{label}: description and blocker must be explicit")
        if re.search(r"^(none|n/a)$", str(row.get("blocker", "")).strip(), re.I):
            errors.append(f"{label}: blocker cannot be a placeholder")
        evidence = row.get("evidence")
        if not isinstance(evidence, list) or not evidence:
            errors.append(f"{label}: evidence must be a non-empty list")
        for item in evidence if isinstance(evidence, list) else []:
            url = str(item.get("url", "")) if isinstance(item, dict) else ""
            parsed = urlparse(url)
            if parsed.scheme != "https" or not parsed.hostname:
                errors.append(f"{label}: invalid HTTPS evidence URL {url!r}")
        try:
            date.fromisoformat(str(row.get("checkedAt")))
        except ValueError:
            errors.append(f"{label}: checkedAt must be an ISO date")

    categories = Counter(row.get("category") for row in rows)
    if categories != Counter({category: 10 for category in expected_categories}):
        errors.append(f"expected 10 apps in each category, found {dict(categories)}")
    if len({row.get("name") for row in rows}) != len(rows):
        errors.append("duplicate app names")

    method = verification.get("method", {})
    samples = verification.get("samples", [])
    if method.get("sampleSize") != len(samples) or len(samples) != 20:
        errors.append("verification sampleSize must match 20 sample rows")
    if len({sample.get("id") for sample in samples}) != len(samples):
        errors.append("verification sample ids must be unique")
    if any(sample.get("id") not in range(1, 101) for sample in samples):
        errors.append("verification sample id outside dataset")
    for phase in ("firstPass", "finalPass"):
        score = method.get(phase, {})
        supported, total, accuracy = score.get("supportedClaims"), score.get("totalClaims"), score.get("accuracy")
        if not isinstance(supported, int) or not isinstance(total, int) or not total:
            errors.append(f"verification {phase} totals are invalid")
        elif round(100 * supported / total, 1) != accuracy:
            errors.append(f"verification {phase} accuracy does not match its totals")

    latest_path = ROOT / "artifacts/research.latest.json"
    if latest_path.exists():
        latest = json.loads(latest_path.read_text(encoding="utf-8"))
        agent_rows = latest.get("rows", [])
        if [row.get("id") for row in agent_rows] != list(range(1, 101)):
            errors.append("latest agent artifact must contain ordered IDs 1..100")
        if latest.get("completed") != len(agent_rows):
            errors.append("latest agent completed count differs from row count")
        if latest.get("researched") != sum(row.get("status") == "researched" for row in agent_rows):
            errors.append("latest agent researched count is inconsistent")
        if latest.get("needsHumanReview") != sum(row.get("status") == "needs_human_review" for row in agent_rows):
            errors.append("latest agent review count is inconsistent")
        for row in agent_rows:
            if row.get("status") == "researched":
                primary = row.get("primaryEvidence") or {}
                if not primary.get("official") or not primary.get("technical"):
                    errors.append(f"agent row {row.get('id')}: auto-cleared without official technical evidence")

    if errors:
        print("\n".join(errors))
        return 1

    summary = {
        "rows": len(rows),
        "categories": len(categories),
        "verdicts": dict(sorted(Counter(row["verdict"] for row in rows).items())),
        "access": dict(sorted(Counter(row["access"] for row in rows).items())),
        "confidence": dict(sorted(Counter(row["confidence"] for row in rows).items())),
        "verificationSamples": len(samples),
    }
    print(json.dumps(summary, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
