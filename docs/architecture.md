# IoTShield System Architecture

## Overview
**IoTShield** is an AI-powered IoT Intrusion Detection System (IDS) designed to protect Internet of Things (IoT) environments from emerging cyber threats, anomalies, and network attacks.

## Multi-Layer Architecture

```
+-------------------------------------------------------------+
|                 IoTShield Presentation Layer                |
|           (React / Vue Threat Analytics Dashboard)          |
+------------------------------+------------------------------+
                               | REST / WebSockets
+------------------------------v------------------------------+
|                   IoTShield Backend (FastAPI)               |
|  - API Routing & Endpoints (/api/health, /api/info, ...)    |
|  - Authentication & Device Management (Planned)             |
|  - Ingestion Engine & Live Stream Parser (Planned)          |
+------------------------------+------------------------------+
                               |
+------------------------------v------------------------------+
|               AI / Machine Learning Engine                  |
|  - Feature Preprocessor & Scaler (CIC-IoT / Custom format)  |
|  - Multi-class Classifier (XGBoost / LightGBM / RF)         |
|  - Anomaly Detector (Isolation Forest / Autoencoder)        |
|  - Explainability Engine (SHAP Values & Feature Importance) |
+------------------------------+------------------------------+
                               |
+------------------------------v------------------------------+
|            Hardware & Network Capture Layer (Planned)       |
|  - Network Tap / PCAP Ingest / ESP32 Sensor Nodes           |
|  - Bluetooth / Zigbee / Wi-Fi Gateway Telemetry             |
+-------------------------------------------------------------+
```

## Architectural Principles
1. **Modularity**: Every module (API, ML pipelines, frontend, hardware connectors) is decoupled and independently testable.
2. **Scalability**: Asynchronous FastAPI endpoints capable of handling real-time telemetry from multiple IoT nodes.
3. **Observability**: Clear health checks, metrics, and structured logging.
4. **Security by Design**: Principle of least privilege, environment-based configuration, and no embedded secrets.
