// ===== Market Node Types =====

export type AssetClass =
  | 'equity'
  | 'bond'
  | 'commodity'
  | 'crypto'
  | 'forex'
  | 'cash'
  | 'real_estate'
  | 'alternative';

export type Region = 'global' | 'japan' | 'us' | 'europe' | 'asia';

export interface MarketNode {
  id: string;
  label: string;
  labelJa: string;
  assetClass: AssetClass;
  region: Region;
  /** Canvas上のX座標 (0-1 正規化) */
  x: number;
  /** Canvas上のY座標 (0-1 正規化) */
  y: number;
  /** バブルの基本半径 */
  baseRadius: number;
  /** 代表的なティッカーシンボル */
  ticker: string;
  /** データソース */
  source: 'yahoo' | 'fred' | 'coingecko' | 'cboe' | 'exchange_rate';
  /** バブルカラー */
  color: string;
}

// ===== Flow Types =====

export interface Flow {
  id: string;
  from: string; // MarketNode id
  to: string;   // MarketNode id
  /** フロー強度 (-1 to 1) */
  intensity: number;
  /** パーティクル色 */
  color: string;
}

export interface FlowParticle {
  x: number;
  y: number;
  progress: number; // 0-1
  speed: number;
  opacity: number;
  size: number;
}

// ===== Market Data =====

export interface MarketDataPoint {
  nodeId: string;
  price: number;
  change1d: number;  // % change
  change1w: number;
  change1m: number;
  volume: number;
  timestamp: number;
}

export interface MarketRegime {
  label: string;
  labelJa: string;
  color: string;
  description: string;
}

// ===== Control Bar =====

export type Period = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y';
export type ViewMode = 'bubble' | 'heatmap' | 'sankey';

// ===== Right Panel =====

export interface NetFlowData {
  assetClass: AssetClass;
  label: string;
  inflow: number;
  outflow: number;
  net: number;
}

export interface YieldCurvePoint {
  maturity: string; // '3M', '2Y', '5Y', '10Y', '30Y'
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

export interface CorrelationPair {
  id: string;
  nodeA: string;
  nodeB: string;
  correlation: number; // -1 to 1
  label: string;
}

// ===== AI Analysis =====

export interface AIReport {
  summary: string;
  keyFlows: string[];
  risks: string[];
  opportunities: string[];
  generatedAt: number;
}
