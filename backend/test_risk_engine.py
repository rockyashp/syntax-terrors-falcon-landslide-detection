import os
import sys

backend_dir = os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", "..", "d:", "Projects", "New folder (2)", "landslideguard-ai-final", "backend")
if not os.path.exists(backend_dir):
    backend_dir = r"d:\Projects\New folder (2)\landslideguard-ai-final\backend"
sys.path.insert(0, backend_dir)

from numerical_model import FALCONNumericalModel
from risk_engine import calculate_geotechnical_risk, calculate_final_risk, calculate_slope_gate

print("=" * 70)
print("FALCON HIERARCHICAL RISK ENGINE: COMPREHENSIVE TEST SUITE")
print("=" * 70)

# 1. Load Trained Numerical Model
model_path = os.path.join(backend_dir, "models", "numerical", "FALCON_hybrid_landslide_model.pkl")
numerical_model = None
if os.path.exists(model_path):
    try:
        numerical_model = FALCONNumericalModel(model_path)
        print("Loaded FALCON Numerical Model successfully.\n")
    except Exception as e:
        print(f"Failed to load numerical model: {e}\n")
else:
    print("Numerical model file not found; testing heuristic fallback.\n")

# Test Cases Definition
test_cases = [
    {
        "name": "1. Baseline Calm / Safe Condition",
        "description": "Sunny day, dry soil, gentle slope (20 deg), zero movement",
        "sensors": {
            "rainfall": 2.0,
            "soil_moisture": 25.0,
            "ground_movement": 0.2,
            "pore_pressure": 5.0,
            "temperature": 22.0,
            "humidity": 45.0,
        },
        "slope": 20.0,
        "image": {"detected": False, "confidence": 0.05, "landslide_area_percent": 0.0},
        "temporal": "NONE",
        "camera_online": True,
        "expected_level": ["SAFE"],
    },
    {
        "name": "2. Topographic Slope Gating (Heavy Rain on Flat Land)",
        "description": "50mm storm on flat terrain (5 deg) with no ground movement -> Should NOT false-alarm",
        "sensors": {
            "rainfall": 50.0,
            "soil_moisture": 80.0,
            "ground_movement": 0.5,
            "pore_pressure": 15.0,
            "temperature": 18.0,
            "humidity": 90.0,
        },
        "slope": 5.0,
        "image": {"detected": False, "confidence": 0.10, "landslide_area_percent": 0.0},
        "temporal": "NONE",
        "camera_online": True,
        "expected_level": ["SAFE", "MODERATE"],
    },
    {
        "name": "3. Dangerous Geotechnical Saturation on Steep Escarpment",
        "description": "45mm rainfall on 42 deg slope with high soil saturation and pore pressure",
        "sensors": {
            "rainfall": 48.0,
            "soil_moisture": 82.0,
            "ground_movement": 3.2,
            "pore_pressure": 38.0,
            "temperature": 16.0,
            "humidity": 95.0,
        },
        "slope": 42.0,
        "image": {"detected": False, "confidence": 0.15, "landslide_area_percent": 0.0},
        "temporal": "NONE",
        "camera_online": True,
        "expected_level": ["HIGH", "CRITICAL"],
    },
    {
        "name": "4. Physical Safety Override (Active Shear Displacement)",
        "description": "Extensometer detects 9.5 mm movement during modest rain -> Hard fail-safe override to >=85%",
        "sensors": {
            "rainfall": 15.0,
            "soil_moisture": 45.0,
            "ground_movement": 9.5,
            "pore_pressure": 18.0,
            "temperature": 20.0,
            "humidity": 60.0,
        },
        "slope": 35.0,
        "image": {"detected": False, "confidence": 0.10, "landslide_area_percent": 0.0},
        "temporal": "NONE",
        "camera_online": True,
        "expected_level": ["CRITICAL"],
    },
    {
        "name": "5. Physical Safety Override (Critical Pore Pressure)",
        "description": "Pore water pressure spikes to 54.0 kPa -> Hard fail-safe override to >=75%",
        "sensors": {
            "rainfall": 20.0,
            "soil_moisture": 60.0,
            "ground_movement": 1.5,
            "pore_pressure": 54.0,
            "temperature": 19.0,
            "humidity": 70.0,
        },
        "slope": 32.0,
        "image": {"detected": False, "confidence": 0.08, "landslide_area_percent": 0.0},
        "temporal": "NONE",
        "camera_online": True,
        "expected_level": ["CRITICAL", "HIGH"],
    },
    {
        "name": "6. Confirmed Visual Detection + Moderate Geotechnical Risk",
        "description": "Drone SegFormer confirms landslide scarp across 2+ consecutive frames (conf 0.92)",
        "sensors": {
            "rainfall": 25.0,
            "soil_moisture": 55.0,
            "ground_movement": 2.1,
            "pore_pressure": 22.0,
            "temperature": 18.0,
            "humidity": 75.0,
        },
        "slope": 36.0,
        "image": {"detected": True, "confidence": 0.92, "landslide_area_percent": 24.5},
        "temporal": "CONFIRMED_DETECTION",
        "camera_online": True,
        "expected_level": ["CRITICAL", "HIGH"],
    },
    {
        "name": "7. Degraded Sensor / Camera Offline Operation (Night / Fog)",
        "description": "Camera offline, risk engine automatically adapts to 100% geotechnical weighting",
        "sensors": {
            "rainfall": 40.0,
            "soil_moisture": 70.0,
            "ground_movement": 3.0,
            "pore_pressure": 30.0,
            "temperature": 15.0,
            "humidity": 85.0,
        },
        "slope": 38.0,
        "image": {"detected": False, "confidence": 0.0, "landslide_area_percent": 0.0},
        "temporal": "NONE",
        "camera_online": False,
        "expected_level": ["HIGH", "MODERATE", "CRITICAL"],
    },
]

passed_count = 0
for tc in test_cases:
    print(f"--- Running Test: {tc['name']} ---")
    print(f"Scenario: {tc['description']}")
    
    geo = calculate_geotechnical_risk(
        sensor_data=tc["sensors"],
        numerical_model=numerical_model,
        slope=tc["slope"],
    )
    
    final = calculate_final_risk(
        image_result=tc["image"],
        numerical_result=geo,
        temporal_status=tc["temporal"],
        camera_online=tc["camera_online"],
        slope=tc["slope"],
    )
    
    score = final["final_score"]
    level = final["risk_level"]
    weights = final["weights"]
    overrides = final["overrides_applied"]
    
    print(f"Slope Gate: {geo['slope_gate']:.3f} | Geo Score: {geo['geotechnical_score']:.1f}%")
    print(f"Vision Weight: {weights['vision_weight']*100:.0f}% | Geo Weight: {weights['geotechnical_weight']*100:.0f}%")
    print(f"Overrides Triggered: {overrides if overrides else 'None'}")
    print(f"Final Score: {score:.2f}% | Final Level: {level}")
    
    if level in tc["expected_level"]:
        print("Result: PASSED\n")
        passed_count += 1
    else:
        print(f"Result: UNEXPECTED (Expected {tc['expected_level']}, got {level})\n")

print("=" * 70)
print(f"Summary: {passed_count}/{len(test_cases)} tests passed successfully.")
print("=" * 70)
