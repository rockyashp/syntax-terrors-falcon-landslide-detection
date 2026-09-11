import React, { useState } from 'react';
import { Zap, Eye, CloudRain, Droplets, Gauge, Activity, RotateCcw, Info, Mountain, ShieldAlert } from 'lucide-react';
import { useTelemetryStore } from '../stores/useTelemetryStore';
import { RiskGauge } from '../components/risk/RiskGauge';
import { RiskFusion } from '../components/risk/RiskFusion';
import { RiskLevel } from '../types';

export const RiskEnginePage: React.FC = () => {
  const { risk, aiLatest, sensors } = useTelemetryStore();

  const [simAI, setSimAI] = useState(aiLatest.confidence > 0 ? Math.round(aiLatest.confidence * 100) : 48);
  const [simRain, setSimRain] = useState(sensors.rainfall);
  const [simSoil, setSimSoil] = useState(sensors.soil_moisture);
  const [simMovement, setSimMovement] = useState(sensors.ground_movement);
  const [simPore, setSimPore] = useState(sensors.pore_pressure);
  const [simSlope, setSimSlope] = useState(34);

  // 1. Topographic Gating
  const slopeGate =
    simSlope < 15 ? Math.max(0.1, (simSlope / 15.0) * 0.25) : simSlope <= 45 ? simSlope / 45.0 : 1.0;

  // 2. Geotechnical ML Simulation
  const mNorm = Math.min(1.0, simMovement / 15.0);
  const rNorm = Math.min(1.0, simRain / 60.0);
  const pNorm = Math.min(1.0, simPore / 60.0);
  const sNorm = Math.min(1.0, simSoil / 100.0);

  const rawGeoScore = (mNorm * 45.0 + (sNorm * 0.4 + pNorm * 0.3 + rNorm * 0.3) * 55.0) * slopeGate;

  // 3. Physical Safety Overrides
  const overrides: string[] = [];
  let gatedGeoScore = rawGeoScore;
  if (simMovement >= 8.0) {
    gatedGeoScore = Math.max(gatedGeoScore, 85.0);
    overrides.push('Active Shear Displacement');
  } else if (simMovement >= 4.0) {
    gatedGeoScore = Math.max(gatedGeoScore, 60.0);
    overrides.push('Elevated Movement');
  }

  if (simPore >= 50.0) {
    gatedGeoScore = Math.max(gatedGeoScore, 80.0);
    overrides.push('Critical Pore Pressure');
  } else if (simPore >= 35.0) {
    gatedGeoScore = Math.max(gatedGeoScore, 55.0);
    overrides.push('High Pore Pressure');
  }

  if (simRain >= 45.0 && simSoil >= 75.0) {
    gatedGeoScore = Math.max(gatedGeoScore, 70.0);
    overrides.push('Severe Saturation');
  }

  const geoScore = Math.max(0, Math.min(100, Math.round(gatedGeoScore)));

  // 4. Adaptive Vision Weighting
  const visionWeight = simAI > 60 ? 0.45 : simAI > 30 ? 0.30 : 0.10;
  const geoWeight = 1.0 - visionWeight;

  const rawSimScore = visionWeight * simAI + geoWeight * geoScore;
  const simScore = Math.max(0, Math.min(100, Math.round(rawSimScore)));

  const getSimLevel = (s: number): RiskLevel => {
    if (s >= 75) return 'CRITICAL';
    if (s >= 50) return 'HIGH';
    if (s >= 25) return 'MODERATE';
    return 'SAFE';
  };

  const simLevel = getSimLevel(simScore);

  const resetToLive = () => {
    setSimAI(aiLatest.confidence > 0 ? Math.round(aiLatest.confidence * 100) : 48);
    setSimRain(sensors.rainfall);
    setSimSoil(sensors.soil_moisture);
    setSimMovement(sensors.ground_movement);
    setSimPore(sensors.pore_pressure);
    setSimSlope(34);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200 select-none">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl glass-card">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-[#E85D22]/10 text-[#E85D22]">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-text-primary uppercase tracking-wider font-display">
              FALCON Hierarchical Risk Engine &amp; Fusion Architecture
            </h1>
            <p className="text-xs font-mono text-text-muted">
              4-Tier Pipeline: Topographic Gating + XGBoost Geotechnical ML + Fail-Safe Overrides + Adaptive Vision
            </p>
          </div>
        </div>

        <button
          onClick={resetToLive}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold glass-button flex items-center space-x-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5 text-text-muted" />
          <span>Reset to Live Feed</span>
        </button>
      </div>

      {/* Grid: Live Risk vs Interactive Simulation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left: Interactive Simulation Sandbox (7 Cols) */}
        <div className="lg:col-span-7 p-5 rounded-2xl glass-card space-y-4">
          <div className="flex items-center justify-between border-b border-black/[0.06] pb-2.5">
            <div>
              <h3 className="text-sm font-bold uppercase text-text-primary font-display">
                Risk Simulation Sandbox
              </h3>
              <p className="text-xs font-mono text-text-muted">
                Test topographic slopes, geotechnical threshold breaches, and adaptive fusion weights
              </p>
            </div>
            <span className="text-[10px] font-mono text-[#E85D22] font-bold bg-[#E85D22]/10 px-2 py-0.5 rounded">
              INTERACTIVE
            </span>
          </div>

          {/* Sliders for each contributing factor */}
          <div className="space-y-3 font-mono text-xs">
            {/* Topographic Slope Factor */}
            <div className="p-3 rounded-xl bg-black/[0.02] border border-black/[0.04] space-y-1.5">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Mountain className="w-4 h-4 text-[#7B61FF]" />
                  <span className="text-text-primary font-bold">1. Terrain Slope (Topographic Gate)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-text-muted text-[10px]">Gate: {(slopeGate * 100).toFixed(0)}%</span>
                  <span className="text-[#7B61FF] font-bold">{simSlope}°</span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                step="1"
                value={simSlope}
                onChange={(e) => setSimSlope(parseInt(e.target.value))}
                className="w-full accent-[#7B61FF]"
              />
            </div>

            {/* AI Factor */}
            <div className="p-3 rounded-xl bg-black/[0.02] border border-black/[0.04] space-y-1.5">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Eye className="w-4 h-4 text-[#3478C8]" />
                  <span className="text-text-primary font-bold">2. Visual AI Confidence (SegFormer)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-text-muted text-[10px]">Adaptive Weight: {(visionWeight * 100).toFixed(0)}%</span>
                  <span className="text-text-primary font-bold">{simAI}%</span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={simAI}
                onChange={(e) => setSimAI(parseInt(e.target.value))}
                className="w-full accent-[#E85D22]"
              />
            </div>

            {/* Ground Movement Factor */}
            <div className="p-3 rounded-xl bg-black/[0.02] border border-black/[0.04] space-y-1.5">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-status-danger" />
                  <span className="text-text-primary font-bold">3. Ground Movement (Extensometer)</span>
                </div>
                <div className="flex items-center space-x-2">
                  {simMovement >= 8.0 && (
                    <span className="text-[10px] text-red-500 font-bold bg-red-500/10 px-1.5 py-0.5 rounded">
                      FAIL-SAFE OVERRIDE
                    </span>
                  )}
                  <span className="text-status-danger font-bold">{simMovement.toFixed(1)} mm</span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="15"
                step="0.1"
                value={simMovement}
                onChange={(e) => setSimMovement(parseFloat(e.target.value))}
                className="w-full accent-[#E85D22]"
              />
            </div>

            {/* Rainfall Factor */}
            <div className="p-3 rounded-xl bg-black/[0.02] border border-black/[0.04] space-y-1.5">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <CloudRain className="w-4 h-4 text-[#E85D22]" />
                  <span className="text-text-primary font-bold">4. Rainfall Accumulation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[#E85D22] font-bold">{simRain.toFixed(1)} mm</span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                step="0.5"
                value={simRain}
                onChange={(e) => setSimRain(parseFloat(e.target.value))}
                className="w-full accent-[#E85D22]"
              />
            </div>

            {/* Soil Moisture Factor */}
            <div className="p-3 rounded-xl bg-black/[0.02] border border-black/[0.04] space-y-1.5">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Droplets className="w-4 h-4 text-[#D98B16]" />
                  <span className="text-text-primary font-bold">5. Soil Moisture Saturation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[#D98B16] font-bold">{simSoil.toFixed(1)} %</span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="0.5"
                value={simSoil}
                onChange={(e) => setSimSoil(parseFloat(e.target.value))}
                className="w-full accent-[#E85D22]"
              />
            </div>

            {/* Pore Pressure Factor */}
            <div className="p-3 rounded-xl bg-black/[0.02] border border-black/[0.04] space-y-1.5">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Gauge className="w-4 h-4 text-status-safe" />
                  <span className="text-text-primary font-bold">6. Pore Water Pressure</span>
                </div>
                <div className="flex items-center space-x-2">
                  {simPore >= 50.0 && (
                    <span className="text-[10px] text-red-500 font-bold bg-red-500/10 px-1.5 py-0.5 rounded">
                      PORE OVERRIDE
                    </span>
                  )}
                  <span className="text-status-safe font-bold">{simPore.toFixed(1)} kPa</span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                step="0.5"
                value={simPore}
                onChange={(e) => setSimPore(parseFloat(e.target.value))}
                className="w-full accent-[#E85D22]"
              />
            </div>
          </div>
        </div>

        {/* Right: Sandbox Result (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl glass-card space-y-4">
            <div className="telemetry-label text-text-secondary border-b border-black/[0.06] pb-2">
              Simulated Hazard Outcome
            </div>

            <RiskGauge score={simScore} level={simLevel} trend="STABLE" />

            <RiskFusion
              imageScorePercent={simAI}
              numericalScorePercent={geoScore}
              finalScorePercent={simScore}
              visionWeight={visionWeight}
              geoWeight={geoWeight}
              overrides={overrides}
            />
          </div>

          <div className="p-4 rounded-xl glass-card space-y-2.5 font-mono text-xs">
            <div className="flex items-center space-x-2 text-text-primary font-bold">
              <Info className="w-4 h-4 text-[#E85D22]" />
              <span className="uppercase font-display">Hierarchical Multi-Modal Formula</span>
            </div>

            <p className="text-[11px] text-text-secondary leading-relaxed">
              FALCON incorporates Topographic Gating, Continuous Geotechnical ML Inference, Physical Overrides, and Adaptive Vision Fusion:
            </p>

            <div className="p-2.5 rounded-lg bg-black/[0.03] border border-black/[0.05] text-[11px] text-[#E85D22] space-y-1">
              <div>Risk = [w_vision · (AI) + (1 - w_vision) · (Geo_Score · G(θ))]</div>
              <div className="text-[10px] text-text-muted">Override: Displacement &gt; 8mm → Risk ≥ 85%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
