import React from 'react';
import {
  CloudSun,
  X,
  Droplets,
  Wind,
  Gauge,
  Eye,
  CloudRain,
  Activity,
  AlertTriangle,
} from 'lucide-react';
import { useUIStore } from '../../stores/useUIStore';
import { useTelemetryStore } from '../../stores/useTelemetryStore';

export const WeatherModal: React.FC = () => {
  const { isWeatherModalOpen, setWeatherModalOpen } = useUIStore();
  const { weather, risk, location } = useTelemetryStore();

  if (!isWeatherModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150 select-none">
      <div
        className="w-full max-w-2xl bg-white border border-black/[0.1] rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-black/[0.06] bg-[#F7F5F0]">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-[#E85D22]/15 text-[#E85D22]">
              <CloudSun className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider font-display">
                Meteorological Telemetry
              </h2>
              <p className="text-[11px] font-mono text-text-muted">
                {location.name}
              </p>
            </div>
          </div>
          <button
            onClick={() => setWeatherModalOpen(false)}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-black/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Main Weather Hero Card */}
          <div className="p-5 rounded-xl bg-[#F7F5F0] border border-black/[0.06] flex items-center justify-between">
            <div className="flex items-center space-x-5">
              <div className="text-5xl font-mono font-bold text-text-primary tracking-tighter">
                {weather.temperature.toFixed(1)}°C
              </div>
              <div className="border-l border-black/[0.1] pl-5">
                <div className="text-sm font-semibold text-text-primary">
                  {weather.condition || 'Partly Cloudy'}
                </div>
                <div className="text-xs text-text-secondary mt-0.5">
                  Precipitation Risk: <span className="font-mono text-[#E85D22] font-bold">{weather.rainfallRisk || risk.level}</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-mono px-2 py-1 rounded bg-white border border-black/[0.08] text-text-muted">
                {weather.source || 'METEOROLOGICAL SENSORS'}
              </span>
            </div>
          </div>

          {/* Grid of Weather Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
            <div className="p-3.5 rounded-xl bg-white border border-black/[0.06] shadow-sm">
              <div className="flex items-center space-x-2 text-text-muted text-xs mb-1.5">
                <Droplets className="w-4 h-4 text-[#3478C8]" />
                <span className="telemetry-label">Relative Humidity</span>
              </div>
              <div className="text-lg font-mono font-bold text-text-primary">
                {weather.humidity.toFixed(0)}%
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-black/[0.06] shadow-sm">
              <div className="flex items-center space-x-2 text-text-muted text-xs mb-1.5">
                <CloudRain className="w-4 h-4 text-[#E85D22]" />
                <span className="telemetry-label">Rainfall</span>
              </div>
              <div className="text-lg font-mono font-bold text-text-primary">
                {weather.rainfall.toFixed(1)} mm
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-black/[0.06] shadow-sm">
              <div className="flex items-center space-x-2 text-text-muted text-xs mb-1.5">
                <Wind className="w-4 h-4 text-status-safe" />
                <span className="telemetry-label">Wind Velocity</span>
              </div>
              <div className="text-lg font-mono font-bold text-text-primary">
                {weather.wind_speed.toFixed(1)} km/h
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-black/[0.06] shadow-sm">
              <div className="flex items-center space-x-2 text-text-muted text-xs mb-1.5">
                <Gauge className="w-4 h-4 text-[#D98B16]" />
                <span className="telemetry-label">Pressure</span>
              </div>
              <div className="text-lg font-mono font-bold text-text-primary">
                {weather.pressure.toFixed(0)} hPa
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-black/[0.06] shadow-sm">
              <div className="flex items-center space-x-2 text-text-muted text-xs mb-1.5">
                <Eye className="w-4 h-4 text-text-secondary" />
                <span className="telemetry-label">Visibility</span>
              </div>
              <div className="text-lg font-mono font-bold text-text-primary">
                {weather.visibility ?? 9.5} km
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-black/[0.06] shadow-sm">
              <div className="flex items-center space-x-2 text-text-muted text-xs mb-1.5">
                <Activity className="w-4 h-4 text-[#E85D22]" />
                <span className="telemetry-label">Trend</span>
              </div>
              <div className="text-lg font-mono font-bold text-[#E85D22]">
                {weather.rainfallTrend || risk.trend}
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#E85D22]/10 border border-[#E85D22]/20 flex items-center space-x-3 text-xs">
            <AlertTriangle className="w-4 h-4 text-[#E85D22] shrink-0" />
            <p className="text-text-secondary">
              Meteorological telemetry directly drives the <span className="text-text-primary font-semibold">15% Rainfall</span> &amp; <span className="text-text-primary font-semibold">10% Soil Moisture</span> factors in the FALCON Risk Engine.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
