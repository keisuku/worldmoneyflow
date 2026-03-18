import { useRef, useCallback, useState } from 'react';
import type { MarketNode, Flow, FlowParticle, MarketDataPoint } from '../types';
import { useAnimation } from '../hooks/useAnimation';

interface BubbleMapProps {
  nodes: MarketNode[];
  flows: Flow[];
  marketData: Map<string, MarketDataPoint>;
}

/**
 * メインCanvas - バブルチャート + パーティクルアニメーション + 地面
 */
export function BubbleMap({ nodes, flows, marketData }: BubbleMapProps) {
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

      // 背景
      drawBackground(ctx, w, h);

      // 地面（現金ポジション）
      drawGround(ctx, w, h);

      // フローパーティクル更新・描画
      updateAndDrawParticles(ctx, flows, nodes, particlesRef.current, w, h, deltaTime);

      // バブル描画
      for (const node of nodes) {
        const data = marketData.get(node.id);
        drawBubble(ctx, node, data, w, h, hoveredNode === node.id);
      }
    },
    [nodes, flows, marketData, hoveredNode],
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
        const nx = node.x * rect.width;
        const ny = node.y * rect.height;
        const dist = Math.sqrt((mx - nx) ** 2 + (my - ny) ** 2);
        if (dist < node.baseRadius) {
          found = node.id;
          break;
        }
      }
      setHoveredNode(found);
    },
    [nodes],
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

function drawGround(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const groundY = h * 0.85;
  const gradient = ctx.createLinearGradient(0, groundY, 0, h);
  gradient.addColorStop(0, 'rgba(34, 139, 34, 0.1)');
  gradient.addColorStop(1, 'rgba(34, 139, 34, 0.3)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, groundY, w, h - groundY);

  // 地面ラベル
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.font = '12px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('CASH / MONEY MARKET', w / 2, h * 0.92);
}

function drawBubble(
  ctx: CanvasRenderingContext2D,
  node: MarketNode,
  data: MarketDataPoint | undefined,
  w: number,
  h: number,
  isHovered: boolean,
) {
  const x = node.x * w;
  const y = node.y * h;

  // 変動率に応じてバブルサイズを調整
  const changeFactor = data ? 1 + Math.abs(data.change1d) * 0.05 : 1;
  const radius = node.baseRadius * changeFactor * (isHovered ? 1.15 : 1);

  // グロー効果
  ctx.save();
  ctx.shadowColor = node.color;
  ctx.shadowBlur = isHovered ? 25 : 15;

  // バブル本体
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = hexToRgba(node.color, 0.3);
  ctx.fill();

  // 枠線
  ctx.strokeStyle = node.color;
  ctx.lineWidth = isHovered ? 2.5 : 1.5;
  ctx.stroke();
  ctx.restore();

  // ラベル
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.max(10, radius * 0.3)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(node.label, x, y - 6);

  // 変動率
  if (data) {
    const changeColor = data.change1d >= 0 ? '#4CAF50' : '#F44336';
    const sign = data.change1d >= 0 ? '+' : '';
    ctx.fillStyle = changeColor;
    ctx.font = `${Math.max(9, radius * 0.25)}px monospace`;
    ctx.fillText(`${sign}${data.change1d.toFixed(2)}%`, x, y + 10);
  }
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

    // パーティクルリスト取得/初期化
    if (!particles.has(flow.id)) {
      particles.set(flow.id, []);
    }
    const list = particles.get(flow.id)!;

    // 新しいパーティクルを生成（強度に応じた頻度）
    const spawnRate = Math.abs(flow.intensity) * 3;
    if (Math.random() < spawnRate * deltaTime) {
      list.push({
        x: fromNode.x * w,
        y: fromNode.y * h,
        progress: 0,
        speed: 0.3 + Math.random() * 0.4,
        opacity: 0.6 + Math.random() * 0.4,
        size: 2 + Math.random() * 3,
      });
    }

    // パーティクル更新・描画
    for (let i = list.length - 1; i >= 0; i--) {
      const p = list[i];
      p.progress += p.speed * deltaTime;

      if (p.progress >= 1) {
        list.splice(i, 1);
        continue;
      }

      // 線形補間で位置計算
      p.x = fromNode.x * w + (toNode.x * w - fromNode.x * w) * p.progress;
      p.y = fromNode.y * h + (toNode.y * h - fromNode.y * h) * p.progress;

      // 描画
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
