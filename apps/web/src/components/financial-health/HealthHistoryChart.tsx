'use client';

import React, { useState } from 'react';
import { useFinancialHealthStore } from '@/stores/financial-health-store';
import { HealthHistoryPoint } from '@financial-os/shared-types';

export const HealthHistoryChart: React.FC = () => {
  const { history, health } = useFinancialHealthStore();
  const [hoveredPoint, setHoveredPoint] = useState<HealthHistoryPoint | null>(null);

  const rawItems = history?.items || [];
  
  // Ensure we have display items (fallback to current score point if empty)
  const items: HealthHistoryPoint[] = rawItems.length > 0
    ? rawItems
    : health
      ? [
          {
            snapshot_date: health.evaluated_at.split('T')[0],
            score: health.score,
            label: health.label,
            cash_flow_score: health.components.cash_flow,
            savings_score: health.components.savings,
            spending_score: health.components.spending,
            liquidity_score: health.components.liquidity
          }
        ]
      : [];

  const avgScore = history?.average_score ?? health?.score ?? 75;
  const scoreChange = history?.score_change ?? 0;

  // Compute SVG chart coordinates
  const height = 140;
  const width = 500;
  const paddingX = 40;
  const paddingY = 25;

  const pointsCount = Math.max(items.length, 1);
  const stepX = pointsCount > 1 ? (width - 2 * paddingX) / (pointsCount - 1) : 0;

  const coordinates = items.map((it, idx) => {
    const x = pointsCount === 1 ? width / 2 : paddingX + idx * stepX;
    // Map score 0-100 to y (height - paddingY to paddingY)
    const y = height - paddingY - (it.score / 100) * (height - 2 * paddingY);
    return { x, y, item: it };
  });

  const pathD = coordinates.reduce((acc, pt, idx) => {
    if (idx === 0) return `M ${pt.x} ${pt.y}`;
    // Bezier curve smoothing
    const prev = coordinates[idx - 1];
    const cpX1 = prev.x + (pt.x - prev.x) / 2;
    const cpY1 = prev.y;
    const cpX2 = prev.x + (pt.x - prev.x) / 2;
    const cpY2 = pt.y;
    return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${pt.x} ${pt.y}`;
  }, '');

  const areaD = coordinates.length > 1
    ? `${pathD} L ${coordinates[coordinates.length - 1].x} ${height - paddingY} L ${coordinates[0].x} ${height - paddingY} Z`
    : '';

  return (
    <section className="glass-card p-6 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-rounded text-[20px] text-[#3869D2]">monitoring</span>
            <h2 className="text-[1.05rem] font-bold tracking-tight text-white/90">
              Financial Health Progression
            </h2>
          </div>

          <div className="flex items-center gap-3 text-[0.75rem]">
            <span className="text-white/40">
              Avg: <strong className="text-white font-bold">{avgScore.toFixed(0)}</strong>
            </span>
            <span
              className={`font-bold px-2 py-0.5 rounded-full border ${
                scoreChange >= 0
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-red-500/10 text-red-400 border-red-500/20'
              }`}
            >
              {scoreChange >= 0 ? `+${scoreChange}` : scoreChange} pts
            </span>
          </div>
        </div>

        {/* SVG Chart */}
        <div className="relative w-full overflow-hidden">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-[160px] overflow-visible select-none"
          >
            <defs>
              <linearGradient id="areaGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C57CF9" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#3869D2" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#3869D2" />
                <stop offset="100%" stopColor="#C57CF9" />
              </linearGradient>
            </defs>

            {/* Grid baseline lines */}
            <line
              x1="20"
              y1={height - paddingY}
              x2={width - 20}
              y2={height - paddingY}
              className="stroke-white/[0.06]"
              strokeWidth="1"
            />
            <line
              x1="20"
              y1={height / 2}
              x2={width - 20}
              y2={height / 2}
              className="stroke-white/[0.04]"
              strokeDasharray="4 4"
              strokeWidth="1"
            />

            {/* Gradient Area Fill */}
            {areaD && <path d={areaD} fill="url(#areaGlow)" />}

            {/* Stroke Line */}
            {pathD && (
              <path
                d={pathD}
                fill="none"
                stroke="url(#strokeGradient)"
                strokeWidth="3"
                strokeLinecap="round"
                className="drop-shadow-[0_0_10px_rgba(197,124,249,0.4)]"
              />
            )}

            {/* Interactive Data Points */}
            {coordinates.map((pt, i) => (
              <g
                key={i}
                className="cursor-pointer group"
                onMouseEnter={() => setHoveredPoint(pt.item)}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="7"
                  className="fill-[#0f0f24] stroke-[#C57CF9] stroke-2 group-hover:scale-125 transition-transform"
                />
                <circle cx={pt.x} cy={pt.y} r="3" className="fill-white" />
              </g>
            ))}
          </svg>

          {/* Tooltip Overlay */}
          {hoveredPoint && (
            <div className="absolute top-2 right-4 bg-[#0a0a1a]/95 backdrop-blur-[16px] border border-white/[0.08] rounded-[8px] p-3 text-[0.72rem] text-white/80 shadow-[0_4px_16px_rgba(0,0,0,0.5)] z-20 pointer-events-none animate-[fadeIn_0.15s_ease-out]">
              <div className="flex items-center justify-between gap-4 font-bold text-white mb-1">
                <span>{hoveredPoint.snapshot_date}</span>
                <span className="text-[#C57CF9]">{hoveredPoint.score}/100</span>
              </div>
              <div className="text-white/40 text-[0.68rem] uppercase font-semibold">
                {hoveredPoint.label}
              </div>
            </div>
          )}
        </div>

        {/* Date labels */}
        <div className="flex justify-between px-6 mt-1 text-[0.68rem] text-white/30 font-medium">
          {items.map((it, idx) => (
            <span key={idx}>{it.snapshot_date.slice(5)}</span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HealthHistoryChart;
