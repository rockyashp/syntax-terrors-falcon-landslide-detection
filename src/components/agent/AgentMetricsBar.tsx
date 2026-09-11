import React from 'react';
import { ShieldAlert, Eye, Navigation, Cpu } from 'lucide-react';
import { AgentMetricSummary } from '../../types/agent';

interface AgentMetricsBarProps {
  metrics: AgentMetricSummary;
}

export const AgentMetricsBar: React.FC<AgentMetricsBarProps> = ({ metrics }) => {
  // Risk color mapping
  const getRiskColor = (level: string, score: number) => {
    if (score >= 70 || level === 'CRITICAL' || level === 'VERY_HIGH') {
      return {
        bg: 'bg-[#D9362E]/10',
        border: 'border-[#D9362E]/25',
        text: 'text-[#D9362E]',
        label: 'CRITICAL',
      };
    }
    if (score >= 50 || level === 'HIGH') {
      return {
        bg: 'bg-[#E85D22]/10',
        border: 'border-[#E85D22]/25',
        text: 'text-[#E85D22]',
        label: 'HIGH',
      };
    }
    if (score >= 25 || level === 'MODERATE') {
      return {
        bg: 'bg-[#D98B16]/10',
        border: 'border-[#D98B16]/25',
        text: 'text-[#D98B16]',
        label: 'MODERATE',
      };
    }
    return {
      bg: 'bg-[#2E9B68]/10',
      border: 'border-[#2E9B68]/25',
      text: 'text-[#2E9B68]',
      label: 'SAFE',
    };
  };

  const riskStyle = getRiskColor(metrics.riskLevel, metrics.riskScore);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-2">
      {/* 1. Risk Pill */}
      <div className={`flex flex-col p-2 rounded-lg border ${riskStyle.bg} ${riskStyle.border} transition-colors`}>
        <div className="flex items-center justify-between text-[10px] font-mono text-text-muted">
          <span className="font-semibold">RISK</span>
          <ShieldAlert className={`w-3 h-3 ${riskStyle.text}`} />
        </div>
        <div className="flex items-baseline space-x-1 mt-0.5">
          <span className={`text-sm font-extrabold font-mono ${riskStyle.text}`}>
            {metrics.riskScore}%
          </span>
          <span className={`text-[10px] font-bold uppercase tracking-wider ${riskStyle.text}`}>
            {metrics.riskLevel}
          </span>
        </div>
      </div>

      {/* 2. AI Confidence Pill */}
      <div
        className={`flex flex-col p-2 rounded-lg border ${
          metrics.aiDetected
            ? 'bg-[#E85D22]/10 border-[#E85D22]/25 text-[#E85D22]'
            : 'bg-black/[0.03] border-black/[0.06] text-text-primary'
        }`}
      >
        <div className="flex items-center justify-between text-[10px] font-mono text-text-muted">
          <span className="font-semibold">AI VISION</span>
          <Eye className={`w-3 h-3 ${metrics.aiDetected ? 'text-[#E85D22]' : 'text-text-muted'}`} />
        </div>
        <div className="flex items-baseline space-x-1 mt-0.5">
          <span className="text-sm font-extrabold font-mono">
            {metrics.aiDetected ? `${metrics.aiConfidence}%` : 'CLEAR'}
          </span>
          {metrics.aiDetected && (
            <span className="text-[10px] font-bold uppercase text-[#E85D22]">SLIP</span>
          )}
        </div>
      </div>

      {/* 3. Drone Status Pill */}
      <div className="flex flex-col p-2 rounded-lg border bg-black/[0.03] border-black/[0.06]">
        <div className="flex items-center justify-between text-[10px] font-mono text-text-muted">
          <span className="font-semibold">DRONE</span>
          <Navigation className="w-3 h-3 text-[#2E9B68]" />
        </div>
        <div className="flex items-baseline space-x-1 mt-0.5">
          <span className="text-sm font-extrabold font-mono text-[#2E9B68]">
            {metrics.droneBattery}%
          </span>
          <span className="text-[10px] font-medium text-text-secondary font-mono">
            {metrics.droneGps}
          </span>
        </div>
      </div>

      {/* 4. Sensors Status Pill */}
      <div
        className={`flex flex-col p-2 rounded-lg border ${
          metrics.warningSensorsCount > 0
            ? 'bg-[#D98B16]/10 border-[#D98B16]/25'
            : 'bg-black/[0.03] border-black/[0.06]'
        }`}
      >
        <div className="flex items-center justify-between text-[10px] font-mono text-text-muted">
          <span className="font-semibold">SENSORS</span>
          <Cpu className={`w-3 h-3 ${metrics.warningSensorsCount > 0 ? 'text-[#D98B16]' : 'text-[#2E9B68]'}`} />
        </div>
        <div className="flex items-baseline space-x-1 mt-0.5">
          <span
            className={`text-sm font-extrabold font-mono ${
              metrics.warningSensorsCount > 0 ? 'text-[#D98B16]' : 'text-[#2E9B68]'
            }`}
          >
            {metrics.sensorHealthRatio}
          </span>
          <span className="text-[10px] font-medium text-text-secondary font-mono">
            {metrics.warningSensorsCount > 0 ? `${metrics.warningSensorsCount} WARN` : 'ONLINE'}
          </span>
        </div>
      </div>
    </div>
  );
};
