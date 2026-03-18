/**
 * Yahoo Finance API Service
 * 将来的にバックエンドプロキシ経由でデータ取得
 */

export interface YahooQuote {
  symbol: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketVolume: number;
}

const API_BASE = '/api/yahoo';

export async function fetchQuote(symbol: string): Promise<YahooQuote> {
  const res = await fetch(`${API_BASE}/quote?symbol=${encodeURIComponent(symbol)}`);
  if (!res.ok) throw new Error(`Yahoo Finance API error: ${res.status}`);
  return res.json();
}

export async function fetchQuotes(symbols: string[]): Promise<YahooQuote[]> {
  const res = await fetch(
    `${API_BASE}/quotes?symbols=${encodeURIComponent(symbols.join(','))}`,
  );
  if (!res.ok) throw new Error(`Yahoo Finance API error: ${res.status}`);
  return res.json();
}
