import { create } from 'zustand';
import {
  DroneTelemetry,
  SensorTelemetry,
  WeatherData,
  IotPayload,
  AILatestState,
  RiskState,
  LocationInfo,
  SystemHealth,
  LiveWsMessage,
  SensorStatus,
  RiskLevel,
} from '../types';
import { api } from '../services/api';
import { WsConnectionStatus } from '../services/websocket';

// Initial sensible defaults matching backend baseline state
const initialDrone: DroneTelemetry = {
  id: 'DRONE-01',
  name: 'FALCON Recon UAV',
  battery: 92.0,
  latitude: 27.9142,
  longitude: 85.8456,
  altitude: 1420,
  speed: 8.4,
  heading: 90,
  status: 'ONLINE',
  gpsStatus: 'LOCKED',
  cameraStatus: 'CONNECTED',
  network: '5G',
  streamFps: 24,
  resolution: '3840x2160',
};

const initialSensors: SensorTelemetry = {
  soil_moisture: 42.0,
  soil_moisture_status: 'SAFE',
  rainfall: 8.0,
  rainfall_status: 'SAFE',
  ground_movement: 1.2,
  ground_movement_status: 'SAFE',
  pore_pressure: 15.0,
  pore_pressure_status: 'SAFE',
  lastUpdated: new Date().toISOString(),
};

const initialWeather: WeatherData = {
  temperature: 21.0,
  humidity: 55.0,
  rainfall: 8.0,
  wind_speed: 14.0,
  pressure: 1015.0,
  visibility: 9.5,
  condition: 'Partly Cloudy',
  source: 'METEOROLOGICAL_SIMULATION',
  isLive: false,
};

const initialIot: IotPayload = {
  temp: 21.0,
  humidity: 55.0,
  gas: 240,
  airQualityStatus: 'GOOD',
  mqttBroker: 'broker.hivemq.com',
  mqttTopic: 'drone/disaster/telemetry',
  connected: true,
  lastBroadcast: new Date().toISOString(),
};

const initialAI: AILatestState = {
  detected: false,
  confidence: 0.0,
  affected_area: 0.0,
  model: 'FALCON-SegFormer',
  timestamp: new Date().toISOString(),
  inferenceTimeMs: 0,
  temporalStatus: 'NONE',
  consecutiveFramesDetected: 0,
  detections: [],
};

const initialRisk: RiskState = {
  score: 12,
  level: 'SAFE',
  trend: 'STABLE',
  components: {
    ai: 0.0,
    rainfall: 0.1,
    soil_moisture: 0.2,
    ground_movement: 0.05,
    pore_pressure: 0.1,
  },
  lastUpdated: new Date().toISOString(),
};

const initialLocation: LocationInfo = {
  lat: 27.9142,
  lon: 85.8456,
  name: 'Sindhupalchok Escarpment Monitoring Zone',
  elevation: 1420,
};

const initialSystemHealth: SystemHealth = {
  camera: 'ONLINE',
  aiEngine: 'ONLINE',
  sensorGateway: 'ONLINE',
  gps: 'ONLINE',
  weatherApi: 'DEGRADED',
  backend: 'ONLINE',
  database: 'ONLINE',
  websocket: 'ONLINE',
  mqttBroker: 'ONLINE',
};

export interface SensorHistoryPoint {
  time: string;
  soil_moisture: number;
  rainfall: number;
  ground_movement: number;
  pore_pressure: number;
}

export interface TelemetryStoreState {
  drone: DroneTelemetry;
  sensors: SensorTelemetry;
  weather: WeatherData;
  iotPayload: IotPayload;
  aiLatest: AILatestState;
  risk: RiskState;
  location: LocationInfo;
  systemHealth: SystemHealth;
  wsStatus: WsConnectionStatus;
  apiConnected: boolean;
  isLoading: boolean;
  lastUpdateTimestamp: string;
  sensorHistory: SensorHistoryPoint[];
  backendError: string | null;

  // Actions
  setWsStatus: (status: WsConnectionStatus) => void;
  applyWsMessage: (msg: LiveWsMessage) => void;
  fetchFullTelemetry: () => Promise<void>;
  updateAIAnalysis: (ai: AILatestState) => void;
  updateRisk: (risk: RiskState) => void;
  setCurrentLocation: (lat: number, lon: number, name?: string) => void;
}

function calculateSensorStatus(type: 'soil' | 'rain' | 'movement' | 'pore', val: number): SensorStatus {
  if (type === 'soil') {
    if (val < 45) return 'SAFE';
    if (val < 65) return 'MONITOR';
    if (val < 85) return 'WARNING';
    return 'CRITICAL';
  }
  if (type === 'rain') {
    if (val < 15) return 'SAFE';
    if (val < 35) return 'MONITOR';
    if (val < 60) return 'WARNING';
    return 'CRITICAL';
  }
  if (type === 'movement') {
    if (val < 3) return 'SAFE';
    if (val < 8) return 'MONITOR';
    if (val < 15) return 'WARNING';
    return 'CRITICAL';
  }
  if (val < 20) return 'SAFE';
  if (val < 40) return 'MONITOR';
  if (val < 60) return 'WARNING';
  return 'CRITICAL';
}

export const useTelemetryStore = create<TelemetryStoreState>((set, get) => ({
  drone: initialDrone,
  sensors: initialSensors,
  weather: initialWeather,
  iotPayload: initialIot,
  aiLatest: initialAI,
  risk: initialRisk,
  location: initialLocation,
  systemHealth: initialSystemHealth,
  wsStatus: 'DISCONNECTED',
  apiConnected: false,
  isLoading: false,
  lastUpdateTimestamp: new Date().toISOString(),
  sensorHistory: [
    { time: '14:20', soil_moisture: 41.2, rainfall: 7.5, ground_movement: 1.1, pore_pressure: 14.8 },
    { time: '14:22', soil_moisture: 41.5, rainfall: 7.8, ground_movement: 1.15, pore_pressure: 14.9 },
    { time: '14:24', soil_moisture: 41.8, rainfall: 8.0, ground_movement: 1.2, pore_pressure: 15.0 },
    { time: '14:26', soil_moisture: 42.0, rainfall: 8.1, ground_movement: 1.22, pore_pressure: 15.1 },
    { time: '14:28', soil_moisture: 42.1, rainfall: 8.0, ground_movement: 1.2, pore_pressure: 15.0 },
  ],
  backendError: null,

  setWsStatus: (status) => set({ wsStatus: status }),

  applyWsMessage: (msg) => {
    const timeStr = new Date(msg.timestamp || Date.now()).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    set((state) => {
      const newHistory = [
        ...state.sensorHistory.slice(-29), // keep last 30 points
        {
          time: timeStr,
          soil_moisture: msg.sensors.soil_moisture,
          rainfall: msg.sensors.rainfall,
          ground_movement: msg.sensors.ground_movement,
          pore_pressure: msg.sensors.pore_pressure,
        },
      ];

      return {
        drone: {
          ...state.drone,
          ...msg.drone,
          latitude: state.location.lat,
          longitude: state.location.lon,
        },
        sensors: {
          soil_moisture: msg.sensors.soil_moisture,
          soil_moisture_status: calculateSensorStatus('soil', msg.sensors.soil_moisture),
          rainfall: msg.sensors.rainfall,
          rainfall_status: calculateSensorStatus('rain', msg.sensors.rainfall),
          ground_movement: msg.sensors.ground_movement,
          ground_movement_status: calculateSensorStatus('movement', msg.sensors.ground_movement),
          pore_pressure: msg.sensors.pore_pressure,
          pore_pressure_status: calculateSensorStatus('pore', msg.sensors.pore_pressure),
          lastUpdated: msg.timestamp,
        },
        weather: {
          ...state.weather,
          ...msg.weather,
        },
        iotPayload: {
          ...state.iotPayload,
          ...msg.iotPayload,
          lastBroadcast: msg.timestamp,
        },
        risk: {
          ...state.risk,
          score: msg.risk.score,
          level: msg.risk.level,
          lastUpdated: msg.timestamp,
        },
        aiLatest: {
          ...state.aiLatest,
          detected: msg.ai.detected,
          confidence: msg.ai.confidence,
          affected_area: msg.ai.affected_area,
          model: msg.ai.model || state.aiLatest.model,
        },
        apiConnected: true,
        lastUpdateTimestamp: msg.timestamp,
        sensorHistory: newHistory,
      };
    });
  },

  fetchFullTelemetry: async () => {
    set({ isLoading: true, backendError: null });
    try {
      const [statusRes, droneRes, sensorsRes, weatherRes, aiRes, riskRes, locRes] =
        await Promise.allSettled([
          api.getStatus(),
          api.getDrone(),
          api.getSensors(),
          api.getWeather(),
          api.getAILatest(),
          api.getRisk(),
          api.getLocation(),
        ]);

      set((state) => ({
        systemHealth: statusRes.status === 'fulfilled' ? statusRes.value.health : state.systemHealth,
        drone: droneRes.status === 'fulfilled'
          ? { ...state.drone, ...droneRes.value, latitude: state.location.lat, longitude: state.location.lon }
          : state.drone,
        sensors: sensorsRes.status === 'fulfilled' ? { ...state.sensors, ...sensorsRes.value } : state.sensors,
        weather: weatherRes.status === 'fulfilled' ? { ...state.weather, ...weatherRes.value } : state.weather,
        aiLatest: aiRes.status === 'fulfilled' ? { ...state.aiLatest, ...aiRes.value } : state.aiLatest,
        risk: riskRes.status === 'fulfilled' ? { ...state.risk, ...riskRes.value } : state.risk,
        location: state.location,
        apiConnected: statusRes.status === 'fulfilled' || droneRes.status === 'fulfilled',
        isLoading: false,
        lastUpdateTimestamp: new Date().toISOString(),
      }));
    } catch (err: any) {
      set({
        isLoading: false,
        apiConnected: false,
        backendError: err.message || 'Failed to sync with backend',
      });
    }
  },

  updateAIAnalysis: (ai) => {
    set({
      aiLatest: ai,
    });
  },

  updateRisk: (risk) => {
    set({
      risk,
    });
  },

  setCurrentLocation: (lat, lon, name = 'Current Device Location') => {
    set((state) => ({
      location: {
        ...state.location,
        lat,
        lon,
        name,
      },
      drone: {
        ...state.drone,
        latitude: lat,
        longitude: lon,
      },
    }));
  },
}));
