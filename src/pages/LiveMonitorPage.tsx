import React from 'react';
import { CameraFeed } from '../components/camera/CameraFeed';
import {
  Video,
  Navigation,
  Compass,
  Battery,
  Sliders,
  Gauge,
  Activity,
} from 'lucide-react';
import { useTelemetryStore } from '../stores/useTelemetryStore';
import { useCameraStore } from '../stores/useCameraStore';

export const LiveMonitorPage: React.FC = () => {
  const { drone, risk } = useTelemetryStore();
  const { sourceType, filterMode, zoom, setInputModalOpen } = useCameraStore();

  return (
    <div className="space-y-4 animate-in fade-in duration-200 select-none">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl glass-card">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-[#E85D22]/10 text-[#E85D22]">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-text-primary uppercase tracking-wider font-display">
              Live Tactical Drone Monitor
            </h1>
            <p className="text-xs font-mono text-text-muted">
              UAV Optical Payload &amp; Aerial Reconnaissance
            </p>
          </div>
        </div>

        <button
          onClick={() => setInputModalOpen(true)}
          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold glass-button flex items-center space-x-2"
        >
          <Sliders className="w-3.5 h-3.5 text-[#E85D22]" />
          <span>Switch Source ({sourceType})</span>
        </button>
      </div>

      {/* Main Grid: Feed + Right Flight Instrumentation Gauges */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left: Expanded Camera Feed */}
        <div className="lg:col-span-8 space-y-3">
          <CameraFeed />

          {/* Feed Diagnostics Bar */}
          <div className="p-4 rounded-xl glass-card grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div>
              <span className="text-text-muted block text-[10px]">VIDEO FEED TYPE</span>
              <span className="text-text-primary font-bold">{sourceType}</span>
            </div>
            <div>
              <span className="text-text-muted block text-[10px]">OPTICAL FILTER</span>
              <span className="text-[#E85D22] font-bold">{filterMode}</span>
            </div>
            <div>
              <span className="text-text-muted block text-[10px]">DIGITAL ZOOM</span>
              <span className="text-text-primary font-bold">{Math.round(zoom * 100)}%</span>
            </div>
            <div>
              <span className="text-text-muted block text-[10px]">CURRENT RISK</span>
              <span className="text-[#E85D22] font-bold">{risk.score}% ({risk.level})</span>
            </div>
          </div>
        </div>

        {/* Right: Flight Instruments & Telemetry Deck */}
        <div className="lg:col-span-4 space-y-3">
          {/* Flight Instruments Card */}
          <div className="p-5 rounded-xl glass-card space-y-4">
            <div className="flex items-center justify-between border-b border-black/[0.06] pb-2.5">
              <div className="flex items-center space-x-2">
                <Compass className="w-4 h-4 text-[#E85D22]" />
                <span className="telemetry-label text-text-primary">Flight Telemetry</span>
              </div>
              <span className="text-[10px] font-mono text-status-safe font-bold bg-status-safe/10 px-2 py-0.5 rounded border border-status-safe/30">
                GPS LOCKED
              </span>
            </div>

            {/* Compass / Heading Display */}
            <div className="flex items-center justify-center py-2">
              <div className="relative w-36 h-36 rounded-full border border-black/10 flex items-center justify-center bg-[#F7F5F0]">
                <span className="absolute top-1 text-[10px] font-mono font-bold text-[#E85D22]">N</span>
                <span className="absolute bottom-1 text-[10px] font-mono text-text-muted">S</span>
                <span className="absolute right-1.5 text-[10px] font-mono text-text-muted">E</span>
                <span className="absolute left-1.5 text-[10px] font-mono text-text-muted">W</span>

                <div
                  className="w-full h-full flex items-center justify-center transition-transform duration-300"
                  style={{ transform: `rotate(${drone.heading}deg)` }}
                >
                  <Navigation className="w-8 h-8 text-[#E85D22] transform -rotate-45" />
                </div>

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-xs font-mono font-bold text-text-primary bg-white/90 px-1.5 py-0.5 rounded shadow-sm">
                    {String(drone.heading).padStart(3, '0')}°
                  </span>
                </div>
              </div>
            </div>

            {/* Altitude & Speed Meters */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-lg bg-black/[0.02] border border-black/[0.04]">
                <div className="flex items-center space-x-1.5 text-[10px] font-mono text-text-muted mb-1">
                  <Gauge className="w-3.5 h-3.5 text-[#E85D22]" />
                  <span>ALTITUDE</span>
                </div>
                <div className="text-xl font-mono font-bold text-text-primary">
                  {drone.altitude} <span className="text-xs font-normal text-text-muted">m</span>
                </div>
                <div className="text-[10px] font-mono text-text-muted mt-0.5">MSL Elevation</div>
              </div>

              <div className="p-3 rounded-lg bg-black/[0.02] border border-black/[0.04]">
                <div className="flex items-center space-x-1.5 text-[10px] font-mono text-text-muted mb-1">
                  <Activity className="w-3.5 h-3.5 text-status-safe" />
                  <span>AIRSPEED</span>
                </div>
                <div className="text-xl font-mono font-bold text-text-primary">
                  {drone.speed.toFixed(1)} <span className="text-xs font-normal text-text-muted">m/s</span>
                </div>
                <div className="text-[10px] font-mono text-text-muted mt-0.5">Ground Velocity</div>
              </div>
            </div>

            {/* Battery Diagnostics */}
            <div className="space-y-2.5 pt-2 border-t border-black/[0.06]">
              <div>
                <div className="flex justify-between text-[11px] font-mono mb-1">
                  <span className="text-text-muted flex items-center space-x-1">
                    <Battery className="w-3.5 h-3.5 text-[#E85D22]" />
                    <span>UAV Battery</span>
                  </span>
                  <span className="font-bold text-text-primary">{drone.battery.toFixed(0)}%</span>
                </div>
                <div className="h-1.5 w-full bg-black/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#E85D22] rounded-full"
                    style={{ width: `${drone.battery}%` }}
                  />
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
