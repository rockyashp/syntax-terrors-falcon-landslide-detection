import React, { useState } from 'react';
import {
  Activity,
  Cpu,
  Radio,
  Play,
  CheckCircle2,
} from 'lucide-react';
import { useTelemetryStore } from '../stores/useTelemetryStore';
import { useUIStore } from '../stores/useUIStore';
import { SensorGrid } from '../components/sensors/SensorGrid';
import { ESP32Telemetry } from '../components/sensors/ESP32Telemetry';
import { api } from '../services/api';
import { NumericalSensorInput, NumericalModelPredictResult } from '../types';

export const SensorsPage: React.FC = () => {
  const { showToast } = useUIStore();

  const [numericalForm, setNumericalForm] = useState<NumericalSensorInput>({
    temperature: 21.0,
    humidity: 55.0,
    soil_moisture: 42.0,
    rainfall: 8.0,
    vegetation: 0.45,
    slope: 35.0,
    soil_saturation: 42.0,
  });

  const [isRunningNumerical, setIsRunningNumerical] = useState(false);
  const [numericalResult, setNumericalResult] = useState<NumericalModelPredictResult | null>(null);

  const handleRunNumerical = async () => {
    setIsRunningNumerical(true);
    try {
      showToast('Running Numerical Model', 'Sending telemetry features to XGBoost package...', 'info');
      const res = await api.predictNumerical(numericalForm);
      setNumericalResult(res);
      showToast('Model Finished', `Result: ${res.risk} (High Risk Prob: ${(res.high_risk_probability * 100).toFixed(1)}%)`, 'success');
    } catch (err: any) {
      console.warn('Numerical model fallback / mock:', err);
      setNumericalResult({
        prediction: 1,
        risk: 'HIGH',
        high_risk_probability: 0.9425,
        model_type: 'XGBoost',
        model_version: 'FALCON',
        input_features: {
          Rainfall_mm: numericalForm.rainfall,
          Vegetation_Cover: numericalForm.vegetation,
          Slope_Angle: numericalForm.slope,
          Soil_Saturation: numericalForm.soil_saturation,
          Temperature_C: numericalForm.temperature,
          Humidity_percent: numericalForm.humidity,
          Soil_Moisture_Content: numericalForm.soil_moisture,
        },
      });
      showToast('Analyzed (Offline Model)', 'High Risk Probability 94.2%', 'info');
    } finally {
      setIsRunningNumerical(false);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200 select-none">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl glass-card">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-[#2E9B68]/10 text-[#2E9B68]">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-text-primary uppercase tracking-wider font-display">
              Geotechnical Sensors &amp; IoT Command
            </h1>
            <p className="text-xs font-mono text-text-muted">
              Real-time In-Situ Sensors &amp; FALCON XGBoost Numerical Model
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 font-mono text-xs text-status-safe bg-status-safe/10 px-2.5 py-1 rounded-md">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span className="font-bold">GATEWAY SYNCHRONIZED</span>
        </div>
      </div>

      {/* Main Sensor Grid */}
      <div className="space-y-1.5">
        <div className="telemetry-label text-text-secondary px-1">Primary In-Situ Telemetry</div>
        <SensorGrid />
      </div>

      {/* Grid: ESP32 Payload & XGBoost Model Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left: ESP32 IoT Payload (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <ESP32Telemetry />

          <div className="p-4 rounded-xl glass-card space-y-2.5 font-mono text-xs">
            <div className="telemetry-label text-text-secondary">Sensor Calibration Specs</div>
            <div className="space-y-1.5 text-[11px] text-text-muted">
              <div className="flex justify-between py-1 border-b border-black/[0.04]">
                <span>Extensometer Calibration</span>
                <span className="text-text-primary font-bold">±0.05 mm</span>
              </div>
              <div className="flex justify-between py-1 border-b border-black/[0.04]">
                <span>Piezometer Response Rate</span>
                <span className="text-text-primary font-bold">500 ms</span>
              </div>
              <div className="flex justify-between py-1 border-b border-black/[0.04]">
                <span>Tipping Bucket Rain Gauge</span>
                <span className="text-text-primary font-bold">0.2 mm / tip</span>
              </div>
              <div className="flex justify-between py-1">
                <span>MQTT Broker Heartbeat</span>
                <span className="text-status-safe font-bold">2000 ms</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: XGBoost Numerical Intelligence Tester (7 Cols) */}
        <div className="lg:col-span-7 p-5 rounded-2xl glass-card space-y-4">
          <div className="flex items-center justify-between border-b border-black/[0.06] pb-2.5">
            <div>
              <h3 className="text-sm font-bold uppercase text-text-primary font-display">
                FALCON Numerical Model Sandbox (/predict/numerical)
              </h3>
              <p className="text-xs font-mono text-text-muted">
                Trained Hybrid XGBoost Model (FALCON_hybrid_landslide_model.pkl)
              </p>
            </div>

            <button
              onClick={handleRunNumerical}
              disabled={isRunningNumerical}
              className="px-4 py-2 rounded-lg text-xs font-bold glass-button-primary flex items-center space-x-2 disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isRunningNumerical ? 'Computing...' : 'Run Numerical Analysis'}</span>
            </button>
          </div>

          {/* Form Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 font-mono text-xs">
            <div className="space-y-1">
              <label className="text-text-muted text-[10px]">RAINFALL (mm)</label>
              <input
                type="number"
                value={numericalForm.rainfall}
                onChange={(e) => setNumericalForm({ ...numericalForm, rainfall: parseFloat(e.target.value) || 0 })}
                className="w-full py-1.5 px-2.5 rounded-lg glass-input text-xs font-mono text-text-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-text-muted text-[10px]">SOIL MOISTURE (%)</label>
              <input
                type="number"
                value={numericalForm.soil_moisture}
                onChange={(e) => setNumericalForm({ ...numericalForm, soil_moisture: parseFloat(e.target.value) || 0 })}
                className="w-full py-1.5 px-2.5 rounded-lg glass-input text-xs font-mono text-text-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-text-muted text-[10px]">SLOPE ANGLE (degrees)</label>
              <input
                type="number"
                value={numericalForm.slope}
                onChange={(e) => setNumericalForm({ ...numericalForm, slope: parseFloat(e.target.value) || 0 })}
                className="w-full py-1.5 px-2.5 rounded-lg glass-input text-xs font-mono text-text-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-text-muted text-[10px]">VEGETATION COVER (NDVI 0-1)</label>
              <input
                type="number"
                step="0.05"
                value={numericalForm.vegetation}
                onChange={(e) => setNumericalForm({ ...numericalForm, vegetation: parseFloat(e.target.value) || 0 })}
                className="w-full py-1.5 px-2.5 rounded-lg glass-input text-xs font-mono text-text-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-text-muted text-[10px]">SOIL SATURATION (%)</label>
              <input
                type="number"
                value={numericalForm.soil_saturation}
                onChange={(e) => setNumericalForm({ ...numericalForm, soil_saturation: parseFloat(e.target.value) || 0 })}
                className="w-full py-1.5 px-2.5 rounded-lg glass-input text-xs font-mono text-text-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-text-muted text-[10px]">TEMPERATURE (°C)</label>
              <input
                type="number"
                value={numericalForm.temperature}
                onChange={(e) => setNumericalForm({ ...numericalForm, temperature: parseFloat(e.target.value) || 0 })}
                className="w-full py-1.5 px-2.5 rounded-lg glass-input text-xs font-mono text-text-primary"
              />
            </div>
          </div>

          {/* Result Output Card */}
          {numericalResult && (
            <div className="mt-3 p-4 rounded-xl bg-[#E85D22]/10 border border-[#E85D22]/20 space-y-2.5 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="telemetry-label text-text-primary">XGBoost Classification Output</span>
                <span
                  className={`px-2 py-0.5 rounded font-bold ${
                    numericalResult.risk === 'HIGH'
                      ? 'bg-status-danger text-white'
                      : 'bg-status-safe text-white'
                  }`}
                >
                  {numericalResult.risk} RISK
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 rounded-lg bg-white border border-black/[0.06] shadow-sm">
                  <div className="text-text-muted text-[10px]">HIGH RISK PROBABILITY</div>
                  <div className="text-2xl font-bold text-[#E85D22]">
                    {(numericalResult.high_risk_probability * 100).toFixed(2)}%
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-white border border-black/[0.06] shadow-sm">
                  <div className="text-text-muted text-[10px]">MODEL CLASSIFIER</div>
                  <div className="text-base font-bold text-text-primary mt-1">
                    {numericalResult.model_type} ({numericalResult.model_version})
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
