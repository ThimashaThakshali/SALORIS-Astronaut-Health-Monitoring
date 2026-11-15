import csv
import sys
import tempfile
import unittest
from unittest.mock import patch
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parents[1] / "src"))

from saloris_ml.preprocessing import preprocess_osd575


class PreprocessingTests(unittest.TestCase):
    def test_missing_value_and_metadata_are_preserved(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            raw = root / "raw"
            processed = root / "processed"
            raw.mkdir()
            for name in (
                "LSDS-8_Comprehensive_Metabolic_Panel_CMP.upload_SUBMITTED.csv",
                "LSDS-8_Multiplex_serum.cardiovascular.EvePanel_SUBMITTED.csv",
                "LSDS-8_Multiplex_serum.immune.EvePanel_SUBMITTED.csv",
            ):
                if "CMP" in name:
                    content = (
                        "ANALYTE,VALUE,RANGE_MIN,RANGE_MAX,UNITS,TEST_TYPE,SUBJECT_ID,SEX,timepoint\n"
                        "GLUCOSE,,65,99,mg/dL,CMP,C001,M,L-92\n"
                    )
                else:
                    content = (
                        "Analyte,Concentration,Timepoint,ID,Unit,Timepoint2,Type,Percent\n"
                        "Marker,1.2,L-92,C001,ng/ml,Preflight,Panel,50\n"
                    )
                (raw / name).write_text(content, encoding="utf-8")
            (raw / "LSDS-8_Multiplex_serum.immune.AlamarPanel_SUBMITTED.xlsx").write_bytes(b"fixture")
            for name in (
                "LSDS-8_Comprehensive_Metabolic_Panel_CMP_TRANSFORMED.csv",
                "LSDS-8_Multiplex_serum_cardiovascular_EvePanel_TRANSFORMED.csv",
                "LSDS-8_Multiplex_serum_immune_EvePanel_TRANSFORMED.csv",
                "LSDS-8_Multiplex_serum.immune.AlamarPanel_TRANSFORMED.csv",
            ):
                (raw / name).write_text(
                    "Sample Name,marker_value_unit\nC001_serum_L-92,1\n",
                    encoding="utf-8",
                )
            with patch(
                "saloris_ml.preprocessing.parse_xlsx",
                return_value={"rows_data": [{
                    "Analyte": "Activin A",
                    "Concentration": "",
                    "Timepoint": "L-92",
                    "ID": "C001",
                    "Unit": "NPQ",
                }]},
            ):
                report = preprocess_osd575(raw, processed)
            self.assertEqual(report["submitted"]["missing_values"], 2)

    def test_real_dataset_separates_representations_and_extracts_timepoints(self):
        root = Path(__file__).parents[1]
        raw = root / "data" / "raw" / "OSD-575"
        with tempfile.TemporaryDirectory() as directory:
            report = preprocess_osd575(raw, Path(directory))
            self.assertEqual(report["downstream_analysis_representation"], "submitted")
            self.assertGreater(report["outputs"]["observations_submitted.csv"], 0)
            self.assertGreater(report["outputs"]["observations_transformed.csv"], 0)
            self.assertIn("C001", report["submitted"]["subjects"])
            self.assertIn("L-92", report["submitted"]["timepoints"])
            submitted = list(_read(Path(directory) / "observations_submitted.csv"))
            transformed = list(_read(Path(directory) / "observations_transformed.csv"))
            self.assertIn("pre-flight", {row["flight_phase"] for row in submitted})
            self.assertIn("post-flight", {row["flight_phase"] for row in submitted})
            self.assertTrue(all(row["representation"] == "submitted" for row in submitted))
            self.assertTrue(all(row["representation"] == "transformed" for row in transformed))
            self.assertTrue(any(row["biomarker"] == "albumin" for row in transformed))

    def test_missing_required_input_is_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            with self.assertRaises(FileNotFoundError):
                preprocess_osd575(Path(directory), Path(directory) / "processed")


def _read(path):
    with path.open(encoding="utf-8", newline="") as stream:
        return list(csv.DictReader(stream))


if __name__ == "__main__":
    unittest.main()
