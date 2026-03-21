import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ASSET_POOLS, CATEGORY_META, TOTAL_ALL } from '../data/globalAssets';
import { regimeData } from '../data/mockFlowData';
import type { Category, GlobalAsset, AssetChanges } from '../data/globalAssets';

// ─── Time periods ───
type TimePeriod = keyof AssetChanges;
const TIME_PERIODS: { key: TimePeriod; label: string; labelJa: string }[] = [
  { key: 'h1', label: '1H', labelJa: '1時間' },
  { key: 'h4', label: '4H', labelJa: '4時間' },
  { key: 'd1', label: '1D', labelJa: '1日' },
  { key: 'w1', label: '1W', labelJa: '1週' },
  { key: 'm1', label: '1M', labelJa: '1月' },
  { key: 'y1', label: '1Y', labelJa: '1年' },
];

// ─── Cluster centers (normalized 0–1) per category ───
const CLUSTER_CENTERS: Record<Category, { x: number; y: number }> = {
  equities:      { x: 0.25, y: 0.40 },
  bonds:         { x: 0.72, y: 0.38 },
  'real-estate': { x: 0.50, y: 0.18 },
  gold:          { x: 0.50, y: 0.62 },
  crypto:        { x: 0.15, y: 0.70 },
  private:       { x: 0.85, y: 0.65 },
  institutional: { x: 0.50, y: 0.50 },
};

// ─── Types for force sim nodes ───
interface SimNode {
  asset: GlobalAsset;
  x: number;
  y: number;
  r: number;
  floatPhase: number;   // random offset for floating animation
  floatSpeedX: number;
  floatSpeedY: number;
}

// ─── Helpers ───
function formatTrillions(v: number): string {
  if (v >= 1) return `$${v.toFixed(1)}T`;
  if (v >= 0.01) return `$${(v * 1000).toFixed(0)}B`;
  return `$${(v * 1000).toFixed(1)}B`;
}

function formatChange(v: number): string {
  const sign = v >= 0 ? '+' : '';
  if (Math.abs(v) >= 1000) return `${sign}${(v / 1000).toFixed(1)}T`;
  return `${sign}${v.toFixed(0)}B`;
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ─── Force simulation ───
function runForceSimulation(
  assets: GlobalAsset[],
  width: number,
  height: number,
  period: TimePeriod,
): SimNode[] {
  const maxVal = Math.max(...assets.map((a) => a.totalValue));
  const maxR = Math.min(width, height) * 0.12;
  const minR = 6;

  // Scale change relative to total value → adjusts radius
  const nodes: SimNode[] = assets.map((asset) => {
    const center = CLUSTER_CENTERS[asset.category] ?? { x: 0.5, y: 0.5 };
    const baseR = Math.max(minR, maxR * Math.sqrt(asset.totalValue / maxVal));

    // Change factor: positive change → grow, negative → shrink (subtle)
    const changeB = asset.changes[period];
    const changeFraction = (changeB / 1000) / asset.totalValue; // normalized
    const scaleFactor = 1 + Math.max(-0.3, Math.min(0.3, changeFraction * 5));
    const r = Math.max(minR, baseR * scaleFactor);

    return {
      asset,
      x: center.x * width + (Math.random() - 0.5) * 50,
      y: center.y * height + (Math.random() - 0.5) * 50,
      r,
      floatPhase: Math.random() * Math.PI * 2,
      floatSpeedX: 0.3 + Math.random() * 0.5,
      floatSpeedY: 0.4 + Math.random() * 0.5,
    };
  });

  const attractionStrength = 0.014;
  const padding = 3;

  for (let iter = 0; iter < 300; iter++) {
    const alpha = 1 - iter / 300;

    for (const node of nodes) {
      const center = CLUSTER_CENTERS[node.asset.category] ?? { x: 0.5, y: 0.5 };
      const tx = center.x * width;
      const ty = center.y * height;
      node.x += (tx - node.x) * attractionStrength * alpha;
      node.y += (ty - node.y) * attractionStrength * alpha;
    }

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
          a.x -= nx * overlap * 0.5;
          a.y -= ny * overlap * 0.5;
          b.x += nx * overlap * 0.5;
          b.y += ny * overlap * 0.5;
        }
      }
    }

    for (const node of nodes) {
      node.x = Math.max(node.r + 5, Math.min(width - node.r - 5, node.x));
      node.y = Math.max(node.r + 5, Math.min(height - node.r - 5, node.y));
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
  const segments = 12;
  for (let i = 0; i <= segments; i++) {
    const x = (i / segments) * width;
    const y =
      baseY +
      Math.sin(i * 0.8 + time * 0.8) * waveHeight * 0.25 +
      Math.sin(i * 1.6 + time * 1.2) * waveHeight * 0.12;
    if (i === 0) {
      d += ` L ${x} ${y}`;
    } else {
      const prevX = ((i - 1) / segments) * width;
      const cpx = (prevX + x) / 2;
      d += ` Q ${cpx} ${y - Math.sin(i + time) * waveHeight * 0.1} ${x} ${y}`;
    }
  }
  d += ` L ${width} ${height} Z`;
  return d;
}

// ─── Keyframe styles ───
const keyframeStyles = `
@keyframes bubble-pulse {
  0%, 100% { filter: drop-shadow(0 0 6px var(--glow-color)); }
  50% { filter: drop-shadow(0 0 18px var(--glow-color)) drop-shadow(0 0 30px var(--glow-color)); }
}
@keyframes dash-flow {
  to { stroke-dashoffset: -20; }
}
`;

// ─── Risk regime ───
// score: 0 = max risk-off, 100 = max risk-on
const riskScore = regimeData.score; // 38 = cautious
const isRiskOff = riskScore < 40;

// ─── Component ───
export default function BubbleMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 800, height: 500 });
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [period, setPeriod] = useState<TimePeriod>('d1');
  const [waveTime, setWaveTime] = useState(0);
  const [floatTime, setFloatTime] = useState(0);

  // Measure container
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

  // Animation loop for wave + float
  useEffect(() => {
    let raf: number;
    let start: number | null = null;
    const tick = (ts: number) => {
      if (start === null) start = ts;
      const elapsed = (ts - start) / 1000;
      setWaveTime(elapsed);
      setFloatTime(elapsed);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Run force simulation per size/period change
  const nodes = useMemo(
    () => runForceSimulation(ASSET_POOLS, size.width, size.height * 0.82, period),
    [size.width, size.height, period],
  );

  const hoveredNode = hoveredId ? nodes.find((n) => n.asset.id === hoveredId) : null;

  // Risk wave parameters
  const riskOffIntensity = Math.max(0, (50 - riskScore) / 50); // 0–1, higher when more risk-off
  const riskOnIntensity = Math.max(0, (riskScore - 50) / 50);  // 0–1, higher when more risk-on

  // Wave height: risk-off → small green wave; risk-on → large red wave
  const waveBaseHeight = size.height * 0.06;
  const waveMaxExtra = size.height * 0.18;
  const waveHeight = waveBaseHeight + (isRiskOff
    ? waveMaxExtra * 0.2 * riskOffIntensity  // small wave in risk-off
    : waveMaxExtra * riskOnIntensity          // large wave in risk-on
  );

  // Bubble scale factor: risk-off → bubbles bigger (safe havens inflating); risk-on → bubbles deflate
  const bubbleScale = isRiskOff
    ? 1 + riskOffIntensity * 0.15  // grow up to 15%
    : 1 - riskOnIntensity * 0.12;  // shrink up to 12%

  const waveColor = isRiskOff ? '#10b981' : '#ef4444';
  const waveOpacity = isRiskOff ? 0.35 + riskOffIntensity * 0.15 : 0.25 + riskOnIntensity * 0.25;

  const wavePath = generateWavePath(size.width, size.height, waveHeight, waveTime);
  const wavePath2 = generateWavePath(size.width, size.height, waveHeight * 0.7, waveTime + 1.5);

  const totalDisplay = (TOTAL_ALL / 1).toFixed(1);

  const categories = Object.entries(CATEGORY_META).filter(
    ([key]) => key !== 'institutional',
  ) as [Category, (typeof CATEGORY_META)[Category]][];

  // Get floating position offset for a node
  const getFloat = useCallback((node: SimNode) => {
    const dx = Math.sin(floatTime * node.floatSpeedX + node.floatPhase) * 3;
    const dy = Math.cos(floatTime * node.floatSpeedY + node.floatPhase + 1) * 2.5;
    return { dx, dy };
  }, [floatTime]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      style={{
        position: 'relative',
        width: '100%',
        height: '75vh',
        minHeight: 420,
        background: 'linear-gradient(180deg, #0a0e27 0%, #0d1117 70%, #1a1a2e 100%)',
        borderRadius: 12,
        overflow: 'hidden',
      }}
    >
      <style>{keyframeStyles}</style>

      {/* Title + period selector */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 0,
          right: 0,
          textAlign: 'center',
          zIndex: 10,
          pointerEvents: 'none',
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: 'clamp(14px, 2vw, 20px)',
            fontWeight: 700,
            color: '#e2e8f0',
            letterSpacing: '0.02em',
          }}
        >
          世界の資本プール — ${totalDisplay}T
        </h2>
      </div>

      {/* Category legend */}
      <div
        style={{
          position: 'absolute',
          top: 36,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '4px 12px',
          zIndex: 10,
          pointerEvents: 'none',
          padding: '0 12px',
        }}
      >
        {categories.map(([key, meta]) => (
          <span
            key={key}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 'clamp(9px, 1.1vw, 12px)',
              color: '#94a3b8',
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: meta.color,
                display: 'inline-block',
                flexShrink: 0,
              }}
            />
            {meta.labelJa}
          </span>
        ))}
      </div>

      {/* Time period selector */}
      <div
        style={{
          position: 'absolute',
          top: 56,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          gap: 4,
          zIndex: 10,
          padding: '0 12px',
        }}
      >
        {TIME_PERIODS.map((tp) => (
          <button
            key={tp.key}
            onClick={() => setPeriod(tp.key)}
            style={{
              padding: '3px 10px',
              borderRadius: 6,
              border: period === tp.key
                ? '1px solid rgba(255,255,255,0.4)'
                : '1px solid rgba(255,255,255,0.1)',
              background: period === tp.key
                ? 'rgba(255,255,255,0.15)'
                : 'rgba(255,255,255,0.04)',
              color: period === tp.key ? '#f1f5f9' : '#64748b',
              fontSize: 'clamp(10px, 1.2vw, 13px)',
              fontWeight: period === tp.key ? 700 : 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {tp.label}
          </button>
        ))}
      </div>

      {/* Risk regime indicator */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          right: 12,
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 'clamp(9px, 1vw, 11px)',
          color: isRiskOff ? '#10b981' : '#ef4444',
          fontWeight: 600,
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: isRiskOff ? '#10b981' : '#ef4444',
            boxShadow: `0 0 8px ${isRiskOff ? '#10b981' : '#ef4444'}`,
          }}
        />
        {isRiskOff ? 'リスクオフ' : 'リスクオン'}
      </div>

      {/* SVG container */}
      <div
        ref={containerRef}
        style={{ width: '100%', height: '100%', paddingTop: 80 }}
      >
        <svg
          width={size.width}
          height={size.height}
          viewBox={`0 0 ${size.width} ${size.height}`}
          style={{ display: 'block', width: '100%', height: '100%' }}
        >
          <defs>
            <linearGradient id="waveGrad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={waveColor} stopOpacity={waveOpacity * 0.6} />
              <stop offset="100%" stopColor={waveColor} stopOpacity={waveOpacity} />
            </linearGradient>
            <linearGradient id="waveGrad2" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={waveColor} stopOpacity={waveOpacity * 0.3} />
              <stop offset="100%" stopColor={waveColor} stopOpacity={waveOpacity * 0.6} />
            </linearGradient>
          </defs>

          {/* Background wave 2 (behind) */}
          <path d={wavePath2} fill="url(#waveGrad2)" />

          {/* Bubbles */}
          {nodes.map((node) => {
            const { asset, x, y, r: baseR } = node;
            const cat = CATEGORY_META[asset.category];
            const isHovered = hoveredId === asset.id;
            const baseOpacity = asset.investable ? 0.75 : 0.4;
            const fillOpacity = isHovered ? Math.min(baseOpacity + 0.2, 0.95) : baseOpacity;
            const shouldPulse = asset.volatility >= 0.8;

            const r = baseR * bubbleScale;
            const { dx, dy } = getFloat(node);
            const fx = x + dx;
            const fy = y + dy;

            const showName = r > 16;
            const fontSize = Math.max(7, Math.min(12, r * 0.24));
            const valueFontSize = Math.max(6, Math.min(10, r * 0.20));

            // Change indicator
            const change = asset.changes[period];
            const changeColor = change >= 0 ? '#22c55e' : '#ef4444';

            return (
              <g
                key={asset.id}
                onMouseEnter={() => setHoveredId(asset.id)}
                onMouseLeave={() => setHoveredId(null)}
                onTouchStart={() => setHoveredId(asset.id)}
                onTouchEnd={() => setHoveredId(null)}
                style={{
                  cursor: 'pointer',
                  ['--glow-color' as string]: cat.color,
                  ...(shouldPulse
                    ? { animation: 'bubble-pulse 2.5s ease-in-out infinite' }
                    : {}),
                }}
              >
                {/* Glow ring for high-volatility */}
                {shouldPulse && (
                  <circle
                    cx={fx}
                    cy={fy}
                    r={r + 3}
                    fill="none"
                    stroke={cat.color}
                    strokeWidth={1.2}
                    opacity={0.3}
                  />
                )}

                {/* Main bubble */}
                <circle
                  cx={fx}
                  cy={fy}
                  r={isHovered ? r * 1.08 : r}
                  fill={hexToRgba(cat.color, fillOpacity * 0.4)}
                  stroke={cat.color}
                  strokeWidth={isHovered ? 2.5 : 1}
                  style={{
                    transition: 'r 0.3s ease, stroke-width 0.2s ease',
                    filter: isHovered
                      ? `drop-shadow(0 0 12px ${cat.color})`
                      : shouldPulse
                        ? undefined
                        : 'none',
                  }}
                />

                {/* Japanese name */}
                {showName && (
                  <text
                    x={fx}
                    y={fy - valueFontSize * 0.8}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#e2e8f0"
                    fontSize={fontSize}
                    fontWeight={600}
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    {asset.nameJa}
                  </text>
                )}

                {/* Value label */}
                <text
                  x={fx}
                  y={showName ? fy + fontSize * 0.4 : fy - valueFontSize * 0.3}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="rgba(226,232,240,0.85)"
                  fontSize={valueFontSize}
                  fontFamily="monospace"
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {formatTrillions(asset.totalValue)}
                </text>

                {/* Change indicator (small text below) */}
                {showName && change !== 0 && (
                  <text
                    x={fx}
                    y={fy + fontSize * 0.4 + valueFontSize * 1.1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={changeColor}
                    fontSize={Math.max(6, valueFontSize * 0.85)}
                    fontFamily="monospace"
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    {formatChange(change)}
                  </text>
                )}
              </g>
            );
          })}

          {/* Foreground wave (on top) */}
          <path d={wavePath} fill="url(#waveGrad)" />

          {/* Wave label */}
          <text
            x={size.width / 2}
            y={size.height - waveHeight * 0.35}
            textAnchor="middle"
            fill={isRiskOff ? 'rgba(16,185,129,0.7)' : 'rgba(239,68,71,0.7)'}
            fontSize={Math.max(10, size.width * 0.012)}
            fontWeight={600}
          >
            {isRiskOff ? '安全資産へ資金流入中' : 'リスク資産へ資金流入中'}
          </text>

          {/* Small bubble icons in wave (visual effect) */}
          {isRiskOff && Array.from({ length: 6 }).map((_, i) => {
            const bx = (size.width * (i + 1)) / 7;
            const by = size.height - waveHeight * 0.5 + Math.sin(waveTime * 0.6 + i * 1.2) * 8;
            const br = 3 + Math.sin(waveTime * 0.4 + i) * 1.5;
            return (
              <circle
                key={`foam-${i}`}
                cx={bx}
                cy={by}
                r={br}
                fill="rgba(16,185,129,0.3)"
                stroke="rgba(16,185,129,0.15)"
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
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              left: Math.min(
                hoveredNode.x + hoveredNode.r + 12,
                size.width - 200,
              ),
              top: Math.max(hoveredNode.y - 30 + 80, 90),
              background: 'rgba(15, 23, 42, 0.95)',
              border: `1px solid ${CATEGORY_META[hoveredNode.asset.category].color}`,
              borderRadius: 8,
              padding: '8px 12px',
              zIndex: 20,
              pointerEvents: 'none',
              minWidth: 160,
              backdropFilter: 'blur(8px)',
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: '#f1f5f9',
                marginBottom: 2,
              }}
            >
              {hoveredNode.asset.emoji} {hoveredNode.asset.nameJa}
            </div>
            <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 2 }}>
              {hoveredNode.asset.name}
              {hoveredNode.asset.region ? ` — ${hoveredNode.asset.region}` : ''}
            </div>
            <div style={{ fontSize: 10, color: '#64748b', marginBottom: 2 }}>
              {CATEGORY_META[hoveredNode.asset.category].labelJa}
            </div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: CATEGORY_META[hoveredNode.asset.category].color,
                margin: '3px 0',
              }}
            >
              {formatTrillions(hoveredNode.asset.totalValue)}
            </div>
            <div style={{ fontSize: 11, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {TIME_PERIODS.map((tp) => {
                const v = hoveredNode.asset.changes[tp.key];
                return (
                  <span
                    key={tp.key}
                    style={{
                      color: v >= 0 ? '#22c55e' : '#ef4444',
                      fontWeight: tp.key === period ? 700 : 400,
                      textDecoration: tp.key === period ? 'underline' : 'none',
                      fontFamily: 'monospace',
                    }}
                  >
                    {tp.label}: {formatChange(v)}
                  </span>
                );
              })}
            </div>
            {!hoveredNode.asset.investable && (
              <div
                style={{
                  fontSize: 9,
                  color: '#64748b',
                  marginTop: 3,
                  fontStyle: 'italic',
                }}
              >
                非流動性資産
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
