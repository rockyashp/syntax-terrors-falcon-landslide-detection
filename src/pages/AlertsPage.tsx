import React from 'react';
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Info,
  Check,
  CheckCheck,
  MapPin,
  ExternalLink,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useAlertsStore } from '../stores/useAlertsStore';
import { useUIStore } from '../stores/useUIStore';

export const AlertsPage: React.FC = () => {
  const {
    alerts,
    acknowledgeAlert,
    acknowledgeAll,
    filter,
    setFilter,
    isAudioEnabled,
    toggleAudio,
  } = useAlertsStore();
  const { setCurrentPage, showToast } = useUIStore();

  const filteredAlerts = alerts.filter((a) => {
    if (filter === 'ALL') return true;
    return a.level === filter;
  });

  const unreadCount = alerts.filter((a) => !a.acknowledged).length;

  const handleAcknowledge = (id: string) => {
    acknowledgeAlert(id);
    showToast('Alert Acknowledged', 'Logged in local operations journal', 'info');
  };

  const handleAcknowledgeAll = () => {
    acknowledgeAll();
    showToast('All Alerts Acknowledged', 'Operations queue cleared', 'success');
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl glass-1 border border-white/[0.08]">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-status-danger/20 text-status-danger">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-text-primary uppercase tracking-wider font-display">
              Disaster Alert &amp; Incident Center
            </h1>
            <p className="text-xs font-mono text-text-muted">
              Active Geotechnical Hazards &amp; AI-Triggered Landslide Warnings ({unreadCount} unacknowledged)
            </p>
          </div>
        </div>

        {/* Filter Pills & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Audio toggle */}
          <button
            onClick={toggleAudio}
            className={`p-2 rounded-lg text-xs font-semibold glass-button transition-colors ${
              isAudioEnabled ? 'text-accent border-accent/40' : 'text-text-muted'
            }`}
            title={isAudioEnabled ? 'Audio Alert Siren: ON' : 'Audio Alert Siren: OFF'}
          >
            {isAudioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <div className="flex items-center space-x-1 p-1 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs font-mono">
            {(['ALL', 'CRITICAL', 'HIGH', 'WARNING', 'INFO'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFilter(lvl)}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  filter === lvl
                    ? 'bg-accent/20 text-[#FF8A3D] font-bold border border-accent/30'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleAcknowledgeAll}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold glass-button flex items-center space-x-1.5 text-text-primary hover:bg-white/10"
            >
              <CheckCheck className="w-3.5 h-3.5 text-status-safe" />
              <span>Acknowledge All</span>
            </button>
          )}
        </div>
      </div>

      {/* Alerts Feed */}
      {filteredAlerts.length === 0 ? (
        <div className="p-16 text-center rounded-2xl glass-2 border border-white/[0.08] space-y-3">
          <CheckCircle2 className="w-12 h-12 mx-auto text-status-safe opacity-60" />
          <div className="text-sm font-bold text-text-primary uppercase tracking-wider font-display">
            No Active Disaster Alerts
          </div>
          <p className="text-xs text-text-muted max-w-sm mx-auto">
            Autonomous monitoring is online. Any confirmed slip face detection or elevated geotechnical sensor anomaly will appear here immediately.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map((alert) => {
            const isCritical = alert.level === 'CRITICAL' || alert.level === 'HIGH';

            return (
              <div
                key={alert.id}
                className={`p-4 rounded-xl glass-card border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                  !alert.acknowledged
                    ? isCritical
                      ? 'border-status-danger/40 bg-status-danger/[0.04] shadow-glow-danger'
                      : 'border-status-warning/40 bg-status-warning/[0.04]'
                    : 'border-white/[0.06] opacity-75'
                }`}
              >
                {/* Left: Icon, Severity & Content */}
                <div className="flex items-start space-x-3.5 flex-1">
                  <div
                    className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                      isCritical
                        ? 'bg-status-danger/20 text-status-danger'
                        : alert.level === 'WARNING'
                        ? 'bg-status-warning/20 text-status-warning'
                        : 'bg-status-info/20 text-status-info'
                    }`}
                  >
                    <ShieldAlert className="w-5 h-5" />
                  </div>

                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                          isCritical
                            ? 'bg-status-danger/30 text-white border-status-danger/60'
                            : alert.level === 'WARNING'
                            ? 'bg-status-warning/30 text-white border-status-warning/60'
                            : 'bg-status-info/30 text-white border-status-info/60'
                        }`}
                      >
                        {alert.level}
                      </span>
                      <h3 className="text-xs font-bold text-text-primary font-display uppercase tracking-wide">
                        {alert.title}
                      </h3>
                      <span className="text-[10px] font-mono text-text-muted">
                        {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-xs text-text-secondary leading-relaxed">
                      {alert.message}
                    </p>

                    {/* Geotechnical & AI Metrics Pill Row */}
                    <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono text-text-muted pt-1">
                      {alert.location && (
                        <span className="flex items-center space-x-1 text-text-secondary">
                          <MapPin className="w-3 h-3 text-accent" />
                          <span>{alert.location.lat.toFixed(4)}° N, {alert.location.lon.toFixed(4)}° E</span>
                        </span>
                      )}
                      {alert.metrics?.aiConfidence !== undefined && (
                        <span>
                          AI Confidence: <strong className="text-text-primary">{(alert.metrics.aiConfidence * 100).toFixed(1)}%</strong>
                        </span>
                      )}
                      {alert.metrics?.affectedArea !== undefined && (
                        <span>
                          Area: <strong className="text-[#FF8A3D]">{(alert.metrics.affectedArea * 100).toFixed(1)}%</strong>
                        </span>
                      )}
                      {alert.metrics?.riskScore !== undefined && (
                        <span>
                          Risk Score: <strong className="text-status-danger">{alert.metrics.riskScore}%</strong>
                        </span>
                      )}
                      {alert.temporalConfidence && (
                        <span className="text-text-secondary uppercase">
                          Temporal: {alert.temporalConfidence}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
                  <button
                    onClick={() => setCurrentPage('ai-analysis')}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold glass-button flex items-center space-x-1.5"
                  >
                    <span>Inspect AI</span>
                    <ExternalLink className="w-3 h-3 text-accent" />
                  </button>

                  <button
                    onClick={() => setCurrentPage('risk-engine')}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold glass-button flex items-center space-x-1.5"
                  >
                    <span>Risk Engine</span>
                    <ExternalLink className="w-3 h-3 text-accent" />
                  </button>

                  {!alert.acknowledged ? (
                    <button
                      onClick={() => handleAcknowledge(alert.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold glass-button-primary flex items-center space-x-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Acknowledge</span>
                    </button>
                  ) : (
                    <span className="text-[10px] font-mono text-status-safe bg-status-safe/10 border border-status-safe/30 px-2.5 py-1 rounded">
                      ACKNOWLEDGED
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
