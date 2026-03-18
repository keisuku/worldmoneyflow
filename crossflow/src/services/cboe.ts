/**
 * CBOE VIX Data Service
 */

export interface VixData {
  value: number;
  change: number;
  changePercent: number;
  timestamp: number;
}

const API_BASE = '/api/cboe';

export async function fetchVix(): Promise<VixData> {
  const res = await fetch(`${API_BASE}/vix`);
  if (!res.ok) throw new Error(`CBOE API error: ${res.status}`);
  return res.json();
}
