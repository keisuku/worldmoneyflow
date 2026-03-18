import type { CorrelationPair } from '../types';

/**
 * 相関ペア定義（点線で結ぶ）
 * 相関係数は動的に計算される
 */
export const correlationPairs: CorrelationPair[] = [
  // US Equity内
  { id: 'spx_ndx', nodeA: 'spx', nodeB: 'ndx', correlation: 0, label: 'S&P 500 ↔ NASDAQ' },
  { id: 'ndx_tech', nodeA: 'ndx', nodeB: 'tech', correlation: 0, label: 'NASDAQ ↔ Tech' },
  { id: 'spx_tech', nodeA: 'spx', nodeB: 'tech', correlation: 0, label: 'S&P 500 ↔ Tech' },
  { id: 'spx_russ', nodeA: 'spx', nodeB: 'russ', correlation: 0, label: 'S&P 500 ↔ Russell' },

  // Safe haven
  { id: 'gold_ust', nodeA: 'gold', nodeB: 'ust', correlation: 0, label: 'Gold ↔ US Treasury' },
  { id: 'gold_silver', nodeA: 'gold', nodeB: 'silver', correlation: 0, label: 'Gold ↔ Silver' },
  { id: 'ust_jgb', nodeA: 'ust', nodeB: 'jgb', correlation: 0, label: 'UST ↔ JGB' },

  // Cross-region equity
  { id: 'spx_stoxx', nodeA: 'spx', nodeB: 'stoxx', correlation: 0, label: 'S&P 500 ↔ STOXX' },
  { id: 'spx_nky', nodeA: 'spx', nodeB: 'nky', correlation: 0, label: 'S&P 500 ↔ Nikkei' },

  // China/EM
  { id: 'csi_hsi', nodeA: 'csi', nodeB: 'hsi', correlation: 0, label: 'CSI 300 ↔ Hang Seng' },
  { id: 'csi_em', nodeA: 'csi', nodeB: 'em', correlation: 0, label: 'CSI 300 ↔ MSCI EM' },

  // Commodity
  { id: 'oil_copper', nodeA: 'oil', nodeB: 'copper', correlation: 0, label: 'Oil ↔ Copper' },

  // FX
  { id: 'usd_eur', nodeA: 'usd', nodeB: 'eur', correlation: 0, label: 'USD ↔ EUR' },

  // Japan-FX
  { id: 'nky_jpy', nodeA: 'nky', nodeB: 'jpy', correlation: 0, label: 'Nikkei ↔ JPY' },
];
