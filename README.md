# SALORIS
### Human Resilience Beyond the Horizon.

**Astronaut Health Monitoring and Emergency Assistance System**

SALORIS is a health-monitoring and emergency assistance platform designed to support astronauts during space missions. It was developed for the 2026 NASA Space Apps Challenge.

Space missions can affect the human body in many ways. Astronauts may face changes in their heart, bones, immune system, sleep and mental well-being. SALORIS brings health tracking, educational information, research and emergency guidance together in one platform.

## The Problem We Address

Astronauts face five major hazards during space missions:

- Space radiation
- Isolation and confinement
- Distance from Earth
- Gravity fields
- Hostile space environments

These hazards can affect both physical and mental health. Astronauts need ways to monitor their health, understand changes and know when they may need help.

SALORIS aims to make this process easier through a simple and interactive interface.

## Main Features

### 1. Mission Overview
- Shows a central view of astronaut health information.
- Displays health indicators, summaries and trends.
- Provides easy access to the platform's main features.
- Identifies demonstration and simulated data.

### 2. Health Check-in
Astronauts can enter and record health information, including:
- Heart rate and blood pressure.
- Blood glucose, body temperature and oxygen saturation.
- Sleep hours and sleep quality.
- Mood, stress and fatigue.
- Symptoms and additional health notes.

The check-in forms help organise health information and send supported data to the backend.

### 3. Interactive Body Explorer
- Explore different parts and systems of the human body.
- Learn how spaceflight can affect each body system.
- Discover related health risks and spaceflight hazards.
- View useful health indicators and ways to monitor them.
- Read preventive health guidance.

### 4. Research Environment
- Learn about the five hazards of human spaceflight.
- Explore spaceflight-related health risks.
- Access relevant NASA research information and resources.

### 5. Emergency Assistance
- Provides organised emergency response information.
- Shows guidance for reviewing possible health concerns.
- Supports emergency event reporting.

### 6. NASA Research and Experimental Data Analysis

SALORIS uses NASA's Inspiration4 OSD-575 dataset to explore astronaut health research data.

Our Python data workflow includes:
- Collecting and inspecting the dataset.
- Preparing and organising the data.
- Comparing measurements with individual pre-flight baselines.
- Identifying unusual changes through experimental anomaly analysis.

This analysis is experimental and is not a medically validated prediction system.

## NASA Data Used

**NASA Open Science Data Repository – SpaceX Inspiration4 OSD-575**

https://osdr.nasa.gov/bio/repo/data/studies/OSD-575

This dataset provides the research data used in our experimental analysis.

We also use NASA Human Research Program resources to understand the health risks astronauts may face during space missions.

## Technologies Used

| Area | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite |
| Package management | pnpm, Corepack |
| Backend | Java 21, Spring Boot |
| Database | PostgreSQL |
| Database migrations | Flyway |
| Data analysis | Python |
| Communication | REST APIs |

## Project Structure

```text
SALORIS/
├── frontend/       # User interface
├── backend/        # Backend application and APIs
├── ml/             # NASA data processing and analysis
├── research/       # Research sources and references
├── docs/           # Technical documentation
└── README.md
```

## How to Run the Project

### Requirements
- Node.js and Corepack
- Java 25
- PostgreSQL
- Python

### 1. Start the Frontend

```powershell
cd frontend
corepack pnpm install
corepack pnpm dev
```

### 2. Start the Backend

Make sure PostgreSQL is running and the database is configured. Set your database password using the `DB_PASSWORD` environment variable.

```powershell
cd backend
$env:DB_PASSWORD = "your_database_password"
.\mvnw.cmd spring-boot:run
```

The backend uses Flyway to manage database changes.

### 3. Set Up the ML Environment

```powershell
cd ml
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Run the experimental anomaly analysis:

```powershell
python scripts/detect_anomalies.py
```

Run the ML tests:

```powershell
python -m unittest discover -s tests -v
```

## Testing

The project includes automated tests for the frontend, backend and data analysis workflow.

Testing performed includes:
- Frontend TypeScript checks and production build.
- Backend tests and database connection checks.
- ML tests for data inspection, preprocessing, baseline comparisons and anomaly analysis.

## Important Limitations

SALORIS is an educational and experimental prototype. It is not a medical diagnostic system and does not replace professional medical advice or certified spacecraft health systems.

The Inspiration4 dataset contains a small number of participants. Therefore, our experimental analysis should not be treated as a proven medical prediction method.

Some dashboard values are simulated for demonstration and are not live astronaut measurements.

## Use of AI-Assisted Tools

AI tools such as ChatGPT and GitHub Copilot were used as supporting tools for selected research, coding assistance, debugging and documentation tasks. The project concept, feature planning, technical decisions, implementation review and testing were carried out by the team. NASA research data was sourced directly from NASA and was not AI-generated.

## Project Status

SALORIS includes a working frontend, backend and database integration, health check-ins, an interactive Body Explorer, research information, emergency guidance and an experimental NASA data analysis workflow.

**Developed for the 2026 NASA Space Apps Challenge.**

### SALORIS — Human Resilience Beyond the Horizon.
