import React from 'react';
import { CheckCircle2, ArrowRight, ShieldAlert } from 'lucide-react';
import { useAlertsStore } from '../../stores/useAlertsStore';
import { useUIStore } from '../../stores/useUIStore';

export const RecentAlertsBanner: React.FC = () => {
  const { alerts, acknowledgeAlert } = useAlertsStore();
  const { setCurrentPage } = useUIStore();

  const activeAlerts = alerts.filter((a) => !a.acknowledged);
  const latest = activeAlerts[0] || alerts[0];

  if (!latest) {
    return (
      <div className="p-3.5 rounded-xl bg-white/70 border border-black/[0.06] flex items-center justify-between text-xs text-text-muted select-none shadow-sm">
        <div className="flex items-center space-x-2.5">
          <CheckCircle2 className="w-4 h-4 text-status-safe" />
          <span className="text-text-secondary font-medium">All monitoring sectors clear — Continuous autonomous watch active</span>
        </div>
        <span className="text-[10px] font-mono font-bold text-status-safe bg-status-safe/10 px-2 py-0.5 rounded">
          SYSTEM NOMINAL
        </span>
      </div>
    );
  }

  const isCritical = latest.level === 'CRITICAL' || latest.level === 'HIGH';

  return (
    <div
      className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 select-none transition-all shadow-sm ${
        isCritical
          ? 'bg-[#D9362E]/5 border-[#D9362E]/30'
          : 'bg-[#D98B16]/5 border-[#D98B16]/30'
      }`}
    >
      <div className="flex items-center space-x-3">
        <div
          className={`p-2 rounded-lg shrink-0 ${
            isCritical ? 'bg-status-danger/15 text-status-danger' : 'bg-status-warning/15 text-status-warning'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span
              className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded border ${
                isCritical
                  ? 'bg-status-danger text-white border-status-danger'
                  : 'bg-status-warning text-white border-status-warning'
              }`}
            >
              {latest.level} ALERT
            </span>
            <span className="text-xs font-bold text-text-primary">{latest.title}</span>
          </div>
          <p className="text-[11px] text-text-secondary mt-0.5 line-clamp-1">
            {latest.message}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2 shrink-0 w-full sm:w-auto justify-end">
        {!latest.acknowledged && (
          <button
            onClick={() => acknowledgeAlert(latest.id)}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-black/5 hover:bg-black/10 text-text-primary transition-colors"
          >
            Acknowledge
          </button>
        )}
        <button
          onClick={() => setCurrentPage('alerts')}
          className="px-3 py-1 rounded-lg text-xs font-semibold glass-button-primary flex items-center space-x-1"
        >
          <span>View All ({alerts.length})</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
