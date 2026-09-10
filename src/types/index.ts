/**
 * FALCON Landslide Intelligence System - Comprehensive Type Definitions
 * Exact mapping to backend schemas and state representations.
 */

export type SystemHealthStatus = 'ONLINE' | 'DEGRADED' | 'OFFLINE' | 'UNAVAILABLE';

export interface SystemHealth {
  camera: SystemHealthStatus;
  aiEngine: SystemHealthStatus;
  sensorGateway: SystemHealthStatus;
  gps: SystemHealthStatus;
  weatherApi: SystemHealthStatus;
  backend: SystemHealthStatus;
  database: SystemHealthStatus;
  websocket: SystemHealthStatus;
  mqttBroker: SystemHealthStatus;
}

export interface ApiStatusResponse {
  status: string;
  timestamp: string;
  version: string;
  health: SystemHealth;
}

export interface HealthResponse {
  status: string;
  image_model: string;
  numerical_model: string;
  satellite_model: string;
}

export interface DroneTelemetry {
  id: string;
  name?: string;
  battery: number;
  latitude: number;
  longitude: number;
  altitude: number;
  speed: number;
  heading: number;
  status?: string;
  gpsStatus?: string;
  cameraStatus?: string;
  network?: string;
  streamFps?: number;
  resolution?: string;
}

export type RiskLevel = 'SAFE' | 'MONITOR' | 'MODERATE' | 'HIGH' | 'VERY_HIGH' | 'CRITICAL';
export type SensorStatus = 'SAFE' | 'MONITOR' | 'WARNING' | 'CRITICAL';

export interface SensorTelemetry {
  soil_moisture: number;
  soil_moisture_status?: SensorStatus;
  rainfall: number;
  rainfall_status?: SensorStatus;
  ground_movement: number;
  ground_movement_status?: SensorStatus;
  pore_pressure: number;
  pore_pressure_status?: SensorStatus;
  lastUpdated?: string;
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  rainfall: number;
  wind_speed: number;
  pressure: number;
  visibility?: number;
  condition?: string;
  icon?: string;
  source?: string;
  isLive?: boolean;
  rainfallRisk?: string;
  rainfallTrend?: string;
  forecast6h?: any[];
  forecast24h?: any[];
  lastSynced?: string;
}

export interface IotPayload {
  temp: number;
  humidity: number;
  gas: number;
  airQualityStatus?: string;
  mqttBroker?: string;
  mqttTopic?: string;
  connected?: boolean;
  lastBroadcast?: string;
}

export type TemporalStatus = 'NONE' | 'SINGLE_FRAME_POSSIBLE' | 'CONFIRMED_DETECTION';

export interface DetectionBox {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  confidence: number;
}

export interface AILatestState {
  detected: boolean;
  confidence: number;
  affected_area: number;
  model: string;
  timestamp: string;
  inferenceTimeMs: number;
  temporalStatus: TemporalStatus;
  consecutiveFramesDetected: number;
  detections: DetectionBox[];
}

export interface RiskComponents {
  ai: number;
  rainfall: number;
  soil_moisture: number;
  ground_movement: number;
  pore_pressure: number;
}

export interface RiskState {
  score: number;
  level: RiskLevel;
  trend: 'STABLE' | 'INCREASING' | 'DECREASING';
  components: RiskComponents;
  lastUpdated: string;
}

export interface LocationInfo {
  lat: number;
  lon: number;
  name: string;
  elevation: number;
}

export interface AlertEvent {
  id: string;
  timestamp: string;
  level: 'CRITICAL' | 'HIGH' | 'WARNING' | 'INFO';
  title: string;
  message: string;
  location: {
    lat: number;
    lon: number;
    name: string;
  };
  metrics: {
    aiConfidence?: number;
    affectedArea?: number;
    groundMovement?: number;
    rainfall?: number;
    soilMoisture?: number;
    riskScore?: number;
  };
  acknowledged: boolean;
  temporalConfidence: TemporalStatus | string;
  snapshotId?: string;
}

// WebSocket broadcast payload structure
export interface LiveWsMessage {
  timestamp: string;
  drone: {
    id: string;
    battery: number;
    latitude: number;
    longitude: number;
    altitude: number;
    speed: number;
    heading: number;
  };
  ai: {
    model?: string;
    detected: boolean;
    confidence: number;
    affected_area: number;
  };
  sensors: {
    soil_moisture: number;
    rainfall: number;
    ground_movement: number;
    pore_pressure: number;
  };
  weather: {
    temperature: number;
    humidity: number;
    wind_speed: number;
    rainfall: number;
    pressure: number;
  };
  risk: {
    score: number;
    level: RiskLevel;
  };
  iotPayload: {
    temp: number;
    humidity: number;
    gas: number;
  };
}

// Image Model Predict response
export interface ImageModelPredictResult {
  decision: string;
  landslide_area_percent: number;
  landslide_coverage: number;
  visual_confidence: number;
  max_probability: number;
  mean_probability: number;
  landslide_pixels: number;
  total_pixels: number;
  image_width: number;
  image_height: number;
  area_threshold: number;
  threshold: number;
}

// Numerical Model Request Schema
export interface NumericalSensorInput {
  temperature: number;
  humidity: number;
  soil_moisture: number;
  rainfall: number;
  vegetation: number; // NDVI
  slope: number; // degrees
  soil_saturation: number; // %
}

// Numerical Model Predict response
export interface NumericalModelPredictResult {
  prediction: number;
  risk: string;
  high_risk_probability: number;
  model_type: string;
  model_version: string;
  input_features: Record<string, number>;
}

// Combined Risk Predict Response
export interface CombinedRiskPredictResponse {
  system: string;
  image_analysis: {
    max_probability: number;
    mean_probability: number;
    landslide_coverage: number;
    threshold: number;
  };
  numerical_analysis: NumericalModelPredictResult;
  final_risk: {
    final_score: number;
    risk_level: RiskLevel;
  };
}

// Satellite 14-band Predict response
export interface SatelliteModelPredictResult {
  source: string;
  model_name: string;
  dataset: string;
  image_shape: number[];
  bands: string[];
  landslide_pixels: number;
  total_pixels: number;
  landslide_coverage_percent: number;
  max_probability: number;
  mean_probability: number;
  threshold: number;
  risk: string;
  validation_metrics?: Record<string, any>;
}

// AI Analyze API Response
export interface AIAnalyzeResponse {
  detected: boolean;
  confidence: number;
  affected_area: number;
  model: string;
  timestamp: string;
  inferenceTimeMs: number;
  temporalStatus: TemporalStatus;
  consecutiveFramesDetected: number;
  detections: DetectionBox[];
  error?: string;
}

// Stored Snapshot record
export interface StoredSnapshot {
  id: string;
  timestamp: string;
  imageDataUrl: string;
  thumbnailDataUrl?: string;
  blob?: Blob;
  droneId: string;
  latitude: number;
  longitude: number;
  altitude: number;
  resolution: string;
  analysis?: AIAnalyzeResponse;
  riskScore?: number;
  riskLevel?: RiskLevel;
  sourceType: 'CAMERA' | 'UPLOAD' | 'SYNTHETIC';
  notes?: string;
}

// Camera Modes and Settings
export type CameraSourceType = 'WEBCAM' | 'UPLOAD_IMAGE' | 'UPLOAD_VIDEO' | 'SYNTHETIC_DEMO';

export interface CameraSettings {
  sourceType: CameraSourceType;
  deviceId?: string;
  resolution: string;
  zoom: number; // 0.5, 0.75, 1.0, 1.25, 1.5, 2.0
  pan: { x: number; y: number };
  isMirrored: boolean;
  filterMode: 'STANDARD' | 'IR_NIGHT' | 'THERMAL_FALSE_COLOR' | 'EDGE_ENHANCED';
}

export type NavigationPage =
  | 'landing'
  | 'overview'
  | 'monitor'
  | 'ai-analysis'
  | 'risk-engine'
  | 'sensors'
  | 'drone'
  | 'snapshots'
  | 'alerts'
  | 'system';
