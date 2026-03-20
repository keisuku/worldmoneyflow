// Global Capital Pools — 2025-2026 data
// Sources: Visual Capitalist, Goldman Sachs, Savills, CoinMarketCap, SIFMA, Thinking Ahead Institute

export type Category =
  | 'equities'
  | 'bonds'
  | 'real-estate'
  | 'crypto'
  | 'gold'
  | 'private'
  | 'institutional';

export interface AssetChanges {
  h1: number;  // 1-hour change in $B
  h4: number;  // 4-hour
  d1: number;  // 1-day
  w1: number;  // 1-week
  m1: number;  // 1-month
  y1: number;  // 1-year
}

export interface GlobalAsset {
  id: string;
  name: string;
  nameShort: string;
  category: Category;
  totalValue: number;        // trillions USD
  investable: boolean;       // liquid/tradeable?
  volatility: number;        // 0–1, controls glow intensity
  changes: AssetChanges;     // $B change per period
  region?: string;
  emoji?: string;
}

export const CATEGORY_META: Record<Category, { label: string; color: string; labelJa: string }> = {
  equities:      { label: 'Equities',        color: '#3b82f6', labelJa: '株式' },
  bonds:         { label: 'Bonds',           color: '#10b981', labelJa: '債券' },
  'real-estate': { label: 'Real Estate',     color: '#f59e0b', labelJa: '不動産' },
  crypto:        { label: 'Crypto',          color: '#8b5cf6', labelJa: '暗号資産' },
  gold:          { label: 'Gold & Cmdty',    color: '#eab308', labelJa: '金・商品' },
  private:       { label: 'Private Markets', color: '#14b8a6', labelJa: 'プライベート' },
  institutional: { label: 'Institutional',   color: '#6366f1', labelJa: '機関投資家' },
};

// "The Great De-Risking" — March 2026 scenario
// Equities selling off, bonds/gold bid, crypto mixed
export const GLOBAL_ASSETS: GlobalAsset[] = [
  // ── Real Estate ($393T total, mostly illiquid) ──
  {
    id: 'residential',
    name: 'Residential Real Estate',
    nameShort: 'Residential',
    category: 'real-estate',
    totalValue: 286.9,
    investable: false,
    volatility: 0.05,
    emoji: '🏠',
    changes: { h1: 0, h4: 0, d1: -5, w1: -30, m1: -200, y1: -1500 },
  },
  {
    id: 'commercial-re',
    name: 'Commercial Real Estate',
    nameShort: 'Commercial RE',
    category: 'real-estate',
    totalValue: 58.5,
    investable: false,
    volatility: 0.08,
    emoji: '🏢',
    changes: { h1: 0, h4: 0, d1: -3, w1: -18, m1: -90, y1: -420 },
  },
  {
    id: 'agricultural',
    name: 'Agricultural Land',
    nameShort: 'Agri Land',
    category: 'real-estate',
    totalValue: 47.9,
    investable: false,
    volatility: 0.03,
    emoji: '🌾',
    changes: { h1: 0, h4: 0, d1: 0, w1: -5, m1: -20, y1: +150 },
  },

  // ── Equities ($128T) ──
  {
    id: 'us-eq-mag7',
    name: 'Magnificent 7',
    nameShort: 'Mag 7',
    category: 'equities',
    totalValue: 20.0,
    investable: true,
    volatility: 0.85,
    region: 'US',
    emoji: '🇺🇸',
    changes: { h1: -18, h4: -52, d1: -135, w1: -480, m1: -1400, y1: +3200 },
  },
  {
    id: 'us-eq-rest',
    name: 'US Equities (ex-Mag7)',
    nameShort: 'US Eq',
    category: 'equities',
    totalValue: 61.8,
    investable: true,
    volatility: 0.55,
    region: 'US',
    emoji: '🇺🇸',
    changes: { h1: -9, h4: -28, d1: -85, w1: -280, m1: -650, y1: +2800 },
  },
  {
    id: 'asia-eq',
    name: 'Asia Equities (ex-Japan)',
    nameShort: 'Asia Eq',
    category: 'equities',
    totalValue: 15.3,
    investable: true,
    volatility: 0.60,
    region: 'Asia',
    emoji: '🌏',
    changes: { h1: -4, h4: -14, d1: -42, w1: -160, m1: -380, y1: +950 },
  },
  {
    id: 'europe-eq',
    name: 'Europe Equities (ex-UK)',
    nameShort: 'EU Eq',
    category: 'equities',
    totalValue: 14.1,
    investable: true,
    volatility: 0.45,
    region: 'Europe',
    emoji: '🇪🇺',
    changes: { h1: -3, h4: -10, d1: -32, w1: -110, m1: -250, y1: +680 },
  },
  {
    id: 'japan-eq',
    name: 'Japan Equities',
    nameShort: 'JP Eq',
    category: 'equities',
    totalValue: 6.4,
    investable: true,
    volatility: 0.50,
    region: 'Japan',
    emoji: '🇯🇵',
    changes: { h1: -2, h4: -5, d1: -18, w1: -55, m1: -120, y1: +420 },
  },
  {
    id: 'uk-eq',
    name: 'UK Equities',
    nameShort: 'UK Eq',
    category: 'equities',
    totalValue: 3.8,
    investable: true,
    volatility: 0.40,
    region: 'UK',
    emoji: '🇬🇧',
    changes: { h1: -1, h4: -3, d1: -10, w1: -35, m1: -70, y1: +180 },
  },
  {
    id: 'other-eq',
    name: 'Other Equities (EM + Frontier)',
    nameShort: 'Other Eq',
    category: 'equities',
    totalValue: 6.4,
    investable: true,
    volatility: 0.65,
    region: 'EM',
    emoji: '🌍',
    changes: { h1: -3, h4: -9, d1: -28, w1: -95, m1: -210, y1: +350 },
  },

  // ── Bonds ($97T) ──
  {
    id: 'us-treasuries',
    name: 'US Treasuries',
    nameShort: 'UST',
    category: 'bonds',
    totalValue: 30.6,
    investable: true,
    volatility: 0.30,
    region: 'US',
    emoji: '🇺🇸',
    changes: { h1: +6, h4: +18, d1: +48, w1: +160, m1: +650, y1: +1200 },
  },
  {
    id: 'us-bonds-other',
    name: 'US Corporate & Muni Bonds',
    nameShort: 'US Corp',
    category: 'bonds',
    totalValue: 10.9,
    investable: true,
    volatility: 0.25,
    region: 'US',
    emoji: '🏦',
    changes: { h1: +2, h4: +5, d1: +15, w1: +45, m1: +180, y1: +420 },
  },
  {
    id: 'europe-bonds',
    name: 'Europe Bonds',
    nameShort: 'EU Bonds',
    category: 'bonds',
    totalValue: 28.0,
    investable: true,
    volatility: 0.22,
    region: 'Europe',
    emoji: '🇪🇺',
    changes: { h1: +4, h4: +12, d1: +35, w1: +110, m1: +450, y1: +850 },
  },
  {
    id: 'asia-bonds',
    name: 'Asia Bonds (ex-Japan)',
    nameShort: 'Asia Bonds',
    category: 'bonds',
    totalValue: 20.3,
    investable: true,
    volatility: 0.20,
    region: 'Asia',
    emoji: '🌏',
    changes: { h1: +3, h4: +8, d1: +22, w1: +70, m1: +280, y1: +550 },
  },
  {
    id: 'other-bonds',
    name: 'Other Bonds (EM + Frontier)',
    nameShort: 'EM Bonds',
    category: 'bonds',
    totalValue: 6.8,
    investable: true,
    volatility: 0.35,
    region: 'EM',
    emoji: '🌍',
    changes: { h1: +1, h4: +3, d1: +8, w1: +25, m1: +90, y1: +200 },
  },

  // ── Gold & Commodities ──
  {
    id: 'gold',
    name: 'Gold (Investment)',
    nameShort: 'Gold',
    category: 'gold',
    totalValue: 15.7,
    investable: true,
    volatility: 0.40,
    emoji: '🥇',
    changes: { h1: +3, h4: +10, d1: +28, w1: +85, m1: +280, y1: +2100 },
  },
  {
    id: 'commodities',
    name: 'Commodities (ex-Gold)',
    nameShort: 'Cmdty',
    category: 'gold',
    totalValue: 4.2,
    investable: true,
    volatility: 0.55,
    emoji: '🛢️',
    changes: { h1: -1, h4: -3, d1: -8, w1: -22, m1: -60, y1: +120 },
  },

  // ── Private Markets ($13.1T) ──
  {
    id: 'private-equity',
    name: 'Private Equity & VC',
    nameShort: 'PE/VC',
    category: 'private',
    totalValue: 8.2,
    investable: false,
    volatility: 0.15,
    emoji: '🔒',
    changes: { h1: 0, h4: 0, d1: -2, w1: -12, m1: -45, y1: +380 },
  },
  {
    id: 'private-debt',
    name: 'Private Debt & Infrastructure',
    nameShort: 'Pvt Debt',
    category: 'private',
    totalValue: 4.9,
    investable: false,
    volatility: 0.10,
    emoji: '🏗️',
    changes: { h1: 0, h4: 0, d1: -1, w1: -5, m1: -15, y1: +220 },
  },
  {
    id: 'reits',
    name: 'REITs (Listed)',
    nameShort: 'REITs',
    category: 'real-estate',
    totalValue: 5.2,
    investable: true,
    volatility: 0.45,
    emoji: '🏬',
    changes: { h1: -1, h4: -2, d1: -8, w1: -25, m1: -65, y1: -180 },
  },

  // ── Crypto ($2.6T) ──
  {
    id: 'btc',
    name: 'Bitcoin',
    nameShort: 'BTC',
    category: 'crypto',
    totalValue: 1.4,
    investable: true,
    volatility: 0.95,
    emoji: '₿',
    changes: { h1: +2.5, h4: -4, d1: +12, w1: -35, m1: +85, y1: +480 },
  },
  {
    id: 'eth',
    name: 'Ethereum',
    nameShort: 'ETH',
    category: 'crypto',
    totalValue: 0.26,
    investable: true,
    volatility: 0.90,
    emoji: 'Ξ',
    changes: { h1: -0.3, h4: -1.2, d1: -3, w1: -12, m1: -20, y1: +35 },
  },
  {
    id: 'other-crypto',
    name: 'Other Crypto (SOL, etc.)',
    nameShort: 'Alts',
    category: 'crypto',
    totalValue: 0.94,
    investable: true,
    volatility: 0.92,
    emoji: '🪙',
    changes: { h1: -0.8, h4: -3, d1: -8, w1: -28, m1: -55, y1: +120 },
  },

  // ── Institutional Hubs (AUM — these OVERLAP with asset pools above) ──
  {
    id: 'pension-funds',
    name: 'Global Pension Funds',
    nameShort: 'Pensions',
    category: 'institutional',
    totalValue: 58.5,
    investable: false,
    volatility: 0.08,
    emoji: '🏛️',
    changes: { h1: -5, h4: -15, d1: -40, w1: -120, m1: -250, y1: +2200 },
  },
  {
    id: 'blackrock',
    name: 'BlackRock AUM',
    nameShort: 'BLK',
    category: 'institutional',
    totalValue: 11.5,
    investable: false,
    volatility: 0.12,
    emoji: '⬛',
    changes: { h1: -2, h4: -6, d1: -18, w1: -55, m1: -120, y1: +850 },
  },
  {
    id: 'vanguard',
    name: 'Vanguard AUM',
    nameShort: 'VGD',
    category: 'institutional',
    totalValue: 10.1,
    investable: false,
    volatility: 0.10,
    emoji: '🔺',
    changes: { h1: -1.5, h4: -5, d1: -14, w1: -42, m1: -95, y1: +720 },
  },
  {
    id: 'swfs',
    name: 'Sovereign Wealth Funds',
    nameShort: 'SWFs',
    category: 'institutional',
    totalValue: 12.0,
    investable: false,
    volatility: 0.06,
    emoji: '👑',
    changes: { h1: 0, h4: -1, d1: -5, w1: -15, m1: +30, y1: +600 },
  },
  {
    id: 'fidelity',
    name: 'Fidelity AUM',
    nameShort: 'FID',
    category: 'institutional',
    totalValue: 5.5,
    investable: false,
    volatility: 0.10,
    emoji: '🟢',
    changes: { h1: -0.8, h4: -2.5, d1: -7, w1: -22, m1: -50, y1: +380 },
  },
  {
    id: 'hedge-funds',
    name: 'Hedge Fund Industry',
    nameShort: 'HFs',
    category: 'institutional',
    totalValue: 4.5,
    investable: false,
    volatility: 0.70,
    emoji: '🦔',
    changes: { h1: -1.5, h4: -5, d1: -15, w1: -45, m1: -80, y1: +250 },
  },
];

// Non-overlapping investable pools only (for bubble map)
export const ASSET_POOLS = GLOBAL_ASSETS.filter(a => a.category !== 'institutional');

// Total investable assets (~$261T ex real-estate, ~$654T including all)
export const TOTAL_INVESTABLE = ASSET_POOLS
  .filter(a => a.investable)
  .reduce((s, a) => s + a.totalValue, 0);

export const TOTAL_ALL = ASSET_POOLS.reduce((s, a) => s + a.totalValue, 0);
