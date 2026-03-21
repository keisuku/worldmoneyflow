// ─── CrossFlow Design Tokens ───
// 全コンポーネントはこのファイルから色を取得すること

export const T = {
  // Brand
  brand: '#00d4aa',

  // Semantic
  positive: '#00d4aa',
  negative: '#ef4444',
  caution: '#f59e0b',

  // Surfaces
  surface: '#0a0e1a',
  surfaceAlt: '#0f1425',
  card: 'rgba(255,255,255,0.025)',
  cardHover: 'rgba(255,255,255,0.06)',
  border: 'rgba(255,255,255,0.06)',
  borderHi: 'rgba(255,255,255,0.10)',

  // Text
  text: '#e8eaed',
  textSec: '#94a3b8',
  textMuted: '#64748b',
  textDim: '#475569',

  // Category colors (single source of truth)
  cat: {
    equities: '#3b82f6',
    bonds: '#00d4aa',
    'real-estate': '#f59e0b',
    crypto: '#8b5cf6',
    gold: '#eab308',
    private: '#14b8a6',
    institutional: '#6366f1',
  } as Record<string, string>,

  // Regime
  regime: {
    'RISK-ON': '#00d4aa',
    CAUTIOUS: '#f59e0b',
    'RISK-OFF': '#ef4444',
  } as Record<string, string>,
} as const;

export const REGIME_JA: Record<string, string> = {
  'RISK-ON': 'リスクオン',
  CAUTIOUS: '慎重',
  'RISK-OFF': 'リスクオフ',
};

export const DATA_TIMESTAMP = '2026年3月21日 09:00 JST';
