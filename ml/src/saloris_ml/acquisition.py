"""Official NASA OSDR metadata acquisition helpers."""

from __future__ import annotations

import json
from datetime import date
from pathlib import Path
from urllib.parse import quote
from urllib.request import Request, urlopen

API_URL = "https://osdr.nasa.gov/osdr/data/osd/files/575"
SOURCE_PAGE = "https://osdr.nasa.gov/bio/repo/data/studies/OSD-575"
DOWNLOAD_BASE = "https://osdr.nasa.gov/geode-py/ws/studies/OSD-575/download?source=datamanager&file="


def fetch_file_metadata(url: str = API_URL) -> dict:
    request = Request(url, headers={"Accept": "application/json", "User-Agent": "SALORIS-OSDR-inspection/1.0"})
    try:
        with urlopen(request, timeout=30) as response:
            payload = json.load(response)
    except OSError as error:
        raise RuntimeError(f"NASA OSDR metadata request failed: {error}") from error
    if not payload.get("success") or "OSD-575" not in payload.get("studies", {}):
        raise ValueError("NASA OSDR response did not contain OSD-575 metadata")
    return payload


def build_manifest(payload: dict, raw_dir: Path, checksums: dict[str, str], sizes: dict[str, int]) -> dict:
    study = payload["studies"]["OSD-575"]
    files = []
    for item in study["study_files"]:
        name = item["file_name"]
        files.append({
            "file_name": name,
            "download_url": DOWNLOAD_BASE + quote(name),
            "retrieved_on": date.today().isoformat(),
            "license": "CC0-1.0 (as stated on the OSDR study page)",
            "sha256": checksums.get(name),
            "size_bytes": sizes.get(name, item.get("file_size")),
            "format": Path(name).suffix.lower().lstrip("."),
            "category": item.get("category"),
            "subcategory": item.get("subcategory"),
            "subdirectory": item.get("subdirectory"),
            "description": item.get("category"),
        })
    return {
        "study_accession": "OSD-575",
        "study_title": "SpaceX Inspiration4 Blood Serum Metabolic Panel and Immune/Cardiac Cytokine Arrays (Comprehensive Metabolic Panel and Multiplex)",
        "source_page": SOURCE_PAGE,
        "file_api": API_URL,
        "license": "CC0-1.0 (as stated on the OSDR study page)",
        "files": files,
    }
