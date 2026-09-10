import React from 'react';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';
import { useTelemetryStore } from '../../stores/useTelemetryStore';
import { useUIStore } from '../../stores/useUIStore';

export const MiniLocationMap: React.FC = () => {
  const { location, drone } = useTelemetryStore();
  const { setCurrentPage } = useUIStore();

  return (
    <div className="p-4 rounded-xl glass-card flex flex-col justify-between space-y-3 select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded-md bg-[#E85D22]/10 text-[#E85D22]">
            <MapPin className="w-3.5 h-3.5" />
          </div>
          <span className="telemetry-label">Monitoring Zone &amp; UAV Position</span>
        </div>

        <button
          onClick={() => setCurrentPage('drone')}
          className="p-1 text-text-muted hover:text-text-primary transition-colors"
          title="Open Full Drone Telemetry & Tactical Map"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Mini Visual Map Canvas */}
      <div
        onClick={() => setCurrentPage('drone')}
        className="relative h-28 rounded-lg bg-[#F1EEE8] border border-black/[0.06] overflow-hidden cursor-pointer group"
      >
        {/* Topographic grid lines simulation */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#17151408_1px,transparent_1px),linear-gradient(to_bottom,#17151408_1px,transparent_1px)] bg-[size:16px_16px]" />

        {/* Hazard Zone Polygon Contour */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 100">
          <polygon
            points="30,20 90,15 170,35 150,85 70,90 20,60"
            fill="rgba(232, 93, 34, 0.12)"
            stroke="rgba(232, 93, 34, 0.5)"
            strokeWidth="1.5"
            strokeDasharray="3,3"
          />

          <path
            d="M 10 40 Q 80 20 190 50"
            fill="none"
            stroke="rgba(23, 21, 20, 0.1)"
            strokeWidth="1"
          />
          <path
            d="M 10 70 Q 100 50 190 80"
            fill="none"
            stroke="rgba(23, 21, 20, 0.08)"
            strokeWidth="1"
          />
        </svg>

        {/* Dynamic Drone Marker */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <div className="relative flex items-center justify-center">
            <span className="animate-ping absolute inline-flex h-6 w-6 rounded-full bg-[#E85D22] opacity-40" />
            <div className="relative w-5 h-5 rounded-full bg-[#E85D22] border-2 border-white shadow-md flex items-center justify-center">
              <Navigation
                className="w-2.5 h-2.5 text-white transform transition-transform"
                style={{ transform: `rotate(${drone.heading - 45}deg)` }}
              />
            </div>
          </div>
          <span className="text-[8px] font-mono font-bold text-text-primary bg-white px-1.5 py-0.2 rounded mt-1 border border-black/10 shadow-sm">
            {drone.id} ({drone.altitude}m)
          </span>
        </div>

        <div className="absolute bottom-1.5 left-2 text-[9px] font-mono text-text-muted">
          Sindhupalchok Escarpment
        </div>
      </div>

      {/* Coordinates readout */}
      <div className="flex items-center justify-between text-[10px] font-mono text-text-muted pt-1 border-t border-black/[0.05]">
        <span>LAT: {drone.latitude.toFixed(4)}° N</span>
        <span>LON: {drone.longitude.toFixed(4)}° E</span>
        <span className="text-text-primary font-semibold">{location.elevation}m MSL</span>
      </div>
    </div>
  );
};
