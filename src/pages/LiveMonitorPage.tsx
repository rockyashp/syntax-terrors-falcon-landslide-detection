import React from 'react';
import { CameraFeed } from '../components/camera/CameraFeed';
import { Video, Sliders } from 'lucide-react';
import { useTelemetryStore } from '../stores/useTelemetryStore';
import { useCameraStore } from '../stores/useCameraStore';

export const LiveMonitorPage: React.FC = () => {
  const { risk } = useTelemetryStore();
  const { sourceType, filterMode, zoom, setInputModalOpen } = useCameraStore();

  return (
    <div className="space-y-4 animate-in fade-in duration-200 select-none max-w-7xl mx-auto">
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

      {/* Main Camera Feed & Diagnostics */}
      <div className="space-y-3">
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
    </div>
  );
};

