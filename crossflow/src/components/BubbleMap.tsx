import { useRef, useCallback, useState } from 'react';
import type { MarketNode, Flow, FlowParticle, MarketDataPoint, GroundLayer, CorrelationPair, SizeMode } from '../types';
import { calcBubbleRadius, calcBubbleBorder } from '../types';
import { useAnimation } from '../hooks/useAnimation';

interface BubbleMapProps {
  nodes: MarketNode[];
  flows: Flow[];
  marketData: Map<string, MarketDataPoint>;
  groundLayers: GroundLayer[];
  correlationPairs: CorrelationPair[];
  regime: 'risk-on' | 'risk-off';
  sizeMode: SizeMode;
}

/**
 * メインCanvas - バブルチャート + パーティクルアニメーション + 地面3レイヤー + 相関点線
 */
export function BubbleMap({
  nodes,
  flows,
  marketData,
  groundLayers,
  correlationPairs: corrPairs,
  regime,
  sizeMode,
}: BubbleMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Map<string, FlowParticle[]>>(new Map());
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, deltaTime: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      drawBackground(ctx, w, h);
      drawGroundLayers(ctx, w, h, groundLayers, regime);
      drawCorrelationLines(ctx, corrPairs, nodes, w, h);
      updateAndDrawParticles(ctx, flows, nodes, particlesRef.current, w, h, deltaTime);

      for (const node of nodes) {
        const data = marketData.get(node.id);
        drawBubble(ctx, node, data, w, h, hoveredNode === node.id, regime, sizeMode);
      }
    },
    [nodes, flows, marketData, hoveredNode, groundLayers, corrPairs, regime, sizeMode],
  );

  useAnimation(canvasRef, draw);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      let found: string | null = null;
      for (const node of nodes) {
        const nx = node.position.x * rect.width;
        const ny = node.position.y * rect.height;
        const r = calcBubbleRadius({
          mode: sizeMode,
          baseMass: node.baseMass,
          flow: marketData.get(node.id)?.flow ?? 0,
          regime,
          isVix: node.category === 'volatility',
        });
        const dist = Math.sqrt((mx - nx) ** 2 + (my - ny) ** 2);
        if (dist < r) {
          found = node.id;
          break;
        }
      }
      setHoveredNode(found);
    },
    [nodes, sizeMode, regime, marketData],
  );

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%', display: 'block' }}
      onMouseMove={handleMouseMove}
    />
  );
}

// ===== Drawing Functions =====

function drawBackground(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const gradient = ctx.createLinearGradient(0, 0, 0, h);
  gradient.addColorStop(0, '#0a0e27');
  gradient.addColorStop(0.7, '#0d1117');
  gradient.addColorStop(1, '#1a1a2e');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
}

function drawGroundLayers(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  layers: GroundLayer[],
  regime: 'risk-on' | 'risk-off',
) {
  const groundStart = h * 0.78;
  const layerHeight = (h - groundStart) / layers.length;

  for (const layer of layers) {
    const y = groundStart + layer.layerIndex * layerHeight;
    const baseColor = regime === 'risk-off' ? layer.riskOffColor : layer.riskOnColor;
    const expansion = layer.expansion;

    const gradient = ctx.createLinearGradient(0, y, 0, y + layerHeight);
    gradient.addColorStop(0, hexToRgba(baseColor, 0.08 + expansion * 0.15));
    gradient.addColorStop(1, hexToRgba(baseColor, 0.15 + expansion * 0.2));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, y, w, layerHeight);

    // 境界線
    ctx.strokeStyle = hexToRgba(baseColor, 0.25);
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();

    // ラベル
    ctx.fillStyle = hexToRgba(layer.color, 0.5);
    ctx.font = '10px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(layer.label, w - 12, y + layerHeight / 2 + 3);
  }
}

function drawCorrelationLines(
  ctx: CanvasRenderingContext2D,
  pairs: CorrelationPair[],
  nodes: MarketNode[],
  w: number,
  h: number,
) {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  ctx.save();
  ctx.setLineDash([4, 6]);
  ctx.lineWidth = 0.6;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';

  for (const pair of pairs) {
    const a = nodeMap.get(pair.nodeA);
    const b = nodeMap.get(pair.nodeB);
    if (!a || !b) continue;

    ctx.beginPath();
    ctx.moveTo(a.position.x * w, a.position.y * h);
    ctx.lineTo(b.position.x * w, b.position.y * h);
    ctx.stroke();
  }

  ctx.restore();
}

function drawBubble(
  ctx: CanvasRenderingContext2D,
  node: MarketNode,
  data: MarketDataPoint | undefined,
  w: number,
  h: number,
  isHovered: boolean,
  regime: 'risk-on' | 'risk-off',
  sizeMode: SizeMode,
) {
  const x = node.position.x * w;
  const y = node.position.y * h;
  const flow = data?.flow ?? 0;

  const radius = calcBubbleRadius({
    mode: sizeMode,
    baseMass: node.baseMass,
    flow,
    regime,
    isVix: node.category === 'volatility',
  }) * (isHovered ? 1.12 : 1);

  const border = calcBubbleBorder(flow);

  // グロー
  ctx.save();
  ctx.shadowColor = node.color;
  ctx.shadowBlur = isHovered ? 25 : 12;

  // バブル本体
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = hexToRgba(node.color, 0.25);
  ctx.fill();

  // 枠線（フロー色）
  ctx.strokeStyle = border.color;
  ctx.lineWidth = isHovered ? border.width + 0.5 : border.width;
  ctx.stroke();
  ctx.restore();

  // ラベル
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.max(9, radius * 0.32)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(node.label, x, y - 6);

  // 変動率
  if (data) {
    const changeColor = data.change1d >= 0 ? '#22c55e' : '#ef4444';
    const sign = data.change1d >= 0 ? '+' : '';
    ctx.fillStyle = changeColor;
    ctx.font = `${Math.max(8, radius * 0.24)}px monospace`;
    ctx.fillText(`${sign}${data.change1d.toFixed(2)}%`, x, y + 8);
  }

  // baseMass (small, below change)
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.font = `${Math.max(7, radius * 0.18)}px monospace`;
  ctx.fillText(`$${node.baseMass}T`, x, y + 18);
}

function updateAndDrawParticles(
  ctx: CanvasRenderingContext2D,
  flows: Flow[],
  nodes: MarketNode[],
  particles: Map<string, FlowParticle[]>,
  w: number,
  h: number,
  deltaTime: number,
) {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  for (const flow of flows) {
    if (Math.abs(flow.intensity) < 0.05) continue;

    const fromNode = nodeMap.get(flow.from);
    const toNode = nodeMap.get(flow.to);
    if (!fromNode || !toNode) continue;

    if (!particles.has(flow.id)) {
      particles.set(flow.id, []);
    }
    const list = particles.get(flow.id)!;

    const spawnRate = Math.abs(flow.intensity) * 3;
    if (Math.random() < spawnRate * deltaTime) {
      list.push({
        x: fromNode.position.x * w,
        y: fromNode.position.y * h,
        progress: 0,
        speed: 0.3 + Math.random() * 0.4,
        opacity: 0.6 + Math.random() * 0.4,
        size: 2 + Math.random() * 3,
      });
    }

    for (let i = list.length - 1; i >= 0; i--) {
      const p = list[i];
      p.progress += p.speed * deltaTime;

      if (p.progress >= 1) {
        list.splice(i, 1);
        continue;
      }

      const fx = fromNode.position.x * w;
      const fy = fromNode.position.y * h;
      const tx = toNode.position.x * w;
      const ty = toNode.position.y * h;
      p.x = fx + (tx - fx) * p.progress;
      p.y = fy + (ty - fy) * p.progress;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = hexToRgba(flow.color, p.opacity * (1 - p.progress * 0.5));
      ctx.fill();
    }
  }
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
