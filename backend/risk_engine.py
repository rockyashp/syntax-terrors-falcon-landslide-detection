"""
FALCON Hierarchical Non-Linear Risk Engine & Fusion Architecture.

Architecture:
1. Topographic Gating: Non-linear slope modifier (G(theta)) suppressing false alarms on flat terrain.
2. Continuous Geotechnical ML Inference: Evaluates in-situ IoT telemetry & weather with the trained XGBoost model.
3. Fail-Safe Physical Overrides: Hard triggers for active shear displacement (>8mm) or critical pore pressure (>50kPa).
4. Adaptive Vision Fusion: Dynamically scales vision weighting (0% - 45%) based on temporal confirmation and camera availability.
"""

from typing import Any, Dict, List, Optional


def calculate_slope_gate(slope_degrees: float = 32.0) -> float:
    """Calculates non-linear topographic slope gating factor G(theta).
    Landslides physically require a slope gradient to overcome internal shear resistance.
    """
    if slope_degrees < 15.0:
        # Flat or low-angle terrain: landslide risk is heavily gated
        return max(0.08, (slope_degrees / 15.0) * 0.20)
    elif slope_degrees <= 45.0:
        # Critical transitional gradient
        return slope_degrees / 45.0
    else:
        # Steep escarpment
        return 1.0


def calculate_geotechnical_risk(
    sensor_data: Dict[str, Any],
    numerical_model: Optional[Any] = None,
    slope: float = 32.0,
    vegetation: float = 0.45,
) -> Dict[str, Any]:
    """Computes geotechnical slope hazard incorporating XGBoost inference,
    slope gating, and physical limit overrides.
    """
    rainfall = float(sensor_data.get("rainfall", 0.0))
    soil_moisture = float(sensor_data.get("soil_moisture", 0.0))
    ground_movement = float(sensor_data.get("ground_movement", 0.0))
    pore_pressure = float(sensor_data.get("pore_pressure", 0.0))
    temperature = float(sensor_data.get("temperature", 21.0))
    humidity = float(sensor_data.get("humidity", 55.0))

    slope_gate = calculate_slope_gate(slope)
    overrides: List[str] = []

    # 1. Base Geotechnical Prediction via Trained XGBoost Model if loaded
    if numerical_model is not None:
        try:
            model_payload = {
                "rainfall": rainfall,
                "vegetation": vegetation,
                "slope": slope,
                "soil_saturation": soil_moisture,
                "temperature": temperature,
                "humidity": humidity,
                "soil_moisture": soil_moisture,
            }
            pred = numerical_model.predict(model_payload)
            base_ml_prob = float(pred.get("high_risk_probability", 0.0))
            raw_score = base_ml_prob * 100.0
        except Exception:
            # Fallback if model prediction fails
            raw_score = _heuristic_geotechnical_score(rainfall, soil_moisture, ground_movement, pore_pressure)
            base_ml_prob = raw_score / 100.0
    else:
        raw_score = _heuristic_geotechnical_score(rainfall, soil_moisture, ground_movement, pore_pressure)
        base_ml_prob = raw_score / 100.0

    # 2. Apply Topographic Gating
    gated_score = raw_score * slope_gate

    # 3. Apply Critical Fail-Safe Physical Overrides
    # Active ground displacement (>8mm) indicates active shear surface failure regardless of slope
    if ground_movement >= 8.0:
        gated_score = max(gated_score, 85.0)
        overrides.append("ACTIVE_SHEAR_DISPLACEMENT")
    elif ground_movement >= 4.0 and slope >= 15.0:
        gated_score = max(gated_score, 60.0)
        overrides.append("ELEVATED_GROUND_MOVEMENT")

    # Critical hydrostatic pore water pressure (requires physical slope to induce slip)
    if slope >= 15.0:
        if pore_pressure >= 50.0:
            gated_score = max(gated_score, 80.0)
            overrides.append("CRITICAL_PORE_PRESSURE")
        elif pore_pressure >= 35.0:
            gated_score = max(gated_score, 55.0)
            overrides.append("HIGH_PORE_PRESSURE")

    # Compound antecedent precipitation saturation (only causes landslide slip on steep terrain >= 20 deg)
    if slope >= 20.0 and rainfall >= 45.0 and soil_moisture >= 75.0:
        gated_score = max(gated_score, 70.0)
        overrides.append("COMPOUND_PRECIPITATION_SATURATION")

    final_geo_score = max(0.0, min(100.0, gated_score))

    return {
        "geotechnical_score": round(final_geo_score, 2),
        "raw_ml_probability": round(base_ml_prob, 4),
        "slope_gate": round(slope_gate, 3),
        "slope_degrees": slope,
        "overrides_applied": overrides,
        "components": {
            "ground_movement_factor": round(min(1.0, ground_movement / 15.0), 3),
            "rainfall_factor": round(min(1.0, rainfall / 60.0), 3),
            "soil_moisture_factor": round(min(1.0, soil_moisture / 100.0), 3),
            "pore_pressure_factor": round(min(1.0, pore_pressure / 60.0), 3),
        },
    }


def _heuristic_geotechnical_score(
    rainfall: float,
    soil_moisture: float,
    ground_movement: float,
    pore_pressure: float,
) -> float:
    """Non-linear fallback geotechnical approximation when ML package is not available."""
    m_norm = min(1.0, ground_movement / 15.0)
    r_norm = min(1.0, rainfall / 60.0)
    p_norm = min(1.0, pore_pressure / 60.0)
    s_norm = min(1.0, soil_moisture / 100.0)

    # Compound non-linear moisture-pore interaction
    compound_saturation = s_norm * 0.4 + p_norm * 0.3 + r_norm * 0.3

    return (m_norm * 45.0 + compound_saturation * 55.0)


def calculate_final_risk(
    image_result: Dict[str, Any],
    numerical_result: Dict[str, Any],
    temporal_status: str = "NONE",
    camera_online: bool = True,
    slope: float = 32.0,
) -> Dict[str, Any]:
    """Composite multi-modal fusion combining visual segmentation and geotechnical sensing.
    Dynamically scales the vision weighting based on temporal confirmation and availability.
    """
    # 1. Determine Visual Confidence
    img_conf = float(image_result.get("max_probability") or image_result.get("confidence") or 0.0)
    area_percent = float(image_result.get("landslide_area_percent") or (image_result.get("affected_area", 0.0) * 100))
    detected = bool(image_result.get("detected", False) or (area_percent >= 5.0 and img_conf >= 0.40))

    # 2. Determine Dynamic Vision Weight
    if not camera_online:
        w_vision = 0.0
    elif detected and temporal_status == "CONFIRMED_DETECTION":
        w_vision = 0.45
    elif detected and temporal_status == "SINGLE_FRAME_POSSIBLE":
        w_vision = 0.30
    elif detected:
        w_vision = 0.25
    else:
        # Camera is streaming but no scarp detected
        w_vision = 0.05

    w_geo = 1.0 - w_vision

    # 3. Extract Geotechnical Score
    if "geotechnical_score" in numerical_result:
        geo_score = float(numerical_result["geotechnical_score"])
    elif "high_risk_probability" in numerical_result:
        geo_score = float(numerical_result["high_risk_probability"]) * 100.0
        # Apply slope gate
        geo_score = geo_score * calculate_slope_gate(slope)
    else:
        geo_score = 15.0

    # 4. Compute Fused Score
    img_score_pct = img_conf * 100.0 if detected else img_conf * 30.0
    fused_score = (w_vision * img_score_pct) + (w_geo * geo_score)

    # If physical hard overrides exist in numerical analysis, retain minimum critical threshold
    overrides = numerical_result.get("overrides_applied", [])
    if "ACTIVE_SHEAR_DISPLACEMENT" in overrides:
        fused_score = max(fused_score, 85.0)
    elif "CRITICAL_PORE_PRESSURE" in overrides:
        fused_score = max(fused_score, 75.0)

    score = max(0.0, min(100.0, round(fused_score, 2)))

    # 5. Risk Classification
    if score >= 75.0:
        level = "CRITICAL"
    elif score >= 50.0:
        level = "HIGH"
    elif score >= 25.0:
        level = "MODERATE"
    else:
        level = "SAFE"

    return {
        "final_score": score,
        "risk_level": level,
        "weights": {
            "vision_weight": round(w_vision, 2),
            "geotechnical_weight": round(w_geo, 2),
        },
        "vision_subscore": round(img_score_pct, 2),
        "geotechnical_subscore": round(geo_score, 2),
        "temporal_status": temporal_status,
        "overrides_applied": overrides,
    }