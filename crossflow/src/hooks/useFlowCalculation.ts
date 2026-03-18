import { useMemo } from 'react';
import type { Flow, MarketDataPoint } from '../types';
import { defaultFlows } from '../data/flows';

/**
 * 資金フロー計算Hook
 * 各ノードの価格変動からフローの方向・強度を推定
 */
export function useFlowCalculation(marketData: Map<string, MarketDataPoint>): Flow[] {
  return useMemo(() => {
    if (marketData.size === 0) return defaultFlows;

    return defaultFlows.map((flow) => {
      const fromData = marketData.get(flow.from);
      const toData = marketData.get(flow.to);

      if (!fromData || !toData) return flow;

      // フロー強度の計算:
      // from の価格が下落し to の価格が上昇 → 正のフロー（from → to への資金移動）
      const intensity = calculateIntensity(fromData, toData);

      return { ...flow, intensity };
    });
  }, [marketData]);
}

function calculateIntensity(from: MarketDataPoint, to: MarketDataPoint): number {
  // 1日変動率の差をフロー強度として使用
  const diff = to.change1d - from.change1d;

  // -1 to 1 の範囲にクランプ（±5%の差で最大強度）
  const normalized = Math.max(-1, Math.min(1, diff / 5));

  // 小さなフローはノイズとしてフィルタ
  if (Math.abs(normalized) < 0.05) return 0;

  return normalized;
}
