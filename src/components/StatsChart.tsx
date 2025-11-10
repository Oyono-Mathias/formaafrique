
'use client';

import React from 'react';

interface StatsChartProps {
  series: Array<{ date: string; value: number }>;
  height?: number;
  label: string;
}

/**
 * @component StatsChart
 * @description A simple, lightweight, and responsive SVG line/area chart component.
 * It's designed to visualize a time series without heavy dependencies.
 *
 * @props
 *  - series: An array of data points with a date and a value.
 *  - height: The height of the SVG chart.
 *  - label: An accessible label for the chart, used as the SVG title.
 * @ux
 *  - Renders a clean line and area chart.
 *  - The SVG is fully responsive to its container's width.
 */
export default function StatsChart({
  series,
  height = 60,
  label,
}: StatsChartProps) {
  if (!series || series.length < 2) {
    return (
      <div
        style={{ height: `${height}px` }}
        className="flex items-center justify-center text-xs text-muted-foreground"
      >
        Données insuffisantes
      </div>
    );
  }

  const width = 200; // SVG viewBox width
  const values = series.map(p => p.value);
  const min = 0; // Always start y-axis at 0
  const max = Math.max(...values);
  const range = max - min;

  // Function to scale data points to the SVG coordinate system
  const scale = (value: number, dimension: number) => {
    if (range === 0) return dimension / 2; // Handle case where all values are the same
    return dimension - ((value - min) / range) * dimension;
  };

  const points = series
    .map((point, i) => {
      const x = (i / (series.length - 1)) * width;
      const y = scale(point.value, height);
      return `${x},${y}`;
    })
    .join(' ');

  const areaPath = `M0,${height} ${points} L${width},${height} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height={height}
      aria-label={label}
      role="img"
      className="overflow-visible"
    >
      <title>{label}</title>
      <defs>
        <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.2} />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
        </linearGradient>
      </defs>
      {/* Area fill */}
      <path d={areaPath} className="fill-[url(#areaGradient)]" aria-hidden="true" />
      {/* Line */}
      <polyline
        fill="none"
        className="stroke-primary"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        aria-hidden="true"
      />
    </svg>
  );
}
