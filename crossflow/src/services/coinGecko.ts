/**
 * CoinGecko API Service
 * 暗号資産価格データ取得 (CORS対応、ブラウザ直接呼び出し可)
 * Rate limit: 10-30 calls/min (free tier)
 */

export interface CoinPrice {
  id: string;
  current_price: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency: number | null;
  price_change_percentage_30d_in_currency: number | null;
  total_volume: number;
  market_cap: number;
}

const API_BASE = 'https://api.coingecko.com/api/v3';

/**
 * 暗号資産の市場データを取得
 * @param ids CoinGecko ID ('bitcoin', 'ethereum' 等)
 * @param currency 通貨 ('usd' or 'jpy')
 */
export async function fetchCoinPrices(
  ids: string[],
  currency = 'usd',
): Promise<CoinPrice[]> {
  const url = `${API_BASE}/coins/markets?vs_currency=${currency}&ids=${ids.join(',')}&sparkline=false&price_change_percentage=24h,7d,30d`;

  const res = await fetch(url, {
    signal: AbortSignal.timeout(10000),
    headers: { accept: 'application/json' },
  });

  if (res.status === 429) {
    throw new Error('CoinGecko rate limit exceeded');
  }
  if (!res.ok) throw new Error(`CoinGecko API error: ${res.status}`);

  return res.json();
}

/** ノードIDからCoinGecko IDへのマッピング */
export const COINGECKO_IDS: Record<string, string> = {
  btc: 'bitcoin',
  btc2: 'bitcoin',
};

/** CoinGeckoレスポンスをノード用データに変換 */
export function coinToNodeData(coin: CoinPrice) {
  return {
    price: coin.current_price,
    change1d: coin.price_change_percentage_24h ?? 0,
    change1w: coin.price_change_percentage_7d_in_currency ?? 0,
    change1m: coin.price_change_percentage_30d_in_currency ?? 0,
    volume: coin.total_volume,
  };
}
