"""Experimental, transparent anomaly classifications from baseline comparisons."""

from __future__ import annotations

import csv
import json
import math
from collections import Counter
from pathlib import Path
from typing import Any

Z_SCORE_THRESHOLD = 2.0
REQUIRED_FIELDS = {
    "subject_id",
    "panel",
    "assay",
    "biomarker",
    "unit",
    "post_timepoint",
    "post_value",
    "baseline_mean",
    "baseline_standard_deviation",
    "z_score",
    "comparison_status",
}
OUTPUT_FIELDS = [
    "subject_id",
    "biomarker",
    "panel",
    "assay",
    "unit",
    "sample_id",
    "timepoint",
    "observed_value",
    "baseline_mean",
    "baseline_standard_deviation",
    "deviation_score",
    "anomaly_classification",
    "method",
    "explanation",
    "source_file",
    "source_row",
    "comparison_status",
]


def _number(value: str | None) -> float | None:
    if value is None or value.strip() == "":
        return None
    try:
        result = float(value)
    except ValueError:
        return None
    return result if math.isfinite(result) else None


def _classification(row: dict[str, str]) -> tuple[str, str]:
    status = row.get("comparison_status", "")
    observed = _number(row.get("post_value"))
    z_score = _number(row.get("z_score"))
    baseline_mean = _number(row.get("baseline_mean"))
    baseline_sd = _number(row.get("baseline_standard_deviation"))

    if status == "MISSING_POST_VALUE" or observed is None:
        return "Missing measurement", "The post-flight measurement is missing or non-numeric; it was not treated as normal."
    if status == "INSUFFICIENT_BASELINE" or baseline_mean is None:
        return "Insufficient data", "There are not enough numeric pre-flight observations to establish this subject-specific baseline."
    if baseline_sd == 0:
        if observed == baseline_mean:
            return "Within baseline variation", "The observed value equals a zero-variance baseline; no standardized score is available."
        return "Unusual deviation", "The observed value differs from a zero-variance baseline; a z-score is undefined."
    if z_score is None:
        return "Insufficient data", "A standardized deviation could not be calculated from the available baseline statistics."
    if abs(z_score) > Z_SCORE_THRESHOLD:
        return "Unusual deviation", (
            f"The absolute baseline z-score is {abs(z_score):.4g}, above the exploratory "
            f"{Z_SCORE_THRESHOLD:g} standard-deviation heuristic."
        )
    return "Within baseline variation", (
        f"The absolute baseline z-score is {abs(z_score):.4g}, within the exploratory "
        f"{Z_SCORE_THRESHOLD:g} standard-deviation heuristic."
    )


def _result(row: dict[str, str]) -> dict[str, str]:
    classification, explanation = _classification(row)
    return {
        "subject_id": row.get("subject_id", ""),
        "biomarker": row.get("biomarker", ""),
        "panel": row.get("panel", ""),
        "assay": row.get("assay", ""),
        "unit": row.get("unit", ""),
        "sample_id": row.get("post_sample_id", ""),
        "timepoint": row.get("post_timepoint", ""),
        "observed_value": row.get("post_value", ""),
        "baseline_mean": row.get("baseline_mean", ""),
        "baseline_standard_deviation": row.get("baseline_standard_deviation", ""),
        "deviation_score": row.get("z_score", ""),
        "anomaly_classification": classification,
        "method": "subject_baseline_z_score",
        "explanation": explanation,
        "source_file": row.get("post_source_file", ""),
        "source_row": row.get("post_source_row", ""),
        "comparison_status": row.get("comparison_status", ""),
    }


def detect_anomalies(input_path: Path, output_path: Path) -> dict[str, Any]:
    """Classify baseline comparisons without training a predictive model."""
    if not input_path.is_file():
        raise FileNotFoundError(f"Baseline comparison file is missing: {input_path}")
    with input_path.open("r", encoding="utf-8-sig", newline="") as stream:
        reader = csv.DictReader(stream)
        missing = REQUIRED_FIELDS - set(reader.fieldnames or [])
        if missing:
            raise ValueError(f"Baseline comparisons are missing required columns: {sorted(missing)}")
        results = [_result(row) for row in reader]
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8", newline="") as stream:
        writer = csv.DictWriter(stream, fieldnames=OUTPUT_FIELDS)
        writer.writeheader()
        writer.writerows(results)
    classifications = Counter(result["anomaly_classification"] for result in results)
    return {
        "input_file": input_path.name,
        "output_file": output_path.name,
        "input_rows": len(results),
        "output_rows": len(results),
        "classification_counts": dict(sorted(classifications.items())),
        "subjects": sorted({result["subject_id"] for result in results if result["subject_id"]}),
        "panels": sorted({result["panel"] for result in results if result["panel"]}),
        "assays": sorted({result["assay"] for result in results if result["assay"]}),
        "method": {
            "name": "subject_baseline_z_score",
            "threshold": Z_SCORE_THRESHOLD,
            "threshold_interpretation": "Exploratory descriptive heuristic only; not a clinical or NASA-validated cutoff.",
            "isolation_forest": {
                "implemented": False,
                "reason": "The dataset provides only up to three baseline observations per subject/biomarker group, so a separate per-group Isolation Forest would not have meaningful training support.",
            },
        },
        "limitations": [
            "OSD-575 contains four Inspiration4 subjects and is exploratory research data.",
            "Results are not diagnoses, predictions, emergency alerts or clinically validated findings.",
            "Rules-based health assessment remains separate and is not controlled by these classifications.",
            "No missing value was classified as normal, and no data was imputed.",
        ],
    }


def write_report(report: dict[str, Any], path: Path) -> None:
    path.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
