import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  X,
  Cpu,
  ArrowRight,
} from 'lucide-react';
import { useTelemetryStore } from '../../stores/useTelemetryStore';
import { useCameraStore } from '../../stores/useCameraStore';
import { useUIStore } from '../../stores/useUIStore';

export const SnapshotAnalysisDrawer: React.FC = () => {
  const { aiLatest, risk } = useTelemetryStore();
  const { analysisProgressStep, setAnalysisState } = useCameraStore();
  const { setCurrentPage } = useUIStore();

  if (analysisProgressStep === 'IDLE') return null;

  const isComplete = analysisProgressStep === 'DONE';

  return (
    <div className="absolute bottom-4 left-4 right-4 z-20 animate-in fade-in slide-in-from-bottom-2 duration-200 select-none">
      <div className="p-3.5 rounded-xl bg-[#0D0A09]/95 backdrop-blur-xl border border-white/[0.1] shadow-2xl space-y-2.5">
        {/* Progress Step Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
          <div className="flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-accent" />
            <div className="text-xs font-bold text-text-primary uppercase tracking-wide font-display">
              {analysisProgressStep === 'CAPTURED' && 'Frame Captured — Preparing Tensor Payload'}
              {analysisProgressStep === 'UPLOADING' && 'Uploading Frame to FALCON Model...'}
              {analysisProgressStep === 'ANALYZING' && 'Running FALCON-SegFormer Inference...'}
              {analysisProgressStep === 'DONE' &&
                (aiLatest.detected ? 'Hazard Detected: Landslide Slip Face' : 'Terrain Analysis: Stable / Clear')}
              {analysisProgressStep === 'ERROR' && 'Inference Processing Error'}
            </div>
          </div>

          <button
            onClick={() => setAnalysisState('IDLE')}
            className="p-1 text-text-muted hover:text-text-primary transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Complete Verdict or Progress */}
        {isComplete ? (
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1.5">
                {aiLatest.detected ? (
                  <span className="flex items-center space-x-1 text-status-danger font-bold">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>HAZARD ({(aiLatest.confidence * 100).toFixed(1)}%)</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-1 text-status-safe font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>STABLE ({(aiLatest.confidence * 100).toFixed(1)}%)</span>
                  </span>
                )}
              </div>

              <span className="text-text-muted">
                Area: <strong className="text-text-primary">{(aiLatest.affected_area * 100).toFixed(1)}%</strong>
              </span>

              <span className="text-text-muted">
                Combined Risk: <strong className="text-accent">{risk.score}%</strong>
              </span>
            </div>

            <button
              onClick={() => {
                setAnalysisState('IDLE');
                setCurrentPage('ai-analysis');
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold glass-button-primary flex items-center space-x-1"
            >
              <span>Inspect Workspace</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="h-1 w-full bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all duration-300"
                style={{
                  width:
                    analysisProgressStep === 'CAPTURED'
                      ? '25%'
                      : analysisProgressStep === 'UPLOADING'
                      ? '55%'
                      : analysisProgressStep === 'ANALYZING'
                      ? '85%'
                      : '100%',
                }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-text-muted">
              <span>Frame captured</span>
              <span>Uploading payload</span>
              <span>Tensor inference</span>
              <span>Fused</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
