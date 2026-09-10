import React from 'react';
import {
  Navigation,
  Battery,
  MapPin,
} from 'lucide-react';
import { useTelemetryStore } from '../stores/useTelemetryStore';
import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
import L from 'leaflet';

const createDroneIcon = (heading: number) => {
  return L.divIcon({
    className: 'custom-drone-icon',
    html: `
      <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
        <span style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background: #E85D22; opacity: 0.4; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
        <div style="width: 24px; height: 24px; border-radius: 50%; background: #E85D22; border: 2px solid #FFFFFF; box-shadow: 0 2px 8px rgba(232, 93, 34, 0.5); display: flex; align-items: center; justify-content: center; transform: rotate(${heading - 45}deg);">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

export const DronePage: React.FC = () => {
  const { drone, location } = useTelemetryStore();

  const escarpmentZoneCoords: [number, number][] = [
    [27.922, 85.838],
    [27.925, 85.855],
    [27.908, 85.862],
    [27.902, 85.845],
    [27.912, 85.835],
  ];

  return (
    <div className="space-y-4 animate-in fade-in duration-200 select-none">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl glass-card">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-[#E85D22]/10 text-[#E85D22]">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-text-primary uppercase tracking-wider font-display">
              {drone.id} — {drone.name || 'FALCON Recon UAV'}
            </h1>
            <p className="text-xs font-mono text-text-muted">
              Autonomous Escarpment Reconnaissance &amp; Aerial Surveillance Operations
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 font-mono text-xs">
          <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-status-safe/10 border border-status-safe/30 text-status-safe font-bold">
            <span className="h-2 w-2 rounded-full bg-status-safe animate-pulse" />
            <span>{drone.status || 'ONLINE'}</span>
          </span>
        </div>
      </div>

      {/* Grid: Map (8 Cols) & UAV Telemetry Diagnostics (4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Tactical Map Container */}
        <div className="lg:col-span-8 rounded-2xl glass-card overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-3.5 bg-white border-b border-black/[0.06] text-xs font-mono">
            <div className="flex items-center space-x-2 text-text-secondary">
              <MapPin className="w-4 h-4 text-[#E85D22]" />
              <span className="font-bold text-text-primary">{location.name.toUpperCase()}</span>
            </div>
            <div className="text-text-muted">
              GPS Lock: <span className="text-status-safe font-bold">{drone.gpsStatus || 'LOCKED'}</span>
            </div>
          </div>

          <div className="h-[460px] w-full relative">
            <MapContainer
              center={[location.lat, location.lon]}
              zoom={14}
              scrollWheelZoom={true}
              className="h-full w-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <Polygon
                positions={escarpmentZoneCoords}
                pathOptions={{
                  color: '#E85D22',
                  weight: 2,
                  fillColor: '#E85D22',
                  fillOpacity: 0.15,
                  dashArray: '4, 4',
                }}
              />

              <Marker
                position={[location.lat, location.lon]}
                icon={createDroneIcon(drone.heading)}
              >
                <Popup className="text-xs font-mono">
                  <div className="font-bold text-[#E85D22]">{drone.id}</div>
                  <div>Altitude: {drone.altitude}m MSL</div>
                  <div>Speed: {drone.speed} m/s</div>
                  <div>Heading: {drone.heading}°</div>
                </Popup>
              </Marker>
            </MapContainer>
          </div>

          {/* Bottom Coordinate Bar */}
          <div className="p-3 bg-white border-t border-black/[0.06] flex items-center justify-between text-xs font-mono text-text-muted">
            <div>
              COORDINATES:{' '}
              <span className="text-text-primary font-bold">
                {location.lat.toFixed(5)}° N, {location.lon.toFixed(5)}° E
              </span>
            </div>
            <div>
              ELEVATION:{' '}
              <span className="text-[#E85D22] font-bold">{drone.altitude} m MSL</span>
            </div>
          </div>
        </div>

        {/* Right UAV Telemetry Cards (4 Cols) */}
        <div className="lg:col-span-4 space-y-3 font-mono text-xs select-none">
          <div className="p-5 rounded-2xl glass-card space-y-4">
            <div className="telemetry-label text-text-secondary border-b border-black/[0.06] pb-2">
              UAV System Diagnostics
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div className="p-3 rounded-xl bg-black/[0.02] border border-black/[0.04]">
                <div className="flex items-center space-x-1.5 text-text-muted mb-1">
                  <Battery className="w-3.5 h-3.5 text-[#E85D22]" />
                  <span>BATTERY</span>
                </div>
                <div className="text-xl font-bold text-text-primary">
                  {drone.battery.toFixed(0)}%
                </div>
              </div>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-black/[0.06] text-[11px]">
              <div className="flex justify-between py-1 border-b border-black/[0.04]">
                <span className="text-text-muted">Camera Sensor:</span>
                <span className="text-text-primary font-bold">{drone.resolution || '3840 × 2160 (4K UHD)'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-black/[0.04]">
                <span className="text-text-muted">Stream Frame Rate:</span>
                <span className="text-text-primary font-bold">{drone.streamFps || 24} FPS</span>
              </div>
              <div className="flex justify-between py-1 border-b border-black/[0.04]">
                <span className="text-text-muted">Network Protocol:</span>
                <span className="text-text-primary font-bold">{drone.network || '5G NR Uplink'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-text-muted">Gimbal Stabilization:</span>
                <span className="text-status-safe font-bold">3-Axis Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
