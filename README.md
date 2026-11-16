# SALORIS
### Human Resilience Beyond the Horizon.

**Astronaut Health Monitoring and Emergency Assistance System**

SALORIS is an astronaut health-monitoring and decision-support prototype developed for the 2026 NASA Space Apps Challenge. It aims to support astronaut health awareness during space missions by bringing together health check-ins, interactive anatomy education, spaceflight health research, health data analysis and emergency response guidance.

## The Challenge

Long-duration space missions expose astronauts to health risks associated with microgravity, radiation, isolation and confinement, distance from Earth, and hostile spacecraft environments.

SALORIS addresses these challenges by providing an integrated platform where astronauts can record health indicators, explore spaceflight-related health risks, review health information and access emergency guidance.

## Key Features

### 1. Mission Overview
- Central dashboard for astronaut health information.
- Health indicator summaries and visual trends.
- Navigation to health monitoring and other platform features.
- Clearly identified demonstration and simulated data.

### 2. Health Check-in
- Structured health check-in forms.
- Recording of vital indicators, including heart rate, blood pressure, blood glucose, temperature and oxygen saturation.
- Sleep, mood, stress, fatigue and symptom reporting.
- Input validation and backend integration.

### 3. Interactive Body Explorer
- Interactive exploration of human body systems.
- Explanations of body functions and spaceflight-related health considerations.
- Connections between body systems, health risks and the five hazards of human spaceflight.
- Relevant health indicators, monitoring considerations and preventive guidance.

### 4. Research Environment
- Spaceflight health research information.
- Educational resources about the five hazards of human spaceflight.
- NASA research references and relevant health considerations.

### 5. Emergency Assistance
- Structured emergency information and response guidance.
- Reference instructions for reviewing potential health concerns.
- Emergency event reporting and supporting workflows.

### 6. Experimental Data Analysis

SALORIS includes a Python-based research workflow using NASA's Inspiration4 OSD-575 dataset.

The workflow includes:
- Dataset acquisition and inspection.
- Data preprocessing while preserving source representations and metadata.
- Individual astronaut baseline comparisons.
- Experimental anomaly analysis using baseline deviations.

The anomaly analysis is exploratory and is not a clinically validated prediction system.

## NASA Data and Research

**Primary dataset:** NASA Open Science Data Repository – SpaceX Inspiration4 OSD-575.

Dataset: https://osdr.nasa.gov/bio/repo/data/studies/OSD-575

The dataset provides spaceflight research measurements used for data inspection, preprocessing and exploratory individual-baseline analysis.

The project also references NASA Human Research Program resources to understand the health risks and hazards associated with human spaceflight.

## Technology Stack

| Component | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite |
| Package management | pnpm, Corepack |
| Backend | Java 21, Spring Boot |
| Database | PostgreSQL |
| Database migrations | Flyway |
| Data analysis | Python |
| Anomaly analysis | Python-based experimental analysis |
| API communication | REST APIs |

## Project Structure

```text
SALORIS/
├── frontend/       # React and TypeScript application
├── backend/        # Java Spring Boot REST API
├── ml/             # NASA dataset processing and analysis
├── research/       # Research sources and references
├── docs/           # Technical documentation
└── README.md
```

## Running the Project Locally

### Prerequisites
- Node.js and Corepack
- Java 21
- PostgreSQL
- Python

### 1. Frontend

```powershell
cd frontend
corepack pnpm install
corepack pnpm dev
```

### 2. Backend

Configure PostgreSQL and set the database password through the `DB_PASSWORD` environment variable.

```powershell
cd backend
$env:DB_PASSWORD = "your_database_password"
.\mvnw.cmd spring-boot:run
```

The backend uses Flyway for database migrations.

### 3. ML Environment

```powershell
cd ml
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Run the anomaly analysis:

```powershell
python scripts/detect_anomalies.py
```

Run the ML tests:

```powershell
python -m unittest discover -s tests -v
```

Refer to the individual component documentation for additional configuration and execution details.

## Testing

The project includes automated tests for the frontend, backend and ML workflow.

Development verification included:
- Frontend TypeScript validation and production build.
- Backend automated tests and database integration.
- ML dataset processing, baseline and anomaly analysis tests.

## Scientific Scope and Limitations

SALORIS is an educational and experimental health-monitoring prototype. It is not a medical diagnostic tool, a substitute for professional medical assessment or a mission-certified spacecraft health system.

The Inspiration4 OSD-575 dataset contains a small number of participants. Consequently, the experimental baseline and anomaly analysis must not be interpreted as clinically validated or generalisable medical predictions.

Dashboard demonstration values should not be interpreted as live astronaut telemetry.

## Use of AI-Assisted Tools

AI tools such as ChatGPT and GitHub Copilot were used as supporting tools for selected research, coding assistance, debugging and documentation tasks. The project concept, feature planning, technical decisions, implementation review and testing were carried out by the team. NASA research data was sourced directly from NASA and was not AI-generated.

## Project Status

SALORIS has an implemented frontend, Spring Boot backend, PostgreSQL integration, interactive health-monitoring features, emergency guidance and an experimental NASA dataset analysis pipeline.

Developed for the **2026 NASA Space Apps Challenge**.

**SALORIS — Human Resilience Beyond the Horizon.**
