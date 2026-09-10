import React from 'react';
import { Cpu, Radio, Thermometer, Droplets, Flame } from 'lucide-react';
import { useTelemetryStore } from '../../stores/useTelemetryStore';

export const ESP32Telemetry: React.FC = () => {
  const { iotPayload } = useTelemetryStore();

  return (
    <div className="p-4 rounded-xl glass-card flex flex-col justify-between space-y-3 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded-md bg-[#E85D22]/10 text-[#E85D22]">
            <Cpu className="w-3.5 h-3.5" />
          </div>
          <span className="telemetry-label">ESP32 IoT Telemetry</span>
        </div>

        <span className="flex items-center space-x-1 text-[9px] font-mono text-status-safe bg-status-safe/10 border border-status-safe/30 px-2 py-0.5 rounded font-bold">
          <span className="h-1.5 w-1.5 rounded-full bg-status-safe animate-pulse" />
          <span>CONNECTED</span>
        </span>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2 py-1">
        <div className="p-2.5 rounded-lg bg-black/[0.02] border border-black/[0.04]">
          <div className="flex items-center space-x-1 text-[10px] font-mono text-text-muted mb-0.5">
            <Thermometer className="w-3 h-3 text-[#E85D22]" />
            <span>TEMP</span>
          </div>
          <div className="text-sm font-mono font-bold text-text-primary">
            {iotPayload.temp.toFixed(1)}°C
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-black/[0.02] border border-black/[0.04]">
          <div className="flex items-center space-x-1 text-[10px] font-mono text-text-muted mb-0.5">
            <Droplets className="w-3 h-3 text-[#3478C8]" />
            <span>HUMID</span>
          </div>
          <div className="text-sm font-mono font-bold text-text-primary">
            {iotPayload.humidity.toFixed(0)}%
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-black/[0.02] border border-black/[0.04]">
          <div className="flex items-center space-x-1 text-[10px] font-mono text-text-muted mb-0.5">
            <Flame className="w-3 h-3 text-status-safe" />
            <span>GAS</span>
          </div>
          <div className="text-sm font-mono font-bold text-text-primary">
            {iotPayload.gas} <span className="text-[9px] text-text-muted font-normal">ppm</span>
          </div>
        </div>
      </div>

      {/* MQTT Network Link Details */}
      <div className="pt-2 border-t border-black/[0.05] flex items-center justify-between text-[10px] font-mono text-text-muted">
        <div className="flex items-center space-x-1.5 truncate">
          <Radio className="w-3 h-3 text-[#E85D22] shrink-0" />
          <span className="truncate">{iotPayload.mqttBroker || 'broker.hivemq.com'}</span>
        </div>
        <span className="text-text-secondary">{iotPayload.mqttTopic || 'drone/disaster/telemetry'}</span>
      </div>
    </div>
  );
};
