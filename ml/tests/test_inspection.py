import csv
import json
import sys
import zipfile
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).parents[1] / "src"))

from saloris_ml.acquisition import build_manifest, fetch_file_metadata
from saloris_ml.inspection import inspect_file, sha256_file


import tempfile
import unittest


class InspectionTests(unittest.TestCase):
    def test_checksum_is_deterministic(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "sample.txt"
            path.write_bytes(b"saloris")
            self.assertEqual(
                sha256_file(path),
                "f0e3143da6e9c70c0644900cdd7801010804cee81b8eaa2de7ca91b4fd897953",
            )

    def test_csv_inspection_preserves_required_metadata(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "sample.csv"
            with path.open("w", newline="", encoding="utf-8") as stream:
                writer = csv.writer(stream)
                writer.writerow(["ANALYTE", "VALUE", "UNITS", "SUBJECT_ID", "timepoint"])
                writer.writerow(["GLUCOSE", "83", "mg/dL", "C001", "L-92"])
                writer.writerow(["GLUCOSE", "", "mg/dL", "C001", "L-92"])
                writer.writerow(["GLUCOSE", "83", "mg/dL", "C001", "L-92"])
            report = inspect_file(path)
            self.assertEqual(report["rows"], 3)
            self.assertEqual(report["identifier_columns"], ["SUBJECT_ID"])
            self.assertEqual(report["timepoint_columns"], ["timepoint"])
            self.assertEqual(report["missing_values"]["VALUE"], 1)
            self.assertEqual(report["duplicate_records"], 1)

    def test_missing_file_is_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            with self.assertRaises(FileNotFoundError):
                inspect_file(Path(directory) / "missing.csv")

    def test_unsupported_file_is_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "sample.txt"
            path.write_text("x", encoding="utf-8")
            with self.assertRaisesRegex(ValueError, "Unsupported"):
                inspect_file(path)

    def test_api_response_validation(self):
        response = json.dumps({"success": True, "studies": {"OSD-575": {"study_files": []}}}).encode()

        class FakeResponse:
            def __enter__(self):
                from io import BytesIO
                return BytesIO(response)

            def __exit__(self, *_):
                return False

        with patch("saloris_ml.acquisition.urlopen", return_value=FakeResponse()):
            self.assertTrue(fetch_file_metadata()["success"])

    def test_api_response_without_study_is_rejected(self):
        response = json.dumps({"success": True, "studies": {}}).encode()

        class FakeResponse:
            def __enter__(self):
                from io import BytesIO
                return BytesIO(response)

            def __exit__(self, *_):
                return False

        with patch("saloris_ml.acquisition.urlopen", return_value=FakeResponse()):
            with self.assertRaises(ValueError):
                fetch_file_metadata()

    def test_api_download_failure_is_reported(self):
        with patch("saloris_ml.acquisition.urlopen", side_effect=OSError("offline")):
            with self.assertRaisesRegex(RuntimeError, "metadata request failed"):
                fetch_file_metadata()

    def test_manifest_preserves_file_metadata(self):
        payload = {"studies": {"OSD-575": {"study_files": [
            {"file_name": "cmp.csv", "file_size": 3, "category": "Comprehensive Metabolic Panel"}
        ]}}}
        manifest = build_manifest(payload, Path("."), {"cmp.csv": "abc"}, {"cmp.csv": 3})
        self.assertEqual(manifest["study_accession"], "OSD-575")
        self.assertEqual(manifest["files"][0]["sha256"], "abc")
        self.assertEqual(manifest["files"][0]["category"], "Comprehensive Metabolic Panel")


if __name__ == "__main__":
    unittest.main()
