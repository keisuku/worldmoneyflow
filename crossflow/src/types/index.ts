// ===== Market Node Types =====

export type NodeCategory = 'risk' | 'safe' | 'commodity' | 'fx' | 'volatility';

export type Region = 'global' | 'japan' | 'us' | 'europe' | 'asia';

export type SizeMode = 'stock' | 'flow';

export interface MarketNode {
  id: string;
  label: string;
  labelJa: string;
  category: NodeCategory;
  /** Canvas上の位置 (0-1 正規化) */
  position: { x: number; y: number };
  /** 時価総額ベースの質量 ($T) */
  baseMass: number;
  /** テーマカラー */
  color: string;
  /** 代表的なティッカーシンボル */
  ticker: string;
  /** データソース */
  source: 'yahoo' | 'fred' | 'coingecko' | 'cboe' | 'exchange_rate';
}

// ===== Ground (Investor) Layers =====

export type GroundLayerType = 'hf_cta' | 'institutional' | 'retail';

export interface GroundLayer {
  type: GroundLayerType;
  label: string;
  labelJa: string;
  /** レイヤー番号 0=最上部(地面境界), 1=中間, 2=最下部 */
  layerIndex: number;
  /** ベースカラー */
  color: string;
  /** リスクオフ時カラー */
  riskOffColor: string;
  /** リスクオン時カラー */
  riskOnColor: string;
  /** 現在の膨縮レベル (0-1) */
  expansion: number;
}

// ===== Bubble Sizing =====

export interface BubbleSizeParams {
  mode: SizeMode;
  baseMass: number;
  /** 資金フロー値 (Flowモードで使用) */
  flow: number;
  /** risk-on | risk-off */
  regime: 'risk-on' | 'risk-off';
  /** VIXノード特殊フラグ */
  isVix: boolean;
}

/**
 * バブルサイズ計算
 * - Stockモード: baseMass そのまま
 * - Flowモード: baseMass × flowEffect × regimeScale
 */
export function calcBubbleRadius(params: BubbleSizeParams): number {
  const { mode, baseMass, flow, regime, isVix } = params;

  if (mode === 'stock') {
    return massToRadius(baseMass);
  }

  // Flow mode
  const flowEffect = Math.min(1.5, Math.max(0.5, 1 + flow * 0.005));
  let regimeScale: number;
  if (isVix) {
    regimeScale = regime === 'risk-off' ? 3.5 : 0.4;
  } else {
    regimeScale = regime === 'risk-off' ? 0.82 : 1.15;
  }

  return massToRadius(baseMass * flowEffect * regimeScale);
}

/** mass ($T) を Canvas上の半径 (px) に変換 */
function massToRadius(mass: number): number {
  // sqrt で面積比例にし、スケーリングファクターを掛ける
  return Math.sqrt(mass) * 12;
}

// ===== Bubble Border =====

export interface BubbleBorder {
  color: string; // green if flow > 0, red if flow < 0
  width: number; // 1 + |flow| × 0.15, clamped 1~3.5
}

export function calcBubbleBorder(flow: number): BubbleBorder {
  const color = flow >= 0 ? '#22c55e' : '#ef4444';
  const width = Math.min(3.5, Math.max(1, 1 + Math.abs(flow) * 0.15));
  return { color, width };
}

// ===== Flow Types =====

export interface Flow {
  id: string;
  from: string;
  to: string;
  /** フロー強度 (-100 to 100 の任意スケール) */
  intensity: number;
  /** パーティクル色 */
  color: string;
}

export interface FlowParticle {
  x: number;
  y: number;
  progress: number;
  speed: number;
  opacity: number;
  size: number;
}

// ===== Market Data =====

export interface MarketDataPoint {
  nodeId: string;
  price: number;
  change1d: number;
  change1w: number;
  change1m: number;
  volume: number;
  /** 資金フロー推定値 (正=流入, 負=流出) */
  flow: number;
  timestamp: number;
}

export interface MarketRegime {
  label: string;
  labelJa: string;
  color: string;
  description: string;
  type: 'risk-on' | 'risk-off';
}

// ===== Correlation =====

export interface CorrelationPair {
  id: string;
  nodeA: string;
  nodeB: string;
  correlation: number;
  label: string;
}

// ===== Control Bar =====

export type Period = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y';
export type ViewMode = 'bubble' | 'heatmap' | 'sankey';

// ===== Right Panel =====

export type AssetClass =
  | 'equity'
  | 'bond'
  | 'commodity'
  | 'crypto'
  | 'forex'
  | 'cash'
  | 'real_estate'
  | 'alternative';

export interface NetFlowData {
  assetClass: AssetClass;
  label: string;
  inflow: number;
  outflow: number;
  net: number;
}

export interface YieldCurvePoint {
  maturity: string;
  yield: number;
  previousYield: number;
}

export interface SpreadData {
  name: string;
  value: number;
  change: number;
}

export interface CalendarEvent {
  date: string;
  title: string;
  titleJa: string;
  impact: 'high' | 'medium' | 'low';
}

// ===== AI Analysis =====

export interface AIReport {
  summary: string;
  keyFlows: string[];
  risks: string[];
  opportunities: string[];
  generatedAt: number;
}
