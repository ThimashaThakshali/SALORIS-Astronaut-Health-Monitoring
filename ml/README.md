# SALORIS ML data workspace

This workspace contains the Stage 1 acquisition and inspection artifacts for
NASA OSDR study OSD-575. It is intentionally separate from the Spring Boot
backend and React frontend.

Stage 1 does not train models, create a service, or make clinical claims.
Original NASA downloads are kept under `data/raw/OSD-575/`; generated
manifests and inspection reports are stored under `reports/`.

The source study is the SpaceX Inspiration4 Blood Serum Metabolic Panel and
Immune/Cardiac Cytokine Arrays study. The official OSDR file API identifies the
downloaded CMP and multiplex files and their panel classifications.
