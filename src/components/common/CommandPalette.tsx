import React, { useState, useEffect } from 'react';
import {
  Search,
  LayoutDashboard,
  Video,
  Cpu,
  Zap,
  Activity,
  Navigation,
  Image as ImageIcon,
  Bell,
  Server,
  Camera,
  RefreshCw,
  CloudSun,
  X,
  Home,
} from 'lucide-react';
import { useUIStore } from '../../stores/useUIStore';
import { useCameraStore } from '../../stores/useCameraStore';
import { useTelemetryStore } from '../../stores/useTelemetryStore';

interface ActionItem {
  id: string;
  title: string;
  category: string;
  icon: React.ElementType;
  action: () => void;
}

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setCommandPaletteOpen,
    setCurrentPage,
    setWeatherModalOpen,
    showToast,
  } = useUIStore();
  const { setInputModalOpen } = useCameraStore();
  const { fetchFullTelemetry } = useTelemetryStore();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      }
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const actions: ActionItem[] = [
    {
      id: 'nav-landing',
      title: 'Go to Hero Landing Page',
      category: 'Navigation',
      icon: Home,
      action: () => {
        setCurrentPage('landing');
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'nav-overview',
      title: 'Go to Overview Dashboard',
      category: 'Navigation',
      icon: LayoutDashboard,
      action: () => {
        setCurrentPage('overview');
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'nav-monitor',
      title: 'Go to Live Camera Monitor',
      category: 'Navigation',
      icon: Video,
      action: () => {
        setCurrentPage('monitor');
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'nav-ai',
      title: 'Go to AI Analysis & SegFormer Workspace',
      category: 'Navigation',
      icon: Cpu,
      action: () => {
        setCurrentPage('ai-analysis');
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'nav-risk',
      title: 'Go to Risk Engine & Multi-Modal Fusion',
      category: 'Navigation',
      icon: Zap,
      action: () => {
        setCurrentPage('risk-engine');
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'nav-sensors',
      title: 'Go to Geotechnical Sensors & IoT',
      category: 'Navigation',
      icon: Activity,
      action: () => {
        setCurrentPage('sensors');
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'nav-drone',
      title: 'Go to Drone Operations & Map',
      category: 'Navigation',
      icon: Navigation,
      action: () => {
        setCurrentPage('drone');
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'nav-snapshots',
      title: 'Go to Snapshot Archive',
      category: 'Navigation',
      icon: ImageIcon,
      action: () => {
        setCurrentPage('snapshots');
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'nav-alerts',
      title: 'Go to Disaster Alerts',
      category: 'Navigation',
      icon: Bell,
      action: () => {
        setCurrentPage('alerts');
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'nav-system',
      title: 'Go to System Health Matrix',
      category: 'Navigation',
      icon: Server,
      action: () => {
        setCurrentPage('system');
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'action-camera-modal',
      title: 'Configure Camera Feed (Webcam / Upload / Video)',
      category: 'Camera',
      icon: Camera,
      action: () => {
        setInputModalOpen(true);
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'action-weather',
      title: 'View Meteorological Details',
      category: 'Environment',
      icon: CloudSun,
      action: () => {
        setWeatherModalOpen(true);
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'action-refresh',
      title: 'Sync Telemetry with Backend API',
      category: 'System',
      icon: RefreshCw,
      action: () => {
        fetchFullTelemetry();
        showToast('System Refreshed', 'Telemetry synced with backend', 'info');
        setCommandPaletteOpen(false);
      },
    },
  ];

  const filtered = actions.filter(
    (a) =>
      a.title.toLowerCase().includes(query.toLowerCase()) ||
      a.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start justify-center pt-24 px-4 select-none">
      <div
        className="w-full max-w-xl bg-white border border-black/[0.1] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center px-4 border-b border-black/[0.06] bg-[#F7F5F0]">
          <Search className="w-5 h-5 text-text-muted mr-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or navigate..."
            autoFocus
            className="w-full py-4 bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none font-sans"
          />
          <button
            onClick={() => setCommandPaletteOpen(false)}
            className="p-1 rounded-lg text-text-muted hover:text-text-primary"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-text-muted text-xs font-mono">
              No matching commands found
            </div>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg hover:bg-black/[0.04] text-text-secondary hover:text-text-primary transition-all text-xs group text-left"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-1.5 rounded-md bg-black/[0.03] group-hover:bg-[#E85D22]/10 group-hover:text-[#E85D22] transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-medium text-text-primary">{item.title}</span>
                      <span className="ml-2 text-[10px] font-mono text-text-muted uppercase">
                        [{item.category}]
                      </span>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-black/[0.06] bg-[#F7F5F0] flex items-center justify-between text-[11px] font-mono text-text-muted">
          <span>Navigate with arrows</span>
          <span>ESC to close</span>
        </div>
      </div>
    </div>
  );
};
