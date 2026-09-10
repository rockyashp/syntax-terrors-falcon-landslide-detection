import React, { useRef, useEffect } from 'react';
import { DroneTelemetry } from '../../types';

interface Props {
  drone: DroneTelemetry;
  filterMode: 'STANDARD' | 'IR_NIGHT' | 'THERMAL_FALSE_COLOR' | 'EDGE_ENHANCED';
  zoom: number;
  pan: { x: number; y: number };
}

export const CameraCanvasSynthetic: React.FC<Props> = ({ drone, filterMode, zoom, pan }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const render = () => {
      time += 0.015;
      const width = canvas.width;
      const height = canvas.height;

      ctx.save();
      ctx.clearRect(0, 0, width, height);

      // Apply Zoom & Pan
      ctx.translate(width / 2, height / 2);
      ctx.scale(zoom, zoom);
      ctx.translate(-width / 2 + pan.x, -height / 2 + pan.y);

      // 1. Draw Mountainous Slope Terrain Base
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      if (filterMode === 'IR_NIGHT') {
        gradient.addColorStop(0, '#0a1a0f');
        gradient.addColorStop(0.5, '#122b19');
        gradient.addColorStop(1, '#051108');
      } else if (filterMode === 'THERMAL_FALSE_COLOR') {
        gradient.addColorStop(0, '#100030');
        gradient.addColorStop(0.3, '#500080');
        gradient.addColorStop(0.7, '#cc2000');
        gradient.addColorStop(1, '#ffd000');
      } else {
        // Standard high-altitude escarpment reconnaissance palette
        gradient.addColorStop(0, '#161311');
        gradient.addColorStop(0.4, '#241c18');
        gradient.addColorStop(0.8, '#1e1815');
        gradient.addColorStop(1, '#0e0b0a');
      }
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // 2. Draw Mountain Ridge Curves / Escarpment Contours
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 7; i++) {
        ctx.beginPath();
        const yOffset = (height * 0.15) + (i * height * 0.12);
        const col =
          filterMode === 'IR_NIGHT'
            ? `rgba(70, 220, 110, ${0.12 + i * 0.04})`
            : filterMode === 'THERMAL_FALSE_COLOR'
            ? `rgba(255, 200, 50, ${0.2 + i * 0.08})`
            : `rgba(255, 106, 26, ${0.08 + i * 0.03})`;
        ctx.strokeStyle = col;

        for (let x = 0; x <= width; x += 20) {
          const wave1 = Math.sin(x * 0.005 + time + i) * 35;
          const wave2 = Math.cos(x * 0.012 - time * 0.5 + i * 2) * 15;
          const y = yOffset + wave1 + wave2;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // 3. Simulated Potential Landslide Hazard / Slip Zone (for visual authenticity)
      const zoneX = width * 0.52 + Math.sin(time * 0.4) * 15;
      const zoneY = height * 0.45 + Math.cos(time * 0.3) * 10;
      const zoneRadius = 90;

      const zoneGrad = ctx.createRadialGradient(zoneX, zoneY, 10, zoneX, zoneY, zoneRadius);
      if (filterMode === 'IR_NIGHT') {
        zoneGrad.addColorStop(0, 'rgba(100, 255, 150, 0.25)');
        zoneGrad.addColorStop(1, 'rgba(50, 200, 100, 0)');
      } else if (filterMode === 'THERMAL_FALSE_COLOR') {
        zoneGrad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        zoneGrad.addColorStop(1, 'rgba(255, 0, 0, 0)');
      } else {
        zoneGrad.addColorStop(0, 'rgba(255, 106, 26, 0.22)');
        zoneGrad.addColorStop(0.6, 'rgba(255, 59, 48, 0.12)');
        zoneGrad.addColorStop(1, 'rgba(255, 106, 26, 0)');
      }

      ctx.fillStyle = zoneGrad;
      ctx.beginPath();
      ctx.ellipse(zoneX, zoneY, zoneRadius * 1.2, zoneRadius * 0.8, Math.PI / 6, 0, Math.PI * 2);
      ctx.fill();

      // Slip face target box
      ctx.strokeStyle =
        filterMode === 'IR_NIGHT'
          ? 'rgba(100, 255, 150, 0.5)'
          : filterMode === 'THERMAL_FALSE_COLOR'
          ? 'rgba(255, 255, 255, 0.7)'
          : 'rgba(255, 106, 26, 0.6)';
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(zoneX - 60, zoneY - 45, 120, 90);
      ctx.setLineDash([]);

      // 4. Subtle Topographic Elevation Grid Points
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      for (let gx = 40; gx < width; gx += 80) {
        for (let gy = 40; gy < height; gy += 80) {
          ctx.fillRect(gx, gy, 2, 2);
        }
      }

      // 5. Dynamic Crosshair in Center
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1;
      const cx = width / 2;
      const cy = height / 2;
      // Center lines
      ctx.beginPath();
      ctx.moveTo(cx - 20, cy);
      ctx.lineTo(cx - 6, cy);
      ctx.moveTo(cx + 6, cy);
      ctx.lineTo(cx + 20, cy);
      ctx.moveTo(cx, cy - 20);
      ctx.lineTo(cx, cy - 6);
      ctx.moveTo(cx, cy + 6);
      ctx.lineTo(cx, cy + 20);
      ctx.stroke();

      // Pitch Ladder Marks
      const pitchOffset = Math.sin(time * 0.8) * 8;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.beginPath();
      ctx.moveTo(cx - 50, cy - 40 + pitchOffset);
      ctx.lineTo(cx - 30, cy - 40 + pitchOffset);
      ctx.moveTo(cx + 30, cy - 40 + pitchOffset);
      ctx.lineTo(cx + 50, cy - 40 + pitchOffset);
      ctx.moveTo(cx - 50, cy + 40 + pitchOffset);
      ctx.lineTo(cx - 30, cy + 40 + pitchOffset);
      ctx.moveTo(cx + 30, cy + 40 + pitchOffset);
      ctx.lineTo(cx + 50, cy + 40 + pitchOffset);
      ctx.stroke();

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [filterMode, zoom, pan, drone.altitude]);

  return (
    <canvas
      ref={canvasRef}
      width={1280}
      height={720}
      className="w-full h-full object-cover select-none"
    />
  );
};
