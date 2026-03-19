/**
 * Yahoo Finance API Service
 * プロキシサーバー経由で株価/コモディティ/VIXを取得
 */

export interface YahooQuote {
  symbol: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketVolume: number;
  previousClose: number;
  weekChange: number;
  monthChange?: number;
}

const API_BASE = '/api/yahoo';

/** 全シンボルをバッチ取得 */
export async function fetchQuotes(symbols: string[]): Promise<YahooQuote[]> {
  const res = await fetch(
    `${API_BASE}/quotes?symbols=${encodeURIComponent(symbols.join(','))}`,
    { signal: AbortSignal.timeout(5000) },
  );
  if (!res.ok) throw new Error(`Yahoo Finance API error: ${res.status}`);
  return res.json();
}

/** 単一シンボル取得 */
export async function fetchQuote(symbol: string): Promise<YahooQuote> {
  const res = await fetch(
    `${API_BASE}/quote?symbol=${encodeURIComponent(symbol)}`,
    { signal: AbortSignal.timeout(10000) },
  );
  if (!res.ok) throw new Error(`Yahoo Finance API error: ${res.status}`);
  return res.json();
}

/**
 * ノードIDからYahoo Financeティッカーへのマッピング
 * globalNodes / japanNodes の ticker フィールドを使用
 */
export const YAHOO_SYMBOLS: Record<string, string> = {
  // Global — Equity
  spx: '^GSPC',
  ndx: '^IXIC',
  tech: 'XLK',
  russ: '^RUT',
  nky: '^N225',
  stoxx: '^STOXX50E',
  csi: '000300.SS',
  hsi: '^HSI',
  em: 'EEM',
  hy: 'HYG',
  // Global — Safe haven
  gold: 'GC=F',
  silver: 'SI=F',
  ust: 'TLT',
  jgb: '2511.T',
  // Global — Commodity
  oil: 'CL=F',
  copper: 'HG=F',
  reit: 'VNQ',
  // Global — FX (via Yahoo)
  usd: 'DX-Y.NYB',
  // Global — VIX
  vix: '^VIX',
  // Japan
  nk225: '^N225',
  topix: '^TPX',
  mothers: '2516.T',  // Growth250 ETF
  bank: '1615.T',
  semi: '8035.T',
  auto: '7203.T',
  jreit: '1343.T',
  jgb2: '2511.T',
  vix2: '^VIX',  // fallback to VIX
};

/**
 * ETFフロー推定用シンボル
 * AUM変動 ≈ (price × shares outstanding) の日次差分
 */
export const ETF_FLOW_SYMBOLS = [
  'SPY', 'QQQ', 'IWM',  // 株式
  'TLT', 'IEF', 'SHY',  // 債券
  'GLD', 'SLV',          // 貴金属
  'HYG', 'LQD',          // クレジット
  'EEM', 'VWO',          // 新興国
  'VNQ',                  // REIT
];
