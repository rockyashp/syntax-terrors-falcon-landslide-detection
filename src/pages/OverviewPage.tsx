import React from 'react';
import { CameraFeed } from '../components/camera/CameraFeed';
import { RiskEngineCard } from '../components/risk/RiskEngineCard';
import { SensorGrid } from '../components/sensors/SensorGrid';
import { ESP32Telemetry } from '../components/sensors/ESP32Telemetry';
import { AIDetectionSummary } from '../components/ai/AIDetectionSummary';
import { MiniLocationMap } from '../components/map/MiniLocationMap';
import { RecentAlertsBanner } from '../components/alerts/RecentAlertsBanner';
import { Activity } from 'lucide-react';
import { useTelemetryStore } from '../stores/useTelemetryStore';

export const OverviewPage: React.FC = () => {
  const { drone, risk } = useTelemetryStore();

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Top Status Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 px-4 py-2.5 rounded-xl glass-1 border border-white/[0.06] text-xs font-mono select-none">
        <div className="flex items-center space-x-3 sm:space-x-5">
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-status-safe" />
            <span className="font-bold text-text-primary">AUTONOMOUS ESCARPMENT PATROL</span>
          </div>

          <div className="hidden sm:block h-3.5 w-[1px] bg-white/[0.08]" />

          <div className="hidden sm:flex items-center space-x-1.5 text-text-muted">
            <span>UAV:</span>
            <span className="text-text-primary font-bold">{drone.id}</span>
          </div>

          <div className="hidden md:block h-3.5 w-[1px] bg-white/[0.08]" />

          <div className="hidden md:flex items-center space-x-1.5 text-text-muted">
            <span>ALT:</span>
            <span className="text-accent font-bold">{drone.altitude}m MSL</span>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-text-muted text-[11px]">
          <span>COMPOSITE RISK:</span>
          <span
            className={`font-bold ${
              risk.score >= 75
                ? 'text-status-danger'
                : risk.score >= 50
                ? 'text-[#FF7A24]'
                : risk.score >= 25
                ? 'text-status-warning'
                : 'text-status-safe'
            }`}
          >
            {risk.score}% ({risk.level})
          </span>
        </div>
      </div>

      {/* Main Command Center: 65% Camera Feed & 35% Master Risk Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <div className="lg:col-span-8">
          <CameraFeed />
        </div>

        <div className="lg:col-span-4">
          <RiskEngineCard />
        </div>
      </div>

      {/* Active Alerts Banner */}
      <RecentAlertsBanner />

      {/* Geotechnical Sensor Telemetry */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center space-x-1.5">
            <Activity className="w-3.5 h-3.5 text-accent" />
            <h3 className="telemetry-label text-text-secondary">Geotechnical Sensor Telemetry</h3>
          </div>
          <span className="text-[10px] font-mono text-text-muted">
            Live Stream Rate: 2.0s
          </span>
        </div>

        <SensorGrid />
      </div>

      {/* Secondary Intelligence Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AIDetectionSummary />
        <ESP32Telemetry />
        <MiniLocationMap />
      </div>
    </div>
  );
};
