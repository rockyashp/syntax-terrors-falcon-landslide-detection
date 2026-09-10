import React from 'react';
import { Cpu, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import { useTelemetryStore } from '../../stores/useTelemetryStore';
import { useUIStore } from '../../stores/useUIStore';

export const AIDetectionSummary: React.FC = () => {
  const { aiLatest } = useTelemetryStore();
  const { setCurrentPage } = useUIStore();

  const isHazard = aiLatest.detected;

  return (
    <div className="p-4 rounded-xl glass-card flex flex-col justify-between space-y-3 select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded-md bg-[#3478C8]/10 text-[#3478C8]">
            <Cpu className="w-3.5 h-3.5" />
          </div>
          <span className="telemetry-label">Latest AI Vision Inference</span>
        </div>

        <span className="text-[9px] font-mono text-text-muted px-1.5 py-0.5 rounded bg-black/[0.04] border border-black/[0.06]">
          {aiLatest.model || 'FALCON-SegFormer'}
        </span>
      </div>

      {/* Detection Status Banner */}
      <div
        className={`p-3 rounded-lg border flex items-center justify-between ${
          isHazard
            ? 'bg-status-danger/10 border-status-danger/40 text-status-danger'
            : 'bg-status-safe/10 border-status-safe/30 text-status-safe'
        }`}
      >
        <div className="flex items-center space-x-2.5">
          {isHazard ? (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          )}
          <div>
            <div className="text-xs font-bold uppercase tracking-wide">
              {isHazard ? 'Landslide Slip Face Detected' : 'Clear Slope Surface'}
            </div>
            <div className="text-[10px] font-mono opacity-80">
              Temporal: {aiLatest.temporalStatus || 'NONE'} ({aiLatest.consecutiveFramesDetected || 0} frames)
            </div>
          </div>
        </div>

        <div className="text-right font-mono">
          <div className="text-sm font-bold">
            {(aiLatest.confidence * 100).toFixed(1)}%
          </div>
          <div className="text-[9px] uppercase opacity-75">Confidence</div>
        </div>
      </div>

      {/* Metrics Row & Link */}
      <div className="flex items-center justify-between text-[11px] font-mono text-text-muted pt-1 border-t border-black/[0.05]">
        <div className="flex items-center space-x-3">
          <span>Area: <strong className="text-text-primary">{(aiLatest.affected_area * 100).toFixed(1)}%</strong></span>
          <span>Time: <strong className="text-text-primary">{aiLatest.inferenceTimeMs || 142}ms</strong></span>
        </div>

        <button
          onClick={() => setCurrentPage('ai-analysis')}
          className="flex items-center space-x-1 text-[#E85D22] hover:text-[#F06A2A] font-semibold transition-colors"
        >
          <span>Workspace</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
