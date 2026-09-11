import {
  FalconNormalizedContext,
  AgentResponse,
  AgentMetricSummary,
  AgentPriority,
} from '../types/agent';
import { SensorTelemetry, RiskLevel } from '../types';

/**
 * FALCON AI Agent Service
 * Interprets real-time landslide telemetry, vision inference, geotechnical sensors,
 * and drone status to generate concise, human-readable operational intelligence briefings.
 * Inspired by JARVIS / FRIDAY — calm, precise, professional, actionable.
 */

// Helper to calculate metrics summary
export function extractMetricsSummary(context: FalconNormalizedContext): AgentMetricSummary {
  const sensors = context.sensors;
  const sensorList: { name: string; val: number; status?: string }[] = [
    { name: 'Soil Moisture', val: sensors.soil_moisture, status: sensors.soil_moisture_status },
    { name: 'Rainfall', val: sensors.rainfall, status: sensors.rainfall_status },
    { name: 'Ground Movement', val: sensors.ground_movement, status: sensors.ground_movement_status },
    { name: 'Pore Pressure', val: sensors.pore_pressure, status: sensors.pore_pressure_status },
  ];

  const warningCount = sensorList.filter((s) => s.status === 'WARNING').length;
  const criticalCount = sensorList.filter((s) => s.status === 'CRITICAL').length;
  const totalSensors = sensorList.length;
  const onlineCount = totalSensors - (criticalCount > 0 && sensors.lastUpdated ? 0 : 0); // Active sensors count

  return {
    riskScore: Math.round(context.risk.score),
    riskLevel: context.risk.level,
    riskTrend: context.risk.trend,
    aiConfidence: Math.round((context.aiAnalysis.confidence || 0) * 1000) / 10,
    aiDetected: context.aiAnalysis.detected,
    aiTemporalStatus: context.aiAnalysis.temporalStatus,
    droneBattery: Math.round(context.drone.battery),
    droneStatus: context.drone.status || 'ONLINE',
    droneGps: context.drone.gpsStatus || 'LOCKED',
    sensorHealthRatio: `${totalSensors - criticalCount}/${totalSensors}`,
    warningSensorsCount: warningCount,
    criticalSensorsCount: criticalCount,
    activeAlertsCount: context.unreadAlertsCount || context.alerts.filter((a) => !a.acknowledged).length,
  };
}

// Generate Priority Level
function calculatePriority(context: FalconNormalizedContext): AgentPriority {
  if (
    context.risk.level === 'CRITICAL' ||
    context.risk.level === 'VERY_HIGH' ||
    context.risk.score >= 75 ||
    (context.aiAnalysis.detected && context.aiAnalysis.confidence >= 0.85) ||
    context.unreadAlertsCount > 0
  ) {
    return 'critical';
  }
  if (
    context.risk.level === 'HIGH' ||
    context.risk.level === 'MODERATE' ||
    context.risk.score >= 35 ||
    context.sensors.soil_moisture_status === 'WARNING' ||
    context.sensors.rainfall_status === 'WARNING' ||
    context.sensors.ground_movement_status === 'WARNING'
  ) {
    return 'warning';
  }
  return 'normal';
}

/**
 * Generate the Main Situation Briefing from live context.
 */
export function generateSituationBriefing(
  context: FalconNormalizedContext,
  previousContext?: FalconNormalizedContext | null
): AgentResponse {
  const metrics = extractMetricsSummary(context);
  const priority = calculatePriority(context);
  const riskScore = metrics.riskScore;
  const riskLevel = metrics.riskLevel;
  const zoneName = context.location.name || 'target sector';

  // 1. Overall Status Summary
  let summary = '';
  if (riskScore >= 75 || riskLevel === 'CRITICAL' || riskLevel === 'VERY_HIGH') {
    summary = `CRITICAL ALERT: Elevated landslide hazard detected at ${zoneName}. Combined risk is at ${riskScore}%. Immediate operator review is advised.`;
  } else if (riskScore >= 50 || riskLevel === 'HIGH') {
    summary = `FALCON reports a HIGH landslide risk at ${zoneName}. Combined probability is ${riskScore}% with active environmental and visual indicators.`;
  } else if (riskScore >= 25 || riskLevel === 'MODERATE') {
    summary = `Monitoring conditions at ${zoneName} are showing MODERATE concern at ${riskScore}%. Baseline telemetry is stable with selective metric monitoring.`;
  } else {
    summary = `Monitoring at ${zoneName} is STABLE. Current landslide probability is ${riskScore}% (${riskLevel}), with all operational parameters within safe thresholds.`;
  }

  // 2. Risk Explanation
  let riskExplanation = '';
  const components = context.risk.components;
  if (riskScore >= 50) {
    const topContributors: string[] = [];
    if (context.aiAnalysis.detected && context.aiAnalysis.confidence > 0.5) {
      topContributors.push(`visual detection (${Math.round(context.aiAnalysis.confidence * 100)}% confidence)`);
    }
    if (context.sensors.soil_moisture > 50) {
      topContributors.push(`soil saturation (${context.sensors.soil_moisture.toFixed(1)}%)`);
    }
    if (context.sensors.rainfall > 15) {
      topContributors.push(`active precipitation (${context.sensors.rainfall.toFixed(1)} mm/h)`);
    }
    if (context.sensors.ground_movement > 3.0) {
      topContributors.push(`ground displacement (${context.sensors.ground_movement.toFixed(2)} mm)`);
    }

    if (topContributors.length > 0) {
      riskExplanation = `Risk elevated primarily by ${topContributors.join(', ')}. Geotechnical and optical weighting are active.`;
    } else {
      riskExplanation = `Overall risk is ${riskScore}%, classified as ${riskLevel} based on multi-parameter environmental fusion.`;
    }
  } else {
    riskExplanation = `Risk level is ${riskLevel} (${riskScore}%). Multi-sensor indices reflect normal geological equilibrium.`;
  }

  // 3. Vision Observation
  let visionObs = '';
  if (context.aiAnalysis.detected) {
    const confPercent = Math.round(context.aiAnalysis.confidence * 100);
    const areaPercent = Math.round(context.aiAnalysis.affected_area * 100);
    const tempStatus =
      context.aiAnalysis.temporalStatus === 'CONFIRMED_DETECTION'
        ? 'multi-frame confirmed'
        : 'single-frame potential';
    visionObs = `AI vision model detected a landslide-like terrain signature (${confPercent}% confidence, ${areaPercent}% frame coverage, ${tempStatus}).`;
  } else if (!context.cameraSettings.isLive && context.cameraSettings.sourceType !== 'SYNTHETIC_DEMO') {
    visionObs = 'Optical camera feed is currently offline; AI visual verification is in standby mode.';
  } else {
    visionObs = 'Optical terrain scan is clear. No active landslide slip-faces or scarp lines identified in recent frames.';
  }

  // 4. Sensor Condition Observation
  let sensorObs = '';
  const sensorDetails: string[] = [];
  if (context.sensors.soil_moisture_status === 'CRITICAL' || context.sensors.soil_moisture > 75) {
    sensorDetails.push(`soil moisture critical at ${context.sensors.soil_moisture.toFixed(1)}%`);
  } else if (context.sensors.soil_moisture > 45) {
    sensorDetails.push(`soil moisture elevated at ${context.sensors.soil_moisture.toFixed(1)}%`);
  } else {
    sensorDetails.push(`soil moisture nominal (${context.sensors.soil_moisture.toFixed(1)}%)`);
  }

  if (context.sensors.rainfall > 20) {
    sensorDetails.push(`heavy precipitation (${context.sensors.rainfall.toFixed(1)} mm/h)`);
  } else if (context.sensors.rainfall > 5) {
    sensorDetails.push(`moderate rainfall (${context.sensors.rainfall.toFixed(1)} mm/h)`);
  } else {
    sensorDetails.push(`rainfall light (${context.sensors.rainfall.toFixed(1)} mm/h)`);
  }

  if (context.sensors.ground_movement > 3.0) {
    sensorDetails.push(`ground displacement active (${context.sensors.ground_movement.toFixed(2)} mm)`);
  }

  sensorObs = sensorDetails.join(' · ') + '.';

  // 5. Drone & Location Observation
  let droneObs = '';
  const droneId = context.drone.id || 'DRONE-01';
  const battery = Math.round(context.drone.battery);
  const alt = Math.round(context.drone.altitude);
  const gps = context.drone.gpsStatus || 'LOCKED';
  droneObs = `${droneId} is online with ${gps} GPS at ${alt}m altitude (${battery}% battery). Actively streaming telemetry.`;

  // 6. Actionable Recommendation
  let recommendation = '';
  if (riskScore >= 75 || context.aiAnalysis.detected) {
    recommendation =
      'Recommend immediate visual inspection of the latest captured frame, verifying ground displacement sensors, and notifying the field response unit if confirmed.';
  } else if (riskScore >= 50 || context.sensors.soil_moisture > 60) {
    recommendation =
      'Recommend continuous aerial surveillance over the escarpment sector and monitoring soil moisture and pore pressure trends closely.';
  } else if (metrics.activeAlertsCount > 0) {
    recommendation =
      'Review pending system alerts in the alerts queue to acknowledge cleared and unresolved notices.';
  } else {
    recommendation =
      'Maintain standard autonomous flight patrol and scheduled multi-spectral sensor polling.';
  }

  // Delta Summary if previous context is available
  let deltaSummary: string | undefined = undefined;
  if (previousContext) {
    const delta = computeContextDelta(context, previousContext);
    if (delta.hasChanged) {
      deltaSummary = delta.summary;
    }
  }

  // List of observations
  const observations: string[] = [visionObs, sensorObs, droneObs];
  if (context.weather.wind_speed > 35) {
    observations.push(`High wind advisory: ${context.weather.wind_speed.toFixed(1)} km/h.`);
  }
  if (metrics.activeAlertsCount > 0) {
    observations.push(`${metrics.activeAlertsCount} unacknowledged alert(s) logged in system.`);
  }

  return {
    id: `briefing-${Date.now()}`,
    title: 'Current Situation Briefing',
    summary,
    riskExplanation,
    visionObservation: visionObs,
    sensorObservation: sensorObs,
    droneObservation: droneObs,
    observations,
    recommendation,
    priority,
    timestamp: new Date().toISOString(),
    contextPage: context.currentPage,
    metrics,
    deltaSummary,
  };
}

/**
 * Compare Current Context against Previous Context to determine "What Changed?".
 */
export function computeContextDelta(
  current: FalconNormalizedContext,
  previous: FalconNormalizedContext
): { hasChanged: boolean; summary: string; changes: string[] } {
  const changes: string[] = [];

  // 1. Risk change
  const riskDiff = Math.round(current.risk.score - previous.risk.score);
  if (Math.abs(riskDiff) >= 2) {
    const dir = riskDiff > 0 ? 'increased' : 'decreased';
    const sign = riskDiff > 0 ? `+${riskDiff}` : `${riskDiff}`;
    changes.push(
      `Landslide risk ${dir} from ${Math.round(previous.risk.score)}% to ${Math.round(
        current.risk.score
      )}% (${sign}%).`
    );
  } else if (current.risk.level !== previous.risk.level) {
    changes.push(`Risk classification shifted from ${previous.risk.level} to ${current.risk.level}.`);
  }

  // 2. AI Detection change
  if (current.aiAnalysis.detected !== previous.aiAnalysis.detected) {
    if (current.aiAnalysis.detected) {
      const conf = Math.round(current.aiAnalysis.confidence * 100);
      changes.push(`AI vision model triggered a new landslide detection at ${conf}% confidence.`);
    } else {
      changes.push('AI vision model reports terrain has cleared back to safe status.');
    }
  } else if (
    current.aiAnalysis.detected &&
    Math.abs(current.aiAnalysis.confidence - previous.aiAnalysis.confidence) >= 0.05
  ) {
    const prevConf = Math.round(previous.aiAnalysis.confidence * 100);
    const currConf = Math.round(current.aiAnalysis.confidence * 100);
    changes.push(`AI detection confidence shifted from ${prevConf}% to ${currConf}%.`);
  }

  // 3. Sensor changes
  const soilDiff = current.sensors.soil_moisture - previous.sensors.soil_moisture;
  if (Math.abs(soilDiff) >= 3.0) {
    const dir = soilDiff > 0 ? 'rose' : 'dropped';
    changes.push(
      `Soil moisture ${dir} by ${Math.abs(soilDiff).toFixed(1)}% (now ${current.sensors.soil_moisture.toFixed(1)}%).`
    );
  }

  const rainDiff = current.sensors.rainfall - previous.sensors.rainfall;
  if (Math.abs(rainDiff) >= 2.5) {
    const dir = rainDiff > 0 ? 'increased' : 'decreased';
    changes.push(
      `Precipitation rate ${dir} to ${current.sensors.rainfall.toFixed(1)} mm/h.`
    );
  }

  const moveDiff = current.sensors.ground_movement - previous.sensors.ground_movement;
  if (Math.abs(moveDiff) >= 0.5) {
    changes.push(
      `Ground displacement shifted by ${moveDiff > 0 ? '+' : ''}${moveDiff.toFixed(2)} mm.`
    );
  }

  // 4. Alert changes
  if (current.alerts.length > previous.alerts.length) {
    const newCount = current.alerts.length - previous.alerts.length;
    changes.push(`${newCount} new disaster event alert(s) registered.`);
  }

  // 5. Drone & Camera changes
  if (current.drone.battery !== previous.drone.battery && Math.abs(current.drone.battery - previous.drone.battery) >= 5) {
    changes.push(`Drone battery adjusted to ${Math.round(current.drone.battery)}%.`);
  }

  if (changes.length === 0) {
    return {
      hasChanged: false,
      summary: 'Telemetry is stable. No significant parameter shifts detected in recent cycles.',
      changes: ['All environmental and vision metrics are operating within steady baseline tolerances.'],
    };
  }

  return {
    hasChanged: true,
    summary: `Since the previous update: ${changes.slice(0, 2).join(' ')}`,
    changes,
  };
}

/**
 * Handle Operator Questions using Grounded Real-Time Telemetry (FRIDAY/JARVIS style).
 */
export function answerOperatorQuestion(
  question: string,
  context: FalconNormalizedContext,
  previousContext?: FalconNormalizedContext | null
): AgentResponse {
  const q = question.toLowerCase().trim();
  const metrics = extractMetricsSummary(context);
  const priority = calculatePriority(context);
  const timestamp = new Date().toISOString();

  // Pattern matching for diverse operator queries

  // 1. "What changed?" / "Changes" / "Recent updates"
  if (
    q.includes('changed') ||
    q.includes('what happened') ||
    q.includes('recent update') ||
    q.includes('since last') ||
    q.includes('delta')
  ) {
    const delta = previousContext
      ? computeContextDelta(context, previousContext)
      : {
          hasChanged: false,
          summary: 'Telemetry is operating under steady-state baseline. No sudden variance recorded.',
          changes: [
            `Current risk is ${metrics.riskScore}% (${metrics.riskLevel}).`,
            `AI Vision status: ${metrics.aiDetected ? `Detected (${metrics.aiConfidence}%)` : 'Clear'}.`,
            `Sensors: Moisture ${context.sensors.soil_moisture.toFixed(1)}%, Rain ${context.sensors.rainfall.toFixed(1)} mm/h.`,
          ],
        };

    return {
      id: `ans-changed-${Date.now()}`,
      title: 'Telemetry Delta Analysis',
      summary: delta.summary,
      observations: delta.changes,
      recommendation: delta.hasChanged
        ? 'Evaluate if the observed shifts warrant an updated hazard assessment.'
        : 'Continue routine operational monitoring.',
      priority: delta.hasChanged ? 'warning' : 'normal',
      timestamp,
      sourceQuestion: question,
      metrics,
    };
  }

  // 2. "Why is risk high?" / "What is causing risk?" / "Risk explanation"
  if (
    q.includes('why is risk') ||
    q.includes('why risk') ||
    q.includes('causing the risk') ||
    q.includes('cause the risk') ||
    q.includes('risk high') ||
    q.includes('risk score') ||
    q.includes('risk level') ||
    q.includes('explain risk')
  ) {
    const topFactors: string[] = [];
    if (context.aiAnalysis.detected) {
      topFactors.push(
        `Visual Landslide Detection: AI model reports a ${Math.round(
          context.aiAnalysis.confidence * 100
        )}% confidence slip-face.`
      );
    }
    if (context.sensors.soil_moisture > 45) {
      topFactors.push(
        `Soil Saturation: Moisture is at ${context.sensors.soil_moisture.toFixed(
          1
        )}% (${context.sensors.soil_moisture_status || 'ELEVATED'}), reducing shear strength.`
      );
    }
    if (context.sensors.rainfall > 10) {
      topFactors.push(
        `Precipitation Load: Active rainfall rate is ${context.sensors.rainfall.toFixed(
          1
        )} mm/h, driving pore pressure accumulation.`
      );
    }
    if (context.sensors.ground_movement > 2.0) {
      topFactors.push(
        `Subsurface Displacement: Ground movement is registering ${context.sensors.ground_movement.toFixed(
          2
        )} mm.`
      );
    }

    if (topFactors.length === 0) {
      topFactors.push('All geotechnical and visual indices are currently nominal.');
    }

    const summary =
      metrics.riskScore >= 50
        ? `The current risk score of ${metrics.riskScore}% (${metrics.riskLevel}) is driven by ${
            context.aiAnalysis.detected ? 'optical landslide confirmation combined with ' : ''
          }geotechnical saturation.`
        : `Current landslide risk is ${metrics.riskLevel} at ${metrics.riskScore}%. Baseline geological factors remain balanced.`;

    return {
      id: `ans-risk-${Date.now()}`,
      title: 'Risk Engine Breakdown',
      summary,
      riskExplanation: `Hybrid model fuses SegFormer optical weights (${context.risk.weights?.vision_weight ?? 0.5}) with geotechnical telemetry (${context.risk.weights?.geotechnical_weight ?? 0.5}).`,
      observations: topFactors,
      recommendation:
        metrics.riskScore >= 50
          ? 'Perform a targeted visual review of the slope scarp and track rainfall forecast over the next 6 hours.'
          : 'Normal patrol schedule is adequate.',
      priority,
      timestamp,
      sourceQuestion: question,
      metrics,
    };
  }

  // 3. "What did the camera detect?" / "Latest AI analysis" / "Visual detection" / "AI vision"
  if (
    q.includes('camera') ||
    q.includes('ai analysis') ||
    q.includes('image model') ||
    q.includes('segformer') ||
    q.includes('vision') ||
    q.includes('detect') ||
    q.includes('see') ||
    q.includes('frame') ||
    q.includes('snapshot')
  ) {
    let summary = '';
    const observations: string[] = [];

    if (context.aiAnalysis.detected) {
      const conf = Math.round(context.aiAnalysis.confidence * 100);
      const area = Math.round(context.aiAnalysis.affected_area * 100);
      summary = `The AI vision model has detected an active landslide hazard area covering approximately ${area}% of the target frame at ${conf}% confidence.`;
      observations.push(`Model: ${context.aiAnalysis.model || 'FALCON-SegFormer'}`);
      observations.push(`Temporal Verification: ${context.aiAnalysis.temporalStatus}`);
      observations.push(`Inference Speed: ${context.aiAnalysis.inferenceTimeMs}ms`);
      observations.push(`Consecutive Detections: ${context.aiAnalysis.consecutiveFramesDetected} frame(s)`);
    } else if (context.cameraSettings.isAnalyzing) {
      summary = 'FALCON vision pipeline is currently running inference on the latest captured frame.';
      observations.push('Deep learning segmentation in progress.');
    } else {
      summary = 'The optical analysis pipeline reports no active landslide slip faces in the current target view.';
      observations.push('Visual scan status: CLEAR');
      observations.push(`Model Architecture: ${context.aiAnalysis.model || 'FALCON-SegFormer'}`);
      observations.push('Terrain surface shows no catastrophic mass movement signatures.');
    }

    return {
      id: `ans-ai-${Date.now()}`,
      title: 'AI Vision Analysis',
      summary,
      observations,
      recommendation: context.aiAnalysis.detected
        ? 'Review the high-resolution snapshot in the Snapshots tab and inspect the bounding region.'
        : 'Maintain aerial visual coverage over designated slope coordinates.',
      priority: context.aiAnalysis.detected ? 'critical' : 'normal',
      timestamp,
      sourceQuestion: question,
      metrics,
    };
  }

  // 4. "Sensor status" / "Are sensors normal?" / "Soil moisture" / "Rainfall" / "IoT"
  if (
    q.includes('sensor') ||
    q.includes('soil') ||
    q.includes('rain') ||
    q.includes('moisture') ||
    q.includes('pore') ||
    q.includes('movement') ||
    q.includes('esp32') ||
    q.includes('iot') ||
    q.includes('telemetry')
  ) {
    const s = context.sensors;
    const summary = `Sensors are reporting: Soil Moisture at ${s.soil_moisture.toFixed(
      1
    )}% (${s.soil_moisture_status || 'SAFE'}), Rainfall at ${s.rainfall.toFixed(
      1
    )} mm/h (${s.rainfall_status || 'SAFE'}), Ground Movement at ${s.ground_movement.toFixed(
      2
    )} mm, and Pore Pressure at ${s.pore_pressure.toFixed(1)} kPa.`;

    const observations: string[] = [
      `Soil Moisture: ${s.soil_moisture.toFixed(1)}% [${s.soil_moisture_status || 'SAFE'}]`,
      `Rainfall Rate: ${s.rainfall.toFixed(1)} mm/h [${s.rainfall_status || 'SAFE'}]`,
      `Ground Displacement: ${s.ground_movement.toFixed(2)} mm [${s.ground_movement_status || 'SAFE'}]`,
      `Pore Water Pressure: ${s.pore_pressure.toFixed(1)} kPa [${s.pore_pressure_status || 'SAFE'}]`,
      `IoT Gateway: ${context.iotPayload.connected ? 'ESP32 MQTT Link Connected' : 'Simulated Telemetry'}`,
    ];

    return {
      id: `ans-sensors-${Date.now()}`,
      title: 'Geotechnical & Sensor Status',
      summary,
      observations,
      recommendation:
        s.soil_moisture > 65 || s.rainfall > 30
          ? 'Monitor saturation curve for potential liquefaction threshold crossings.'
          : 'Sensor readings are within standard operational envelope.',
      priority: s.soil_moisture_status === 'WARNING' || s.rainfall_status === 'WARNING' ? 'warning' : 'normal',
      timestamp,
      sourceQuestion: question,
      metrics,
    };
  }

  // 5. "Where is the drone?" / "Drone status" / "Battery" / "GPS"
  if (
    q.includes('drone') ||
    q.includes('where is') ||
    q.includes('uav') ||
    q.includes('battery') ||
    q.includes('altitude') ||
    q.includes('gps') ||
    q.includes('location') ||
    q.includes('flight')
  ) {
    const d = context.drone;
    const loc = context.location;
    const summary = `${d.id || 'DRONE-01'} (${d.name || 'FALCON Recon UAV'}) is ${
      d.status || 'ONLINE'
    } with ${d.gpsStatus || 'LOCKED'} GPS at ${Math.round(d.altitude)}m altitude. Battery is at ${Math.round(
      d.battery
    )}%.`;

    const observations: string[] = [
      `Coordinates: ${loc.lat.toFixed(4)}° N, ${loc.lon.toFixed(4)}° E (${loc.name})`,
      `Flight Telemetry: Speed ${d.speed.toFixed(1)} m/s, Heading ${Math.round(d.heading)}°`,
      `Battery Level: ${Math.round(d.battery)}% (estimated flight time ~38 min)`,
      `Camera Stream: ${d.cameraStatus || 'CONNECTED'} at ${d.streamFps || 24} FPS (${d.resolution || '4K'})`,
      `Network Link: ${d.network || '5G Ultra-Low Latency'}`,
    ];

    return {
      id: `ans-drone-${Date.now()}`,
      title: 'Drone & Navigation Status',
      summary,
      observations,
      recommendation:
        d.battery < 20
          ? 'Battery is low. Initiate return-to-launch (RTL) protocol.'
          : 'UAV stationkeeping is optimal for continued monitoring.',
      priority: d.battery < 25 ? 'warning' : 'normal',
      timestamp,
      sourceQuestion: question,
      metrics,
    };
  }

  // 6. "Active alerts" / "Alerts" / "Warnings"
  if (q.includes('alert') || q.includes('warning') || q.includes('emergency') || q.includes('incident')) {
    const unackAlerts = context.alerts.filter((a) => !a.acknowledged);
    const summary =
      unackAlerts.length > 0
        ? `There are currently ${unackAlerts.length} active unacknowledged alert(s) requiring operator attention.`
        : 'All historical alerts have been acknowledged. No active unresolved alerts at this time.';

    const observations =
      unackAlerts.length > 0
        ? unackAlerts.slice(0, 4).map((a) => `[${a.level}] ${a.title}: ${a.message}`)
        : ['Alert queue is clear.', 'System health is ONLINE.'];

    return {
      id: `ans-alerts-${Date.now()}`,
      title: 'Alert Queue Summary',
      summary,
      observations,
      recommendation:
        unackAlerts.length > 0
          ? 'Navigate to the Alerts page to review and acknowledge pending disaster notices.'
          : 'Continue standard system monitoring.',
      priority: unackAlerts.length > 0 ? 'warning' : 'normal',
      timestamp,
      sourceQuestion: question,
      metrics,
    };
  }

  // 7. "Should I be concerned?" / "Is there danger?" / "Recommendation" / "What should I do?"
  if (
    q.includes('concerned') ||
    q.includes('danger') ||
    q.includes('what should i do') ||
    q.includes('what to do') ||
    q.includes('recommend') ||
    q.includes('safe') ||
    q.includes('action') ||
    q.includes('protocol')
  ) {
    let summary = '';
    let recommendation = '';
    const observations: string[] = [];

    if (metrics.riskScore >= 70 || context.aiAnalysis.detected) {
      summary = `Caution warranted. Risk is elevated at ${metrics.riskScore}% (${metrics.riskLevel}) with optical landslide signatures detected.`;
      recommendation =
        'Execute immediate verification: inspect latest snapshot, verify soil pore pressure readings, and alert local disaster response coordinators if terrain displacement continues.';
      observations.push('High probability of active slope instability.');
      observations.push(`Visual confirmation: ${Math.round(context.aiAnalysis.confidence * 100)}% confidence.`);
    } else if (metrics.riskScore >= 40) {
      summary = `Moderate vigilance required. Current risk is ${metrics.riskScore}% (${metrics.riskLevel}). Conditions are stable but approaching advisory thresholds.`;
      recommendation =
        'Maintain close watch on precipitation rates and soil saturation over the next 2-4 hours.';
      observations.push('Soil moisture and rain rates are elevated.');
    } else {
      summary = `No immediate hazard detected. System is operating in nominal SAFE mode at ${metrics.riskScore}% risk.`;
      recommendation = 'Maintain regular monitoring parameters. No emergency intervention needed.';
      observations.push('All parameters within baseline limits.');
    }

    return {
      id: `ans-advice-${Date.now()}`,
      title: 'Operational Assessment & Advice',
      summary,
      observations,
      recommendation,
      priority,
      timestamp,
      sourceQuestion: question,
      metrics,
    };
  }

  // Default: General Situation Briefing tailored to query
  return generateSituationBriefing(context, previousContext);
}
