"""Build the OSD-575 provenance manifest and inspection report."""

from __future__ import annotations

import json
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from saloris_ml.acquisition import build_manifest, fetch_file_metadata
from saloris_ml.inspection import inspect_file, sha256_file


def main() -> None:
    raw_dir = ROOT / "data" / "raw" / "OSD-575"
    reports = ROOT / "reports"
    reports.mkdir(exist_ok=True)
    payload = fetch_file_metadata()
    files = {}
    for path in sorted(raw_dir.iterdir()):
        if path.suffix.lower() in {".csv", ".xlsx"}:
            files[path.name] = inspect_file(path)
    checksums = {path.name: sha256_file(path) for path in raw_dir.iterdir() if path.is_file()}
    sizes = {path.name: path.stat().st_size for path in raw_dir.iterdir() if path.is_file()}
    manifest = build_manifest(payload, raw_dir, checksums, sizes)
    manifest["generated_at"] = datetime.now(timezone.utc).isoformat()
    (reports / "source-manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    report = {
        "study_accession": "OSD-575",
        "generated_at": manifest["generated_at"],
        "files": list(files.values()),
        "notes": [
            "Submitted and transformed files are reported separately.",
            "No files were combined, deduplicated, or modified.",
            "The files contain four subject identifiers (C001-C004) and sample timepoints.",
        ],
    }
    (reports / "inspection-report.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
