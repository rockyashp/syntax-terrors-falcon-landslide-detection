"""
Live system state.

The drone/IoT/weather telemetry in this project comes from hardware that
isn't attached in every deployment (ESP32 payload, MQTT broker, live RTSP
feed, etc). Until that hardware is wired in, this module provides a
realistic, continuously-updating simulation so the frontend has real data
to poll/subscribe to over HTTP + WebSocket instead of freezing on defaults.

The *AI detection* and *risk fusion* numbers are NOT simulated — they are
overwritten with real model output whenever /api/ai/analyze or
/predict/risk are called (see main.py).
"""

import math
import random
import time
from datetime import datetime, timezone


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def status_for(value, safe, monitor, warning):
    """Map a numeric reading to a SAFE/MONITOR/WARNING/CRITICAL band."""
    if value < safe:
        return "SAFE"
    if value < monitor:
        return "MONITOR"
    if value < warning:
        return "WARNING"
    return "CRITICAL"


class SystemState:
    def __init__(self):
        self.start_time = time.time()

        self.drone = {
            "id": "DRONE-01",
            "name": "FALCON Recon UAV",
            "battery": 92.0,
            "latitude": 27.9142,
            "longitude": 85.8456,
            "altitude": 1420,
            "speed": 8.4,
            "heading": 90,
            "status": "ONLINE",
            "gpsStatus": "LOCKED",
            "cameraStatus": "CONNECTED",
            "network": "5G",
            "streamFps": 24,
            "resolution": "3840x2160",
        }

        self.sensors = {
            "soil_moisture": 42.0,
            "rainfall": 8.0,
            "ground_movement": 1.2,
            "pore_pressure": 15.0,
            "lastUpdated": now_iso(),
        }

        self.weather = {
            "temperature": 21.0,
            "humidity": 55.0,
            "rainfall": 8.0,
            "wind_speed": 14.0,
            "pressure": 1015.0,
            "visibility": 9.5,
            "condition": "Partly Cloudy",
            "icon": "cloud-sun",
            "source": "METEOROLOGICAL_SIMULATION",
            "isLive": False,
        }

        self.iot = {
            "temp": 21.0,
            "humidity": 55.0,
            "gas": 240,
            "airQualityStatus": "GOOD",
            "mqttBroker": "broker.hivemq.com",
            "mqttTopic": "drone/disaster/telemetry",
            "connected": True,
            "lastBroadcast": now_iso(),
        }
        self.mqtt_live = False
        self.mqtt_last_message = None
        self.location_locked = False

        # AI + risk start neutral; real values arrive via /api/ai/analyze
        # and /predict/risk.
        self.ai_latest = {
            "detected": False,
            "confidence": 0.0,
            "affected_area": 0.0,
            "model": "FALCON-SegFormer",
            "timestamp": now_iso(),
            "inferenceTimeMs": 0,
            "temporalStatus": "NONE",
            "consecutiveFramesDetected": 0,
            "detections": [],
        }

        self.risk = {
            "score": 12,
            "level": "SAFE",
            "trend": "STABLE",
            "components": {
                "ai": 0.0,
                "rainfall": 0.1,
                "soil_moisture": 0.2,
                "ground_movement": 0.05,
                "pore_pressure": 0.1,
            },
            "lastUpdated": now_iso(),
        }

        self.alerts = []
        self.system_health = {
            "camera": "ONLINE",
            "aiEngine": "ONLINE",
            "sensorGateway": "ONLINE",
            "gps": "ONLINE",
            "weatherApi": "DEGRADED",
            "backend": "ONLINE",
            "database": "ONLINE",
            "websocket": "ONLINE",
            "mqttBroker": "ONLINE",
        }

    # ------------------------------------------------------------------
    # Simulation tick (drone patrol + sensor jitter). Called periodically.
    # ------------------------------------------------------------------
    def tick(self):
        t = time.time() - self.start_time

        # Keep the browser-provided location fixed; otherwise animate the demo patrol.
        if not self.location_locked:
            angle = (t / 15.0) % (2 * math.pi)
            radius = 0.0035
            self.drone["latitude"] = round(27.9142 + math.sin(angle) * radius, 5)
            self.drone["longitude"] = round(85.8456 + math.cos(angle) * radius, 5)
            self.drone["heading"] = round((math.degrees(angle) + 90) % 360)
        self.drone["altitude"] = round(1420 + math.sin(t / 8.0) * 8)
        self.drone["streamFps"] = 24 + (1 if random.random() > 0.85 else 0)
        if random.random() < 0.02:
            self.drone["battery"] = max(15.0, round(self.drone["battery"] - 1, 1))

        # Geotechnical channels remain simulated until those sensors are connected.
        if not self.mqtt_live:
            self.sensors["soil_moisture"] = max(0.0, round(self.sensors["soil_moisture"] + random.uniform(-0.4, 0.4), 1))
            self.sensors["rainfall"] = max(0.0, round(self.sensors["rainfall"] + random.uniform(-0.5, 0.5), 1))
            self.sensors["ground_movement"] = max(0.0, round(self.sensors["ground_movement"] + random.uniform(-0.1, 0.1), 2))
            self.sensors["pore_pressure"] = max(0.0, round(self.sensors["pore_pressure"] + random.uniform(-0.3, 0.3), 1))
        self.sensors["lastUpdated"] = now_iso()

        # IoT values come from MQTT when the ESP32 is connected.
        if not self.mqtt_live:
            self.iot["temp"] = round(self.iot["temp"] + random.uniform(-0.1, 0.1), 1)
            self.iot["humidity"] = round(self.iot["humidity"] + random.uniform(-0.2, 0.2), 1)
            self.iot["gas"] = max(100, min(900, round(self.iot["gas"] + random.uniform(-3, 3))))
        self.iot["lastBroadcast"] = now_iso()

        self.recompute_risk()

    def ingest_mqtt_payload(self, payload: dict):
        """Apply the ESP32 DHT11/MQ gas payload to live system state."""
        temp = float(payload["temp"])
        humidity = float(payload["humidity"])
        gas = int(payload["gas"])
        timestamp = now_iso()

        self.iot.update({
            "temp": round(temp, 1),
            "humidity": round(humidity, 1),
            "gas": max(0, gas),
            "connected": True,
            "lastBroadcast": timestamp,
        })
        self.weather.update({
            "temperature": round(temp, 1),
            "humidity": round(humidity, 1),
            "source": "ESP32 DHT11",
            "isLive": True,
            "lastSynced": timestamp,
        })
        self.mqtt_live = True
        self.mqtt_last_message = timestamp
        self.system_health["mqttBroker"] = "ONLINE"
        self.system_health["sensorGateway"] = "ONLINE"
        self.recompute_risk()

    def set_location(self, latitude: float, longitude: float):
        self.drone["latitude"] = round(latitude, 6)
        self.drone["longitude"] = round(longitude, 6)
        self.location_locked = True

    # ------------------------------------------------------------------
    def sensors_with_status(self):
        s = self.sensors
        return {
            "soil_moisture": s["soil_moisture"],
            "soil_moisture_status": status_for(s["soil_moisture"], 45, 65, 85),
            "rainfall": s["rainfall"],
            "rainfall_status": status_for(s["rainfall"], 15, 35, 60),
            "ground_movement": s["ground_movement"],
            "ground_movement_status": status_for(s["ground_movement"], 3, 8, 15),
            "pore_pressure": s["pore_pressure"],
            "pore_pressure_status": status_for(s["pore_pressure"], 20, 40, 60),
            "lastUpdated": s["lastUpdated"],
        }

    def recompute_risk(self):
        """Fuse the latest AI confidence with live sensor readings.

        Weighting mirrors the frontend's own heuristic (utils/risk.ts) so
        the score means the same thing whether it's computed client-side
        or served by the backend:
        AI 35% / ground movement 30% / rainfall 15% / soil moisture 10% / pore pressure 10%
        """
        ai_component = self.ai_latest.get("confidence", 0.0) if self.ai_latest.get("detected") else self.ai_latest.get("confidence", 0.0) * 0.3
        rainfall_component = min(1.0, self.sensors["rainfall"] / 60.0)
        soil_component = min(1.0, self.sensors["soil_moisture"] / 100.0)
        movement_component = min(1.0, self.sensors["ground_movement"] / 15.0)
        pore_component = min(1.0, self.sensors["pore_pressure"] / 60.0)

        components = {
            "ai": round(ai_component, 3),
            "rainfall": round(rainfall_component, 3),
            "soil_moisture": round(soil_component, 3),
            "ground_movement": round(movement_component, 3),
            "pore_pressure": round(pore_component, 3),
        }

        raw_score = (
            components["ai"] * 35
            + components["ground_movement"] * 30
            + components["rainfall"] * 15
            + components["soil_moisture"] * 10
            + components["pore_pressure"] * 10
        )
        score = max(0, min(100, round(raw_score)))

        if score > 75:
            level = "VERY_HIGH"
        elif score > 50:
            level = "HIGH"
        elif score > 25:
            level = "MONITOR"
        else:
            level = "SAFE"

        prev_score = self.risk.get("score", score)
        trend = "INCREASING" if score > prev_score else "DECREASING" if score < prev_score else "STABLE"

        self.risk = {
            "score": score,
            "level": level,
            "trend": trend,
            "components": components,
            "lastUpdated": now_iso(),
        }

    def push_alert(self, level, title, message):
        alert = {
            "id": f"alert-{int(time.time() * 1000)}",
            "timestamp": now_iso(),
            "level": level,
            "title": title,
            "message": message,
            "location": {
                "lat": self.drone["latitude"],
                "lon": self.drone["longitude"],
                "name": "Sindhupalchok Escarpment Monitoring Zone",
            },
            "metrics": {
                "aiConfidence": self.ai_latest.get("confidence"),
                "affectedArea": self.ai_latest.get("affected_area"),
                "groundMovement": self.sensors["ground_movement"],
                "rainfall": self.sensors["rainfall"],
                "soilMoisture": self.sensors["soil_moisture"],
                "riskScore": self.risk["score"],
            },
            "acknowledged": False,
            "temporalConfidence": self.ai_latest.get("temporalStatus", "NONE"),
        }
        self.alerts.insert(0, alert)
        self.alerts = self.alerts[:100]
        return alert

    def to_ws_message(self):
        return {
            "timestamp": now_iso(),
            "drone": {
                "id": self.drone["id"],
                "battery": self.drone["battery"],
                "latitude": self.drone["latitude"],
                "longitude": self.drone["longitude"],
                "altitude": self.drone["altitude"],
                "speed": self.drone["speed"],
                "heading": self.drone["heading"],
            },
            "ai": {
                "model": self.ai_latest.get("model"),
                "detected": self.ai_latest.get("detected"),
                "confidence": self.ai_latest.get("confidence"),
                "affected_area": self.ai_latest.get("affected_area"),
            },
            "sensors": {
                "soil_moisture": self.sensors["soil_moisture"],
                "rainfall": self.sensors["rainfall"],
                "ground_movement": self.sensors["ground_movement"],
                "pore_pressure": self.sensors["pore_pressure"],
            },
            "weather": {
                "temperature": self.weather["temperature"],
                "humidity": self.weather["humidity"],
                "wind_speed": self.weather["wind_speed"],
                "rainfall": self.weather["rainfall"],
                "pressure": self.weather["pressure"],
            },
            "risk": {
                "score": self.risk["score"],
                "level": self.risk["level"],
            },
            "iotPayload": {
                "temp": self.iot["temp"],
                "humidity": self.iot["humidity"],
                "gas": self.iot["gas"],
                "connected": self.mqtt_live,
                "lastBroadcast": self.iot["lastBroadcast"],
            },
        }


state = SystemState()
