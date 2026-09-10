# FALCON LandslideGuard AI

FALCON LandslideGuard AI is an intelligent, real-time landslide monitoring, risk assessment, and early warning platform. The system integrates aerial drone image segmentation, 14-band multispectral satellite imagery analysis, geotechnical machine learning models, real-time ESP32 IoT sensor telemetry via MQTT, live meteorological forecasting, and interactive geospatial visualization into a unified operational dashboard.

---

## Table of Contents

- [System Architecture](#system-architecture)
- [Key Features](#key-features)
- [AI and Analytical Models](#ai-and-analytical-models)
- [System Requirements](#system-requirements)
- [Environment Configuration](#environment-configuration)
- [Installation Guide](#installation-guide)
- [Running the Application](#running-the-application)
- [Stopping Services](#stopping-services)
- [API and WebSocket Reference](#api-and-websocket-reference)
- [Hardware and IoT Integration](#hardware-and-iot-integration)
- [Production Build and Verification](#production-build-and-verification)
- [Troubleshooting](#troubleshooting)
- [Project Directory Structure](#project-directory-structure)

---

## System Architecture

The platform operates using a distributed, event-driven architecture designed for high availability and low latency:

```
[ ESP32 IoT Node ] ---> (MQTT Broker) ---> [ FastAPI Backend ] <--- (WeatherAPI / OSM)
                                                   |
                                     +-------------+-------------+
                                     |                           |
                            [ WebSocket Stream ]          [ REST Endpoints ]
                                     |                           |
                                     +-------------+-------------+
                                                   |
                                         [ React / Vite UI ]
```

1. **Edge Sensing Layer**: ESP32 microcontroller nodes stream environmental data (temperature, humidity, air quality/gas) to an MQTT broker.
2. **Backend Processing Engine**: FastAPI server consumes MQTT streams, integrates external weather forecasting data via WeatherAPI, evaluates geotechnical thresholds, and executes PyTorch and Scikit-Learn inference models.
3. **Real-Time Telemetry Dispatcher**: A WebSocket hub broadcasts updated telemetry, risk metrics, and alert triggers to active dashboard sessions every two seconds.
4. **Client Interface**: React/Vite dashboard provides interactive mapping (Leaflet), real-time sensor analytics, manual model execution pipelines, snapshot archiving (IndexedDB), and alert management.

---

## Key Features

- **Multi-Modal Risk Assessment**: Combines computer vision, satellite remote sensing, and numerical geotechnical modeling for multi-source risk validation.
- **Real-Time Drone and Sensor Telemetry**: Live ingestion of IoT sensor data with automated fallback to mathematical simulations during network disruption.
- **Geospatial Intelligence**: Interactive mapping using OpenStreetMap and Leaflet with dynamic reverse geocoding via Nominatim.
- **Temporal Detection Verification**: Multi-frame confidence tracking to eliminate false positives in aerial visual detection.
- **Meteorological Forecasting Integration**: Real-time precipitation and 6-hour / 24-hour rainfall trend tracking to evaluate ground saturation vulnerability.
- **Persistent Data Store**: Client-side snapshot archival leveraging IndexedDB for offline inspection and historical audit trails.

---

## AI and Analytical Models

### 1. Aerial Image Segmentation (FALCON-SegFormer)
- **Architecture**: Transformer-based visual segmentation model.
- **Purpose**: Detects landslide scarps, debris flow, soil displacement, and exposed bedrock in high-resolution aerial and drone imagery.
- **Output**: Segmentation mask, maximum and mean class confidence scores, and percentage of affected surface area.

### 2. Satellite Multispectral Model
- **Architecture**: 14-band SegFormer model handling multispectral geospatial arrays.
- **Input**: HDF5 (`.h5`) datasets containing optical, near-infrared, and shortwave infrared satellite bands.
- **Purpose**: Macro-scale terrain analysis and broad-area slip classification.

### 3. Geotechnical Numerical Risk Model
- **Architecture**: Hybrid Scikit-Learn / XGBoost regression and classification pipeline.
- **Input Parameters**: Soil moisture, rainfall accumulation (1h, 24h, 7d), slope angle, ground vibration, pore water pressure, elevation, terrain curvature, and NDVI (Normalized Difference Vegetation Index).
- **Output**: Numerical probability score indicating slope instability.

### 4. Risk Engine Fusion
- Weighted synthesis of visual detection confidence, geotechnical stability index, and cumulative precipitation trends to classify hazard levels into `LOW`, `MODERATE`, `HIGH`, or `CRITICAL`.

---

## System Requirements

- **Operating System**: Windows 10/11, macOS, or Linux
- **Node.js**: Version 18.0.0 or higher
- **Python**: Version 3.11 or higher
- **Web Browser**: Modern Chromium-based browser, Firefox, or Safari with Geolocation API enabled
- **Hardware (Optional)**: ESP32 development board with environmental sensors

---

## Environment Configuration

Configuration variables are managed via the `.env` file in the project root. Copy the template file to begin:

```bash
cp .env.example .env
```

### Configuration Variables

| Variable | Required | Default Value | Description |
| :--- | :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Yes | `http://localhost:8000` | Backend REST API endpoint for the frontend client |
| `VITE_WS_BASE_URL` | Yes | `ws://localhost:8000` | WebSocket endpoint for live telemetry streaming |
| `WEATHERAPI_KEY` | Optional | `your_weatherapi_key_here` | API key from WeatherAPI.com for live precipitation data |
| `MQTT_BROKER` | Yes | `broker.hivemq.com` | MQTT broker hostname or IP address |
| `MQTT_PORT` | Yes | `1883` | MQTT broker TCP connection port |
| `MQTT_TOPIC` | Yes | `drone/disaster/telemetry` | MQTT subscription topic for incoming ESP32 payloads |
| `MQTT_USERNAME` | Optional | `""` | Username for authenticated MQTT brokers |
| `MQTT_PASSWORD` | Optional | `""` | Password for authenticated MQTT brokers |
| `ALLOWED_ORIGINS` | Optional | `*` | Comma-separated CORS allowed origins list |

---

## Installation Guide

### 1. Clone the Repository
```bash
git clone <repository-url>
cd landslideguard-ai-final
```

### 2. Frontend Dependencies
Install the required Node.js packages:

```bash
npm install
```

### 3. Backend Dependencies
Set up an isolated Python virtual environment and install all necessary backend packages:

#### On Windows (PowerShell):
```powershell
python -m venv .venv
.venv\Scripts\python.exe -m pip install --upgrade pip
.venv\Scripts\python.exe -m pip install -r backend\requirements.txt
```

#### On Linux / macOS (Bash):
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r backend/requirements.txt
```

---

## Running the Application

Running the platform requires starting both the FastAPI backend and the Vite frontend development server concurrently in separate terminals.

### Terminal 1: Launch Backend

#### Windows (PowerShell):
```powershell
.venv\Scripts\python.exe -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

#### Linux / macOS (Bash):
```bash
source .venv/bin/activate
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

Backend Services:
- REST API: `http://localhost:8000`
- Interactive API Documentation (Swagger UI): `http://localhost:8000/docs`
- Health Diagnostic Endpoint: `http://localhost:8000/health`
- WebSocket Live Feed: `ws://localhost:8000/ws/live`

### Terminal 2: Launch Frontend

```bash
npm run dev -- --host 0.0.0.0
```

Access the user interface by opening the URL displayed in the terminal:
```
http://localhost:5173
```

*Note: Allow browser location permissions when prompted to enable real-time local weather forecasts and map centering.*

---

## Stopping Services

To terminate the running development servers, focus each terminal window and press `Ctrl + C`.

If background processes remain bound to the service ports on Windows, release them using PowerShell:

```powershell
# Terminate process listening on port 5173 (Frontend)
Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue |
  ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }

# Terminate process listening on port 8000 (Backend)
Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue |
  ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

On Linux or macOS:
```bash
lsof -ti:5173 | xargs kill -9
lsof -ti:8000 | xargs kill -9
```

---

## API and WebSocket Reference

### WebSocket Protocol

- **Endpoint**: `ws://localhost:8000/ws/live`
- **Direction**: Server-to-Client broadcast (emitted every 2 seconds).
- **Payload Schema**:
```json
{
  "type": "TELEMETRY_UPDATE",
  "drone": {
    "latitude": 30.7333,
    "longitude": 79.0669,
    "altitude": 1420.5,
    "battery": 94,
    "status": "PATROLLING"
  },
  "sensors": {
    "temperature": 21.4,
    "humidity": 68.2,
    "soil_moisture": 42.1,
    "pore_pressure": 18.3,
    "ground_movement": 0.04,
    "vibration": 0.01
  },
  "risk": {
    "score": 38.5,
    "level": "MODERATE",
    "trend": "STABLE"
  },
  "weather": {
    "temperature": 21.4,
    "humidity": 68.2,
    "rainfall": 2.1,
    "source": "WEATHERAPI.COM",
    "isLive": true
  },
  "systemHealth": {
    "imageModel": "ONLINE",
    "numericalModel": "ONLINE",
    "satelliteModel": "ONLINE",
    "mqttBroker": "ONLINE",
    "weatherApi": "ONLINE"
  }
}
```

### Core REST Endpoints

| Method | Path | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Verifies runtime status and model loading integrity |
| `GET` | `/api/status` | Returns system health indicators and active module state |
| `GET` | `/api/drone` | Retrieves current drone coordinates and flight status |
| `GET` | `/api/sensors` | Returns all real-time sensor metrics and threshold status |
| `GET` | `/api/weather` | Returns meteorological data, forecasts, and rain trends |
| `POST` | `/api/location` | Sets active GPS coordinate reference point for the system |
| `POST` | `/api/ai/analyze` | Evaluates drone aerial image; updates global detection state |
| `POST` | `/predict/image` | Standalone endpoint for aerial image segmentation |
| `POST` | `/predict/numerical` | Evaluates geotechnical parameters against ML model |
| `POST` | `/predict/risk` | Composite inference combining image and geotechnical inputs |
| `POST` | `/predict/satellite` | Processes 14-band multispectral HDF5 satellite data |

---

## Hardware and IoT Integration

The platform supports external telemetry ingestion from microcontrollers such as the ESP32.

### MQTT Ingestion Schema

The ESP32 publishes JSON payloads to the topic specified in `MQTT_TOPIC`:

```json
{
  "temp": 24.5,
  "humidity": 62.0,
  "gas": 310
}
```

### Telemetry Pipeline
1. ESP32 reads physical sensor pins.
2. ESP32 transmits formatted JSON to the configured MQTT broker.
3. Backend MQTT client ingests payload and updates the in-memory state.
4. The WebSocket connection pushes updated metrics to connected browser clients.

*Note: In production environments, replace public MQTT brokers with an authenticated, TLS-encrypted broker instance.*

---

## Production Build and Verification

### Frontend Production Build
To validate TypeScript types and compile optimized production assets:

```bash
npm run build
```

The output bundle is generated in the `dist/` directory. You can preview the production build locally:

```bash
npm run preview
```

### Backend Syntax Verification
To verify Python syntax and compilation across all backend modules:

#### Windows (PowerShell):
```powershell
.venv\Scripts\python.exe -m compileall backend
```

#### Linux / macOS (Bash):
```bash
python -m compileall backend
```

---

## Troubleshooting

### Backend Fails to Start
- Ensure dependencies are installed in the active virtual environment.
- Check Python version compatibility (`python --version` should be 3.11 or newer).
- Verify that port `8000` is not occupied by another process.

### Weather Data Displays as Simulation
- Ensure a valid `WEATHERAPI_KEY` is provided in `.env`.
- Verify external internet connectivity. When the WeatherAPI service is unreachable or unconfigured, the backend automatically falls back to an internal meteorological simulation model.

### MQTT Broker Status Shows Degraded
- Verify broker domain, port, and topic match between `.env` and the ESP32 firmware.
- If using public brokers such as `broker.hivemq.com`, temporary network throttling or rate limits may occur.

### Missing AI Model Files
- The API is architected to boot even if individual model weight files are absent. Missing models will be reported as `unavailable` in `/health` and `/api/status`, while allowing sensor telemetry and monitoring features to operate normally. Ensure required `.pth`, `.safetensors`, or `.pkl` weight files are placed under `backend/models/`.

---

## Project Directory Structure

```
landslideguard-ai-final/
├── backend/
│   ├── models/
│   │   ├── image/             # Aerial image segmentation weights & config
│   │   ├── numerical/         # Geotechnical ML model (Scikit-Learn / XGBoost)
│   │   └── satellite/         # Multispectral 14-band SegFormer model weights
│   ├── image_model.py         # Aerial image inference pipeline
│   ├── main.py                # FastAPI entry point, REST API & WebSocket server
│   ├── numerical_model.py     # Geotechnical risk inference module
│   ├── requirements.txt       # Python dependency specifications
│   ├── risk_engine.py         # Multi-modal risk fusion calculation logic
│   ├── satellite_model.py     # HDF5 multispectral data processing & inference
│   ├── schemas.py             # Pydantic data schemas
│   └── state.py               # In-memory telemetry state and simulation engine
├── public/                    # Static public assets
├── src/
│   ├── components/            # Reusable UI components and layout widgets
│   ├── hooks/                 # Custom React lifecycle and state hooks
│   ├── pages/                 # Application views (Overview, AI Analysis, Sensors, etc.)
│   ├── services/              # API, WebSocket, and IndexedDB client services
│   ├── stores/                # Zustand global state stores
│   ├── styles/                # Tailwind and application styling definitions
│   ├── types/                 # TypeScript interface and type declarations
│   ├── App.tsx                # Root component and navigation routing
│   └── main.tsx               # Frontend client entry point
├── .env.example               # Environment variable configuration template
├── .gitignore                 # Git ignore file for build, environment, and temp files
├── index.html                 # Main HTML template
├── package.json               # Node.js project manifest and scripts
├── tailwind.config.js         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript compiler configuration
└── vite.config.ts             # Vite build and development configuration
```
#   s y n t a x - t e r r o r s - f a l c o n - l a n d s l i d e - d e t e c t i o n  
 