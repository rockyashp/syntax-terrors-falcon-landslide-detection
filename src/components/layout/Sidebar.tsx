import React from 'react';
import {
  LayoutDashboard,
  Video,
  Cpu,
  Zap,
  Activity,
  Navigation,
  Image as ImageIcon,
  Bell,
  Server,
  ChevronLeft,
  ChevronRight,
  Battery,
  Home,
} from 'lucide-react';
import { useUIStore } from '../../stores/useUIStore';
import { useTelemetryStore } from '../../stores/useTelemetryStore';
import { useAlertsStore } from '../../stores/useAlertsStore';
import { NavigationPage } from '../../types';

interface NavItem {
  id: NavigationPage;
  label: string;
  icon: React.ElementType;
  badge?: number | string;
}

export const Sidebar: React.FC = () => {
  const { currentPage, setCurrentPage, isSidebarCollapsed, toggleSidebar } = useUIStore();
  const { drone } = useTelemetryStore();
  const { unreadCount } = useAlertsStore();

  const navItems: NavItem[] = [
    { id: 'landing', label: 'Home / Intro', icon: Home },
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'monitor', label: 'Live Monitor', icon: Video },
    { id: 'ai-analysis', label: 'AI Analysis', icon: Cpu },
    { id: 'risk-engine', label: 'Risk Engine', icon: Zap },
    { id: 'sensors', label: 'Sensors & IoT', icon: Activity },
    { id: 'drone', label: 'Drone Ops', icon: Navigation },
    { id: 'snapshots', label: 'Snapshots', icon: ImageIcon },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: unreadCount > 0 ? unreadCount : undefined },
    { id: 'system', label: 'System Health', icon: Server },
  ];

  return (
    <aside
      className={`relative z-30 flex flex-col justify-between border-r border-black/[0.06] bg-white/80 backdrop-blur-xl transition-all duration-200 select-none ${
        isSidebarCollapsed ? 'w-14' : 'w-52'
      }`}
    >
      {/* Nav items */}
      <div className="py-3 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center space-x-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all group relative ${
                isActive
                  ? 'bg-[#E85D22]/10 text-[#E85D22] font-semibold'
                  : 'text-text-secondary hover:text-text-primary hover:bg-black/[0.03]'
              } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
              title={isSidebarCollapsed ? item.label : undefined}
            >
              {isActive && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#E85D22] rounded-r" />
              )}

              <Icon
                className={`w-4 h-4 shrink-0 ${
                  isActive ? 'text-[#E85D22]' : 'text-text-muted group-hover:text-text-primary'
                }`}
              />

              {!isSidebarCollapsed && (
                <span className="truncate flex-1 text-left tracking-wide">
                  {item.label}
                </span>
              )}

              {item.badge !== undefined && (
                <span
                  className={`flex items-center justify-center font-mono font-bold text-[10px] rounded-full shrink-0 ${
                    item.id === 'alerts'
                      ? 'bg-status-danger text-white px-1.5 py-0.2 shadow-sm'
                      : 'bg-black/10 text-text-secondary px-1.5'
                  } ${isSidebarCollapsed ? 'absolute -top-1 -right-1 min-w-4 h-4' : ''}`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom UAV Status */}
      <div className="p-2 border-t border-black/[0.06] bg-black/[0.02] space-y-1.5">
        <div
          onClick={() => setCurrentPage('drone')}
          className={`p-2 rounded-lg bg-white border border-black/[0.06] hover:border-[#E85D22]/40 transition-all cursor-pointer shadow-sm ${
            isSidebarCollapsed ? 'text-center' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-status-safe" />
              {!isSidebarCollapsed && (
                <span className="text-[11px] font-mono font-bold text-text-primary">
                  {drone.id}
                </span>
              )}
            </div>

            {!isSidebarCollapsed && (
              <span className="text-[9px] font-mono uppercase px-1 py-0.2 rounded bg-status-safe/10 text-status-safe font-semibold">
                ONLINE
              </span>
            )}
          </div>

          {!isSidebarCollapsed && (
            <div className="mt-1.5 pt-1.5 border-t border-black/[0.04] grid grid-cols-2 gap-1 text-[10px] font-mono text-text-muted">
              <div className="flex items-center space-x-1">
                <Battery className="w-3 h-3 text-[#E85D22]" />
                <span className="text-text-secondary">{drone.battery.toFixed(0)}%</span>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center py-1 rounded text-text-muted hover:text-text-primary hover:bg-black/[0.03] transition-colors text-[10px] font-mono"
        >
          {isSidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>
    </aside>
  );
};
