import React from 'react';
import {
  LayoutDashboard,
  Video,
  Cpu,
  Bell,
  Home,
  Menu,
} from 'lucide-react';
import { useUIStore } from '../../stores/useUIStore';
import { useAlertsStore } from '../../stores/useAlertsStore';
import { NavigationPage } from '../../types';

export const MobileNavBar: React.FC = () => {
  const { currentPage, setCurrentPage, toggleMobileMenu } = useUIStore();
  const { unreadCount } = useAlertsStore();

  const mainTabs: { id: NavigationPage; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'landing', label: 'Home', icon: Home },
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'monitor', label: 'Live', icon: Video },
    { id: 'ai-analysis', label: 'AI Vision', icon: Cpu },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: unreadCount > 0 ? unreadCount : undefined },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-t border-black/[0.08] px-2 py-1 flex items-center justify-around shadow-lg select-none pb-[env(safe-area-inset-bottom,0px)]"
    >
      {mainTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentPage === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => setCurrentPage(tab.id)}
            className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
              isActive
                ? 'text-[#E85D22] font-semibold'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            {/* Active Pill Indicator */}
            {isActive && (
              <span className="absolute top-0 w-6 h-0.5 bg-[#E85D22] rounded-full" />
            )}

            <div className="relative mt-0.5">
              <Icon className={`w-5 h-5 ${isActive ? 'text-[#E85D22]' : 'text-text-secondary'}`} />
              {tab.badge !== undefined && (
                <span className="absolute -top-1 -right-2 flex h-3.5 min-w-3.5 px-1 items-center justify-center rounded-full bg-status-danger text-[8px] font-mono font-bold text-white shadow-xs">
                  {tab.badge}
                </span>
              )}
            </div>

            <span className="text-[10px] tracking-tight mt-0.5 leading-none">
              {tab.label}
            </span>
          </button>
        );
      })}

      {/* More / Menu Button to open Drawer */}
      <button
        onClick={toggleMobileMenu}
        aria-label="Open full menu"
        className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-text-muted hover:text-text-primary transition-all"
      >
        <div className="relative mt-0.5">
          <Menu className="w-5 h-5 text-text-secondary" />
        </div>
        <span className="text-[10px] tracking-tight mt-0.5 leading-none">
          More
        </span>
      </button>
    </nav>
  );
};
