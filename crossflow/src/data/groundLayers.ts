import type { GroundLayer } from '../types';

/**
 * 地面（投資家）3レイヤー定義
 * Layer 0 (最上部, 地面境界): HF/CTA — 最も機動的
 * Layer 1 (中間): 機関投資家（年金/保険/SWF）
 * Layer 2 (最下部): 個人投資家
 *
 * 各レイヤーは独立して膨縮。リスクオフ時は赤系、リスクオン時は緑系。
 */
export const groundLayers: GroundLayer[] = [
  {
    type: 'hf_cta',
    label: 'HF / CTA',
    labelJa: 'ヘッジファンド/CTA',
    layerIndex: 0,
    color: '#9333ea',
    riskOffColor: '#dc2626',
    riskOnColor: '#22c55e',
    expansion: 0.5,
  },
  {
    type: 'institutional',
    label: 'Institutional',
    labelJa: '機関投資家(年金/保険/SWF)',
    layerIndex: 1,
    color: '#3b82f6',
    riskOffColor: '#b91c1c',
    riskOnColor: '#16a34a',
    expansion: 0.5,
  },
  {
    type: 'retail',
    label: 'Retail',
    labelJa: '個人投資家',
    layerIndex: 2,
    color: '#eab308',
    riskOffColor: '#991b1b',
    riskOnColor: '#15803d',
    expansion: 0.5,
  },
];
