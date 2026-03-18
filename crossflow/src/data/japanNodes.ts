import type { MarketNode } from '../types';

/**
 * 日本市場16ノード定義
 */
export const japanNodes: MarketNode[] = [
  // ===== 株式指数 =====
  {
    id: 'nk225',
    label: 'Nikkei 225',
    labelJa: '日経225',
    category: 'risk',
    position: { x: 0.20, y: 0.22 },
    baseMass: 6,
    color: '#06b6d4',
    ticker: '^N225',
    source: 'yahoo',
  },
  {
    id: 'topix',
    label: 'TOPIX',
    labelJa: 'TOPIX',
    category: 'risk',
    position: { x: 0.32, y: 0.20 },
    baseMass: 5.5,
    color: '#0891b2',
    ticker: '^TPX',
    source: 'yahoo',
  },
  {
    id: 'mothers',
    label: 'Growth 250',
    labelJa: 'グロース250',
    category: 'risk',
    position: { x: 0.12, y: 0.34 },
    baseMass: 0.5,
    color: '#22d3ee',
    ticker: '^MTHR',
    source: 'yahoo',
  },

  // ===== セクター株 =====
  {
    id: 'bank',
    label: 'Banks',
    labelJa: '銀行株',
    category: 'risk',
    position: { x: 0.26, y: 0.36 },
    baseMass: 2,
    color: '#3b82f6',
    ticker: '1615.T',
    source: 'yahoo',
  },
  {
    id: 'semi',
    label: 'Semicon',
    labelJa: '半導体株',
    category: 'risk',
    position: { x: 0.08, y: 0.22 },
    baseMass: 3,
    color: '#6366f1',
    ticker: '8035.T',
    source: 'yahoo',
  },
  {
    id: 'auto',
    label: 'Auto',
    labelJa: '自動車株',
    category: 'risk',
    position: { x: 0.18, y: 0.44 },
    baseMass: 2.5,
    color: '#818cf8',
    ticker: '7203.T',
    source: 'yahoo',
  },

  // ===== 不動産 =====
  {
    id: 'jreit',
    label: 'J-REIT',
    labelJa: 'J-REIT',
    category: 'commodity',
    position: { x: 0.40, y: 0.34 },
    baseMass: 1.2,
    color: '#78716c',
    ticker: '1343.T',
    source: 'yahoo',
  },

  // ===== 債券 =====
  {
    id: 'jgb2',
    label: 'JGB',
    labelJa: 'JGB',
    category: 'safe',
    position: { x: 0.75, y: 0.22 },
    baseMass: 9,
    color: '#c084fc',
    ticker: '2511.T',
    source: 'yahoo',
  },

  // ===== 為替 =====
  {
    id: 'usdjpy',
    label: 'USD/JPY',
    labelJa: 'ドル円',
    category: 'fx',
    position: { x: 0.50, y: 0.38 },
    baseMass: 4,
    color: '#22d3ee',
    ticker: 'USDJPY=X',
    source: 'yahoo',
  },
  {
    id: 'eurjpy',
    label: 'EUR/JPY',
    labelJa: 'ユーロ円',
    category: 'fx',
    position: { x: 0.58, y: 0.30 },
    baseMass: 2,
    color: '#60a5fa',
    ticker: 'EURJPY=X',
    source: 'yahoo',
  },

  // ===== コモディティ =====
  {
    id: 'gold2',
    label: 'Gold (JPY)',
    labelJa: '金(円建)',
    category: 'safe',
    position: { x: 0.68, y: 0.18 },
    baseMass: 3,
    color: '#d4a017',
    ticker: '1540.T',
    source: 'yahoo',
  },

  // ===== 暗号資産 =====
  {
    id: 'btc2',
    label: 'BTC/JPY',
    labelJa: 'BTC/JPY',
    category: 'risk',
    position: { x: 0.06, y: 0.56 },
    baseMass: 1.7,
    color: '#f97316',
    ticker: 'bitcoin',
    source: 'coingecko',
  },

  // ===== 投資家フロー =====
  {
    id: 'kaigai',
    label: 'Foreign',
    labelJa: '海外投資家',
    category: 'risk',
    position: { x: 0.38, y: 0.52 },
    baseMass: 5,
    color: '#fb923c',
    ticker: '^N225',
    source: 'yahoo',
  },
  {
    id: 'nichigin',
    label: 'BOJ',
    labelJa: '日銀',
    category: 'safe',
    position: { x: 0.82, y: 0.36 },
    baseMass: 8,
    color: '#a855f7',
    ticker: '^N225',
    source: 'yahoo',
  },
  {
    id: 'nisa',
    label: 'NISA',
    labelJa: 'NISA資金',
    category: 'risk',
    position: { x: 0.52, y: 0.56 },
    baseMass: 2,
    color: '#fbbf24',
    ticker: '^N225',
    source: 'yahoo',
  },

  // ===== VIX =====
  {
    id: 'vix2',
    label: 'Nikkei VI',
    labelJa: '日経VI',
    category: 'volatility',
    position: { x: 0.56, y: 0.66 },
    baseMass: 0.5,
    color: '#ef4444',
    ticker: '^JNV',
    source: 'yahoo',
  },
];
