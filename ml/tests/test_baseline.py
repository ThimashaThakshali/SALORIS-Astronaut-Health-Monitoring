import csv
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parents[1] / "src"))

from saloris_ml.baseline import analyze_baseline


FIELDS = [
    "representation", "panel", "assay", "source_file", "source_row",
    "subject_id", "sample_id", "timepoint", "flight_phase", "biomarker",
    "value", "unit", "reference_min", "reference_max", "missing_reason",
]


def row(subject, panel, biomarker, value, timepoint, phase, unit="unit"):
    return {
        "representation": "submitted",
        "panel": panel,
        "assay": panel,
        "source_file": f"{panel}.csv",
        "source_row": "2",
        "subject_id": subject,
        "sample_id": f"{subject}_serum_{timepoint}",
        "timepoint": timepoint,
        "flight_phase": phase,
        "biomarker": biomarker,
        "value": value,
        "unit": unit,
        "reference_min": "",
        "reference_max": "",
        "missing_reason": "",
    }


def write_rows(path, rows):
    with path.open("w", encoding="utf-8", newline="") as stream:
        writer = csv.DictWriter(stream, fieldnames=FIELDS)
        writer.writeheader()
        writer.writerows(rows)


class BaselineTests(unittest.TestCase):
    def run_analysis(self, rows):
        directory = tempfile.TemporaryDirectory()
        input_path = Path(directory.name) / "observations.csv"
        output_path = Path(directory.name) / "baseline.csv"
        write_rows(input_path, rows)
        report = analyze_baseline(input_path, output_path)
        with output_path.open(encoding="utf-8", newline="") as stream:
            return directory, report, list(csv.DictReader(stream))

    def test_baseline_mean_difference_percentage_and_z_score(self):
        directory, _, results = self.run_analysis([
            row("C001", "CMP", "GLUCOSE", "10", "L-92", "pre-flight"),
            row("C001", "CMP", "GLUCOSE", "14", "L-44", "pre-flight"),
            row("C001", "CMP", "GLUCOSE", "12", "L-3", "pre-flight"),
            row("C001", "CMP", "GLUCOSE", "16", "R+1", "post-flight"),
        ])
        self.addCleanup(directory.cleanup)
        result = results[0]
        self.assertEqual(result["baseline_count"], "3")
        self.assertEqual(float(result["baseline_mean"]), 12)
        self.assertAlmostEqual(float(result["baseline_standard_deviation"]), 2)
        self.assertEqual(float(result["absolute_difference"]), 4)
        self.assertAlmostEqual(float(result["percentage_difference"]), 33.3333333333)
        self.assertAlmostEqual(float(result["z_score"]), 2)
        self.assertEqual(result["comparison_status"], "COMPARABLE")

    def test_missing_post_measurement_is_retained(self):
        directory, _, results = self.run_analysis([
            row("C001", "CMP", "GLUCOSE", "10", "L-92", "pre-flight"),
            row("C001", "CMP", "GLUCOSE", "11", "L-44", "pre-flight"),
            row("C001", "CMP", "GLUCOSE", "", "R+1", "post-flight"),
        ])
        self.addCleanup(directory.cleanup)
        self.assertEqual(results[0]["comparison_status"], "MISSING_POST_VALUE")
        self.assertEqual(results[0]["post_value"], "")

    def test_zero_mean_and_zero_variance_are_explicit(self):
        directory, _, results = self.run_analysis([
            row("C001", "CMP", "ZERO", "0", "L-92", "pre-flight"),
            row("C001", "CMP", "ZERO", "0", "L-44", "pre-flight"),
            row("C001", "CMP", "ZERO", "2", "R+1", "post-flight"),
        ])
        self.addCleanup(directory.cleanup)
        self.assertEqual(results[0]["comparison_status"], "BASELINE_ZERO_VARIANCE")
        self.assertEqual(results[0]["percentage_difference"], "")
        self.assertEqual(results[0]["z_score"], "")

    def test_zero_mean_with_variance_keeps_z_score_but_not_percentage(self):
        directory, _, results = self.run_analysis([
            row("C001", "CMP", "ZERO_MEAN", "-1", "L-92", "pre-flight"),
            row("C001", "CMP", "ZERO_MEAN", "1", "L-44", "pre-flight"),
            row("C001", "CMP", "ZERO_MEAN", "2", "R+1", "post-flight"),
        ])
        self.addCleanup(directory.cleanup)
        self.assertEqual(results[0]["comparison_status"], "BASELINE_ZERO_MEAN")
        self.assertEqual(results[0]["percentage_difference"], "")
        self.assertNotEqual(results[0]["z_score"], "")

    def test_insufficient_baseline_observations(self):
        directory, _, results = self.run_analysis([
            row("C001", "CMP", "GLUCOSE", "10", "L-3", "pre-flight"),
            row("C001", "CMP", "GLUCOSE", "12", "R+1", "post-flight"),
        ])
        self.addCleanup(directory.cleanup)
        self.assertEqual(results[0]["comparison_status"], "INSUFFICIENT_BASELINE")
        self.assertEqual(results[0]["baseline_count"], "1")

    def test_subject_and_panel_are_not_combined(self):
        directory, _, results = self.run_analysis([
            row("C001", "CMP", "GLUCOSE", "10", "L-92", "pre-flight"),
            row("C001", "CMP", "GLUCOSE", "12", "R+1", "post-flight"),
            row("C002", "CMP", "GLUCOSE", "100", "L-92", "pre-flight"),
            row("C002", "CMP", "GLUCOSE", "120", "R+1", "post-flight"),
            row("C001", "HD71", "GLUCOSE", "1000", "L-92", "pre-flight"),
            row("C001", "HD71", "GLUCOSE", "1100", "R+1", "post-flight"),
        ])
        self.addCleanup(directory.cleanup)
        self.assertEqual(len(results), 3)
        self.assertEqual(
            {(result["subject_id"], result["panel"]) for result in results},
            {("C001", "CMP"), ("C002", "CMP"), ("C001", "HD71")},
        )
        self.assertEqual(results[0]["baseline_count"], "1")


if __name__ == "__main__":
    unittest.main()
