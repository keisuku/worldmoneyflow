import type { CorrelationPair } from '../types';

/**
 * 監視対象の相関ペア
 * 相関係数は動的に計算される
 */
export const correlationPairs: CorrelationPair[] = [
  {
    id: 'sp500_us10y',
    nodeA: 'sp500',
    nodeB: 'us10y',
    correlation: 0,
    label: 'S&P 500 vs US 10Y',
  },
  {
    id: 'sp500_gold',
    nodeA: 'sp500',
    nodeB: 'gold',
    correlation: 0,
    label: 'S&P 500 vs Gold',
  },
  {
    id: 'sp500_vix',
    nodeA: 'sp500',
    nodeB: 'vix',
    correlation: 0,
    label: 'S&P 500 vs VIX',
  },
  {
    id: 'dxy_gold',
    nodeA: 'dxy',
    nodeB: 'gold',
    correlation: 0,
    label: 'DXY vs Gold',
  },
  {
    id: 'dxy_emerging',
    nodeA: 'dxy',
    nodeB: 'emerging',
    correlation: 0,
    label: 'DXY vs EM Equity',
  },
  {
    id: 'usdjpy_nikkei',
    nodeA: 'usdjpy',
    nodeB: 'nikkei',
    correlation: 0,
    label: 'USD/JPY vs Nikkei',
  },
  {
    id: 'btc_nasdaq',
    nodeA: 'bitcoin',
    nodeB: 'nasdaq',
    correlation: 0,
    label: 'Bitcoin vs NASDAQ',
  },
  {
    id: 'oil_copper',
    nodeA: 'wti',
    nodeB: 'copper',
    correlation: 0,
    label: 'WTI vs Copper',
  },
  {
    id: 'us10y_us2y',
    nodeA: 'us10y',
    nodeB: 'us2y',
    correlation: 0,
    label: 'US 10Y vs 2Y (Curve)',
  },
  {
    id: 'ig_hy',
    nodeA: 'us_ig',
    nodeB: 'us_hy',
    correlation: 0,
    label: 'IG vs HY Spread',
  },
];
