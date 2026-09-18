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
  X,
  Shield,
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
  const {
    currentPage,
    setCurrentPage,
    isSidebarCollapsed,
    toggleSidebar,
    isMobileMenuOpen,
    setMobileMenuOpen,
  } = useUIStore();
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

  const handleNavClick = (id: NavigationPage) => {
    setCurrentPage(id);
    setMobileMenuOpen(false);
  };

  const navListContent = (
    <div className="py-3 px-2 space-y-0.5 overflow-y-auto flex-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentPage === item.id;

        return (
          <button
            key={item.id}
            onClick={() => handleNavClick(item.id)}
            className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group relative ${
              isActive
                ? 'bg-[#E85D22]/10 text-[#E85D22] font-semibold shadow-xs'
                : 'text-text-secondary hover:text-text-primary hover:bg-black/[0.03]'
            } ${isSidebarCollapsed ? 'lg:justify-center lg:px-0' : ''}`}
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

            <span className={`truncate flex-1 text-left tracking-wide ${isSidebarCollapsed ? 'lg:hidden' : ''}`}>
              {item.label}
            </span>

            {item.badge !== undefined && (
              <span
                className={`flex items-center justify-center font-mono font-bold text-[10px] rounded-full shrink-0 ${
                  item.id === 'alerts'
                    ? 'bg-status-danger text-white px-1.5 py-0.2 shadow-sm'
                    : 'bg-black/10 text-text-secondary px-1.5'
                } ${isSidebarCollapsed ? 'lg:absolute lg:-top-1 lg:-right-1 lg:min-w-4 lg:h-4' : ''}`}
              >
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );

  const uavFooterContent = (
    <div className="p-2.5 border-t border-black/[0.06] bg-black/[0.02] space-y-2">
      <div
        onClick={() => handleNavClick('drone')}
        className={`p-2.5 rounded-xl bg-white border border-black/[0.06] hover:border-[#E85D22]/40 transition-all cursor-pointer shadow-sm ${
          isSidebarCollapsed ? 'lg:text-center' : ''
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-status-safe animate-pulse" />
            <span className={`text-[11px] font-mono font-bold text-text-primary ${isSidebarCollapsed ? 'lg:hidden' : ''}`}>
              {drone.id}
            </span>
          </div>

          <span className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-status-safe/10 text-status-safe font-semibold ${isSidebarCollapsed ? 'lg:hidden' : ''}`}>
            ONLINE
          </span>
        </div>

        <div className={`mt-1.5 pt-1.5 border-t border-black/[0.04] grid grid-cols-2 gap-1 text-[10px] font-mono text-text-muted ${isSidebarCollapsed ? 'lg:hidden' : ''}`}>
          <div className="flex items-center space-x-1">
            <Battery className="w-3 h-3 text-[#E85D22]" />
            <span className="text-text-secondary">{drone.battery.toFixed(0)}%</span>
          </div>
        </div>
      </div>

      {/* Desktop Collapse Toggle */}
      <button
        onClick={toggleSidebar}
        className="hidden lg:flex w-full items-center justify-center py-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-black/[0.03] transition-colors text-[10px] font-mono"
        title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
      >
        {isSidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>
    </div>
  );

  return (
    <>
      {/* ======================================================== */}
      {/* 1. DESKTOP PERSISTENT SIDEBAR */}
      {/* ======================================================== */}
      <aside
        className={`hidden lg:flex relative z-30 flex-col justify-between border-r border-black/[0.06] bg-white/80 backdrop-blur-xl transition-all duration-200 select-none ${
          isSidebarCollapsed ? 'w-14' : 'w-52'
        }`}
      >
        {navListContent}
        {uavFooterContent}
      </aside>

      {/* ======================================================== */}
      {/* 2. MOBILE SLIDE-OVER DRAWER & BACKDROP */}
      {/* ======================================================== */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop Overlay */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
          />

          {/* Slide Drawer Content */}
          <div className="relative z-50 w-72 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-left duration-250 border-r border-black/[0.08]">
            {/* Drawer Header */}
            <div className="p-4 border-b border-black/[0.06] flex items-center justify-between bg-black/[0.01]">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#E85D22] flex items-center justify-center text-white shadow-sm">
                  <Shield className="w-4 h-4 fill-white" />
                </div>
                <div>
                  <div className="font-extrabold text-sm tracking-wider text-text-primary font-display">
                    FALCON
                  </div>
                  <div className="text-[9px] text-text-muted font-mono tracking-widest uppercase">
                    NAVIGATION MENU
                  </div>
                </div>
              </div>

              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-black/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav items */}
            {navListContent}

            {/* Bottom UAV Status */}
            {uavFooterContent}
          </div>
        </div>
      )}
    </>
  );
};
