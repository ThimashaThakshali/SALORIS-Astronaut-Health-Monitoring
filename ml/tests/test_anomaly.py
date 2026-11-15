import csv
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parents[1] / "src"))

from saloris_ml.anomaly import detect_anomalies


FIELDS = [
    "subject_id", "panel", "assay", "biomarker", "unit",
    "post_sample_id", "post_timepoint", "post_flight_phase", "post_value",
    "post_source_file", "post_source_row", "baseline_count", "baseline_mean",
    "baseline_standard_deviation", "baseline_timepoints", "baseline_sample_ids",
    "baseline_source_files", "absolute_difference", "percentage_difference",
    "z_score", "comparison_status", "comparison_reason",
]


def row(subject="C001", panel="CMP", biomarker="GLUCOSE", value="10", mean="10", sd="1", z="0", status="COMPARABLE"):
    return {
        "subject_id": subject,
        "panel": panel,
        "assay": panel,
        "biomarker": biomarker,
        "unit": "unit",
        "post_sample_id": f"{subject}_serum_R+1",
        "post_timepoint": "R+1",
        "post_flight_phase": "post-flight",
        "post_value": value,
        "post_source_file": "source.csv",
        "post_source_row": "2",
        "baseline_count": "3",
        "baseline_mean": mean,
        "baseline_standard_deviation": sd,
        "baseline_timepoints": "L-92|L-44|L-3",
        "baseline_sample_ids": "",
        "baseline_source_files": "source.csv",
        "absolute_difference": "",
        "percentage_difference": "",
        "z_score": z,
        "comparison_status": status,
        "comparison_reason": "",
    }


def write_rows(path, rows):
    with path.open("w", encoding="utf-8", newline="") as stream:
        writer = csv.DictWriter(stream, fieldnames=FIELDS)
        writer.writeheader()
        writer.writerows(rows)


class AnomalyTests(unittest.TestCase):
    def run_detection(self, rows):
        directory = tempfile.TemporaryDirectory()
        input_path = Path(directory.name) / "baseline.csv"
        output_path = Path(directory.name) / "anomalies.csv"
        write_rows(input_path, rows)
        report = detect_anomalies(input_path, output_path)
        with output_path.open(encoding="utf-8", newline="") as stream:
            return directory, report, list(csv.DictReader(stream))

    def test_within_variation_and_unusual_deviation(self):
        directory, report, results = self.run_detection([
            row(z="1.5"),
            row(biomarker="CREATININE", value="15", z="2.1"),
        ])
        self.addCleanup(directory.cleanup)
        self.assertEqual(results[0]["anomaly_classification"], "Within baseline variation")
        self.assertEqual(results[1]["anomaly_classification"], "Unusual deviation")
        self.assertEqual(report["classification_counts"]["Unusual deviation"], 1)

    def test_missing_and_insufficient_values_are_not_normal(self):
        directory, _, results = self.run_detection([
            row(value="", z="", status="MISSING_POST_VALUE"),
            row(value="12", mean="", sd="", z="", status="INSUFFICIENT_BASELINE"),
        ])
        self.addCleanup(directory.cleanup)
        self.assertEqual(results[0]["anomaly_classification"], "Missing measurement")
        self.assertEqual(results[1]["anomaly_classification"], "Insufficient data")

    def test_zero_standard_deviation(self):
        directory, _, results = self.run_detection([
            row(value="10", mean="10", sd="0", z="", status="BASELINE_ZERO_VARIANCE"),
            row(value="11", mean="10", sd="0", z="", status="BASELINE_ZERO_VARIANCE"),
        ])
        self.addCleanup(directory.cleanup)
        self.assertEqual(results[0]["anomaly_classification"], "Within baseline variation")
        self.assertEqual(results[1]["anomaly_classification"], "Unusual deviation")

    def test_subject_and_panel_fields_are_preserved(self):
        directory, _, results = self.run_detection([
            row(subject="C001", panel="CMP"),
            row(subject="C002", panel="HD71"),
        ])
        self.addCleanup(directory.cleanup)
        self.assertEqual(
            {(result["subject_id"], result["panel"], result["assay"]) for result in results},
            {("C001", "CMP", "CMP"), ("C002", "HD71", "HD71")},
        )

    def test_missing_input_and_schema_are_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            with self.assertRaises(FileNotFoundError):
                detect_anomalies(Path(directory) / "missing.csv", Path(directory) / "out.csv")
            bad = Path(directory) / "bad.csv"
            bad.write_text("subject_id\nC001\n", encoding="utf-8")
            with self.assertRaises(ValueError):
                detect_anomalies(bad, Path(directory) / "out.csv")


if __name__ == "__main__":
    unittest.main()
