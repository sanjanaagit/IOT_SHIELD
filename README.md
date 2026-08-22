# IoTShield: AI-Based IoT Intrusion Detection System (IDS)

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Status](https://img.shields.io/badge/Stage-1%20Foundation-orange.svg)](#current-development-stage)

**IoTShield** is a next-generation, AI-driven Intrusion Detection System (IDS) engineered specifically for Internet of Things (IoT) ecosystems. It is designed to inspect network telemetry, detect malicious activity, compute device-level risk scores, explain threat predictions, and interface with real-world IoT hardware nodes.

---

## 1. Problem Statement

Internet of Things (IoT) devices are increasingly ubiquitous across smart homes, healthcare, industrial automation, and enterprise environments. However, IoT devices frequently suffer from inherent security vulnerabilities:
- **Resource Constraints**: Limited processing capability prevents heavy on-device cryptographic and security tools.
- **Weak Default Configurations**: Default credentials, unpatched firmware, and unencrypted communications.
- **Vulnerability to Novel Attacks**: Susceptibility to Distributed Denial of Service (DDoS) botnets (e.g., Mirai), reconnaissance scans, spoofing, and protocol tampering.

Traditional signature-based Network Intrusion Detection Systems (NIDS) fail to identify zero-day vulnerabilities and nuanced IoT-specific behavioral anomalies. **IoTShield** addresses this gap by combining machine learning, real-time traffic inspection, and explainable AI to protect IoT infrastructure.

---

## 2. Project Objectives

- **Intelligent Threat Detection**: Detect both known cyberattacks (DDoS, brute-force, injection, port scans) and unknown zero-day anomalies using ML models.
- **Real-Time Network Telemetry Analysis**: Ingest and evaluate flow-level network statistics efficiently with low latency.
- **Explainable Predictions (XAI)**: Leverage feature attribution methods (e.g., SHAP) to explain why a particular network flow was classified as malicious.
- **Device Risk Scoring**: Calculate holistic device vulnerability and risk metrics based on historical traffic behavior.
- **Hardware & Edge Integration**: Bridge with real-world IoT devices (e.g., ESP32, Bluetooth gateways, Wi-Fi sensor nodes).
- **Interactive Security Dashboard**: Provide security operators with actionable threat analytics, logs, and alert triage.

---

## 3. Current Development Stage

> [!NOTE]
> **Current Status: Stage 1 — Project Foundation & Baseline Backend**
>
> In this initial stage, we establish the clean, modular project architecture, FastAPI backend framework, standard configuration management, baseline API endpoints (`/api/health`, `/api/info`), automated test suites, and documentation.
>
> *Machine learning pipelines, dataset classification, frontend dashboards, database persistence, authentication, SHAP explainability, anomaly detection, and hardware integrations are scheduled for subsequent stages.*

---

## 4. Technology Stack (Stage 1 & Planned)

### Stage 1 (Active)
- **Backend Framework**: Python 3.10+, FastAPI
- **ASGI Server**: Uvicorn
- **Data Validation & Settings**: Pydantic v2, Pydantic-Settings
- **Testing & Quality**: Pytest, HTTPX

### Future Stages (Planned)
- **Machine Learning & Analytics**: Scikit-Learn, XGBoost, LightGBM, Pandas, NumPy
- **Explainable AI (XAI)**: SHAP (SHapley Additive exPlanations)
- **Frontend / Dashboard**: React / Next.js / Tailwind CSS
- **Database & Cache**: PostgreSQL / SQLite, Redis
- **IoT Hardware**: ESP32, Wi-Fi / Bluetooth Low Energy (BLE) capture nodes

---

## 5. Basic Architecture

```
+-------------------------------------------------------------+
|                 IoTShield Presentation Layer                |
|             (Threat Analytics & Security UI)                |
+------------------------------+------------------------------+
                               | REST APIs / WebSocket Streams
+------------------------------v------------------------------+
|                   IoTShield Backend (FastAPI)               |
|  - Router & Endpoints (/api/health, /api/info)              |
|  - Configuration Management (.env, pydantic-settings)       |
|  - Ingestion & Validation Engine                            |
+------------------------------+------------------------------+
                               |
+------------------------------v------------------------------+
|            AI / Machine Learning Engine (Stage 2+)          |
|  - Preprocessing & Feature Scalers                          |
|  - Multi-class Classifiers & Anomaly Detectors              |
|  - SHAP Model Explainability Engine                         |
+------------------------------+------------------------------+
                               |
+------------------------------v------------------------------+
|          Data Storage & Hardware Sensors (Stage 4+)         |
|  - IoT Network Datasets (CIC-IoT / TON_IoT)                 |
|  - ESP32 Telemetry & Packet Capture Probes                  |
+-------------------------------------------------------------+
```

---

## 6. Project Structure

```
iotshield/
│
├── backend/                  # FastAPI backend application
│   └── app/
│       ├── api/              # API router and endpoint definitions
│       │   └── v1/
│       │       ├── endpoints/
│       │       │   ├── health.py   # GET /api/health
│       │       │   └── info.py     # GET /api/info
│       │       └── router.py       # Aggregated v1 router
│       ├── core/             # Application configuration & settings
│       │   └── config.py
│       ├── schemas/          # Pydantic data validation schemas
│       │   ├── health.py
│       │   └── info.py
│       └── main.py           # FastAPI application entry point
│
├── frontend/                 # UI dashboard (Stage 3+)
├── ml/                       # ML models, training pipelines, SHAP (Stage 2+)
├── data/                     # Raw and processed datasets (Stage 2+)
│   ├── raw/
│   └── processed/
├── models/                   # Serialized ML model artifacts (Stage 2+)
│   └── saved/
├── tests/                    # Automated test suite
│   ├── conftest.py
│   ├── test_health.py
│   └── test_info.py
├── docs/                     # Architecture and technical documentation
│   └── architecture.md
├── scripts/                  # Utility and automation scripts
├── .env.example              # Sample environment variables
├── .gitignore                # Git ignore configuration
├── requirements.txt          # Python dependencies
└── README.md                 # Project documentation
```

---

## 7. Multi-Stage Development Roadmap

| Stage | Focus Area | Description | Status |
| :--- | :--- | :--- | :--- |
| **Stage 1** | **Foundation & Baseline Backend** | Modular structure, FastAPI setup, health endpoints, tests, configuration | **Completed** |
| **Stage 2** | **ML Pipeline & Threat Detection** | IoT datasets, feature engineering, intrusion classification models, anomaly detection | *Planned* |
| **Stage 3** | **Explainability & Risk Analytics** | SHAP explanations, device risk scoring algorithms, threat severity mapping | *Planned* |
| **Stage 4** | **Frontend Threat Dashboard** | Interactive dashboard, real-time alert triage, threat visualization | *Planned* |
| **Stage 5** | **Hardware Integration & Live Capture** | ESP32 telemetry, BLE/Wi-Fi live network packet inspection | *Planned* |

---

## 8. Getting Started (Stage 1)

### Prerequisites
- Python 3.10 or higher
- `pip` (Python package manager)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd iotsheild
   ```

2. **Create and activate a virtual environment:**
   ```bash
   # On Windows
   python -m venv venv
   .\venv\Scripts\activate

   # On Linux/macOS
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```

---

## 9. Running the Application

Start the FastAPI development server:

```bash
uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
```

Once running, access:
- **Interactive Swagger API Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc Documentation**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
- **Health Check**: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)
- **System Info**: [http://127.0.0.1:8000/api/info](http://127.0.0.1:8000/api/info)

---

## 10. Running Tests

Execute the automated test suite with pytest:

```bash
pytest tests/ -v
```
