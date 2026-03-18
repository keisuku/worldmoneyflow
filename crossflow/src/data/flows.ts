import type { Flow } from '../types';

/**
 * 主要な資金フローパス定義
 * intensity は動的に計算されるが、初期値を設定
 */
export const defaultFlows: Flow[] = [
  // Risk-On: Safe → Risk
  { id: 'ust_to_spx', from: 'ust', to: 'spx', intensity: 0, color: '#3b82f6' },
  { id: 'ust_to_ndx', from: 'ust', to: 'ndx', intensity: 0, color: '#6366f1' },
  { id: 'ust_to_em', from: 'ust', to: 'em', intensity: 0, color: '#fb923c' },
  { id: 'gold_to_spx', from: 'gold', to: 'spx', intensity: 0, color: '#3b82f6' },

  // Risk-Off: Risk → Safe
  { id: 'spx_to_ust', from: 'spx', to: 'ust', intensity: 0, color: '#a855f7' },
  { id: 'spx_to_gold', from: 'spx', to: 'gold', intensity: 0, color: '#d4a017' },
  { id: 'ndx_to_ust', from: 'ndx', to: 'ust', intensity: 0, color: '#a855f7' },

  // USD strength: EM → US
  { id: 'em_to_spx', from: 'em', to: 'spx', intensity: 0, color: '#3b82f6' },
  { id: 'nky_to_spx', from: 'nky', to: 'spx', intensity: 0, color: '#06b6d4' },

  // USD weakness: US → EM/Commodity
  { id: 'spx_to_em', from: 'spx', to: 'em', intensity: 0, color: '#fb923c' },
  { id: 'usd_to_gold', from: 'usd', to: 'gold', intensity: 0, color: '#d4a017' },

  // Crypto
  { id: 'ndx_to_btc', from: 'ndx', to: 'btc', intensity: 0, color: '#f97316' },
  { id: 'btc_to_ndx', from: 'btc', to: 'ndx', intensity: 0, color: '#6366f1' },

  // Credit
  { id: 'ust_to_hy', from: 'ust', to: 'hy', intensity: 0, color: '#f472b6' },
  { id: 'hy_to_ust', from: 'hy', to: 'ust', intensity: 0, color: '#a855f7' },

  // Commodity
  { id: 'oil_to_copper', from: 'oil', to: 'copper', intensity: 0, color: '#b45309' },

  // Japan
  { id: 'nky_to_jgb', from: 'nky', to: 'jgb', intensity: 0, color: '#c084fc' },
  { id: 'jgb_to_ust', from: 'jgb', to: 'ust', intensity: 0, color: '#a855f7' },
  { id: 'jpy_to_nky', from: 'jpy', to: 'nky', intensity: 0, color: '#06b6d4' },

  // Cross-region
  { id: 'stoxx_to_spx', from: 'stoxx', to: 'spx', intensity: 0, color: '#3b82f6' },
  { id: 'csi_to_hsi', from: 'csi', to: 'hsi', intensity: 0, color: '#f87171' },
];
