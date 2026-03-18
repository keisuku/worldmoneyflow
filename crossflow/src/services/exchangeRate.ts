/**
 * 為替レート API Service
 */

export interface ExchangeRates {
  base: string;
  rates: Record<string, number>;
  timestamp: number;
}

const API_BASE = '/api/exchange';

export async function fetchExchangeRates(
  base = 'USD',
): Promise<ExchangeRates> {
  const res = await fetch(`${API_BASE}/rates?base=${base}`);
  if (!res.ok) throw new Error(`Exchange Rate API error: ${res.status}`);
  return res.json();
}
