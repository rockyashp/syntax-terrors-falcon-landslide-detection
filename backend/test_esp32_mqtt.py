"""
FALCON ESP32 MQTT Live Diagnostic & Telemetry Inspector
Use this standalone tool to verify if your ESP32 board is successfully
publishing sensor telemetry over MQTT without needing the main web backend running.
"""

import os
import sys
import time
import json
import re
import warnings
from datetime import datetime

warnings.filterwarnings("ignore")

# Configure stdout for safe printing on Windows terminal
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

try:
    import paho.mqtt.client as mqtt
except ImportError:
    print("[ERROR] 'paho-mqtt' library not found. Run:")
    print("        pip install paho-mqtt")
    sys.exit(1)

# Load configuration from .env if present
env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
if os.path.exists(env_path):
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip())

MQTT_BROKER = os.getenv("MQTT_BROKER", "broker.hivemq.com")
MQTT_PORT = int(os.getenv("MQTT_PORT", 1883))
MQTT_TOPIC = os.getenv("MQTT_TOPIC", "drone/disaster/telemetry")
MQTT_USERNAME = os.getenv("MQTT_USERNAME", "")
MQTT_PASSWORD = os.getenv("MQTT_PASSWORD", "")

message_count = 0
start_time = time.time()


def print_banner():
    print("=" * 70)
    print("   [FALCON] ESP32 SENSOR TELEMETRY LIVE MONITOR")
    print("=" * 70)
    print(f" Broker  : {MQTT_BROKER}:{MQTT_PORT}")
    print(f" Topic   : {MQTT_TOPIC}")
    print(f" Status  : Connecting...")
    print("=" * 70)
    print("Listening for incoming ESP32 packets. Press Ctrl+C to stop.\n")


def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print(f"[OK CONNECTED] Subscribed to topic: '{MQTT_TOPIC}'")
        print("Waiting for ESP32 data packet...\n" + "-" * 70)
        client.subscribe(MQTT_TOPIC)
    else:
        print(f"[ERROR] Connection failed with code: {rc}")


def on_message(client, userdata, msg):
    global message_count
    message_count += 1
    now = datetime.now().strftime("%H:%M:%S")

    raw_bytes = msg.payload
    raw_str = raw_bytes.decode("utf-8", errors="replace").strip()

    print(f"\n[PACKET #{message_count} received at {now}]")
    print(f"  * Raw Topic   : {msg.topic}")
    print(f"  * Raw Payload : {raw_str}")

    # Inspect JSON & Sensor fields
    temp_val = None
    hum_val = None
    gas_val = None
    is_valid_json = False

    try:
        data = json.loads(raw_str)
        is_valid_json = True
        temp_val = data.get("temp")
        hum_val = data.get("humidity")
        gas_val = data.get("gas")
    except Exception:
        # Fallback regex inspection
        t_m = re.search(r'["\']?temp["\']?\s*:\s*([0-9.-]+|nan|null)', raw_str, re.I)
        h_m = re.search(r'["\']?humidity["\']?\s*:\s*([0-9.-]+|nan|null)', raw_str, re.I)
        g_m = re.search(r'["\']?gas["\']?\s*:\s*([0-9.-]+|nan|null)', raw_str, re.I)

        if t_m: temp_val = t_m.group(1)
        if h_m: hum_val = h_m.group(1)
        if g_m: gas_val = g_m.group(1)

    print("  * Parsed Sensor Values:")

    # Temperature Status
    if temp_val is not None and str(temp_val).lower() not in ("nan", "none", "null"):
        print(f"    [TEMP] Temperature : {temp_val} C  [OK]")
    else:
        print(f"    [TEMP] Temperature : {temp_val}  [WARNING: SENSOR READ FAILURE / NAN]")

    # Humidity Status
    if hum_val is not None and str(hum_val).lower() not in ("nan", "none", "null"):
        print(f"    [HUM ] Humidity    : {hum_val} %   [OK]")
    else:
        print(f"    [HUM ] Humidity    : {hum_val}  [WARNING: SENSOR READ FAILURE / NAN]")

    # Gas Status
    if gas_val is not None and str(gas_val).lower() not in ("nan", "none", "null"):
        print(f"    [GAS ] Gas (Pin 34): {gas_val} ADC   [OK]")
    else:
        print(f"    [GAS ] Gas (Pin 34): {gas_val}  [WARNING: NO READING]")

    if not is_valid_json:
        print("  * JSON Format : [INVALID] (Contains unquoted 'nan' or syntax error)")
    else:
        print("  * JSON Format : [VALID JSON]")

    print("-" * 70)


def main():
    print_banner()

    client_id = f"falcon-tester-{int(time.time())}"
    client = mqtt.Client(client_id=client_id)

    if MQTT_USERNAME:
        client.username_pw_set(MQTT_USERNAME, MQTT_PASSWORD)

    client.on_connect = on_connect
    client.on_message = on_message

    try:
        client.connect(MQTT_BROKER, MQTT_PORT, keepalive=60)
        client.loop_forever()
    except KeyboardInterrupt:
        print("\n\n" + "=" * 70)
        print(f"Stopped monitoring. Total packets received: {message_count}")
        print("=" * 70)
    except Exception as e:
        print(f"\n[ERROR]: {e}")


if __name__ == "__main__":
    main()
