/**
 * FRED API Service (Federal Reserve Economic Data)
 * プロキシサーバー経由で米国債利回り・FF金利を取得
 * 更新頻度: 15分間隔
 */

export interface FredObservation {
  date: string;
  value: number;
}

export interface YieldCurveData {
  [seriesId: string]: {
    current: number | null;
    previous: number | null;
  };
}

const API_BASE = '/api/fred';

/** 単一シリーズの観測値を取得 */
export async function fetchSeries(
  seriesId: string,
  limit = 10,
): Promise<FredObservation[]> {
  const res = await fetch(
    `${API_BASE}/series?id=${encodeURIComponent(seriesId)}&limit=${limit}`,
    { signal: AbortSignal.timeout(10000) },
  );
  if (!res.ok) throw new Error(`FRED API error: ${res.status}`);
  return res.json();
}

/** イールドカーブ全体を取得 */
export async function fetchYieldCurve(): Promise<YieldCurveData> {
  const res = await fetch(`${API_BASE}/yield-curve`, {
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`FRED API error: ${res.status}`);
  return res.json();
}

/** FRED シリーズID定義 */
export const FRED_SERIES = {
  // 米国債利回り
  DGS2: 'DGS2',      // 2年
  DGS10: 'DGS10',    // 10年
  DGS30: 'DGS30',    // 30年
  // FF金利
  FEDFUNDS: 'FEDFUNDS',
  // スプレッド関連
  T10Y2Y: 'T10Y2Y',  // 2s10sスプレッド
  BAMLH0A0HYM2: 'BAMLH0A0HYM2',  // HY OAS
  BAMLC0A0CM: 'BAMLC0A0CM',       // IG OAS
  // TED Spread
  TEDRATE: 'TEDRATE',
};

/** イールドカーブの満期ラベルマッピング */
export const YIELD_CURVE_LABELS: Record<string, string> = {
  DGS1MO: '1M',
  DGS3MO: '3M',
  DGS6MO: '6M',
  DGS1: '1Y',
  DGS2: '2Y',
  DGS5: '5Y',
  DGS10: '10Y',
  DGS30: '30Y',
};
