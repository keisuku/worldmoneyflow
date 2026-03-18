/**
 * CoinGecko API Service
 * 暗号資産価格データ取得
 */

export interface CoinPrice {
  id: string;
  current_price: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d: number;
  total_volume: number;
  market_cap: number;
}

const API_BASE = 'https://api.coingecko.com/api/v3';

export async function fetchCoinPrices(
  ids: string[],
  currency = 'usd',
): Promise<CoinPrice[]> {
  const res = await fetch(
    `${API_BASE}/coins/markets?vs_currency=${currency}&ids=${ids.join(',')}&sparkline=false`,
  );
  if (!res.ok) throw new Error(`CoinGecko API error: ${res.status}`);
  return res.json();
}
