/**
 * フロー推定サービス
 * 完全なフローデータ(EPFR等)の代替として、プロキシ指標で推定
 */

import type { MarketDataPoint } from '../types';
import type { YahooQuote } from './yahooFinance';

/**
 * ETFフロー推定
 * AUM変動 ≈ 出来高 × 価格変動方向
 * 正確ではないが、資金の方向性を示すプロキシとして機能
 */
export function estimateEtfFlow(quote: YahooQuote): number {
  const priceDirection = quote.regularMarketChangePercent >= 0 ? 1 : -1;
  // 出来高を正規化（billion USD基準）
  const volumeInBillions = (quote.regularMarketVolume * quote.regularMarketPrice) / 1e9;
  return priceDirection * volumeInBillions;
}

/**
 * セクターローテーション推定
 * セクターETFの相対パフォーマンスから方向性を判定
 */
export interface SectorRotation {
  riskOn: number;   // 0-1: リスクオン度合い
  riskOff: number;  // 0-1: リスクオフ度合い
}

export function estimateSectorRotation(
  marketData: Map<string, MarketDataPoint>,
): SectorRotation {
  // リスクオン指標: 株式、HY、暗号資産のパフォーマンス
  const riskOnIds = ['spx', 'ndx', 'hy', 'btc', 'em'];
  // リスクオフ指標: 国債、金、VIX
  const riskOffIds = ['ust', 'gold', 'jgb', 'vix'];

  const riskOnAvg = averageChange(marketData, riskOnIds);
  const riskOffAvg = averageChange(marketData, riskOffIds);

  // 正規化: -3% ~ +3% → 0 ~ 1
  const normalize = (v: number) => Math.max(0, Math.min(1, (v + 3) / 6));

  return {
    riskOn: normalize(riskOnAvg),
    riskOff: normalize(riskOffAvg),
  };
}

/**
 * リスクレジーム判定
 * VIX + 2s10sスプレッド + HYスプレッドの組み合わせ
 */
export interface RegimeSignal {
  regime: 'risk-on' | 'risk-off';
  confidence: number; // 0-1
  vixLevel: number;
  yieldSpread: number;  // 2s10s
}

export function estimateRegime(
  vixPrice: number,
  yieldSpread2s10s?: number,
): RegimeSignal {
  // VIX基準
  let vixSignal = 0;
  if (vixPrice < 15) vixSignal = 1;        // 強リスクオン
  else if (vixPrice < 20) vixSignal = 0.6;  // やや リスクオン
  else if (vixPrice < 25) vixSignal = 0.3;  // やや リスクオフ
  else if (vixPrice < 30) vixSignal = 0.1;  // リスクオフ
  else vixSignal = 0;                        // 強リスクオフ

  // 2s10sスプレッド基準（マイナス=逆イールド=リスクオフ）
  let spreadSignal = 0.5;
  if (yieldSpread2s10s !== undefined) {
    if (yieldSpread2s10s > 1.0) spreadSignal = 1;
    else if (yieldSpread2s10s > 0) spreadSignal = 0.7;
    else if (yieldSpread2s10s > -0.5) spreadSignal = 0.3;
    else spreadSignal = 0;
  }

  const composite = vixSignal * 0.6 + spreadSignal * 0.4;
  const regime = composite >= 0.5 ? 'risk-on' : 'risk-off';

  return {
    regime,
    confidence: Math.abs(composite - 0.5) * 2,
    vixLevel: vixPrice,
    yieldSpread: yieldSpread2s10s ?? 0,
  };
}

/**
 * ノードフロー推定
 * 価格変動 × 出来高をベースにフロー値を算出
 */
export function estimateNodeFlow(
  changePercent: number,
  volume: number,
  baseMass: number,
): number {
  // 価格変動方向 × ボリューム重み × 質量スケール
  const direction = changePercent >= 0 ? 1 : -1;
  const magnitude = Math.abs(changePercent);
  const volumeWeight = Math.min(1, volume / 1e9); // 10億基準で正規化
  return direction * magnitude * volumeWeight * Math.sqrt(baseMass);
}

function averageChange(
  data: Map<string, MarketDataPoint>,
  ids: string[],
): number {
  let sum = 0;
  let count = 0;
  for (const id of ids) {
    const d = data.get(id);
    if (d) {
      sum += d.change1d;
      count++;
    }
  }
  return count > 0 ? sum / count : 0;
}
