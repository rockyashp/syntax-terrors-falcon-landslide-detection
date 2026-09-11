import React from 'react';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { Toast } from '../common/Toast';
import { CommandPalette } from '../common/CommandPalette';
import { WeatherModal } from '../weather/WeatherModal';
import { useUIStore } from '../../stores/useUIStore';
import { useLiveTelemetry } from '../../hooks/useLiveTelemetry';
import { LandingPage } from '../../pages/LandingPage';
import { OverviewPage } from '../../pages/OverviewPage';
import { LiveMonitorPage } from '../../pages/LiveMonitorPage';
import { AIAnalysisPage } from '../../pages/AIAnalysisPage';
import { RiskEnginePage } from '../../pages/RiskEnginePage';
import { SensorsPage } from '../../pages/SensorsPage';
import { DronePage } from '../../pages/DronePage';
import { SnapshotsPage } from '../../pages/SnapshotsPage';
import { AlertsPage } from '../../pages/AlertsPage';
import { SystemPage } from '../../pages/SystemPage';
import { FalconAgent } from '../agent/FalconAgent';

export const AppShell: React.FC = () => {
  // Activate live telemetry hook
  useLiveTelemetry();
  const { currentPage } = useUIStore();

  // If on landing page, show standalone hero
  if (currentPage === 'landing') {
    return (
      <div className="min-h-screen bg-[#F7F5F0] text-[#171514] antialiased">
        <LandingPage />
        <Toast />
        <CommandPalette />
        <FalconAgent />
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'overview':
        return <OverviewPage />;
      case 'monitor':
        return <LiveMonitorPage />;
      case 'ai-analysis':
        return <AIAnalysisPage />;
      case 'risk-engine':
        return <RiskEnginePage />;
      case 'sensors':
        return <SensorsPage />;
      case 'drone':
        return <DronePage />;
      case 'snapshots':
        return <SnapshotsPage />;
      case 'alerts':
        return <AlertsPage />;
      case 'system':
        return <SystemPage />;
      default:
        return <OverviewPage />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F5F0] text-[#171514] antialiased">
      {/* Top Bar */}
      <TopBar />

      <div className="flex flex-1 relative overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar />

        {/* Main Content Viewport */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto max-w-[1920px] w-full mx-auto">
          {renderPage()}
        </main>
      </div>

      {/* Global Modals, Toast, and Command Palette */}
      <Toast />
      <CommandPalette />
      <WeatherModal />
      <FalconAgent />
    </div>
  );
};
