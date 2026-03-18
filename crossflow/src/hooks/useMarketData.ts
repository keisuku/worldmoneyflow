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
 * リアルAPI → キャッシュフォールバック → モックデータ の3段階
 */
export function useMarketData(nodes: MarketNode[]) {
  const [data, setData] = useState<Map<string, MarketDataPoint>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // データソース登録
  useEffect(() => {
    const yahooCount = nodes.filter((n) => n.source === 'yahoo' || n.source === 'cboe').length;
    const cgCount = nodes.filter((n) => n.source === 'coingecko').length;
    const fxCount = nodes.filter((n) => n.id === 'jpy' || n.id === 'eur' || n.id === 'usdjpy' || n.id === 'eurjpy').length;
    dataQuality.registerSource('yahoo', yahooCount);
    dataQuality.registerSource('coingecko', cgCount);
    dataQuality.registerSource('exchange_rate', fxCount);
  }, [nodes]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    const result = new Map<string, MarketDataPoint>();
    const now = Date.now();

    // === Tier 1: Yahoo Finance (株価/コモディティ/VIX) ===
    const yahooNodes = nodes.filter(
      (n) => (n.source === 'yahoo' || n.source === 'cboe') && YAHOO_SYMBOLS[n.id],
    );
    const yahooSymbols = yahooNodes.map((n) => YAHOO_SYMBOLS[n.id]).filter(Boolean);

    if (yahooSymbols.length > 0) {
      try {
        const quotes = await fetchQuotes(yahooSymbols);
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
        console.warn('Yahoo Finance fetch failed, using cache:', err);
        dataQuality.recordError('yahoo', String(err));
        // キャッシュフォールバック
        for (const node of yahooNodes) {
          const cached = cache.get(node.id);
          if (cached) result.set(node.id, cached.data);
        }
      }
    }

    // === Tier 1: CoinGecko (暗号資産) ===
    const cgNodes = nodes.filter((n) => n.source === 'coingecko' && COINGECKO_IDS[n.id]);
    if (cgNodes.length > 0) {
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
        dataQuality.recordSuccess('coingecko', cgNodes.length);
      } catch (err) {
        console.warn('CoinGecko fetch failed, using cache:', err);
        dataQuality.recordError('coingecko', String(err));
        for (const node of cgNodes) {
          const cached = cache.get(node.id);
          if (cached) result.set(node.id, cached.data);
        }
      }
    }

    // === Tier 1: Exchange Rate API (FX) ===
    const fxNodes = nodes.filter(
      (n) => ['jpy', 'eur', 'usdjpy', 'eurjpy'].includes(n.id),
    );
    if (fxNodes.length > 0) {
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
        dataQuality.recordSuccess('exchange_rate', fxNodes.length);
      } catch (err) {
        console.warn('ExchangeRate fetch failed, using cache:', err);
        dataQuality.recordError('exchange_rate', String(err));
        for (const node of fxNodes) {
          const cached = cache.get(node.id);
          if (cached) result.set(node.id, cached.data);
        }
      }
    }

    // === フォールバック: キャッシュもなければモックデータ ===
    for (const node of nodes) {
      if (!result.has(node.id)) {
        const cached = cache.get(node.id);
        if (cached && now - cached.fetchedAt < 3600_000) {
          result.set(node.id, cached.data);
        } else {
          // 最終手段: モックデータ
          result.set(node.id, generateMockPoint(node, now));
        }
      }
    }

    setData(result);
    setLoading(false);
  }, [nodes]);

  useEffect(() => {
    refresh();
    // 1分間隔でリフレッシュ
    intervalRef.current = setInterval(refresh, 60_000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [refresh]);

  return { data, loading, error, refresh };
}

/** モックデータ生成（最終フォールバック） */
function generateMockPoint(node: MarketNode, now: number): MarketDataPoint {
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
