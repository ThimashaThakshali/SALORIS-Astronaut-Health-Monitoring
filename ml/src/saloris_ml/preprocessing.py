"""OSD-575 representation-preserving preprocessing utilities."""

from __future__ import annotations

import csv
import re
from pathlib import Path
from typing import Any, Iterable

from .inspection import parse_xlsx

MISSING = {"", "na", "n/a", "null", "nan", "not available"}
OUTPUT_FIELDS = [
    "representation",
    "panel",
    "assay",
    "source_file",
    "source_row",
    "subject_id",
    "sample_id",
    "timepoint",
    "flight_phase",
    "biomarker",
    "value",
    "unit",
    "reference_min",
    "reference_max",
    "missing_reason",
]

SUBMITTED_FILES = {
    "LSDS-8_Comprehensive_Metabolic_Panel_CMP.upload_SUBMITTED.csv": ("CMP", "CMP"),
    "LSDS-8_Multiplex_serum.cardiovascular.EvePanel_SUBMITTED.csv": ("cardiovascular", "HDCVD9"),
    "LSDS-8_Multiplex_serum.immune.EvePanel_SUBMITTED.csv": ("immune", "HD71"),
    "LSDS-8_Multiplex_serum.immune.AlamarPanel_SUBMITTED.xlsx": ("immune", "AlamarPanel"),
}
TRANSFORMED_FILES = {
    "LSDS-8_Comprehensive_Metabolic_Panel_CMP_TRANSFORMED.csv": ("CMP", "CMP"),
    "LSDS-8_Multiplex_serum_cardiovascular_EvePanel_TRANSFORMED.csv": ("cardiovascular", "HDCVD9"),
    "LSDS-8_Multiplex_serum_immune_EvePanel_TRANSFORMED.csv": ("immune", "HD71"),
    "LSDS-8_Multiplex_serum.immune.AlamarPanel_TRANSFORMED.csv": ("immune", "AlamarPanel"),
}


def _missing(value: str | None) -> bool:
    return value is None or value.strip().lower() in MISSING


def _phase(timepoint: str) -> str:
    if timepoint.startswith("L-"):
        return "pre-flight"
    if timepoint.startswith("R+"):
        return "post-flight"
    return ""


def _sample_parts(sample: str) -> tuple[str, str, str]:
    match = re.fullmatch(r"(?P<subject>C\d+)_serum_(?P<timepoint>[LR][+-]\d+)", sample)
    if not match:
        return "", sample, ""
    subject = match.group("subject")
    timepoint = match.group("timepoint")
    return subject, sample, timepoint


def _number_or_blank(value: str) -> str:
    return "" if _missing(value) else value.strip()


def _row(
    *,
    representation: str,
    panel: str,
    assay: str,
    source_file: str,
    source_row: int,
    subject_id: str,
    sample_id: str,
    timepoint: str,
    biomarker: str,
    value: str,
    unit: str,
    reference_min: str = "",
    reference_max: str = "",
    missing_reason: str = "",
) -> dict[str, str]:
    clean_value = _number_or_blank(value)
    if not clean_value and not missing_reason:
        missing_reason = "source value is missing or marked unavailable"
    return {
        "representation": representation,
        "panel": panel,
        "assay": assay,
        "source_file": source_file,
        "source_row": str(source_row),
        "subject_id": subject_id,
        "sample_id": sample_id,
        "timepoint": timepoint,
        "flight_phase": _phase(timepoint),
        "biomarker": biomarker,
        "value": clean_value,
        "unit": unit,
        "reference_min": _number_or_blank(reference_min),
        "reference_max": _number_or_blank(reference_max),
        "missing_reason": missing_reason,
    }


def _read_csv(path: Path) -> list[dict[str, str]]:
    with path.open("r", encoding="utf-8-sig", newline="") as stream:
        return list(csv.DictReader(stream))


def _submitted_rows(path: Path, panel: str, assay: str) -> list[dict[str, str]]:
    rows = parse_xlsx(path)["rows_data"] if path.suffix.lower() == ".xlsx" else _read_csv(path)
    output: list[dict[str, str]] = []
    for source_row, source in enumerate(rows, start=2):
        if "ANALYTE" in source:
            subject = source.get("SUBJECT_ID", "")
            timepoint = source.get("timepoint", "")
            output.append(_row(
                representation="submitted",
                panel=panel,
                assay=assay,
                source_file=path.name,
                source_row=source_row,
                subject_id=subject,
                sample_id=f"{subject}_serum_{timepoint}" if subject and timepoint else "",
                timepoint=timepoint,
                biomarker=source.get("ANALYTE", ""),
                value=source.get("VALUE", ""),
                unit=source.get("UNITS", ""),
                reference_min=source.get("RANGE_MIN", ""),
                reference_max=source.get("RANGE_MAX", ""),
            ))
        else:
            subject = source.get("ID", "")
            timepoint = source.get("Timepoint", "")
            output.append(_row(
                representation="submitted",
                panel=panel,
                assay=assay,
                source_file=path.name,
                source_row=source_row,
                subject_id=subject,
                sample_id=f"{subject}_serum_{timepoint}" if subject and timepoint else "",
                timepoint=timepoint,
                biomarker=source.get("Analyte", ""),
                value=source.get("Concentration", ""),
                unit=source.get("Unit", ""),
            ))
    return output


def _transformed_rows(path: Path, panel: str, assay: str) -> list[dict[str, str]]:
    rows = _read_csv(path)
    output: list[dict[str, str]] = []
    for source_row, source in enumerate(rows, start=2):
        sample = source.get("Sample Name", "") or source.get("Sample ID", "")
        subject, sample_id, timepoint = _sample_parts(sample)
        for column, value in source.items():
            lower = column.lower()
            if column == "Sample Name" or "_percent" in lower or "_range_" in lower:
                continue
            if "_value" not in lower and "_concentration_" not in lower:
                continue
            if "_value" in lower:
                biomarker, unit = column.rsplit("_value", 1)[0], column.rsplit("_value", 1)[1]
            else:
                biomarker, unit = column.split("_concentration_", 1)
                unit = unit
            reference_min = source.get(f"{biomarker}_range_min{unit}", "")
            reference_max = source.get(f"{biomarker}_range_max{unit}", "")
            output.append(_row(
                representation="transformed",
                panel=panel,
                assay=assay,
                source_file=path.name,
                source_row=source_row,
                subject_id=subject,
                sample_id=sample_id,
                timepoint=timepoint,
                biomarker=biomarker,
                value=value,
                unit=unit.lstrip("_"),
                reference_min=reference_min,
                reference_max=reference_max,
            ))
    return output


def preprocess_osd575(raw_dir: Path, output_dir: Path) -> dict[str, Any]:
    output_dir.mkdir(parents=True, exist_ok=True)
    submitted: list[dict[str, str]] = []
    transformed: list[dict[str, str]] = []
    for name, (panel, assay) in SUBMITTED_FILES.items():
        path = raw_dir / name
        if not path.is_file():
            raise FileNotFoundError(f"Required submitted OSD-575 file is missing: {path}")
        submitted.extend(_submitted_rows(path, panel, assay))
    for name, (panel, assay) in TRANSFORMED_FILES.items():
        path = raw_dir / name
        if not path.is_file():
            raise FileNotFoundError(f"Required transformed OSD-575 file is missing: {path}")
        transformed.extend(_transformed_rows(path, panel, assay))
    _write_csv(output_dir / "observations_submitted.csv", submitted)
    _write_csv(output_dir / "observations_transformed.csv", transformed)
    return {
        "inputs": list(SUBMITTED_FILES) + list(TRANSFORMED_FILES),
        "outputs": {
            "observations_submitted.csv": len(submitted),
            "observations_transformed.csv": len(transformed),
        },
        "submitted": _summary(submitted),
        "transformed": _summary(transformed),
        "downstream_analysis_representation": "submitted",
        "decision": "Submitted files are the analysis representation because they retain explicit assay fields, units and source rows. Transformed files remain separate for audit and comparison and must not be concatenated with submitted observations.",
        "limitations": [
            "Only four OSD-575 subjects are present.",
            "Transformed units are preserved from NASA column names and are not harmonized across panels.",
            "No missing values were imputed and no model was trained.",
        ],
    }


def _write_csv(path: Path, rows: Iterable[dict[str, str]]) -> None:
    with path.open("w", encoding="utf-8", newline="") as stream:
        writer = csv.DictWriter(stream, fieldnames=OUTPUT_FIELDS)
        writer.writeheader()
        writer.writerows(rows)


def _summary(rows: list[dict[str, str]]) -> dict[str, Any]:
    return {
        "rows": len(rows),
        "missing_values": sum(not row["value"] for row in rows),
        "subjects": sorted({row["subject_id"] for row in rows if row["subject_id"]}),
        "timepoints": sorted({row["timepoint"] for row in rows if row["timepoint"]}),
        "panels": sorted({row["assay"] for row in rows}),
        "biomarkers": sorted({row["biomarker"] for row in rows if row["biomarker"]}),
        "duplicate_keys": len(rows) - len({
            tuple(row[field] for field in (
                "representation", "source_file", "subject_id",
                "sample_id", "biomarker", "value",
            ))
            for row in rows
        }),
    }
