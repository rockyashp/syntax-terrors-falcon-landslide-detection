import asyncio
import io
import json
import os
import sys
import time
import uuid
import re
from datetime import datetime, timezone
from urllib.parse import urlencode
from urllib.request import Request, urlopen

# Ensure backend directory is in python path
sys.path.insert(0, os.path.dirname(__file__))

from dotenv import load_dotenv
import paho.mqtt.client as mqtt
from fastapi import Body, FastAPI, UploadFile, File, Form, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, UnidentifiedImageError

from satellite_model import FALCONSatelliteModel
from image_model import FALCONImageModel
from numerical_model import FALCONNumericalModel
from risk_engine import calculate_final_risk
from schemas import SensorData
from state import state, now_iso

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

# ============================================================
# APP
# ============================================================

app = FastAPI(
    title="FALCON Disaster Detection API",
    description="AI-assisted landslide detection and risk assessment for the LandslideGuard drone system",
    version="1.1.0",
)

# ------------------------------------------------------------
# CORS - the frontend (Vite dev server / static build) runs on a
# different origin than this API, so it needs to be allowed explicitly.
# Override with a comma-separated ALLOWED_ORIGINS env var in production.
# ------------------------------------------------------------
_origins_env = os.environ.get("ALLOWED_ORIGINS", "*")
allow_origins = ["*"] if _origins_env.strip() == "*" else [o.strip() for o in _origins_env.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# LOAD MODELS ONCE (kept optional so the API still boots and serves
# telemetry/health endpoints even if a weights file is missing)
# ============================================================

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")


def _safe_load(name, loader):
    try:
        model = loader()
        print(f"[OK] {name} ready")
        return model, None
    except Exception as exc:  # noqa: BLE001
        print(f"[WARN] {name} failed to load: {exc}")
        return None, str(exc)


image_model, image_model_error = _safe_load(
    "FALCON image model",
    lambda: FALCONImageModel(os.path.join(MODELS_DIR, "image")),
)

numerical_model, numerical_model_error = _safe_load(
    "FALCON numerical model",
    lambda: FALCONNumericalModel(
        os.path.join(MODELS_DIR, "numerical", "FALCON_hybrid_landslide_model.pkl")
    ),
)
if numerical_model is not None:
    state.numerical_model = numerical_model

satellite_model, satellite_model_error = _safe_load(
    "FALCON satellite model",
    lambda: FALCONSatelliteModel(
        os.path.join(MODELS_DIR, "satellite", "FALCON_SegFormer_Final.pth")
    ),
)

WEATHERAPI_KEY = os.environ.get("WEATHERAPI_KEY", "").strip()
WEATHERAPI_URL = "https://api.weatherapi.com/v1/forecast.json"
MQTT_BROKER = os.environ.get("MQTT_BROKER", "broker.hivemq.com")
MQTT_PORT = int(os.environ.get("MQTT_PORT", "1883"))
MQTT_TOPIC = os.environ.get("MQTT_TOPIC", "drone/disaster/telemetry")
MQTT_USERNAME = os.environ.get("MQTT_USERNAME", "").strip()
MQTT_PASSWORD = os.environ.get("MQTT_PASSWORD", "")
MQTT_CLIENT = None
GEOCODING_URL = "https://nominatim.openstreetmap.org/reverse"


def _fetch_weatherapi() -> dict:
    if not WEATHERAPI_KEY:
        raise RuntimeError("WEATHERAPI_KEY is not configured")

    query = urlencode({
        "key": WEATHERAPI_KEY,
        "q": f"{state.drone['latitude']},{state.drone['longitude']}",
        "days": 2,
        "aqi": "no",
        "alerts": "no",
    })
    request = Request(
        f"{WEATHERAPI_URL}?{query}",
        headers={"Accept": "application/json", "User-Agent": "FALCON-LandslideGuard/1.1"},
    )
    with urlopen(request, timeout=10) as response:
        payload = json.load(response)

    current = payload["current"]
    forecast_days = payload.get("forecast", {}).get("forecastday", [])
    hourly = [hour for day in forecast_days for hour in day.get("hour", [])]
    now_epoch = int(time.time())
    upcoming = [hour for hour in hourly if hour.get("time_epoch", 0) >= now_epoch]
    next_6h = upcoming[:6]
    next_24h = upcoming[:24]
    next_6h_rain = sum(hour.get("precip_mm", 0) or 0 for hour in next_6h)
    current_rain = current.get("precip_mm", 0) or 0

    weather = {
        "temperature": current["temp_c"],
        "humidity": current["humidity"],
        "rainfall": current_rain,
        "wind_speed": current["wind_kph"],
        "pressure": current["pressure_mb"],
        "visibility": current["vis_km"],
        "condition": current["condition"]["text"],
        "icon": current["condition"].get("icon"),
        "source": "WEATHERAPI.COM",
        "isLive": True,
        "forecast6h": [
            {"time": hour["time"], "temperature": hour["temp_c"], "rainfall": hour["precip_mm"], "condition": hour["condition"]["text"]}
            for hour in next_6h
        ],
        "forecast24h": [
            {"time": hour["time"], "temperature": hour["temp_c"], "rainfall": hour["precip_mm"], "condition": hour["condition"]["text"]}
            for hour in next_24h
        ],
        "rainfallTrend": "INCREASING" if next_6h_rain > current_rain * 6 else "STABLE",
        "lastSynced": now_iso(),
    }
    state.weather.update(weather)
    state.system_health["weatherApi"] = "ONLINE"
    return weather


async def _refresh_weather():
    try:
        await asyncio.to_thread(_fetch_weatherapi)
    except Exception as exc:  # noqa: BLE001
        state.system_health["weatherApi"] = "DEGRADED"
        state.weather["isLive"] = False
        state.weather["source"] = "METEOROLOGICAL_SIMULATION"
        print(f"WeatherAPI unavailable; using simulation: {exc}")


def _reverse_geocode(latitude: float, longitude: float) -> str:
    query = urlencode({
        "lat": latitude,
        "lon": longitude,
        "format": "jsonv2",
        "zoom": 18,
        "addressdetails": 1,
    })
    request = Request(
        f"{GEOCODING_URL}?{query}",
        headers={"Accept": "application/json", "User-Agent": "FALCON-LandslideGuard/1.1"},
    )
    with urlopen(request, timeout=8) as response:
        address = json.load(response).get("address", {})
    return (
        address.get("city")
        or address.get("town")
        or address.get("village")
        or address.get("municipality")
        or address.get("county")
        or address.get("state")
        or "Current Device Location"
    )


def _mqtt_message(client, userdata, message):
    raw_text = ""
    try:
        raw_text = message.payload.decode("utf-8", errors="replace").strip()
        
        # 1. Try standard / sanitized JSON parsing
        sanitized = re.sub(r':\s*(nan|NaN|None|null)\b', ': null', raw_text, flags=re.IGNORECASE)
        payload = {}
        try:
            payload = json.loads(sanitized)
        except Exception:
            # 2. Robust Regex Extraction fallback if JSON is still broken
            temp_match = re.search(r'["\']?temp["\']?\s*:\s*([0-9.-]+|nan|null)', raw_text, re.IGNORECASE)
            hum_match = re.search(r'["\']?humidity["\']?\s*:\s*([0-9.-]+|nan|null)', raw_text, re.IGNORECASE)
            gas_match = re.search(r'["\']?gas["\']?\s*:\s*([0-9.-]+|nan|null)', raw_text, re.IGNORECASE)

            def _parse_val(match, default):
                if not match:
                    return default
                val_str = match.group(1).lower()
                if val_str in ("nan", "null", "none"):
                    return default
                try:
                    return float(val_str)
                except ValueError:
                    return default

            payload = {
                "temp": _parse_val(temp_match, state.weather.get("temperature", 24.5)),
                "humidity": _parse_val(hum_match, state.weather.get("humidity", 58.0)),
                "gas": _parse_val(gas_match, 310),
            }

        # Fallback values if temp/humidity are missing or None
        if not isinstance(payload, dict):
            payload = {}
        
        temp_val = payload.get("temp")
        hum_val = payload.get("humidity")
        gas_val = payload.get("gas")

        if temp_val is None or str(temp_val).lower() in ("nan", "none", "null"):
            payload["temp"] = float(state.weather.get("temperature", 24.5))
        else:
            payload["temp"] = float(temp_val)

        if hum_val is None or str(hum_val).lower() in ("nan", "none", "null"):
            payload["humidity"] = float(state.weather.get("humidity", 58.0))
        else:
            payload["humidity"] = float(hum_val)

        if gas_val is None or str(gas_val).lower() in ("nan", "none", "null"):
            payload["gas"] = 310
        else:
            payload["gas"] = int(float(gas_val))

        state.ingest_mqtt_payload(payload)
    except Exception as exc:
        print(f"Ignored invalid ESP32 MQTT payload: {exc} | Raw text: '{raw_text}'")


def _mqtt_connected(client, userdata, flags, rc):
    if rc == 0:
        client.subscribe(MQTT_TOPIC)
        print(f"MQTT connected; subscribed to {MQTT_TOPIC}")
    else:
        state.system_health["mqttBroker"] = "DEGRADED"
        print(f"MQTT connection failed with code {rc}")


def _mqtt_disconnected(client, userdata, rc):
    state.system_health["mqttBroker"] = "DEGRADED"
    state.mqtt_live = False
    state.iot["connected"] = False


def _start_mqtt():
    global MQTT_CLIENT
    try:
        MQTT_CLIENT = mqtt.Client(client_id=f"falcon-backend-{uuid.uuid4().hex[:8]}")
        if MQTT_USERNAME:
            MQTT_CLIENT.username_pw_set(MQTT_USERNAME, MQTT_PASSWORD)
        MQTT_CLIENT.on_connect = _mqtt_connected
        MQTT_CLIENT.on_disconnect = _mqtt_disconnected
        MQTT_CLIENT.on_message = _mqtt_message
        MQTT_CLIENT.connect(MQTT_BROKER, MQTT_PORT, keepalive=60)
        MQTT_CLIENT.loop_start()
        print(f"MQTT listener started for {MQTT_BROKER}:{MQTT_PORT}")
    except Exception as exc:  # noqa: BLE001
        MQTT_CLIENT = None
        state.system_health["mqttBroker"] = "DEGRADED"
        print(f"MQTT unavailable; using simulated telemetry: {exc}")


def _stop_mqtt():
    if MQTT_CLIENT is not None:
        MQTT_CLIENT.loop_stop()
        MQTT_CLIENT.disconnect()


# ============================================================
# WEBSOCKET CONNECTION MANAGER + BACKGROUND SIMULATION LOOP
# ============================================================

class ConnectionManager:
    def __init__(self):
        self.active: list[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active.append(ws)

    def disconnect(self, ws: WebSocket):
        if ws in self.active:
            self.active.remove(ws)

    async def broadcast(self, payload: dict):
        dead = []
        for ws in self.active:
            try:
                await ws.send_json(payload)
            except Exception:  # noqa: BLE001
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws)


manager = ConnectionManager()


async def _simulation_loop():
    weather_refresh_counter = 0
    while True:
        state.tick()
        if state.mqtt_live and state.mqtt_last_message:
            last_message = datetime.fromisoformat(state.mqtt_last_message)
            if (datetime.now(timezone.utc) - last_message).total_seconds() > 10:
                state.mqtt_live = False
                state.iot["connected"] = False
                state.system_health["mqttBroker"] = "DEGRADED"
        if weather_refresh_counter <= 0:
            await _refresh_weather()
            weather_refresh_counter = 300
        weather_refresh_counter -= 1
        await manager.broadcast(state.to_ws_message())
        await asyncio.sleep(2)


@app.on_event("startup")
async def _on_startup():
    asyncio.create_task(asyncio.to_thread(_start_mqtt))
    asyncio.create_task(_simulation_loop())


@app.on_event("shutdown")
async def _on_shutdown():
    _stop_mqtt()


@app.websocket("/ws/live")
async def ws_live(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        # Send an immediate snapshot on connect
        await websocket.send_json(state.to_ws_message())
        while True:
            # Keep the connection open; clients don't need to send anything.
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/")
def root():
    return {"system": "FALCON", "status": "online", "version": "1.1.0"}


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "image_model": "loaded" if image_model else f"unavailable ({image_model_error})",
        "numerical_model": "loaded" if numerical_model else f"unavailable ({numerical_model_error})",
        "satellite_model": "loaded" if satellite_model else f"unavailable ({satellite_model_error})",
    }


# ============================================================
# FRONTEND-FACING REST API
# (matches src/services/api.ts + src/types exactly)
# ============================================================

@app.get("/api/status")
def api_status():
    return {
        "status": "ONLINE",
        "timestamp": now_iso(),
        "version": "1.1.0",
        "health": state.system_health,
    }


@app.get("/api/drone")
def api_drone():
    return state.drone


@app.get("/api/sensors")
def api_sensors():
    return state.sensors_with_status()


@app.get("/api/weather")
async def api_weather():
    await _refresh_weather()
    return {
        **state.weather,
        "rainfallRisk": state.risk["level"] if state.risk["level"] != "VERY_HIGH" else "CRITICAL",
        "rainfallTrend": state.weather.get("rainfallTrend", state.risk["trend"]),
        "forecast6h": state.weather.get("forecast6h", []),
        "forecast24h": state.weather.get("forecast24h", []),
        "lastSynced": state.weather.get("lastSynced", now_iso()),
    }


@app.get("/api/ai/latest")
def api_ai_latest():
    return state.ai_latest


@app.get("/api/risk")
def api_risk():
    return state.risk


@app.get("/api/events")
def api_events():
    return state.alerts


@app.get("/api/location")
def api_location():
    return {
        "lat": state.drone["latitude"],
        "lon": state.drone["longitude"],
        "name": getattr(state, "location_name", "Current Device Location"),
        "elevation": 1420,
    }


@app.post("/api/location")
async def set_api_location(location: dict = Body(...)):
    latitude = float(location["lat"])
    longitude = float(location["lon"])
    if not (-90 <= latitude <= 90 and -180 <= longitude <= 180):
        return {"error": "invalid latitude or longitude"}
    state.set_location(latitude, longitude)
    try:
        location_name = await asyncio.to_thread(_reverse_geocode, latitude, longitude)
    except Exception as exc:  # noqa: BLE001
        location_name = "Current Device Location"
        print(f"Reverse geocoding unavailable: {exc}")
    state.location_name = location_name
    return {
        "lat": state.drone["latitude"],
        "lon": state.drone["longitude"],
        "name": location_name,
        "elevation": 1420,
    }


@app.post("/api/ai/analyze")
async def api_ai_analyze(
    file: UploadFile | None = File(default=None),
    image_data: str | None = Form(default=None),
):
    """Runs the real FALCON image segmentation model on an uploaded drone
    frame and folds the result into the live AI/risk/alert state so every
    connected client (REST poll or WebSocket) sees it immediately.
    """
    if image_model is None:
        return {"error": f"image model unavailable: {image_model_error}"}

    if file is not None:
        contents = await file.read()
    elif image_data:
        import base64
        try:
            header_split = image_data.split(",", 1)
            raw = header_split[1] if len(header_split) == 2 else header_split[0]
            contents = base64.b64decode(raw)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid base64 image data: {e}")
    else:
        raise HTTPException(status_code=400, detail="No image provided (use 'file' or 'image_data')")

    if not contents or len(contents) == 0:
        raise HTTPException(status_code=400, detail="Provided image file/payload is empty.")

    try:
        image = Image.open(io.BytesIO(contents))
        image.load()  # Verify image integrity
    except (UnidentifiedImageError, OSError, ValueError) as e:
        raise HTTPException(status_code=400, detail=f"Cannot identify or decode image file: {e}")

    start = time.time()
    result = image_model.predict(image)
    inference_ms = round((time.time() - start) * 1000)

    detected = result["landslide_area_percent"] >= result["area_threshold"]
    confidence = result["max_probability"] if detected else result["mean_probability"]

    prev = state.ai_latest
    if detected and prev.get("detected"):
        consecutive = prev.get("consecutiveFramesDetected", 0) + 1
    elif detected:
        consecutive = 1
    else:
        consecutive = 0

    temporal_status = (
        "CONFIRMED_DETECTION" if consecutive >= 2 else
        "SINGLE_FRAME_POSSIBLE" if consecutive == 1 else
        "NONE"
    )

    detection_result = {
        "detected": detected,
        "confidence": round(confidence, 4),
        "affected_area": round(result["landslide_area_percent"] / 100.0, 4),
        "model": "FALCON-SegFormer",
        "timestamp": now_iso(),
        "inferenceTimeMs": inference_ms,
        "temporalStatus": temporal_status,
        "consecutiveFramesDetected": consecutive,
        "detections": (
            [{
                "x": 0,
                "y": 0,
                "width": 100,
                "height": 100,
                "label": "Landslide Slip Face",
                "confidence": round(confidence, 4),
            }]
            if detected else []
        ),
    }

    state.ai_latest = detection_result
    state.recompute_risk()

    if detected and temporal_status == "CONFIRMED_DETECTION":
        state.push_alert(
            level="CRITICAL" if confidence >= 0.85 else "HIGH",
            title="Landslide-like zone detected",
            message=(
                f"FALCON vision model confirmed a landslide-like zone across "
                f"{result['landslide_area_percent']}% of the frame "
                f"(confidence {confidence:.2f})."
            ),
        )

    return detection_result


# ============================================================
# DIRECT MODEL INFERENCE (used for offline/manual testing of each model)
# ============================================================

@app.post("/predict/image")
async def predict_image(file: UploadFile = File(...)):
    if image_model is None:
        return {"error": f"image model unavailable: {image_model_error}"}

    image_bytes = await file.read()
    if not image_bytes or len(image_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded image file is empty.")

    try:
        image = Image.open(io.BytesIO(image_bytes))
        image.load()
    except (UnidentifiedImageError, OSError, ValueError) as e:
        raise HTTPException(status_code=400, detail=f"Cannot identify or decode image file: {e}")

    result = image_model.predict(image)
    return {"filename": file.filename, "result": result}


@app.post("/predict/numerical")
def predict_numerical(data: SensorData):
    if numerical_model is None:
        return {"error": f"numerical model unavailable: {numerical_model_error}"}

    result = numerical_model.predict(data.model_dump())
    return result


@app.post("/predict/risk")
async def predict_risk(
    file: UploadFile = File(...),
    soil_moisture: float = 0,
    rainfall_1h: float = 0,
    rainfall_24h: float = 0,
    rainfall_7d: float = 0,
    temperature: float = 0,
    humidity: float = 0,
    wind_speed: float = 0,
    ground_movement: float = 0,
    vibration: float = 0,
    pore_pressure: float = 0,
    slope: float = 0,
    elevation: float = 0,
    curvature: float = 0,
    aspect: float = 0,
    ndvi: float = 0,
    precipitation: float = 0,
    lulc: float = 0,
):
    if image_model is None:
        return {"error": f"image model unavailable: {image_model_error}"}
    if numerical_model is None:
        return {"error": f"numerical model unavailable: {numerical_model_error}"}

    # --------------------------------------------------------
    # IMAGE
    # --------------------------------------------------------
    contents = await file.read()
    image = Image.open(io.BytesIO(contents))
    image_result = image_model.predict(image, threshold=0.40)

    # --------------------------------------------------------
    # NUMERICAL
    # The hybrid model was trained on: rainfall, vegetation, slope,
    # soil_saturation, temperature, humidity, soil_moisture. This endpoint
    # accepts the fuller drone/sensor payload and maps it onto those fields.
    # --------------------------------------------------------
    numerical_data = {
        "temperature": temperature,
        "humidity": humidity,
        "soil_moisture": soil_moisture,
        "rainfall": rainfall_24h or rainfall_1h,
        "vegetation": ndvi,
        "slope": slope,
        "soil_saturation": soil_moisture,
    }

    numerical_result = numerical_model.predict(numerical_data)

    # --------------------------------------------------------
    # FINAL RISK
    # --------------------------------------------------------
    risk = calculate_final_risk(image_result, numerical_result, slope=slope)

    return {
        "system": "FALCON",
        "image_analysis": {
            "max_probability": image_result["max_probability"],
            "mean_probability": image_result["mean_probability"],
            "landslide_coverage": image_result["landslide_coverage"],
            "threshold": image_result["threshold"],
        },
        "numerical_analysis": numerical_result,
        "final_risk": risk,
    }


@app.post("/predict/satellite")
async def predict_satellite(file: UploadFile = File(...)):
    if satellite_model is None:
        return {"error": f"satellite model unavailable: {satellite_model_error}"}

    h5_bytes = await file.read()
    result = satellite_model.predict_h5(h5_bytes)

    return {"filename": file.filename, "result": result}
