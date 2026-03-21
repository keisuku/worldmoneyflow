import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ASSET_POOLS, CATEGORY_META } from '../data/globalAssets';
import { regimeData } from '../data/mockFlowData';
import type { Category, GlobalAsset, AssetChanges } from '../data/globalAssets';

// ─── Time periods ───
type TimePeriod = keyof AssetChanges;
const TIME_PERIODS: { key: TimePeriod; label: string }[] = [
  { key: 'h1', label: '時間' },
  { key: 'd1', label: '日' },
  { key: 'w1', label: '週' },
  { key: 'm1', label: '月' },
  { key: 'y1', label: '年' },
];

// ─── Types ───
interface SimNode {
  asset: GlobalAsset;
  x: number;
  y: number;
  r: number;
  floatPhase: number;
  floatSpeedX: number;
  floatSpeedY: number;
}

// ─── Helpers ───
function formatTrillions(v: number): string {
  if (v >= 1) return `$${v.toFixed(1)}T`;
  if (v >= 0.01) return `$${(v * 1000).toFixed(0)}B`;
  return `$${(v * 1000).toFixed(1)}B`;
}

function formatChangePct(changeB: number, totalT: number): string {
  // change is in $B, totalValue is in $T
  const pct = (changeB / (totalT * 1000)) * 100;
  const sign = pct >= 0 ? '+' : '';
  if (Math.abs(pct) < 0.05) return '0%';
  if (Math.abs(pct) < 1) return `${sign}${pct.toFixed(1)}%`;
  return `${sign}${pct.toFixed(1)}%`;
}



// ─── Force simulation — pack bubbles tightly like Crypto Bubbles ───
function runForceSimulation(
  assets: GlobalAsset[],
  width: number,
  height: number,
): SimNode[] {
  const maxVal = Math.max(...assets.map((a) => a.totalValue));
  // Much bigger bubbles — fill the viewport
  const maxR = Math.min(width, height) * 0.28;
  const minR = Math.min(width, height) * 0.025;

  const nodes: SimNode[] = assets.map((asset) => {
    const r = Math.max(minR, maxR * Math.sqrt(asset.totalValue / maxVal));
    return {
      asset,
      x: width / 2 + (Math.random() - 0.5) * width * 0.4,
      y: height / 2 + (Math.random() - 0.5) * height * 0.4,
      r,
      floatPhase: Math.random() * Math.PI * 2,
      floatSpeedX: 0.2 + Math.random() * 0.4,
      floatSpeedY: 0.25 + Math.random() * 0.4,
    };
  });

  // Sort by size descending — place big ones first (center)
  nodes.sort((a, b) => b.r - a.r);

  // Gravity toward center + collision
  const padding = 2;
  for (let iter = 0; iter < 400; iter++) {
    const alpha = 1 - iter / 400;

    // Attract to center
    for (const node of nodes) {
      node.x += (width / 2 - node.x) * 0.008 * alpha;
      node.y += (height / 2 - node.y) * 0.008 * alpha;
    }

    // Collision avoidance
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const minDist = a.r + b.r + padding;
        if (dist < minDist) {
          const overlap = (minDist - dist) / 2;
          const nx = dx / dist;
          const ny = dy / dist;
          // Smaller bubble moves more
          const totalR = a.r + b.r;
          const ratioA = b.r / totalR;
          const ratioB = a.r / totalR;
          a.x -= nx * overlap * ratioA;
          a.y -= ny * overlap * ratioA;
          b.x += nx * overlap * ratioB;
          b.y += ny * overlap * ratioB;
        }
      }
    }

    // Keep within bounds
    for (const node of nodes) {
      node.x = Math.max(node.r + 2, Math.min(width - node.r - 2, node.x));
      node.y = Math.max(node.r + 2, Math.min(height - node.r - 2, node.y));
    }
  }

  return nodes;
}

// ─── Wave path generator ───
function generateWavePath(
  width: number,
  height: number,
  waveHeight: number,
  time: number,
): string {
  const baseY = height - waveHeight;
  let d = `M 0 ${height}`;
  const segments = 14;
  for (let i = 0; i <= segments; i++) {
    const x = (i / segments) * width;
    const y =
      baseY +
      Math.sin(i * 0.7 + time * 0.8) * waveHeight * 0.3 +
      Math.sin(i * 1.4 + time * 1.3) * waveHeight * 0.15;
    if (i === 0) {
      d += ` L ${x} ${y}`;
    } else {
      const prevX = ((i - 1) / segments) * width;
      const cpx = (prevX + x) / 2;
      d += ` Q ${cpx} ${y - Math.sin(i + time) * waveHeight * 0.12} ${x} ${y}`;
    }
  }
  d += ` L ${width} ${height} Z`;
  return d;
}

// ─── Risk regime ───
const riskScore = regimeData.score; // 38 = cautious
const isRiskOff = riskScore < 40;

// ─── Component ───
export default function BubbleMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 800, height: 600 });
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [period, setPeriod] = useState<TimePeriod>('d1');
  const [waveTime, setWaveTime] = useState(0);
  const [floatTime, setFloatTime] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setSize({ width: rect.width, height: rect.height });
      }
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Animation loop — throttled to ~30fps to avoid excessive re-renders
  useEffect(() => {
    let raf: number;
    let start: number | null = null;
    let lastUpdate = 0;
    const tick = (ts: number) => {
      if (start === null) start = ts;
      if (ts - lastUpdate > 33) { // ~30fps
        const elapsed = (ts - start) / 1000;
        setWaveTime(elapsed);
        setFloatTime(elapsed);
        lastUpdate = ts;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Force simulation (layout doesn't change with period — only colors/sizes do)
  const nodes = useMemo(
    () => runForceSimulation(ASSET_POOLS, size.width, size.height * 0.88),
    [size.width, size.height],
  );

  const hoveredNode = hoveredId ? nodes.find((n) => n.asset.id === hoveredId) : null;

  // Risk wave: risk-off → red small wave + bubbles bigger; risk-on → green large wave + bubbles smaller
  // REVERSED per user request: risk-on = green, risk-off = red
  const riskOffIntensity = Math.max(0, (50 - riskScore) / 50);
  const riskOnIntensity = Math.max(0, (riskScore - 50) / 50);

  const waveBaseHeight = size.height * 0.04;
  const waveMaxExtra = size.height * 0.15;
  const waveHeight = waveBaseHeight + (isRiskOff
    ? waveMaxExtra * 0.3 * riskOffIntensity
    : waveMaxExtra * riskOnIntensity
  );

  const bubbleScale = isRiskOff
    ? 1 + riskOffIntensity * 0.12
    : 1 - riskOnIntensity * 0.10;

  // Colors reversed: risk-off = red, risk-on = green
  const waveColor = isRiskOff ? '#ef4444' : '#10b981';
  const waveOpacity = isRiskOff ? 0.3 + riskOffIntensity * 0.2 : 0.25 + riskOnIntensity * 0.25;

  const wavePath = generateWavePath(size.width, size.height, waveHeight, waveTime);
  const wavePath2 = generateWavePath(size.width, size.height, waveHeight * 0.6, waveTime + 1.8);

  const categories = Object.entries(CATEGORY_META).filter(
    ([key]) => key !== 'institutional',
  ) as [Category, (typeof CATEGORY_META)[Category]][];

  const getFloat = useCallback((node: SimNode) => {
    const dx = Math.sin(floatTime * node.floatSpeedX + node.floatPhase) * 4;
    const dy = Math.cos(floatTime * node.floatSpeedY + node.floatPhase + 1) * 3.5;
    return { dx, dy };
  }, [floatTime]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      style={{
        position: 'relative',
        width: '100%',
        height: '85vh',
        minHeight: 500,
        background: '#1a1a2e',
        overflow: 'hidden',
      }}
    >
      {/* Time period selector — Crypto Bubbles style */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          display: 'flex',
          zIndex: 10,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {TIME_PERIODS.map((tp) => {
          const active = period === tp.key;
          return (
            <button
              key={tp.key}
              onClick={() => setPeriod(tp.key)}
              style={{
                flex: 1,
                padding: '8px 0',
                border: 'none',
                borderBottom: active ? '2px solid #22c55e' : '2px solid transparent',
                background: active ? 'rgba(34,197,94,0.08)' : 'transparent',
                color: active ? '#22c55e' : '#64748b',
                fontSize: 'clamp(13px, 2vw, 16px)',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {tp.label}
            </button>
          );
        })}
      </div>

      {/* Risk regime badge */}
      <div
        style={{
          position: 'absolute',
          top: 44,
          right: 8,
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          fontSize: 10,
          color: isRiskOff ? '#ef4444' : '#10b981',
          fontWeight: 700,
          opacity: 0.8,
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: isRiskOff ? '#ef4444' : '#10b981',
            boxShadow: `0 0 6px ${isRiskOff ? '#ef4444' : '#10b981'}`,
          }}
        />
        {isRiskOff ? 'RISK OFF' : 'RISK ON'}
      </div>

      {/* Category legend — small, top-left */}
      <div
        style={{
          position: 'absolute',
          top: 44,
          left: 6,
          zIndex: 10,
          display: 'flex',
          flexWrap: 'wrap',
          gap: '2px 8px',
          pointerEvents: 'none',
        }}
      >
        {categories.map(([key, meta]) => (
          <span
            key={key}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              fontSize: 9,
              color: '#64748b',
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: meta.color,
                flexShrink: 0,
              }}
            />
            {meta.labelJa}
          </span>
        ))}
      </div>

      {/* SVG container */}
      <div
        ref={containerRef}
        style={{ width: '100%', height: '100%', paddingTop: 38 }}
      >
        <svg
          width={size.width}
          height={size.height}
          viewBox={`0 0 ${size.width} ${size.height}`}
          style={{ display: 'block', width: '100%', height: '100%' }}
        >
          <defs>
            <linearGradient id="waveGrad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={waveColor} stopOpacity={waveOpacity * 0.5} />
              <stop offset="100%" stopColor={waveColor} stopOpacity={waveOpacity} />
            </linearGradient>
            <linearGradient id="waveGrad2" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={waveColor} stopOpacity={waveOpacity * 0.2} />
              <stop offset="100%" stopColor={waveColor} stopOpacity={waveOpacity * 0.5} />
            </linearGradient>
          </defs>

          {/* Background wave */}
          <path d={wavePath2} fill="url(#waveGrad2)" />

          {/* Bubbles — Crypto Bubbles style */}
          {nodes.map((node) => {
            const { asset, x, y, r: baseR } = node;
            const isHovered = hoveredId === asset.id;

            const r = baseR * bubbleScale;
            const { dx, dy } = getFloat(node);
            const fx = x + dx;
            const fy = y + dy;

            // Change % for this period
            const changeB = asset.changes[period];
            const changePct = (changeB / (asset.totalValue * 1000)) * 100;
            const isPositive = changePct >= 0;

            // Bubble color based on change direction (like Crypto Bubbles)
            const bubbleColor = changeB === 0
              ? '#555'
              : isPositive ? '#22c55e' : '#ef4444';
            const bubbleFill = changeB === 0
              ? 'rgba(80,80,80,0.35)'
              : isPositive
                ? `rgba(34,197,94,${0.15 + Math.min(0.3, Math.abs(changePct) * 0.02)})`
                : `rgba(239,68,68,${0.15 + Math.min(0.3, Math.abs(changePct) * 0.02)})`;

            // Text sizing — proportional to bubble
            const nameSize = Math.max(8, Math.min(28, r * 0.32));
            const pctSize = Math.max(7, Math.min(22, r * 0.26));
            const valSize = Math.max(5, Math.min(12, r * 0.14));
            const showText = r > 12;
            const showValue = r > 25;
            const showPct = r > 15;

            return (
              <g
                key={asset.id}
                onMouseEnter={() => setHoveredId(asset.id)}
                onMouseLeave={() => setHoveredId(null)}
                onTouchStart={() => setHoveredId(asset.id)}
                onTouchEnd={() => setHoveredId(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Outer glow ring */}
                <circle
                  cx={fx}
                  cy={fy}
                  r={r + (isHovered ? 3 : 1)}
                  fill="none"
                  stroke={bubbleColor}
                  strokeWidth={isHovered ? 2 : 0.8}
                  opacity={isHovered ? 0.6 : 0.3}
                />

                {/* Main bubble */}
                <circle
                  cx={fx}
                  cy={fy}
                  r={isHovered ? r * 1.05 : r}
                  fill={bubbleFill}
                  stroke={bubbleColor}
                  strokeWidth={isHovered ? 2 : 1}
                  style={{
                    transition: 'stroke-width 0.15s',
                    filter: isHovered ? `drop-shadow(0 0 15px ${bubbleColor})` : 'none',
                  }}
                />

                {/* Inner gradient circle for depth */}
                <circle
                  cx={fx}
                  cy={fy}
                  r={r * 0.85}
                  fill="none"
                  stroke={bubbleColor}
                  strokeWidth={0.3}
                  opacity={0.15}
                />

                {showText && (
                  <>
                    {/* Asset name — prominent */}
                    <text
                      x={fx}
                      y={showPct ? fy - pctSize * 0.5 : fy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#fff"
                      fontSize={nameSize}
                      fontWeight={700}
                      style={{ pointerEvents: 'none', userSelect: 'none' }}
                    >
                      {asset.nameJa}
                    </text>

                    {/* Change % — colored, like Crypto Bubbles */}
                    {showPct && (
                      <text
                        x={fx}
                        y={fy + nameSize * 0.55}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill={bubbleColor}
                        fontSize={pctSize}
                        fontWeight={700}
                        fontFamily="monospace"
                        style={{ pointerEvents: 'none', userSelect: 'none' }}
                      >
                        {formatChangePct(changeB, asset.totalValue)}
                      </text>
                    )}

                    {/* Total value — small, below */}
                    {showValue && (
                      <text
                        x={fx}
                        y={fy + nameSize * 0.55 + pctSize * 0.9}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="rgba(255,255,255,0.45)"
                        fontSize={valSize}
                        fontFamily="monospace"
                        style={{ pointerEvents: 'none', userSelect: 'none' }}
                      >
                        {formatTrillions(asset.totalValue)}
                      </text>
                    )}
                  </>
                )}
              </g>
            );
          })}

          {/* Foreground wave */}
          <path d={wavePath} fill="url(#waveGrad)" />

          {/* Wave label */}
          <text
            x={size.width / 2}
            y={size.height - waveHeight * 0.3}
            textAnchor="middle"
            fill={isRiskOff ? 'rgba(239,68,68,0.6)' : 'rgba(34,197,94,0.6)'}
            fontSize={Math.max(9, size.width * 0.011)}
            fontWeight={600}
          >
            {isRiskOff ? '⚠ リスクオフ — 安全資産へ逃避中' : '✦ リスクオン — リスク資産へ流入中'}
          </text>

          {/* Foam bubbles in wave */}
          {Array.from({ length: 8 }).map((_, i) => {
            const bx = (size.width * (i + 0.5)) / 8;
            const by = size.height - waveHeight * 0.4 + Math.sin(waveTime * 0.5 + i * 1.1) * 6;
            const br = 2 + Math.sin(waveTime * 0.3 + i * 0.7) * 1.5;
            return (
              <circle
                key={`foam-${i}`}
                cx={bx}
                cy={by}
                r={Math.max(1, br)}
                fill={`${waveColor}40`}
                stroke={`${waveColor}20`}
                strokeWidth={0.5}
              />
            );
          })}
        </svg>
      </div>

      {/* Hover tooltip */}
      <AnimatePresence>
        {hoveredNode && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.12 }}
            style={{
              position: 'absolute',
              left: Math.min(
                hoveredNode.x + hoveredNode.r * bubbleScale + 10,
                size.width - 190,
              ),
              top: Math.max(hoveredNode.y - 20 + 38, 60),
              background: 'rgba(10, 15, 30, 0.95)',
              border: `1px solid rgba(255,255,255,0.15)`,
              borderRadius: 8,
              padding: '8px 10px',
              zIndex: 20,
              pointerEvents: 'none',
              minWidth: 150,
              backdropFilter: 'blur(10px)',
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 3 }}>
              {hoveredNode.asset.emoji} {hoveredNode.asset.nameJa}
            </div>
            <div style={{ fontSize: 9, color: '#94a3b8', marginBottom: 4 }}>
              {hoveredNode.asset.name}
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: '#fff',
                marginBottom: 4,
              }}
            >
              {formatTrillions(hoveredNode.asset.totalValue)}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px 6px', fontSize: 10, fontFamily: 'monospace' }}>
              {TIME_PERIODS.map((tp) => {
                const v = hoveredNode.asset.changes[tp.key];
                const pct = formatChangePct(v, hoveredNode.asset.totalValue);
                const active = tp.key === period;
                return (
                  <span
                    key={tp.key}
                    style={{
                      color: v >= 0 ? '#22c55e' : '#ef4444',
                      fontWeight: active ? 700 : 400,
                      background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
                      padding: '1px 3px',
                      borderRadius: 3,
                    }}
                  >
                    {tp.label}{pct}
                  </span>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
