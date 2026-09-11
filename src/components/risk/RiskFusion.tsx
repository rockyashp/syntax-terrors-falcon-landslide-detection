import React from 'react';
import { Eye, Cpu, ShieldAlert } from 'lucide-react';

interface Props {
  imageScorePercent: number;
  numericalScorePercent: number;
  finalScorePercent: number;
  visionWeight?: number;
  geoWeight?: number;
  overrides?: string[];
}

export const RiskFusion: React.FC<Props> = ({
  imageScorePercent,
  numericalScorePercent,
  finalScorePercent,
  visionWeight = 0.35,
  geoWeight = 0.65,
  overrides = [],
}) => {
  const imgClamped = Math.max(0, Math.min(100, Math.round(imageScorePercent)));
  const numClamped = Math.max(0, Math.min(100, Math.round(numericalScorePercent)));
  const vWeightPct = Math.round(visionWeight * 100);
  const gWeightPct = Math.round(geoWeight * 100);

  return (
    <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-3 select-none">
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="telemetry-label text-text-secondary">Adaptive Dual-Model Fusion</span>
        <span className="text-[10px] text-accent font-bold">
          {overrides.length > 0 ? 'OVERRIDE ACTIVE' : 'ADAPTIVE CALIBRATED'}
        </span>
      </div>

      {/* Overrides Badge Banner if any physical safety overrides are active */}
      {overrides.length > 0 && (
        <div className="flex items-center space-x-2 p-2 rounded-lg bg-[#FF3B30]/10 border border-[#FF3B30]/20 text-[#FF3B30] text-[11px] font-mono">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span className="font-bold">Physical Safety Override: {overrides.join(', ')}</span>
        </div>
      )}

      {/* Horizontal Branching Visual */}
      <div className="grid grid-cols-2 gap-3">
        {/* Branch 1: Image Model */}
        <div className="space-y-1.5 p-2.5 rounded-lg bg-black/40 border border-white/[0.04]">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <div className="flex items-center space-x-1.5 text-text-muted">
              <Eye className="w-3.5 h-3.5 text-[#55AFFF]" />
              <span>VISION AI</span>
            </div>
            <span className="font-bold text-text-primary">{imgClamped}%</span>
          </div>

          <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#55AFFF] rounded-full transition-all duration-500"
              style={{ width: `${imgClamped}%` }}
            />
          </div>

          <div className="text-[9px] font-mono text-text-muted flex justify-between">
            <span>FALCON-SegFormer</span>
            <span className="text-text-secondary">{vWeightPct}% weight</span>
          </div>
        </div>

        {/* Branch 2: Numerical Model */}
        <div className="space-y-1.5 p-2.5 rounded-lg bg-black/40 border border-white/[0.04]">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <div className="flex items-center space-x-1.5 text-text-muted">
              <Cpu className="w-3.5 h-3.5 text-[#FFB067]" />
              <span>GEOTECHNICAL</span>
            </div>
            <span className="font-bold text-text-primary">{numClamped}%</span>
          </div>

          <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#FF8A3D] rounded-full transition-all duration-500"
              style={{ width: `${numClamped}%` }}
            />
          </div>

          <div className="text-[9px] font-mono text-text-muted flex justify-between">
            <span>XGBoost ML Pipeline</span>
            <span className="text-text-secondary">{gWeightPct}% weight</span>
          </div>
        </div>
      </div>

      {/* Fusion Calculation Strip */}
      <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-black/60 border border-white/[0.04] text-[10px] font-mono text-text-muted">
        <span>
          FUSION: {visionWeight.toFixed(2)}·({imgClamped}%) + {geoWeight.toFixed(2)}·({numClamped}%)
        </span>
        <span className="text-accent font-bold text-xs">{finalScorePercent}%</span>
      </div>
    </div>
  );
};
