import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { SankeyNode, SankeyLink } from '../data/flowNodes.ts';
import {
  sankeyNodes,
  sankeyLinks,
  sankeyNodesMobile,
  sankeyLinksMobile,
} from '../data/flowNodes.ts';

interface LayoutNode extends SankeyNode {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface LayoutLink {
  source: LayoutNode;
  target: LayoutNode;
  sourceY: number;
  targetY: number;
  thickness: number;
  color: string;
  value: number;
  direction: 'inflow' | 'outflow';
}

interface Particle {
  linkIndex: number;
  progress: number;
  speed: number;
  size: number;
  opacity: number;
}

const NODE_WIDTH = 18;
const NODE_PAD = 8;
const COLUMN_COUNT = 5;

function useMobile() {
  const [mobile, setMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return mobile;
}

function layoutSankey(
  nodes: SankeyNode[],
  links: SankeyLink[],
  width: number,
  height: number,
): { layoutNodes: LayoutNode[]; layoutLinks: LayoutLink[] } {
  const pad = 40;
  const usableW = width - pad * 2;
  const usableH = height - pad * 2;
  const colWidth = usableW / (COLUMN_COUNT - 1);

  // Group nodes by column
  const columns: Map<number, SankeyNode[]> = new Map();
  for (const n of nodes) {
    if (!columns.has(n.column)) columns.set(n.column, []);
    columns.get(n.column)!.push(n);
  }

  // Calculate total value per node for sizing
  const nodeValues = new Map<string, number>();
  for (const n of nodes) nodeValues.set(n.id, 0);
  for (const l of links) {
    nodeValues.set(l.source, (nodeValues.get(l.source) ?? 0) + l.value);
    nodeValues.set(l.target, (nodeValues.get(l.target) ?? 0) + l.value);
  }

  // Layout nodes
  const layoutNodeMap = new Map<string, LayoutNode>();
  for (const [col, colNodes] of columns) {
    const maxVal = Math.max(...colNodes.map((n) => nodeValues.get(n.id) ?? 1));
    const totalDesiredH = colNodes.reduce(
      (sum, n) => sum + Math.max(24, ((nodeValues.get(n.id) ?? 1) / Math.max(maxVal, 1)) * 80),
      0,
    );
    const gapTotal = (colNodes.length - 1) * NODE_PAD;
    const scale = Math.min(1, (usableH - gapTotal) / Math.max(totalDesiredH, 1));

    let cy = pad + (usableH - (totalDesiredH * scale + gapTotal)) / 2;
    for (const n of colNodes) {
      const h = Math.max(24, ((nodeValues.get(n.id) ?? 1) / Math.max(maxVal, 1)) * 80) * scale;
      const ln: LayoutNode = {
        ...n,
        x: pad + col * colWidth - NODE_WIDTH / 2,
        y: cy,
        width: NODE_WIDTH,
        height: h,
      };
      layoutNodeMap.set(n.id, ln);
      cy += h + NODE_PAD;
    }
  }

  // Layout links with stacking
  const sourceOffsets = new Map<string, number>();
  const targetOffsets = new Map<string, number>();
  for (const n of nodes) {
    const ln = layoutNodeMap.get(n.id)!;
    sourceOffsets.set(n.id, ln.y);
    targetOffsets.set(n.id, ln.y);
  }

  const maxLinkVal = Math.max(...links.map((l) => l.value), 1);
  const layoutLinks: LayoutLink[] = [];

  for (const link of links) {
    const src = layoutNodeMap.get(link.source);
    const tgt = layoutNodeMap.get(link.target);
    if (!src || !tgt) continue;

    const thickness = Math.max(2, (link.value / maxLinkVal) * 24);
    const sy = sourceOffsets.get(link.source)!;
    const ty = targetOffsets.get(link.target)!;

    layoutLinks.push({
      source: src,
      target: tgt,
      sourceY: sy + thickness / 2,
      targetY: ty + thickness / 2,
      thickness,
      color: link.color,
      value: link.value,
      direction: link.direction,
    });

    sourceOffsets.set(link.source, sy + thickness + 1);
    targetOffsets.set(link.target, ty + thickness + 1);
  }

  return {
    layoutNodes: Array.from(layoutNodeMap.values()),
    layoutLinks,
  };
}

function linkPath(link: LayoutLink): string {
  const sx = link.source.x + link.source.width;
  const tx = link.target.x;
  const midX = (sx + tx) / 2;
  return `M ${sx} ${link.sourceY} C ${midX} ${link.sourceY}, ${midX} ${link.targetY}, ${tx} ${link.targetY}`;
}

function getPointOnCubicBezier(
  t: number,
  sx: number, sy: number,
  cx1: number, cy1: number,
  cx2: number, cy2: number,
  ex: number, ey: number,
): { x: number; y: number } {
  const u = 1 - t;
  return {
    x: u * u * u * sx + 3 * u * u * t * cx1 + 3 * u * t * t * cx2 + t * t * t * ex,
    y: u * u * u * sy + 3 * u * u * t * cy1 + 3 * u * t * t * cy2 + t * t * t * ey,
  };
}

export default function FlowSankey() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dims, setDims] = useState({ width: 800, height: 500 });
  const isMobile = useMobile();
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setDims({
          width: Math.floor(entry.contentRect.width),
          height: Math.floor(entry.contentRect.height),
        });
      }
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  const nodes = isMobile ? sankeyNodesMobile : sankeyNodes;
  const links = isMobile ? sankeyLinksMobile : sankeyLinks;

  const { layoutNodes, layoutLinks } = useMemo(
    () => layoutSankey(nodes, links, dims.width, dims.height),
    [nodes, links, dims.width, dims.height],
  );

  // Initialize particles
  useEffect(() => {
    const particles: Particle[] = [];
    for (let i = 0; i < layoutLinks.length; i++) {
      const count = Math.max(1, Math.round(layoutLinks[i].value / 6));
      for (let j = 0; j < count; j++) {
        particles.push({
          linkIndex: i,
          progress: Math.random(),
          speed: 0.002 + Math.random() * 0.003,
          size: 1.5 + Math.random() * 2,
          opacity: 0.4 + Math.random() * 0.5,
        });
      }
    }
    particlesRef.current = particles;
  }, [layoutLinks]);

  // Canvas animation loop
  const drawParticles = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== dims.width * dpr || canvas.height !== dims.height * dpr) {
      canvas.width = dims.width * dpr;
      canvas.height = dims.height * dpr;
      ctx.scale(dpr, dpr);
    }

    ctx.clearRect(0, 0, dims.width, dims.height);

    for (const p of particlesRef.current) {
      p.progress += p.speed;
      if (p.progress > 1) p.progress -= 1;

      const link = layoutLinks[p.linkIndex];
      if (!link) continue;

      const sx = link.source.x + link.source.width;
      const tx = link.target.x;
      const midX = (sx + tx) / 2;

      const pt = getPointOnCubicBezier(
        p.progress,
        sx, link.sourceY,
        midX, link.sourceY,
        midX, link.targetY,
        tx, link.targetY,
      );

      // Fade at edges
      const edgeFade = Math.min(p.progress * 5, (1 - p.progress) * 5, 1);
      const alpha = p.opacity * edgeFade;

      ctx.beginPath();
      ctx.arc(pt.x, pt.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle =
        link.direction === 'outflow'
          ? `rgba(255, 71, 87, ${alpha})`
          : `rgba(0, 212, 170, ${alpha * 0.9})`;
      ctx.shadowColor = link.color;
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    rafRef.current = requestAnimationFrame(drawParticles);
  }, [layoutLinks, dims]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(drawParticles);
    return () => cancelAnimationFrame(rafRef.current);
  }, [drawParticles]);

  const categoryLabels: Record<string, string> = {
    'central-bank': 'Central Banks',
    cash: 'Cash / MM',
    'govt-bond': 'Gov\'t Bonds',
    'corp-bond': 'Corp Bonds',
    equity: 'Equities',
    commodity: 'Commodities',
    crypto: 'Crypto',
    'real-estate': 'Real Estate',
  };

  // Column labels
  const columnCategories = useMemo(() => {
    const cols: Map<number, string> = new Map();
    for (const n of nodes) {
      if (!cols.has(n.column)) {
        cols.set(n.column, categoryLabels[n.category] ?? '');
      }
    }
    return cols;
  }, [nodes]);

  return (
    <motion.div
      ref={containerRef}
      className="glass-card"
      style={styles.container}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div style={styles.titleBar}>
        <h2 style={styles.title}>Global Capital Flows</h2>
        <span style={styles.subtitle}>
          The Great De-Risking &mdash; March 2026
        </span>
      </div>

      <div style={styles.svgContainer}>
        {/* Column headers */}
        {Array.from(columnCategories.entries()).map(([col, label]) => {
          const pad = 40;
          const usableW = dims.width - pad * 2;
          const colWidth = usableW / (COLUMN_COUNT - 1);
          const x = pad + col * colWidth;
          return (
            <div
              key={col}
              style={{
                position: 'absolute',
                top: 4,
                left: x - 40,
                width: 80,
                textAlign: 'center',
                fontSize: 10,
                color: '#8b8f98',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                pointerEvents: 'none',
              }}
            >
              {label}
            </div>
          );
        })}

        <svg width={dims.width} height={dims.height} style={{ position: 'absolute', top: 0, left: 0 }}>
          <defs>
            {layoutLinks.map((_link, i) => (
              <linearGradient key={i} id={`lg-${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={layoutLinks[i].source.color} stopOpacity={0.4} />
                <stop offset="100%" stopColor={layoutLinks[i].target.color} stopOpacity={0.4} />
              </linearGradient>
            ))}
          </defs>

          {/* Links */}
          {layoutLinks.map((link, i) => (
            <motion.path
              key={i}
              d={linkPath(link)}
              fill="none"
              stroke={`url(#lg-${i})`}
              strokeWidth={link.thickness}
              strokeOpacity={0.5}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, delay: i * 0.03, ease: 'easeInOut' }}
            />
          ))}

          {/* Nodes */}
          {layoutNodes.map((node) => (
            <g key={node.id}>
              <motion.rect
                x={node.x}
                y={node.y}
                width={node.width}
                height={node.height}
                rx={4}
                fill={node.color}
                fillOpacity={0.85}
                stroke={node.color}
                strokeWidth={1}
                strokeOpacity={0.4}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                style={{ transformOrigin: `${node.x + node.width / 2}px ${node.y + node.height / 2}px` }}
              />
              <text
                x={node.column < 3 ? node.x + node.width + 6 : node.x - 6}
                y={node.y + node.height / 2}
                textAnchor={node.column < 3 ? 'start' : 'end'}
                dominantBaseline="central"
                fill="#e8eaed"
                fontSize={isMobile ? 10 : 11}
                fontWeight={500}
                fontFamily="system-ui, sans-serif"
              >
                {node.label}
              </text>
            </g>
          ))}
        </svg>

        {/* Particle canvas overlay */}
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: dims.width,
            height: dims.height,
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Legend */}
      <div style={styles.legend}>
        <div style={styles.legendItem}>
          <span style={{ ...styles.legendDot, background: '#00d4aa' }} />
          <span style={styles.legendText}>Inflow</span>
        </div>
        <div style={styles.legendItem}>
          <span style={{ ...styles.legendDot, background: '#ff4757' }} />
          <span style={styles.legendText}>Outflow</span>
        </div>
        <span className="mono" style={{ fontSize: 10, color: '#8b8f98' }}>
          Width = Flow magnitude ($B)
        </span>
      </div>
    </motion.div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: 360,
    padding: 0,
    overflow: 'hidden',
  },
  titleBar: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 12,
    padding: '14px 18px 8px',
    flexWrap: 'wrap',
  },
  title: {
    fontSize: 15,
    fontWeight: 600,
    color: '#e8eaed',
  },
  subtitle: {
    fontSize: 11,
    color: '#8b8f98',
  },
  svgContainer: {
    flex: 1,
    position: 'relative',
    minHeight: 0,
  },
  legend: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: '8px 18px 12px',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    display: 'inline-block',
  },
  legendText: {
    fontSize: 11,
    color: '#8b8f98',
  },
};
