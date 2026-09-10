import {
  ApiStatusResponse,
  HealthResponse,
  DroneTelemetry,
  SensorTelemetry,
  WeatherData,
  AILatestState,
  RiskState,
  AlertEvent,
  LocationInfo,
  AIAnalyzeResponse,
  ImageModelPredictResult,
  NumericalSensorInput,
  NumericalModelPredictResult,
  CombinedRiskPredictResponse,
  SatelliteModelPredictResult,
} from '../types';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:8000';

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
        ...(options?.headers || {}),
      },
      ...options,
    });

    if (!res.ok) {
      const errorBody = await res.text().catch(() => '');
      throw new Error(`API Error ${res.status}: ${res.statusText || errorBody || 'Request failed'}`);
    }

    return await res.json();
  } catch (err: any) {
    if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
      throw new Error(`Cannot connect to FALCON backend at ${API_BASE_URL}. Is the server running?`);
    }
    throw err;
  }
}

export const api = {
  // System Status & Health
  async getStatus(): Promise<ApiStatusResponse> {
    return fetchJson<ApiStatusResponse>('/api/status');
  },

  async getHealth(): Promise<HealthResponse> {
    return fetchJson<HealthResponse>('/health');
  },

  // Telemetry Endpoints
  async getDrone(): Promise<DroneTelemetry> {
    return fetchJson<DroneTelemetry>('/api/drone');
  },

  async getSensors(): Promise<SensorTelemetry> {
    return fetchJson<SensorTelemetry>('/api/sensors');
  },

  async getWeather(): Promise<WeatherData> {
    return fetchJson<WeatherData>('/api/weather');
  },

  async getAILatest(): Promise<AILatestState> {
    return fetchJson<AILatestState>('/api/ai/latest');
  },

  async getRisk(): Promise<RiskState> {
    return fetchJson<RiskState>('/api/risk');
  },

  async getEvents(): Promise<AlertEvent[]> {
    return fetchJson<AlertEvent[]>('/api/events');
  },

  async getLocation(): Promise<LocationInfo> {
    return fetchJson<LocationInfo>('/api/location');
  },

  async setLocation(lat: number, lon: number): Promise<LocationInfo> {
    return fetchJson<LocationInfo>('/api/location', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat, lon }),
    });
  },

  // AI Frame Analyze (Main Workflow)
  async analyzeImage(
    file?: File | Blob,
    imageDataBase64?: string
  ): Promise<AIAnalyzeResponse> {
    const formData = new FormData();

    if (file) {
      const filename = file instanceof File ? file.name : 'snapshot.jpg';
      formData.append('file', file, filename);
    } else if (imageDataBase64) {
      formData.append('image_data', imageDataBase64);
    } else {
      throw new Error('No image payload provided for analysis');
    }

    const res = await fetch(`${API_BASE_URL}/api/ai/analyze`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`AI Analysis failed (${res.status}): ${errText || res.statusText}`);
    }

    const data = await res.json();
    if (data.error) {
      throw new Error(data.error);
    }
    return data;
  },

  // Direct Model Predictions
  async predictImage(
    file: File | Blob
  ): Promise<{ filename: string; result: ImageModelPredictResult }> {
    const formData = new FormData();
    const filename = file instanceof File ? file.name : 'image.jpg';
    formData.append('file', file, filename);

    const res = await fetch(`${API_BASE_URL}/predict/image`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const err = await res.text().catch(() => '');
      throw new Error(`Image prediction failed: ${err}`);
    }
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data;
  },

  async predictNumerical(
    data: NumericalSensorInput
  ): Promise<NumericalModelPredictResult> {
    const res = await fetch(`${API_BASE_URL}/predict/numerical`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.text().catch(() => '');
      throw new Error(`Numerical prediction failed: ${err}`);
    }
    const result = await res.json();
    if (result.error) throw new Error(result.error);
    return result;
  },

  async predictRisk(
    file: File | Blob,
    params: Partial<{
      soil_moisture: number;
      rainfall_1h: number;
      rainfall_24h: number;
      rainfall_7d: number;
      temperature: number;
      humidity: number;
      wind_speed: number;
      ground_movement: number;
      vibration: number;
      pore_pressure: number;
      slope: number;
      elevation: number;
      curvature: number;
      aspect: number;
      ndvi: number;
      precipitation: number;
      lulc: number;
    }>
  ): Promise<CombinedRiskPredictResponse> {
    const formData = new FormData();
    const filename = file instanceof File ? file.name : 'risk-frame.jpg';
    formData.append('file', file, filename);

    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        formData.append(key, String(val));
      }
    });

    const res = await fetch(`${API_BASE_URL}/predict/risk`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const err = await res.text().catch(() => '');
      throw new Error(`Risk prediction failed: ${err}`);
    }
    const result = await res.json();
    if (result.error) throw new Error(result.error);
    return result;
  },

  async predictSatellite(
    file: File | Blob
  ): Promise<{ filename: string; result: SatelliteModelPredictResult }> {
    const formData = new FormData();
    const filename = file instanceof File ? file.name : 'satellite.h5';
    formData.append('file', file, filename);

    const res = await fetch(`${API_BASE_URL}/predict/satellite`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const err = await res.text().catch(() => '');
      throw new Error(`Satellite prediction failed: ${err}`);
    }
    const result = await res.json();
    if (result.error) throw new Error(result.error);
    return result;
  },
};
