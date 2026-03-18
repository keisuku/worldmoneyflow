import { useState, useEffect, useCallback } from 'react';
import type { MarketNode, MarketDataPoint } from '../types';

/**
 * マーケットデータ取得Hook
 * 初期フェーズではモックデータを返す
 */
export function useMarketData(nodes: MarketNode[]) {
  const [data, setData] = useState<Map<string, MarketDataPoint>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const generateMockData = useCallback((): Map<string, MarketDataPoint> => {
    const map = new Map<string, MarketDataPoint>();
    for (const node of nodes) {
      const basePrice = getBasePrice(node.id);
      const change1d = (Math.random() - 0.5) * 4;
      const flow = (Math.random() - 0.5) * 20; // -10 to +10
      map.set(node.id, {
        nodeId: node.id,
        price: basePrice * (1 + change1d / 100),
        change1d,
        change1w: (Math.random() - 0.5) * 8,
        change1m: (Math.random() - 0.5) * 15,
        volume: Math.random() * 1e9,
        flow,
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
    const interval = setInterval(refresh, 30_000);
    return () => clearInterval(interval);
  }, [refresh]);

  return { data, loading, error, refresh };
}

function getBasePrice(nodeId: string): number {
  const prices: Record<string, number> = {
    // Global
    spx: 5800, ndx: 18500, tech: 230, russ: 2100,
    nky: 39000, stoxx: 520,
    csi: 3600, hsi: 17500, em: 44,
    btc: 68000,
    hy: 78,
    gold: 2350, silver: 28, ust: 92, jgb: 100,
    vix: 16,
    oil: 78, copper: 4.2, reit: 90,
    usd: 104, jpy: 155, eur: 1.08,
    // Japan
    nk225: 39000, topix: 2700, mothers: 680,
    bank: 280, semi: 28000, auto: 3200,
    jreit: 1800, jgb2: 100,
    usdjpy: 155, eurjpy: 168,
    gold2: 12000, btc2: 10500000,
    kaigai: 100, nichigin: 100, nisa: 100,
    vix2: 22,
  };
  return prices[nodeId] ?? 100;
}
