#!/usr/bin/env python3
"""Materialize human-reviewed decisions without mutating the raw agent artifact."""

from __future__ import annotations

import json
import os
import tempfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
RAW_PATH = ROOT / "artifacts/research.raw.json"
CURATION_PATH = ROOT / "data/curation.json"
OUTPUT_PATH = ROOT / "data/apps.json"


def atomic_write(path: Path, rows: list[dict]) -> None:
    with tempfile.NamedTemporaryFile("w", encoding="utf-8", dir=path.parent, delete=False) as handle:
        json.dump(rows, handle, indent=2, ensure_ascii=False)
        handle.write("\n")
        temporary = Path(handle.name)
    os.replace(temporary, path)


def main() -> None:
    raw = json.loads(RAW_PATH.read_text(encoding="utf-8"))
    reviewed = json.loads(CURATION_PATH.read_text(encoding="utf-8"))
    raw_rows = raw.get("rows", [])
    if len(raw_rows) != 100 or len(reviewed) != 100:
        raise ValueError(f"Expected 100 raw and reviewed rows, got {len(raw_rows)} and {len(reviewed)}")

    for index, (source, decision) in enumerate(zip(raw_rows, reviewed, strict=True), start=1):
        if source.get("app") != decision.get("name"):
            raise ValueError(
                f"Row {index} identity mismatch: raw={source.get('app')!r}, curated={decision.get('name')!r}"
            )
        if source.get("category") != decision.get("category"):
            raise ValueError(f"Row {index} category mismatch for {decision.get('name')}")
        if decision.get("id") != index:
            raise ValueError(f"Row {index} has curated id {decision.get('id')}")

    atomic_write(OUTPUT_PATH, reviewed)
    print(f"Wrote {len(reviewed)} reviewed rows to {OUTPUT_PATH.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
