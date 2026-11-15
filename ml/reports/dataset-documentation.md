# OSD-575 Stage 1 dataset documentation

## Provenance

The files were retrieved on 2026-11-15 from the official NASA Open Science
Data Repository (OSDR) file API for study `OSD-575`:

- Study page: <https://osdr.nasa.gov/bio/repo/data/studies/OSD-575>
- File API: <https://osdr.nasa.gov/osdr/data/osd/files/575>
- Study title: *SpaceX Inspiration4 Blood Serum Metabolic Panel and
  Immune/Cardiac Cytokine Arrays (Comprehensive Metabolic Panel and
  Multiplex)*
- Licence: CC0-1.0, as stated on the NASA study page

The original files are preserved unchanged in `data/raw/OSD-575/`.
`source-manifest.json` records each official download URL, file size, format,
retrieval date and SHA-256 checksum.

## Files observed

The NASA API returned nine public files: one ISA metadata ZIP and eight
tabular result files. The inspection report describes every column, inferred
data type, missing value count and exact duplicate count.

| NASA panel/file group | Actual rows | Columns | Observed identifiers and timepoints |
|---|---:|---:|---|
| CMP submitted CSV | 531 | 9 | `SUBJECT_ID` (`C001`-`C004`), `timepoint` (`L-3`, `L-44`, `L-92`, `R+1`, `R+45`, `R+82`, `R+194`) |
| CMP transformed CSV | 28 | 58 | `Sample Name` |
| HDCVD9 cardiovascular submitted CSV | 252 | 8 | `ID` (`C001`-`C004`), `Timepoint`, `Timepoint2` |
| HD71 immune submitted CSV | 1,988 | 8 | `ID` (`C001`-`C004`), `Timepoint`, `Timepoint2` |
| Alamar immune submitted XLSX | 5,481 | 8 | Parsed from the first worksheet; assay-specific identifiers are retained in the original file |
| Three transformed multiplex CSVs | 28, 19, 143 and 407 columns | | `Sample Name` where supplied |

The submitted CMP contains 19 analytes, including glucose, albumin,
electrolytes, liver markers, renal markers and eGFR values. The HDCVD9 file
contains nine analytes and the HD71 file contains 71 analytes. Units are
assay-specific; observed examples include `mg/dL`, `g/dL`, `U/L`, `mmol/L`,
`mL/min/1.73m2`, `ng/ml` and `pg/ml`. No assay files were combined.

## Data quality observations

- The CMP submitted file contains missing `VALUE` and `RANGE_MAX` cells.
- Other missing-value counts and inferred types are recorded in
  `inspection-report.json`; no missing values were silently imputed.
- No exact duplicate rows were found in the eight inspected tabular files.
- The source preserves four subject identifiers and pre-flight/post-flight
  timepoint information. The files are not treated as interchangeable because
  their panels and units differ.
- The transformed files are retained as separate NASA-provided representations,
  not regenerated or merged with submitted files.
- The API response lists CMP, HDCVD9, HD71 and Alamar multiplex data. No file
  labelled `NULISA-seq` was returned for OSD-575, so NULISA-seq is unavailable
  in this acquisition and has not been fabricated.

## Limitations

OSD-575 is a small Inspiration4 study involving four crew members and a short
mission. It is not representative of all astronauts or long-duration
missions. Stage 1 performs acquisition and structural inspection only. No
training, baseline construction, anomaly classification, clinical inference,
preprocessing transformation or service endpoint has been added.
