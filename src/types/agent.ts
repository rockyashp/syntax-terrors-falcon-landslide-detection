import {
  RiskLevel,
  RiskState,
  AILatestState,
  SensorTelemetry,
  DroneTelemetry,
  WeatherData,
  LocationInfo,
  AlertEvent,
  StoredSnapshot,
  SystemHealth,
  IotPayload,
  NavigationPage,
} from './index';

export type AgentStatus = 'IDLE' | 'ANALYZING' | 'ALERT' | 'READY';
export type AgentPriority = 'normal' | 'warning' | 'critical';

export interface FalconNormalizedContext {
  currentPage: NavigationPage;
  systemStatus: string;
  risk: RiskState;
  aiAnalysis: AILatestState;
  sensors: SensorTelemetry;
  drone: DroneTelemetry;
  weather: WeatherData;
  location: LocationInfo;
  alerts: AlertEvent[];
  unreadAlertsCount: number;
  latestSnapshot: StoredSnapshot | null;
  cameraSettings: {
    isLive: boolean;
    sourceType: string;
    zoom: number;
    filterMode: string;
    isAnalyzing: boolean;
  };
  iotPayload: IotPayload;
  systemHealth: SystemHealth;
  wsConnected: boolean;
  timestamp: string;
}

export interface AgentMetricSummary {
  riskScore: number;
  riskLevel: RiskLevel;
  riskTrend: string;
  aiConfidence: number;
  aiDetected: boolean;
  aiTemporalStatus: string;
  droneBattery: number;
  droneStatus: string;
  droneGps: string;
  sensorHealthRatio: string;
  warningSensorsCount: number;
  criticalSensorsCount: number;
  activeAlertsCount: number;
}

export interface AgentObservation {
  id: string;
  type: 'risk' | 'ai' | 'sensor' | 'drone' | 'weather' | 'alert' | 'system' | 'general';
  text: string;
  level: 'info' | 'warning' | 'critical' | 'safe';
}

export interface AgentResponse {
  id: string;
  title?: string;
  summary: string;
  riskExplanation?: string;
  visionObservation?: string;
  sensorObservation?: string;
  droneObservation?: string;
  observations: string[];
  recommendation: string;
  priority: AgentPriority;
  timestamp: string;
  contextPage?: NavigationPage;
  sourceQuestion?: string;
  metrics?: AgentMetricSummary;
  deltaSummary?: string;
}

export interface AgentMessage {
  id: string;
  sender: 'user' | 'agent';
  text?: string;
  response?: AgentResponse;
  timestamp: string;
}

export type QuickActionId =
  | 'status'
  | 'changed'
  | 'why_risk'
  | 'ai_analysis'
  | 'sensors'
  | 'drone'
  | 'alerts'
  | 'recommendation';

export interface QuickActionItem {
  id: QuickActionId;
  label: string;
  iconName?: string;
  prompt: string;
}
