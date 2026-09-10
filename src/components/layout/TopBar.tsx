import React, { useState, useEffect } from 'react';
import {
  Search,
  Bell,
  CloudSun,
  Menu,
  Shield,
  MapPin,
  RefreshCw,
  Home,
} from 'lucide-react';
import { useTelemetryStore } from '../../stores/useTelemetryStore';
import { useAlertsStore } from '../../stores/useAlertsStore';
import { useUIStore } from '../../stores/useUIStore';

export const TopBar: React.FC = () => {
  const {
    location,
    wsStatus,
    apiConnected,
    weather,
    isLoading,
    fetchFullTelemetry,
  } = useTelemetryStore();
  const { unreadCount } = useAlertsStore();
  const {
    toggleSidebar,
    setCommandPaletteOpen,
    setWeatherModalOpen,
    setCurrentPage,
    showToast,
  } = useUIStore();

  const [timeStr, setTimeStr] = useState<string>('');
  const [utcStr, setUtcStr] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
      setUtcStr(now.toISOString().substring(11, 19) + ' UTC');
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    await fetchFullTelemetry();
    showToast('System Refreshed', 'Telemetry synchronized with backend', 'info');
  };

  const isWsLive = wsStatus === 'CONNECTED';

  return (
    <header className="h-14 border-b border-black/[0.06] bg-white/80 backdrop-blur-xl px-4 lg:px-6 flex items-center justify-between sticky top-0 z-40 select-none">
      {/* Left: Brand & Location */}
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleSidebar}
          aria-label="Toggle Navigation"
          className="p-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-black/5 lg:hidden transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand */}
        <div
          onClick={() => setCurrentPage('landing')}
          className="flex items-center space-x-2.5 cursor-pointer group"
          title="Return to Product Landing Page"
        >
          <div className="w-7 h-7 rounded-lg bg-[#E85D22] flex items-center justify-center text-white shadow-sm">
            <Shield className="w-4 h-4 fill-white" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="font-extrabold text-sm tracking-wider text-text-primary font-display">
              FALCON
            </span>
            <span className="text-[10px] text-text-muted font-mono tracking-widest uppercase font-bold">
              / COMMAND CENTER
            </span>
          </div>
        </div>

        {/* Location Divider */}
        <div className="hidden md:block h-4 w-[1px] bg-black/[0.08]" />

        {/* Escarpment Zone */}
        <div className="hidden md:flex items-center space-x-2 text-xs">
          <MapPin className="w-3.5 h-3.5 text-[#E85D22] shrink-0" />
          <span className="font-semibold text-text-primary tracking-wide">
            {location.name.toUpperCase()}
          </span>
          <span className="text-text-muted font-mono text-[11px]">
            ({location.lat.toFixed(4)}° N, {location.lon.toFixed(4)}° E · {location.elevation}m)
          </span>
        </div>
      </div>

      {/* Middle: Live Connection Status */}
      <div className="hidden lg:flex items-center space-x-3 text-xs font-mono">
        <div
          className={`flex items-center space-x-2 px-3 py-1 rounded-full border shadow-sm ${
            isWsLive
              ? 'bg-status-safe/10 border-status-safe/30 text-status-safe'
              : apiConnected
              ? 'bg-status-warning/10 border-status-warning/30 text-status-warning'
              : 'bg-status-danger/10 border-status-danger/30 text-status-danger'
          }`}
        >
          <span className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isWsLive ? 'bg-status-safe' : 'bg-status-warning'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isWsLive ? 'bg-status-safe' : 'bg-status-warning'
              }`}
            />
          </span>
          <span className="font-bold tracking-wider">
            {isWsLive ? '● ALL SYSTEMS OPERATIONAL' : apiConnected ? '● HTTP POLLING ACTIVE' : '● OFFLINE'}
          </span>
        </div>
      </div>

      {/* Right: Weather, Search, Time, Notifications */}
      <div className="flex items-center space-x-2.5">
        <button
          onClick={() => setCurrentPage('landing')}
          className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-black/[0.03] hover:bg-black/[0.06] border border-black/[0.06] text-text-secondary hover:text-text-primary transition-all text-xs font-medium"
          title="View Intro Hero Page"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </button>

        {/* Weather Quick Pill */}
        <button
          onClick={() => setWeatherModalOpen(true)}
          className="hidden xl:flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-black/[0.03] hover:bg-black/[0.06] border border-black/[0.06] text-text-secondary hover:text-text-primary transition-all text-xs font-mono"
          title="Meteorological Details"
        >
          <CloudSun className="w-3.5 h-3.5 text-[#E85D22]" />
          <span>{weather.temperature.toFixed(1)}°C</span>
        </button>

        {/* Sync Button */}
        <button
          onClick={handleRefresh}
          className="p-1.5 rounded-md bg-black/[0.03] hover:bg-black/[0.06] border border-black/[0.06] text-text-secondary hover:text-text-primary transition-all"
          title="Sync with Backend"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-accent' : ''}`} />
        </button>

        {/* Command Search Button */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="hidden sm:flex items-center space-x-2 px-2.5 py-1 rounded-md bg-black/[0.03] hover:bg-black/[0.06] border border-black/[0.06] text-text-muted hover:text-text-primary transition-all text-xs font-mono"
          title="Command Palette (Ctrl + K)"
        >
          <Search className="w-3.5 h-3.5 text-text-muted" />
          <span>Search</span>
          <kbd className="text-[10px] bg-black/[0.06] px-1 rounded text-text-secondary font-mono">⌘K</kbd>
        </button>

        {/* Telemetry Clock */}
        <div className="hidden sm:flex flex-col items-end px-2 text-right font-mono">
          <div className="text-xs font-bold text-text-primary">{timeStr}</div>
          <div className="text-[9px] text-text-muted">{utcStr}</div>
        </div>

        {/* Notifications Icon with Badge */}
        <button
          onClick={() => setCurrentPage('alerts')}
          className="relative p-1.5 rounded-md bg-black/[0.03] hover:bg-black/[0.06] border border-black/[0.06] text-text-secondary hover:text-text-primary transition-all"
          title="Disaster Alerts"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-status-danger text-[9px] font-mono font-bold text-white shadow-sm">
              {unreadCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
