import React from 'react';
import { Zap, ArrowRight } from 'lucide-react';
import { useTelemetryStore } from '../../stores/useTelemetryStore';
import { useUIStore } from '../../stores/useUIStore';
import { RiskGauge } from './RiskGauge';
import { RiskFusion } from './RiskFusion';
import { RiskContributors } from './RiskContributors';

export const RiskEngineCard: React.FC = () => {
  const { risk, aiLatest, sensors } = useTelemetryStore();
  const { setCurrentPage } = useUIStore();

  const imageScorePercent = aiLatest.detected
    ? Math.round(aiLatest.confidence * 100)
    : Math.round(aiLatest.confidence * 30);

  const numericalScorePercent = Math.round(
    (sensors.ground_movement / 15) * 50 +
    (sensors.rainfall / 60) * 30 +
    (sensors.soil_moisture / 100) * 20
  );

  return (
    <div className="flex flex-col rounded-xl glass-2 border border-white/[0.08] p-4 space-y-4 select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded bg-[#FF6A1A] text-black">
            <Zap className="w-3.5 h-3.5 fill-black" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary font-display">
              FALCON Risk Engine
            </h3>
            <p className="text-[10px] font-mono text-text-muted">
              50/50 Dual-Model Landslide Probability
            </p>
          </div>
        </div>

        <button
          onClick={() => setCurrentPage('risk-engine')}
          className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors"
          title="Open Risk Architecture"
        >
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Dominant Radial Score */}
      <RiskGauge score={risk.score} level={risk.level} trend={risk.trend} />

      {/* 50 / 50 Fusion Branch */}
      <RiskFusion
        imageScorePercent={imageScorePercent || 48}
        numericalScorePercent={numericalScorePercent || 92}
        finalScorePercent={risk.score}
      />

      {/* Contributing Factors */}
      <RiskContributors components={risk.components} />
    </div>
  );
};
