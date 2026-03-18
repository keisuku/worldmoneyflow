import { useState, useEffect, useCallback } from 'react';
import type { MarketNode, MarketDataPoint } from '../types';

/**
 * マーケットデータ取得Hook
 * 初期フェーズではモックデータを返す
 * 将来的にはAPIからリアルデータを取得
 */
export function useMarketData(nodes: MarketNode[]) {
  const [data, setData] = useState<Map<string, MarketDataPoint>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const generateMockData = useCallback((): Map<string, MarketDataPoint> => {
    const map = new Map<string, MarketDataPoint>();
    for (const node of nodes) {
      const basePrice = getBasePrice(node.id);
      const change1d = (Math.random() - 0.5) * 4; // -2% to +2%
      map.set(node.id, {
        nodeId: node.id,
        price: basePrice * (1 + change1d / 100),
        change1d,
        change1w: (Math.random() - 0.5) * 8,
        change1m: (Math.random() - 0.5) * 15,
        volume: Math.random() * 1e9,
        timestamp: Date.now(),
      });
    }
    return map;
  }, [nodes]);

  const refresh = useCallback(() => {
    setLoading(true);
    setError(null);
    try {
      const mockData = generateMockData();
      setData(mockData);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [generateMockData]);

  useEffect(() => {
    refresh();
    // 30秒ごとにリフレッシュ
    const interval = setInterval(refresh, 30_000);
    return () => clearInterval(interval);
  }, [refresh]);

  return { data, loading, error, refresh };
}

function getBasePrice(nodeId: string): number {
  const prices: Record<string, number> = {
    sp500: 5800,
    nasdaq: 18500,
    russell2000: 2100,
    stoxx600: 520,
    nikkei: 39000,
    shanghai: 3100,
    emerging: 44,
    us10y: 4.25,
    us2y: 4.65,
    us_ig: 115,
    us_hy: 78,
    jgb10y: 0.85,
    gold: 2350,
    wti: 78,
    copper: 4.2,
    bitcoin: 68000,
    ethereum: 3500,
    dxy: 104,
    usdjpy: 155,
    eurusd: 1.08,
    vix: 16,
  };
  return prices[nodeId] ?? 100;
}
