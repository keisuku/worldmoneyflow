import type { Flow } from '../types';

/**
 * 主要な資金フローパス定義
 * intensity は動的に計算されるが、初期値を設定
 */
export const defaultFlows: Flow[] = [
  // Risk-On: 債券 → 株式
  { id: 'bond_to_equity_us', from: 'us10y', to: 'sp500', intensity: 0, color: '#4CAF50' },
  { id: 'bond_to_nasdaq', from: 'us10y', to: 'nasdaq', intensity: 0, color: '#66BB6A' },
  { id: 'bond_to_em', from: 'us10y', to: 'emerging', intensity: 0, color: '#A5D6A7' },

  // Risk-Off: 株式 → 債券・金
  { id: 'equity_to_bond', from: 'sp500', to: 'us10y', intensity: 0, color: '#2196F3' },
  { id: 'equity_to_gold', from: 'sp500', to: 'gold', intensity: 0, color: '#FFD700' },

  // ドル高: 新興国 → 米国
  { id: 'em_to_us', from: 'emerging', to: 'sp500', intensity: 0, color: '#4CAF50' },
  { id: 'asia_to_us', from: 'nikkei', to: 'sp500', intensity: 0, color: '#43A047' },

  // ドル安: 米国 → 新興国・コモディティ
  { id: 'us_to_em', from: 'sp500', to: 'emerging', intensity: 0, color: '#A5D6A7' },
  { id: 'dxy_to_gold', from: 'dxy', to: 'gold', intensity: 0, color: '#FFD700' },

  // 暗号資産フロー
  { id: 'equity_to_crypto', from: 'nasdaq', to: 'bitcoin', intensity: 0, color: '#F7931A' },
  { id: 'crypto_to_equity', from: 'bitcoin', to: 'nasdaq', intensity: 0, color: '#66BB6A' },
  { id: 'btc_to_eth', from: 'bitcoin', to: 'ethereum', intensity: 0, color: '#627EEA' },

  // クレジット
  { id: 'ig_to_hy', from: 'us_ig', to: 'us_hy', intensity: 0, color: '#90CAF9' },
  { id: 'hy_to_ig', from: 'us_hy', to: 'us_ig', intensity: 0, color: '#64B5F6' },

  // コモディティ間
  { id: 'oil_to_copper', from: 'wti', to: 'copper', intensity: 0, color: '#E65100' },
  { id: 'gold_to_oil', from: 'gold', to: 'wti', intensity: 0, color: '#FF9800' },

  // 日米フロー
  { id: 'nikkei_to_sp', from: 'nikkei', to: 'sp500', intensity: 0, color: '#43A047' },
  { id: 'jgb_to_ust', from: 'jgb10y', to: 'us10y', intensity: 0, color: '#1E88E5' },

  // 為替 → 株式への影響
  { id: 'usdjpy_to_nikkei', from: 'usdjpy', to: 'nikkei', intensity: 0, color: '#AB47BC' },
  { id: 'dxy_to_em', from: 'dxy', to: 'emerging', intensity: 0, color: '#CE93D8' },
];
