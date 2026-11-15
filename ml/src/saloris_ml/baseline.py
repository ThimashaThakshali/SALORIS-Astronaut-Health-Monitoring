"""Descriptive, subject-specific baseline comparisons for OSD-575."""

from __future__ import annotations

import csv
import json
import math
import statistics
from collections import defaultdict
from pathlib import Path
from typing import Any, Iterable

KEY_FIELDS = ("subject_id", "panel", "assay", "biomarker", "unit")
OUTPUT_FIELDS = [
    "subject_id",
    "panel",
    "assay",
    "biomarker",
    "unit",
    "post_sample_id",
    "post_timepoint",
    "post_flight_phase",
    "post_value",
    "post_source_file",
    "post_source_row",
    "baseline_count",
    "baseline_mean",
    "baseline_standard_deviation",
    "baseline_timepoints",
    "baseline_sample_ids",
    "baseline_source_files",
    "absolute_difference",
    "percentage_difference",
    "z_score",
    "comparison_status",
    "comparison_reason",
]


def _number(value: str | None) -> float | None:
    if value is None or value.strip().lower() in {"", "na", "n/a", "null", "nan", "not available"}:
        return None
    try:
        result = float(value)
    except ValueError:
        return None
    return result if math.isfinite(result) else None


def _format(value: float | None) -> str:
    return "" if value is None else format(value, ".12g")


def _key(row: dict[str, str]) -> tuple[str, ...]:
    return tuple(row.get(field, "") for field in KEY_FIELDS)


def _read_observations(path: Path) -> list[dict[str, str]]:
    if not path.is_file():
        raise FileNotFoundError(f"Processed observations file is missing: {path}")
    with path.open("r", encoding="utf-8-sig", newline="") as stream:
        reader = csv.DictReader(stream)
        required = {"subject_id", "panel", "assay", "biomarker", "unit", "timepoint", "flight_phase", "value"}
        missing = required - set(reader.fieldnames or [])
        if missing:
            raise ValueError(f"Processed observations are missing required columns: {sorted(missing)}")
        return list(reader)


def _baseline_groups(rows: Iterable[dict[str, str]]) -> dict[tuple[str, ...], list[dict[str, str]]]:
    groups: dict[tuple[str, ...], list[dict[str, str]]] = defaultdict(list)
    for row in rows:
        if row.get("flight_phase") == "pre-flight" and _number(row.get("value")) is not None:
            groups[_key(row)].append(row)
    return groups


def _comparison(row: dict[str, str], baseline: list[dict[str, str]]) -> dict[str, str]:
    values = [_number(item.get("value")) for item in baseline]
    numeric_values = [value for value in values if value is not None]
    post_value = _number(row.get("value"))
    mean = statistics.fmean(numeric_values) if numeric_values else None
    standard_deviation = statistics.stdev(numeric_values) if len(numeric_values) >= 2 else None
    absolute_difference = post_value - mean if post_value is not None and mean is not None else None
    percentage_difference = (
        absolute_difference / abs(mean) * 100
        if absolute_difference is not None and mean is not None and mean != 0
        else None
    )
    z_score = (
        absolute_difference / standard_deviation
        if absolute_difference is not None and standard_deviation is not None and standard_deviation > 0
        else None
    )

    if post_value is None:
        status = "MISSING_POST_VALUE"
        reason = "The post-flight source value is missing or non-numeric."
    elif not numeric_values:
        status = "INSUFFICIENT_BASELINE"
        reason = "No numeric pre-flight observations exist for this subject, assay, biomarker and unit."
    elif len(numeric_values) < 2:
        status = "INSUFFICIENT_BASELINE"
        reason = "Only one numeric pre-flight observation exists; standard deviation and z-score are unavailable."
    elif standard_deviation == 0:
        status = "BASELINE_ZERO_VARIANCE"
        reason = "Baseline standard deviation is zero; z-score is undefined."
    elif mean == 0:
        status = "BASELINE_ZERO_MEAN"
        reason = "Baseline mean is zero; percentage difference is undefined."
    else:
        status = "COMPARABLE"
        reason = "Descriptive comparison only; this is not statistically or clinically validated."

    return {
        "subject_id": row.get("subject_id", ""),
        "panel": row.get("panel", ""),
        "assay": row.get("assay", ""),
        "biomarker": row.get("biomarker", ""),
        "unit": row.get("unit", ""),
        "post_sample_id": row.get("sample_id", ""),
        "post_timepoint": row.get("timepoint", ""),
        "post_flight_phase": row.get("flight_phase", ""),
        "post_value": _format(post_value),
        "post_source_file": row.get("source_file", ""),
        "post_source_row": row.get("source_row", ""),
        "baseline_count": str(len(numeric_values)),
        "baseline_mean": _format(mean),
        "baseline_standard_deviation": _format(standard_deviation),
        "baseline_timepoints": "|".join(item.get("timepoint", "") for item in baseline),
        "baseline_sample_ids": "|".join(item.get("sample_id", "") for item in baseline),
        "baseline_source_files": "|".join(sorted({item.get("source_file", "") for item in baseline})),
        "absolute_difference": _format(absolute_difference),
        "percentage_difference": _format(percentage_difference),
        "z_score": _format(z_score),
        "comparison_status": status,
        "comparison_reason": reason,
    }


def analyze_baseline(input_path: Path, output_path: Path) -> dict[str, Any]:
    """Write post-flight comparisons against subject-specific pre-flight baselines."""
    rows = _read_observations(input_path)
    groups = _baseline_groups(rows)
    comparisons = [
        _comparison(row, groups.get(_key(row), []))
        for row in rows
        if row.get("flight_phase") == "post-flight"
    ]
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8", newline="") as stream:
        writer = csv.DictWriter(stream, fieldnames=OUTPUT_FIELDS)
        writer.writeheader()
        writer.writerows(comparisons)
    return _report(rows, comparisons, groups, input_path.name, output_path.name)


def _report(
    rows: list[dict[str, str]],
    comparisons: list[dict[str, str]],
    groups: dict[tuple[str, ...], list[dict[str, str]]],
    input_name: str,
    output_name: str,
) -> dict[str, Any]:
    statuses: dict[str, int] = defaultdict(int)
    for row in comparisons:
        statuses[row["comparison_status"]] += 1
    return {
        "input_file": input_name,
        "output_file": output_name,
        "input_rows": len(rows),
        "preflight_numeric_rows": sum(len(group) for group in groups.values()),
        "postflight_rows": len(comparisons),
        "comparison_rows": len(comparisons),
        "subjects": sorted({row.get("subject_id", "") for row in comparisons if row.get("subject_id")}),
        "panels": sorted({row.get("panel", "") for row in comparisons if row.get("panel")}),
        "assays": sorted({row.get("assay", "") for row in comparisons if row.get("assay")}),
        "status_counts": dict(sorted(statuses.items())),
        "baseline_groups": len(groups),
        "method": {
            "baseline_timepoints": ["L-92", "L-44", "L-3"],
            "postflight_timepoints": ["R+1", "R+45", "R+82", "R+194"],
            "standard_deviation": "Sample standard deviation (n-1), only when at least two numeric baseline values exist.",
            "percentage_difference": "absolute difference divided by absolute baseline mean, multiplied by 100; blank when baseline mean is zero.",
        },
        "limitations": [
            "OSD-575 represents four Inspiration4 subjects and is exploratory research data.",
            "Comparisons are descriptive and are not clinical validation, diagnosis, prediction or generalisable astronaut-health accuracy.",
            "No interpolation, imputation, cross-panel unit conversion or emergency decision logic is applied.",
        ],
    }


def write_report(report: dict[str, Any], path: Path) -> None:
    path.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
