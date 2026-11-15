"""Generate experimental anomaly classifications from baseline comparisons."""

from __future__ import annotations

import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from saloris_ml.anomaly import detect_anomalies, write_report


def main() -> None:
    report = detect_anomalies(
        ROOT / "data" / "processed" / "baseline_comparisons.csv",
        ROOT / "data" / "processed" / "anomaly_results.csv",
    )
    report["generated_at"] = datetime.now(timezone.utc).isoformat()
    write_report(report, ROOT / "reports" / "anomaly-analysis-report.json")


if __name__ == "__main__":
    main()
