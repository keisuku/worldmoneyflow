import { useState, useEffect, useCallback, useRef } from 'react';
import type { MarketNode, MarketDataPoint } from '../types';
import { fetchQuotes, YAHOO_SYMBOLS } from '../services/yahooFinance';
import { fetchCoinPrices, COINGECKO_IDS, coinToNodeData } from '../services/coinGecko';
import { fetchExchangeRates, extractFxData } from '../services/exchangeRate';
import { estimateNodeFlow } from '../services/flowEstimation';
import { dataQuality } from '../services/dataQuality';

/** キャッシュエントリ */
interface CacheEntry {
  data: MarketDataPoint;
  fetchedAt: number;
}

// キャッシュ（モジュールレベル）
const cache = new Map<string, CacheEntry>();
let fxRatesCache: { rates: Record<string, number>; fetchedAt: number } | null = null;

/**
 * マーケットデータ統合Hook
 * 初回は初期データを即表示 → バックグラウンドでAPI並列取得 → マージ更新
 */
export function useMarketData(nodes: MarketNode[]) {
  const [data, setData] = useState<Map<string, MarketDataPoint>>(() => initDefaultData(nodes));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const nodesRef = useRef(nodes);
  nodesRef.current = nodes;

  // ノード変更時に初期データでリセット（即座に表示）
  useEffect(() => {
    setData(initDefaultData(nodes));
  }, [nodes]);

  // データソース登録
  useEffect(() => {
    const yahooCount = nodes.filter((n) => n.source === 'yahoo' || n.source === 'cboe').length;
    const cgCount = nodes.filter((n) => n.source === 'coingecko').length;
    const fxCount = nodes.filter((n) => ['jpy', 'eur', 'usdjpy', 'eurjpy'].includes(n.id)).length;
    dataQuality.registerSource('yahoo', yahooCount);
    dataQuality.registerSource('coingecko', cgCount);
    dataQuality.registerSource('exchange_rate', fxCount);
  }, [nodes]);

  const refresh = useCallback(async () => {
    const currentNodes = nodesRef.current;
    setLoading(true);
    setError(null);

    const now = Date.now();

    // 全APIソースを並列実行
    const [yahooResult, cgResult, fxResult] = await Promise.allSettled([
      fetchYahooData(currentNodes, now),
      fetchCoinGeckoData(currentNodes, now),
      fetchFxData(currentNodes, now),
    ]);

    // 既存データにマージ（APIで取れた分だけ上書き）
    setData((prev) => {
      const merged = new Map(prev);

      if (yahooResult.status === 'fulfilled') {
        for (const [id, dp] of yahooResult.value) {
          merged.set(id, dp);
        }
      }
      if (cgResult.status === 'fulfilled') {
        for (const [id, dp] of cgResult.value) {
          merged.set(id, dp);
        }
      }
      if (fxResult.status === 'fulfilled') {
        for (const [id, dp] of fxResult.value) {
          merged.set(id, dp);
        }
      }

      // API取れなかったノードはキャッシュ or 既存(初期値)をそのまま保持
      for (const node of currentNodes) {
        if (!merged.has(node.id)) {
          const cached = cache.get(node.id);
          if (cached) merged.set(node.id, cached.data);
        }
      }

      return merged;
    });

    setLoading(false);
  }, []);

  useEffect(() => {
    // 初回API取得（初期表示後にバックグラウンドで）
    refresh();
    // 1分間隔でリフレッシュ
    intervalRef.current = setInterval(refresh, 60_000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [refresh]);

  return { data, loading, error, refresh };
}

// ===== API Fetch Functions (各ソース独立) =====

async function fetchYahooData(
  nodes: MarketNode[],
  now: number,
): Promise<Map<string, MarketDataPoint>> {
  const result = new Map<string, MarketDataPoint>();
  const yahooNodes = nodes.filter(
    (n) => (n.source === 'yahoo' || n.source === 'cboe') && YAHOO_SYMBOLS[n.id],
  );
  if (yahooNodes.length === 0) return result;

  const symbols = [...new Set(yahooNodes.map((n) => YAHOO_SYMBOLS[n.id]))];

  try {
    const quotes = await fetchQuotes(symbols);
    const quoteMap = new Map(quotes.map((q) => [q.symbol, q]));

    for (const node of yahooNodes) {
      const symbol = YAHOO_SYMBOLS[node.id];
      const quote = quoteMap.get(symbol);
      if (quote) {
        const dp: MarketDataPoint = {
          nodeId: node.id,
          price: quote.regularMarketPrice,
          change1d: quote.regularMarketChangePercent,
          change1w: quote.weekChange ?? 0,
          change1m: quote.monthChange ?? 0,
          volume: quote.regularMarketVolume,
          flow: estimateNodeFlow(
            quote.regularMarketChangePercent,
            quote.regularMarketVolume,
            node.baseMass,
          ),
          timestamp: now,
        };
        result.set(node.id, dp);
        cache.set(node.id, { data: dp, fetchedAt: now });
      }
    }
    dataQuality.recordSuccess('yahoo', result.size);
  } catch (err) {
    console.warn('Yahoo Finance fetch failed:', err);
    dataQuality.recordError('yahoo', String(err));
    // キャッシュフォールバック
    for (const node of yahooNodes) {
      const cached = cache.get(node.id);
      if (cached) result.set(node.id, cached.data);
    }
  }

  return result;
}

async function fetchCoinGeckoData(
  nodes: MarketNode[],
  now: number,
): Promise<Map<string, MarketDataPoint>> {
  const result = new Map<string, MarketDataPoint>();
  const cgNodes = nodes.filter((n) => n.source === 'coingecko' && COINGECKO_IDS[n.id]);
  if (cgNodes.length === 0) return result;

  const cgIds = [...new Set(cgNodes.map((n) => COINGECKO_IDS[n.id]))];

  try {
    const coins = await fetchCoinPrices(cgIds);
    const coinMap = new Map(coins.map((c) => [c.id, c]));

    for (const node of cgNodes) {
      const cgId = COINGECKO_IDS[node.id];
      const coin = coinMap.get(cgId);
      if (coin) {
        const converted = coinToNodeData(coin);
        const dp: MarketDataPoint = {
          nodeId: node.id,
          ...converted,
          flow: estimateNodeFlow(converted.change1d, converted.volume, node.baseMass),
          timestamp: now,
        };
        result.set(node.id, dp);
        cache.set(node.id, { data: dp, fetchedAt: now });
      }
    }
    dataQuality.recordSuccess('coingecko', result.size);
  } catch (err) {
    console.warn('CoinGecko fetch failed:', err);
    dataQuality.recordError('coingecko', String(err));
    for (const node of cgNodes) {
      const cached = cache.get(node.id);
      if (cached) result.set(node.id, cached.data);
    }
  }

  return result;
}

async function fetchFxData(
  nodes: MarketNode[],
  now: number,
): Promise<Map<string, MarketDataPoint>> {
  const result = new Map<string, MarketDataPoint>();
  const fxNodes = nodes.filter((n) => ['jpy', 'eur', 'usdjpy', 'eurjpy'].includes(n.id));
  if (fxNodes.length === 0) return result;

  try {
    const previousRates = fxRatesCache?.rates;
    const fxData = await fetchExchangeRates('USD');
    fxRatesCache = { rates: fxData.rates, fetchedAt: now };

    for (const node of fxNodes) {
      const fxResult = extractFxData(fxData.rates, node.id, previousRates);
      if (fxResult) {
        const dp: MarketDataPoint = {
          nodeId: node.id,
          price: fxResult.price,
          change1d: fxResult.change1d,
          change1w: 0,
          change1m: 0,
          volume: 0,
          flow: estimateNodeFlow(fxResult.change1d, 1e9, node.baseMass),
          timestamp: now,
        };
        result.set(node.id, dp);
        cache.set(node.id, { data: dp, fetchedAt: now });
      }
    }
    dataQuality.recordSuccess('exchange_rate', result.size);
  } catch (err) {
    console.warn('ExchangeRate fetch failed:', err);
    dataQuality.recordError('exchange_rate', String(err));
    for (const node of fxNodes) {
      const cached = cache.get(node.id);
      if (cached) result.set(node.id, cached.data);
    }
  }

  return result;
}

// ===== Mock Data =====

/** 初期データ生成（即座にUI表示するため） */
function initDefaultData(nodes: MarketNode[]): Map<string, MarketDataPoint> {
  const map = new Map<string, MarketDataPoint>();
  const now = Date.now();
  for (const node of nodes) {
    map.set(node.id, generateDefaultPoint(node, now));
  }
  return map;
}

function generateDefaultPoint(node: MarketNode, now: number): MarketDataPoint {
  const basePrice = MOCK_PRICES[node.id] ?? 100;
  const change1d = (Math.random() - 0.5) * 4;
  return {
    nodeId: node.id,
    price: basePrice * (1 + change1d / 100),
    change1d,
    change1w: (Math.random() - 0.5) * 8,
    change1m: (Math.random() - 0.5) * 15,
    volume: Math.random() * 1e9,
    flow: (Math.random() - 0.5) * 10,
    timestamp: now,
  };
}

const MOCK_PRICES: Record<string, number> = {
  spx: 5800, ndx: 18500, tech: 230, russ: 2100,
  nky: 39000, stoxx: 520,
  csi: 3600, hsi: 17500, em: 44,
  btc: 68000,
  hy: 78,
  gold: 2350, silver: 28, ust: 92, jgb: 100,
  vix: 16,
  oil: 78, copper: 4.2, reit: 90,
  usd: 104, jpy: 155, eur: 1.08,
  nk225: 39000, topix: 2700, mothers: 680,
  bank: 280, semi: 28000, auto: 3200,
  jreit: 1800, jgb2: 100,
  usdjpy: 155, eurjpy: 168,
  gold2: 12000, btc2: 10500000,
  kaigai: 100, nichigin: 100, nisa: 100,
  vix2: 22,
};
