/**
 * Exchange Rate API Service
 * 為替レート取得 (CORS対応、ブラウザ直接呼び出し可)
 * 無料API: https://open.er-api.com/ (日次更新)
 * 更新頻度: 1分間隔で確認、ソースは日次
 */

export interface ExchangeRateResponse {
  result: string;
  base_code: string;
  rates: Record<string, number>;
  time_last_update_unix: number;
}

const API_BASE = 'https://open.er-api.com/v6/latest';

/**
 * USD基準の為替レートを取得
 */
export async function fetchExchangeRates(base = 'USD'): Promise<ExchangeRateResponse> {
  const res = await fetch(`${API_BASE}/${base}`, {
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`ExchangeRate API error: ${res.status}`);
  return res.json();
}

/** ノードIDから通貨ペアデータを抽出 */
export function extractFxData(
  rates: Record<string, number>,
  nodeId: string,
  previousRates?: Record<string, number>,
): { price: number; change1d: number } | null {
  switch (nodeId) {
    case 'jpy':
    case 'usdjpy': {
      const rate = rates['JPY'];
      if (!rate) return null;
      const prevRate = previousRates?.['JPY'] ?? rate;
      return {
        price: rate,
        change1d: prevRate ? ((rate - prevRate) / prevRate) * 100 : 0,
      };
    }
    case 'eur':
    case 'eurjpy': {
      const eurRate = rates['EUR'];
      if (!eurRate) return null;
      // EUR/USD = 1 / (USD/EUR rate)
      const eurusd = 1 / eurRate;
      const prevEur = previousRates?.['EUR'];
      const prevEurusd = prevEur ? 1 / prevEur : eurusd;
      if (nodeId === 'eurjpy') {
        const jpyRate = rates['JPY'];
        if (!jpyRate) return null;
        const eurjpy = jpyRate / eurRate;
        const prevJpy = previousRates?.['JPY'] ?? jpyRate;
        const prevEurjpy = prevEur ? prevJpy / prevEur : eurjpy;
        return {
          price: eurjpy,
          change1d: prevEurjpy ? ((eurjpy - prevEurjpy) / prevEurjpy) * 100 : 0,
        };
      }
      return {
        price: eurusd,
        change1d: prevEurusd ? ((eurusd - prevEurusd) / prevEurusd) * 100 : 0,
      };
    }
    default:
      return null;
  }
}
