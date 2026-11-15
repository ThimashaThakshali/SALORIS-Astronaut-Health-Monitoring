"""Generate descriptive baseline comparisons from submitted OSD-575 observations."""

from __future__ import annotations

import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from saloris_ml.baseline import analyze_baseline, write_report


def main() -> None:
    report = analyze_baseline(
        ROOT / "data" / "processed" / "observations_submitted.csv",
        ROOT / "data" / "processed" / "baseline_comparisons.csv",
    )
    report["generated_at"] = datetime.now(timezone.utc).isoformat()
    write_report(report, ROOT / "reports" / "baseline-analysis-report.json")


if __name__ == "__main__":
    main()
