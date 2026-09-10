import React from 'react';
import { useTelemetryStore } from '../../stores/useTelemetryStore';
import { SensorMiniCard } from './SensorMiniCard';
import { Droplets, CloudRain, Activity, Gauge } from 'lucide-react';

export const SensorGrid: React.FC = () => {
  const { sensors, sensorHistory } = useTelemetryStore();

  const soilHist = sensorHistory.map((h) => h.soil_moisture);
  const rainHist = sensorHistory.map((h) => h.rainfall);
  const moveHist = sensorHistory.map((h) => h.ground_movement);
  const poreHist = sensorHistory.map((h) => h.pore_pressure);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <SensorMiniCard
        title="Soil Moisture"
        value={sensors.soil_moisture}
        unit="%"
        status={sensors.soil_moisture_status || 'SAFE'}
        thresholdLabel="Threshold: <65% SAFE"
        icon={Droplets}
        accentColor="#55AFFF"
        history={soilHist.length > 0 ? soilHist : [41, 41.5, 42, 42.1, 42]}
      />

      <SensorMiniCard
        title="Precipitation / Rain"
        value={sensors.rainfall}
        unit="mm"
        status={sensors.rainfall_status || 'SAFE'}
        thresholdLabel="Threshold: <15mm SAFE"
        icon={CloudRain}
        accentColor="#FF8A3D"
        history={rainHist.length > 0 ? rainHist : [7.5, 7.8, 8, 8.1, 8]}
      />

      <SensorMiniCard
        title="Ground Movement"
        value={sensors.ground_movement}
        unit="mm"
        status={sensors.ground_movement_status || 'SAFE'}
        thresholdLabel="Extensometer: <3.0mm"
        icon={Activity}
        accentColor="#FF3B30"
        history={moveHist.length > 0 ? moveHist : [1.1, 1.15, 1.2, 1.22, 1.2]}
      />

      <SensorMiniCard
        title="Pore Water Pressure"
        value={sensors.pore_pressure}
        unit="kPa"
        status={sensors.pore_pressure_status || 'SAFE'}
        thresholdLabel="Piezometer: <20kPa"
        icon={Gauge}
        accentColor="#FFB067"
        history={poreHist.length > 0 ? poreHist : [14.8, 14.9, 15, 15.1, 15]}
      />
    </div>
  );
};
