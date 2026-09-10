import React from 'react';
import { RiskComponents } from '../../types';
import { Eye, Activity, CloudRain, Droplets, Gauge } from 'lucide-react';

interface Props {
  components: RiskComponents;
}

export const RiskContributors: React.FC<Props> = ({ components }) => {
  const items = [
    {
      label: 'Visual AI (SegFormer)',
      value: Math.round((components.ai || 0) * 100),
      weight: '35%',
      icon: Eye,
      barColor: '#55AFFF',
    },
    {
      label: 'Ground Movement (In-situ)',
      value: Math.round((components.ground_movement || 0) * 100),
      weight: '30%',
      icon: Activity,
      barColor: '#FF3B30',
    },
    {
      label: 'Rainfall Accumulation',
      value: Math.round((components.rainfall || 0) * 100),
      weight: '15%',
      icon: CloudRain,
      barColor: '#FF8A3D',
    },
    {
      label: 'Soil Moisture Saturation',
      value: Math.round((components.soil_moisture || 0) * 100),
      weight: '10%',
      icon: Droplets,
      barColor: '#FFB067',
    },
    {
      label: 'Pore Water Pressure',
      value: Math.round((components.pore_pressure || 0) * 100),
      weight: '10%',
      icon: Gauge,
      barColor: '#35D07F',
    },
  ];

  return (
    <div className="space-y-2 select-none">
      <div className="flex items-center justify-between text-xs">
        <span className="telemetry-label text-text-secondary">Contributing Factors</span>
        <span className="text-[10px] font-mono text-text-muted">Calibrated Weights</span>
      </div>

      <div className="space-y-1.5">
        {items.map((item) => {
          const Icon = item.icon;
          const clampedVal = Math.min(100, Math.max(0, item.value));

          return (
            <div
              key={item.label}
              className="p-2 rounded-lg bg-white/[0.015] border border-white/[0.04] space-y-1"
            >
              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center space-x-1.5 text-text-muted">
                  <Icon className="w-3 h-3 text-text-muted shrink-0" />
                  <span className="text-[11px] text-text-secondary truncate">
                    {item.label}
                  </span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-[10px] text-text-muted">({item.weight})</span>
                  <span className="font-bold text-text-primary text-[11px]">{clampedVal}%</span>
                </div>
              </div>

              <div className="h-1 w-full bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${clampedVal}%`,
                    backgroundColor: item.barColor,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
