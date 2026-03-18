/**
 * FRED API Service (Federal Reserve Economic Data)
 * 米国債利回り等の取得
 */

export interface FredObservation {
  date: string;
  value: number;
}

const API_BASE = '/api/fred';

export async function fetchSeries(
  seriesId: string,
  limit = 30,
): Promise<FredObservation[]> {
  const res = await fetch(
    `${API_BASE}/series?id=${encodeURIComponent(seriesId)}&limit=${limit}`,
  );
  if (!res.ok) throw new Error(`FRED API error: ${res.status}`);
  return res.json();
}

export async function fetchYieldCurve(): Promise<Record<string, number>> {
  const maturities = ['DGS1MO', 'DGS3MO', 'DGS6MO', 'DGS1', 'DGS2', 'DGS5', 'DGS10', 'DGS30'];
  const res = await fetch(
    `${API_BASE}/yield-curve?series=${encodeURIComponent(maturities.join(','))}`,
  );
  if (!res.ok) throw new Error(`FRED API error: ${res.status}`);
  return res.json();
}
