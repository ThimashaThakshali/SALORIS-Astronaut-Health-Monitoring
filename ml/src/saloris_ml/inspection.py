"""Deterministic, dependency-free inspection of OSDR tabular files."""

from __future__ import annotations

import csv
import hashlib
import math
import re
import zipfile
from pathlib import Path
from typing import Any
from xml.etree import ElementTree


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _is_missing(value: str | None) -> bool:
    return value is None or value.strip().lower() in {"", "na", "n/a", "null", "nan", "not available"}


def _infer_type(values: list[str]) -> str:
    non_missing = [value for value in values if not _is_missing(value)]
    if not non_missing:
        return "missing"
    try:
        for value in non_missing:
            float(value)
        return "numeric"
    except ValueError:
        return "text"


def parse_csv(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8-sig", newline="") as stream:
        reader = csv.DictReader(stream)
        columns = reader.fieldnames or []
        rows = list(reader)
    return _summarize_rows(path, columns, rows)


def _xlsx_shared_strings(archive: zipfile.ZipFile) -> list[str]:
    try:
        root = ElementTree.fromstring(archive.read("xl/sharedStrings.xml"))
    except KeyError:
        return []
    namespace = {"x": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
    return ["".join(node.itertext()) for node in root.findall("x:si", namespace)]


def parse_xlsx(path: Path) -> dict[str, Any]:
    with zipfile.ZipFile(path) as archive:
        shared_strings = _xlsx_shared_strings(archive)
        sheet = ElementTree.fromstring(archive.read("xl/worksheets/sheet1.xml"))
    namespace = {"x": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
    matrix: list[list[str]] = []
    for row in sheet.findall(".//x:sheetData/x:row", namespace):
        values: dict[int, str] = {}
        for cell in row.findall("x:c", namespace):
            reference = cell.attrib.get("r", "A1")
            column = 0
            for character in re.match(r"[A-Z]+", reference).group():
                column = column * 26 + ord(character) - ord("A") + 1
            column -= 1
            value = cell.find("x:v", namespace)
            text = "" if value is None else value.text or ""
            if cell.attrib.get("t") == "s" and text:
                text = shared_strings[int(text)]
            values[column] = text
        if values:
            matrix.append([values.get(index, "") for index in range(max(values) + 1)])
    if not matrix:
        return _summarize_rows(path, [], [])
    columns = matrix[0]
    rows = [dict(zip(columns, values)) for values in matrix[1:]]
    return _summarize_rows(path, columns, rows)


def _summarize_rows(path: Path, columns: list[str], rows: list[dict[str, str]]) -> dict[str, Any]:
    duplicate_keys = [tuple(row.get(column, "") for column in columns) for row in rows]
    duplicate_count = len(duplicate_keys) - len(set(duplicate_keys))
    missing = {
        column: sum(_is_missing(row.get(column)) for row in rows)
        for column in columns
        if any(_is_missing(row.get(column)) for row in rows)
    }
    data_types = {
        column: _infer_type([row.get(column, "") for row in rows])
        for column in columns
    }
    identifier_columns = [
        column for column in columns
        if any(token in column.lower() for token in ("subject", "sample", "specimen", "id"))
    ]
    timepoint_columns = [
        column for column in columns
        if "timepoint" in column.lower() or "sample name" in column.lower()
    ]
    biomarker_columns = [
        column for column in columns
        if column.lower() in {"analyte", "biomarker", "parameter"} or "concentration" in column.lower()
    ]
    unit_columns = [column for column in columns if "unit" in column.lower()]
    return {
        "file": path.name,
        "rows": len(rows),
        "columns": len(columns),
        "column_names": columns,
        "identifier_columns": identifier_columns,
        "timepoint_columns": timepoint_columns,
        "biomarker_columns": biomarker_columns,
        "unit_columns": unit_columns,
        "missing_values": missing,
        "duplicate_records": duplicate_count,
        "data_types": data_types,
        "numeric_cell_count": sum(
            1 for row in rows for value in row.values()
            if not _is_missing(value) and _is_number(value)
        ),
    }


def _is_number(value: str) -> bool:
    try:
        return math.isfinite(float(value))
    except ValueError:
        return False


def inspect_file(path: Path) -> dict[str, Any]:
    if not path.is_file():
        raise FileNotFoundError(path)
    if path.suffix.lower() == ".csv":
        return parse_csv(path)
    if path.suffix.lower() == ".xlsx":
        return parse_xlsx(path)
    raise ValueError(f"Unsupported tabular format: {path.suffix}")
