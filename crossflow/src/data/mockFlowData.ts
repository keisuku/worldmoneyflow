/**
 * Mock market data reflecting March 2026 conditions:
 * "The Great De-Risking" theme from BofA FMS
 * - Fund managers cutting equity allocation to lowest since Nov 2023
 * - Cash levels rising to 4.1%
 * - Rotation from US to Europe and EM
 * - Gold is the most crowded trade (35%)
 * - Long Semis is the second most crowded trade (35%)
 */

export interface MockETF {
  ticker: string;
  name: string;
  price: number;
  change1d: number;
  weeklyFlow: number; // in $B
  category: string;
}

export interface MockFlowMetric {
  id: string;
  label: string;
  value: number; // weekly net flow in $B
  change: number; // vs previous week
  sparkline: number[];
  positive: boolean;
}

export interface MockSectorData {
  name: string;
  relPerformance: number; // vs S&P 500, %
  momentum: number; // improving/declining score -1 to 1
  quadrant: 'leading' | 'weakening' | 'lagging' | 'improving';
  color: string;
}

export interface MockYieldPoint {
  maturity: string;
  current: number;
  previous: number;
}

export interface MockCentralBankData {
  date: string;
  fed: number;
  ecb: number;
  boj: number;
  pboc: number;
}

export interface MockRateDecision {
  bank: string;
  date: string;
  action: string;
  color: string;
}

// Market regime data
export const regimeData = {
  score: 38, // 0-100, where 0=max risk-off, 100=max risk-on
  label: 'CAUTIOUS' as const,
  vix: 24.3,
  creditSpread: 142,
  yieldCurveSlope: -0.18,
  dxyTrend: -1.2,
  globalLiquidity: 178.4, // $T
  components: [
    { name: 'VIX', value: 24.3, score: 35, color: '#f59e0b' },
    { name: 'Credit Spreads', value: 142, score: 40, color: '#f59e0b' },
    { name: 'Yield Curve', value: -0.18, score: 30, color: '#ff4757' },
    { name: 'DXY Trend', value: -1.2, score: 55, color: '#00d4aa' },
  ],
};

// Key market indicators
export const headerIndicators = {
  vix: 24.3,
  vixChange: 2.1,
  dxy: 102.8,
  dxyChange: -0.4,
  globalLiquidity: 178.4,
  liquidityChange: 0.8,
};

// ETF Flow Table
export const etfFlows: MockETF[] = [
  { ticker: 'SPY', name: 'S&P 500', price: 5342.18, change1d: -0.82, weeklyFlow: -8.4, category: 'US Equity' },
  { ticker: 'QQQ', name: 'Nasdaq 100', price: 17856.42, change1d: -1.14, weeklyFlow: -5.2, category: 'US Equity' },
  { ticker: 'IWM', name: 'Russell 2000', price: 1987.34, change1d: -0.67, weeklyFlow: -1.8, category: 'US Equity' },
  { ticker: 'EEM', name: 'EM Equities', price: 46.82, change1d: 0.42, weeklyFlow: 3.1, category: 'EM Equity' },
  { ticker: 'EFA', name: 'EAFE', price: 82.14, change1d: 0.38, weeklyFlow: 4.2, category: 'Intl Equity' },
  { ticker: 'TLT', name: '20+ Year Treasury', price: 89.56, change1d: 0.28, weeklyFlow: 6.8, category: 'Bonds' },
  { ticker: 'LQD', name: 'IG Corporate', price: 108.24, change1d: 0.15, weeklyFlow: 4.5, category: 'Bonds' },
  { ticker: 'HYG', name: 'High Yield', price: 75.38, change1d: -0.22, weeklyFlow: -0.8, category: 'Bonds' },
  { ticker: 'GLD', name: 'Gold', price: 2847.60, change1d: 0.94, weeklyFlow: 5.6, category: 'Commodity' },
  { ticker: 'VNQ', name: 'Real Estate', price: 84.12, change1d: -0.31, weeklyFlow: -0.4, category: 'Real Estate' },
];

// Flow Cards data
export const flowMetrics: MockFlowMetric[] = [
  {
    id: 'equity',
    label: 'Equity Flows',
    value: -8.5,
    change: -3.2,
    sparkline: [2.1, 1.4, -0.8, -3.2, -5.1, -6.8, -7.2, -8.5],
    positive: false,
  },
  {
    id: 'bonds',
    label: 'Bond Flows',
    value: 22.8,
    change: 4.1,
    sparkline: [8.2, 10.1, 12.4, 14.8, 16.2, 18.5, 20.1, 22.8],
    positive: true,
  },
  {
    id: 'em',
    label: 'EM Flows',
    value: 7.8,
    change: 1.4,
    sparkline: [1.2, 2.4, 3.1, 4.8, 5.2, 6.1, 7.0, 7.8],
    positive: true,
  },
  {
    id: 'gold',
    label: 'Gold / Cmdty',
    value: 5.6,
    change: 0.8,
    sparkline: [1.8, 2.2, 2.8, 3.4, 3.9, 4.5, 5.0, 5.6],
    positive: true,
  },
];

// Sector Rotation data
export const sectorData: MockSectorData[] = [
  { name: 'Tech', relPerformance: -2.8, momentum: -0.4, quadrant: 'weakening', color: '#ff4757' },
  { name: 'Financials', relPerformance: 1.2, momentum: 0.3, quadrant: 'leading', color: '#00d4aa' },
  { name: 'Healthcare', relPerformance: 0.8, momentum: 0.6, quadrant: 'leading', color: '#00d4aa' },
  { name: 'Energy', relPerformance: -1.4, momentum: -0.6, quadrant: 'lagging', color: '#ff4757' },
  { name: 'Materials', relPerformance: 0.4, momentum: 0.7, quadrant: 'improving', color: '#4facfe' },
  { name: 'Industrials', relPerformance: 0.6, momentum: 0.2, quadrant: 'leading', color: '#00d4aa' },
  { name: 'Utilities', relPerformance: 1.8, momentum: 0.5, quadrant: 'leading', color: '#00d4aa' },
  { name: 'Staples', relPerformance: 1.1, momentum: 0.1, quadrant: 'leading', color: '#00d4aa' },
  { name: 'Discretionary', relPerformance: -2.1, momentum: -0.3, quadrant: 'weakening', color: '#f59e0b' },
  { name: 'Real Estate', relPerformance: -0.6, momentum: 0.4, quadrant: 'improving', color: '#4facfe' },
  { name: 'Comm Svcs', relPerformance: -1.8, momentum: -0.5, quadrant: 'lagging', color: '#ff4757' },
];

// Yield Curve
export const yieldCurveData: MockYieldPoint[] = [
  { maturity: '3M', current: 4.82, previous: 4.95 },
  { maturity: '6M', current: 4.68, previous: 4.78 },
  { maturity: '1Y', current: 4.42, previous: 4.55 },
  { maturity: '2Y', current: 4.18, previous: 4.32 },
  { maturity: '5Y', current: 4.08, previous: 4.15 },
  { maturity: '10Y', current: 4.00, previous: 4.08 },
  { maturity: '30Y', current: 4.22, previous: 4.28 },
];

// Central Bank Balance Sheets (in $T, monthly data over 24 months)
export const centralBankData: MockCentralBankData[] = [
  { date: 'Apr 24', fed: 7.4, ecb: 6.8, boj: 5.2, pboc: 5.8 },
  { date: 'Jun 24', fed: 7.3, ecb: 6.7, boj: 5.3, pboc: 5.9 },
  { date: 'Aug 24', fed: 7.2, ecb: 6.6, boj: 5.3, pboc: 6.0 },
  { date: 'Oct 24', fed: 7.1, ecb: 6.5, boj: 5.4, pboc: 6.1 },
  { date: 'Dec 24', fed: 7.0, ecb: 6.4, boj: 5.5, pboc: 6.2 },
  { date: 'Feb 25', fed: 6.9, ecb: 6.3, boj: 5.5, pboc: 6.3 },
  { date: 'Apr 25', fed: 6.8, ecb: 6.2, boj: 5.6, pboc: 6.4 },
  { date: 'Jun 25', fed: 6.8, ecb: 6.1, boj: 5.6, pboc: 6.5 },
  { date: 'Aug 25', fed: 6.7, ecb: 6.1, boj: 5.7, pboc: 6.5 },
  { date: 'Oct 25', fed: 6.7, ecb: 6.0, boj: 5.7, pboc: 6.6 },
  { date: 'Dec 25', fed: 6.6, ecb: 6.0, boj: 5.8, pboc: 6.7 },
  { date: 'Feb 26', fed: 6.6, ecb: 5.9, boj: 5.8, pboc: 6.8 },
  { date: 'Mar 26', fed: 6.5, ecb: 5.9, boj: 5.9, pboc: 6.9 },
];

export const rateDecisions: MockRateDecision[] = [
  { bank: 'Fed', date: 'Mar 19', action: 'Hold 4.25-4.50%', color: '#4facfe' },
  { bank: 'BOJ', date: 'Mar 20', action: 'Hold 0.50%', color: '#ff4757' },
  { bank: 'ECB', date: 'Apr 3', action: 'Expected -25bp', color: '#ffd700' },
  { bank: 'PBOC', date: 'Apr 15', action: 'Expected -10bp LPR', color: '#ff4757' },
];
