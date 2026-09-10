import React from 'react';
import { Eye, Cpu, Zap } from 'lucide-react';

interface Props {
  imageScorePercent: number;
  numericalScorePercent: number;
  finalScorePercent: number;
}

export const RiskFusion: React.FC<Props> = ({
  imageScorePercent,
  numericalScorePercent,
  finalScorePercent,
}) => {
  const imgClamped = Math.max(0, Math.min(100, Math.round(imageScorePercent)));
  const numClamped = Math.max(0, Math.min(100, Math.round(numericalScorePercent)));

  return (
    <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-3 select-none">
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="telemetry-label text-text-secondary">50 / 50 Dual-Model Fusion</span>
        <span className="text-[10px] text-accent font-bold">CALIBRATED</span>
      </div>

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
            <span className="text-text-secondary">50% weight</span>
          </div>
        </div>

        {/* Branch 2: Numerical Model */}
        <div className="space-y-1.5 p-2.5 rounded-lg bg-black/40 border border-white/[0.04]">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <div className="flex items-center space-x-1.5 text-text-muted">
              <Cpu className="w-3.5 h-3.5 text-[#FFB067]" />
              <span>NUMERICAL</span>
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
            <span>XGBoost Package</span>
            <span className="text-text-secondary">50% weight</span>
          </div>
        </div>
      </div>

      {/* Fusion Calculation Strip */}
      <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-black/60 border border-white/[0.04] text-[10px] font-mono text-text-muted">
        <span>FUSION: 0.50·({imgClamped}%) + 0.50·({numClamped}%)</span>
        <span className="text-accent font-bold text-xs">{finalScorePercent}%</span>
      </div>
    </div>
  );
};
