"""Generate representation-preserving normalized OSD-575 observations."""

from __future__ import annotations

import json
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from saloris_ml.preprocessing import preprocess_osd575


def main() -> None:
    report = preprocess_osd575(ROOT / "data" / "raw" / "OSD-575", ROOT / "data" / "processed")
    report["generated_at"] = datetime.now(timezone.utc).isoformat()
    (ROOT / "reports" / "preprocessing-report.json").write_text(
        json.dumps(report, indent=2) + "\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
