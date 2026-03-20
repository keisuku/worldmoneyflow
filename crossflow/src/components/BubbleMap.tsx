import { useState, useMemo, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ASSET_POOLS, CATEGORY_META, TOTAL_ALL } from '../data/globalAssets';
import type { Category, GlobalAsset } from '../data/globalAssets';

// ─── Cluster centers (normalized 0–1) per category ───
const CLUSTER_CENTERS: Record<Category, { x: number; y: number }> = {
  equities:      { x: 0.28, y: 0.48 },
  bonds:         { x: 0.68, y: 0.45 },
  'real-estate': { x: 0.75, y: 0.20 },
  gold:          { x: 0.45, y: 0.78 },
  crypto:        { x: 0.18, y: 0.78 },
  private:       { x: 0.82, y: 0.68 },
  institutional: { x: 0.50, y: 0.50 },
};

// ─── Flow arrows (narrative arcs) ───
const FLOW_ARROWS: { from: Category; to: Category; label: string }[] = [
  { from: 'equities', to: 'bonds', label: 'Risk-off' },
  { from: 'equities', to: 'gold', label: 'Safe haven' },
  { from: 'bonds', to: 'crypto', label: 'Speculative' },
  { from: 'equities', to: 'private', label: 'Alternatives' },
];

// ─── Types for force sim nodes ───
interface SimNode {
  asset: GlobalAsset;
  x: number;
  y: number;
  r: number;
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

// ─── Force simulation (pure function, no D3) ───
function runForceSimulation(
  assets: GlobalAsset[],
  width: number,
  height: number,
): SimNode[] {
  const maxVal = Math.max(...assets.map((a) => a.totalValue));
  const maxR = Math.min(width, height) * 0.13;
  const minR = 8;

  const nodes: SimNode[] = assets.map((asset) => {
    const center = CLUSTER_CENTERS[asset.category] ?? { x: 0.5, y: 0.5 };
    const r = Math.max(minR, maxR * Math.sqrt(asset.totalValue / maxVal));
    return {
      asset,
      x: center.x * width + (Math.random() - 0.5) * 60,
      y: center.y * height + (Math.random() - 0.5) * 60,
      r,
    };
  });

  // Run 300 iterations
  const attractionStrength = 0.012;
  const padding = 3;

  for (let iter = 0; iter < 300; iter++) {
    const alpha = 1 - iter / 300;

    // Category attraction — pull toward cluster center
    for (const node of nodes) {
      const center = CLUSTER_CENTERS[node.asset.category] ?? { x: 0.5, y: 0.5 };
      const tx = center.x * width;
      const ty = center.y * height;
      node.x += (tx - node.x) * attractionStrength * alpha;
      node.y += (ty - node.y) * attractionStrength * alpha;
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
          a.x -= nx * overlap * 0.5;
          a.y -= ny * overlap * 0.5;
          b.x += nx * overlap * 0.5;
          b.y += ny * overlap * 0.5;
        }
      }
    }

    // Keep within bounds
    for (const node of nodes) {
      node.x = Math.max(node.r + 5, Math.min(width - node.r - 5, node.x));
      node.y = Math.max(node.r + 5, Math.min(height - node.r - 5, node.y));
    }
  }

  return nodes;
}

// ─── SVG curved arrow path ───
function curvedArrowPath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): string {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  // Perpendicular offset for curvature
  const offset = Math.sqrt(dx * dx + dy * dy) * 0.25;
  const cx = mx - (dy / Math.sqrt(dx * dx + dy * dy)) * offset;
  const cy = my + (dx / Math.sqrt(dx * dx + dy * dy)) * offset;
  return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
}

// ─── Keyframe styles (injected once) ───
const glowKeyframes = `
@keyframes bubble-pulse {
  0%, 100% { filter: drop-shadow(0 0 6px var(--glow-color)); }
  50% { filter: drop-shadow(0 0 18px var(--glow-color)) drop-shadow(0 0 30px var(--glow-color)); }
}
@keyframes dash-flow {
  to { stroke-dashoffset: -20; }
}
`;

// ─── Component ───
export default function BubbleMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 1200, height: 700 });
  const [hoveredId, setHoveredId] = useState<string | null>(null);

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

  // Run force simulation once per size change
  const nodes = useMemo(
    () => runForceSimulation(ASSET_POOLS, size.width, size.height),
    [size.width, size.height],
  );

  // Node map for arrow lookups
  const categoryCenter = useMemo(() => {
    const centers: Partial<Record<Category, { x: number; y: number; count: number }>> = {};
    for (const n of nodes) {
      const cat = n.asset.category;
      if (!centers[cat]) centers[cat] = { x: 0, y: 0, count: 0 };
      centers[cat]!.x += n.x;
      centers[cat]!.y += n.y;
      centers[cat]!.count += 1;
    }
    const result: Partial<Record<Category, { x: number; y: number }>> = {};
    for (const [cat, val] of Object.entries(centers) as [Category, { x: number; y: number; count: number }][]) {
      result[cat] = { x: val.x / val.count, y: val.y / val.count };
    }
    return result;
  }, [nodes]);

  const hoveredNode = hoveredId ? nodes.find((n) => n.asset.id === hoveredId) : null;

  const totalDisplay = (TOTAL_ALL / 1).toFixed(1);

  const categories = Object.entries(CATEGORY_META).filter(
    ([key]) => key !== 'institutional',
  ) as [Category, (typeof CATEGORY_META)[Category]][];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      style={{
        position: 'relative',
        width: '100%',
        height: '75vh',
        minHeight: 500,
        background: 'linear-gradient(180deg, #0a0e27 0%, #0d1117 70%, #1a1a2e 100%)',
        borderRadius: 12,
        overflow: 'hidden',
      }}
    >
      <style>{glowKeyframes}</style>

      {/* Title */}
      <div
        style={{
          position: 'absolute',
          top: 16,
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
            fontSize: 'clamp(16px, 2.2vw, 24px)',
            fontWeight: 700,
            color: '#e2e8f0',
            letterSpacing: '0.02em',
          }}
        >
          Global Capital Pools — ${totalDisplay}T Total
        </h2>
      </div>

      {/* Category legend */}
      <div
        style={{
          position: 'absolute',
          top: 48,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '6px 16px',
          zIndex: 10,
          pointerEvents: 'none',
          padding: '0 16px',
        }}
      >
        {categories.map(([key, meta]) => (
          <span
            key={key}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              fontSize: 'clamp(10px, 1.2vw, 13px)',
              color: '#94a3b8',
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: meta.color,
                display: 'inline-block',
                flexShrink: 0,
              }}
            />
            {meta.label}
          </span>
        ))}
      </div>

      {/* SVG container */}
      <div
        ref={containerRef}
        style={{ width: '100%', height: '100%', paddingTop: 76 }}
      >
        <svg
          width={size.width}
          height={size.height}
          viewBox={`0 0 ${size.width} ${size.height}`}
          style={{ display: 'block', width: '100%', height: '100%' }}
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="8"
              markerHeight="6"
              refX="7"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="rgba(255,255,255,0.35)" />
            </marker>
          </defs>

          {/* Flow arrows */}
          {FLOW_ARROWS.map((arrow, i) => {
            const fromC = categoryCenter[arrow.from];
            const toC = categoryCenter[arrow.to];
            if (!fromC || !toC) return null;
            const path = curvedArrowPath(fromC.x, fromC.y, toC.x, toC.y);
            const midX = (fromC.x + toC.x) / 2;
            const midY = (fromC.y + toC.y) / 2;
            const dx = toC.x - fromC.x;
            const dy = toC.y - fromC.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const offsetAmt = dist * 0.12;
            const labelX = midX - (dy / dist) * offsetAmt;
            const labelY = midY + (dx / dist) * offsetAmt;
            return (
              <g key={i}>
                <path
                  d={path}
                  fill="none"
                  stroke="rgba(255,255,255,0.18)"
                  strokeWidth={1.5}
                  strokeDasharray="6 4"
                  markerEnd="url(#arrowhead)"
                  style={{ animation: 'dash-flow 1.5s linear infinite' }}
                />
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.4)"
                  fontSize={Math.max(10, size.width * 0.009)}
                  fontStyle="italic"
                >
                  {arrow.label}
                </text>
              </g>
            );
          })}

          {/* Bubbles */}
          {nodes.map((node) => {
            const { asset, x, y, r } = node;
            const cat = CATEGORY_META[asset.category];
            const isHovered = hoveredId === asset.id;
            const baseOpacity = asset.investable ? 0.75 : 0.4;
            const fillOpacity = isHovered ? Math.min(baseOpacity + 0.2, 0.95) : baseOpacity;
            const shouldPulse = asset.volatility >= 0.8;
            const showName = r > 18;
            const fontSize = Math.max(8, Math.min(14, r * 0.26));
            const valueFontSize = Math.max(7, Math.min(12, r * 0.22));

            return (
              <g
                key={asset.id}
                onMouseEnter={() => setHoveredId(asset.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  cursor: 'pointer',
                  ['--glow-color' as string]: cat.color,
                  ...(shouldPulse
                    ? { animation: 'bubble-pulse 2s ease-in-out infinite' }
                    : {}),
                }}
              >
                {/* Glow ring for high-volatility */}
                {shouldPulse && (
                  <circle
                    cx={x}
                    cy={y}
                    r={r + 4}
                    fill="none"
                    stroke={cat.color}
                    strokeWidth={1.5}
                    opacity={0.3}
                  />
                )}

                {/* Main bubble */}
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? r * 1.08 : r}
                  fill={hexToRgba(cat.color, fillOpacity * 0.4)}
                  stroke={cat.color}
                  strokeWidth={isHovered ? 2.5 : 1.2}
                  opacity={1}
                  style={{
                    transition: 'r 0.2s ease, stroke-width 0.2s ease',
                    filter: isHovered
                      ? `drop-shadow(0 0 12px ${cat.color})`
                      : shouldPulse
                        ? undefined
                        : 'none',
                  }}
                />

                {/* Name label */}
                {showName && (
                  <text
                    x={x}
                    y={y - valueFontSize * 0.5}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#e2e8f0"
                    fontSize={fontSize}
                    fontWeight={600}
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    {asset.nameShort}
                  </text>
                )}

                {/* Value label */}
                <text
                  x={x}
                  y={showName ? y + fontSize * 0.7 : y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="rgba(226,232,240,0.8)"
                  fontSize={valueFontSize}
                  fontFamily="monospace"
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {formatTrillions(asset.totalValue)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Hover tooltip */}
      {hoveredNode && (
        <div
          style={{
            position: 'absolute',
            left: Math.min(hoveredNode.x + hoveredNode.r + 16, size.width - 240),
            top: Math.max(hoveredNode.y - 40 + 76, 90),
            background: 'rgba(15, 23, 42, 0.95)',
            border: `1px solid ${CATEGORY_META[hoveredNode.asset.category].color}`,
            borderRadius: 8,
            padding: '10px 14px',
            zIndex: 20,
            pointerEvents: 'none',
            minWidth: 180,
            backdropFilter: 'blur(8px)',
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: '#f1f5f9',
              marginBottom: 4,
            }}
          >
            {hoveredNode.asset.emoji} {hoveredNode.asset.name}
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 2 }}>
            {CATEGORY_META[hoveredNode.asset.category].label}
            {hoveredNode.asset.region ? ` — ${hoveredNode.asset.region}` : ''}
          </div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: CATEGORY_META[hoveredNode.asset.category].color,
              margin: '4px 0',
            }}
          >
            {formatTrillions(hoveredNode.asset.totalValue)}
          </div>
          <div style={{ fontSize: 12, display: 'flex', gap: 12 }}>
            <span
              style={{
                color:
                  hoveredNode.asset.changes.d1 >= 0 ? '#22c55e' : '#ef4444',
              }}
            >
              1d: {formatChange(hoveredNode.asset.changes.d1)}
            </span>
            <span
              style={{
                color:
                  hoveredNode.asset.changes.w1 >= 0 ? '#22c55e' : '#ef4444',
              }}
            >
              1w: {formatChange(hoveredNode.asset.changes.w1)}
            </span>
          </div>
          {!hoveredNode.asset.investable && (
            <div
              style={{
                fontSize: 10,
                color: '#64748b',
                marginTop: 4,
                fontStyle: 'italic',
              }}
            >
              Illiquid / non-tradeable
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
