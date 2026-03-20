/**
 * Sankey diagram node and link definitions
 * Represents global money flow between asset classes
 */

export interface SankeyNode {
  id: string;
  label: string;
  category: 'central-bank' | 'cash' | 'govt-bond' | 'corp-bond' | 'equity' | 'commodity' | 'crypto' | 'real-estate';
  color: string;
  column: number; // 0-4 for positioning
}

export interface SankeyLink {
  source: string;
  target: string;
  value: number; // flow magnitude in $B
  color: string;
  direction: 'inflow' | 'outflow';
}

export const sankeyNodes: SankeyNode[] = [
  // Column 0: Central Banks
  { id: 'fed', label: 'Fed', category: 'central-bank', color: '#4facfe', column: 0 },
  { id: 'ecb', label: 'ECB', category: 'central-bank', color: '#ffd700', column: 0 },
  { id: 'boj', label: 'BOJ', category: 'central-bank', color: '#ff4757', column: 0 },
  { id: 'pboc', label: 'PBOC', category: 'central-bank', color: '#ff6b81', column: 0 },

  // Column 1: Cash & Money Markets
  { id: 'cash', label: 'Cash / MM', category: 'cash', color: '#8b8f98', column: 1 },

  // Column 2: Bonds
  { id: 'us-treasury', label: 'US Treasury', category: 'govt-bond', color: '#4facfe', column: 2 },
  { id: 'bunds', label: 'Bunds', category: 'govt-bond', color: '#ffd700', column: 2 },
  { id: 'jgb', label: 'JGB', category: 'govt-bond', color: '#ff4757', column: 2 },
  { id: 'ig-credit', label: 'IG Credit', category: 'corp-bond', color: '#7c8cf8', column: 2 },
  { id: 'hy-credit', label: 'HY Credit', category: 'corp-bond', color: '#c084fc', column: 2 },

  // Column 3: Equities
  { id: 'us-equity', label: 'US Equity', category: 'equity', color: '#4facfe', column: 3 },
  { id: 'eu-equity', label: 'Europe', category: 'equity', color: '#ffd700', column: 3 },
  { id: 'jp-equity', label: 'Japan', category: 'equity', color: '#ff4757', column: 3 },
  { id: 'em-equity', label: 'EM', category: 'equity', color: '#00d4aa', column: 3 },

  // Column 4: Alternatives
  { id: 'gold', label: 'Gold', category: 'commodity', color: '#ffd700', column: 4 },
  { id: 'oil', label: 'Oil', category: 'commodity', color: '#8b6914', column: 4 },
  { id: 'copper', label: 'Copper', category: 'commodity', color: '#b87333', column: 4 },
  { id: 'bitcoin', label: 'Bitcoin', category: 'crypto', color: '#f7931a', column: 4 },
  { id: 'ethereum', label: 'Ethereum', category: 'crypto', color: '#627eea', column: 4 },
  { id: 'reits', label: 'REITs', category: 'real-estate', color: '#00d4aa', column: 4 },
];

// March 2026 "Great De-Risking" flows
export const sankeyLinks: SankeyLink[] = [
  // Central Bank → Cash/Bonds (QT continues but slowing)
  { source: 'fed', target: 'us-treasury', value: 28, color: '#4facfe', direction: 'inflow' },
  { source: 'fed', target: 'cash', value: 15, color: '#4facfe', direction: 'inflow' },
  { source: 'ecb', target: 'bunds', value: 18, color: '#ffd700', direction: 'inflow' },
  { source: 'boj', target: 'jgb', value: 22, color: '#ff4757', direction: 'inflow' },
  { source: 'pboc', target: 'cash', value: 12, color: '#ff6b81', direction: 'inflow' },

  // Cash → Bonds (strong bond inflows, $91B monthly)
  { source: 'cash', target: 'us-treasury', value: 32, color: '#00d4aa', direction: 'inflow' },
  { source: 'cash', target: 'ig-credit', value: 28, color: '#00d4aa', direction: 'inflow' },
  { source: 'cash', target: 'hy-credit', value: 8, color: '#00d4aa', direction: 'inflow' },
  { source: 'cash', target: 'bunds', value: 14, color: '#00d4aa', direction: 'inflow' },

  // US Equity outflows (-$34B monthly)
  { source: 'us-equity', target: 'cash', value: 34, color: '#ff4757', direction: 'outflow' },

  // Rotation: US → International equities (+$31B)
  { source: 'cash', target: 'eu-equity', value: 16, color: '#00d4aa', direction: 'inflow' },
  { source: 'cash', target: 'em-equity', value: 10, color: '#00d4aa', direction: 'inflow' },
  { source: 'cash', target: 'jp-equity', value: 5, color: '#00d4aa', direction: 'inflow' },

  // Gold: most crowded trade, strong inflows
  { source: 'cash', target: 'gold', value: 18, color: '#ffd700', direction: 'inflow' },
  { source: 'us-equity', target: 'gold', value: 12, color: '#ffd700', direction: 'inflow' },

  // Bonds → Equities (some rebalancing)
  { source: 'us-treasury', target: 'eu-equity', value: 8, color: '#4facfe', direction: 'inflow' },
  { source: 'ig-credit', target: 'us-equity', value: 6, color: '#7c8cf8', direction: 'inflow' },

  // Commodity flows
  { source: 'cash', target: 'oil', value: 4, color: '#8b6914', direction: 'inflow' },
  { source: 'cash', target: 'copper', value: 6, color: '#b87333', direction: 'inflow' },

  // Crypto: mixed
  { source: 'cash', target: 'bitcoin', value: 5, color: '#f7931a', direction: 'inflow' },
  { source: 'bitcoin', target: 'cash', value: 3, color: '#ff4757', direction: 'outflow' },
  { source: 'cash', target: 'ethereum', value: 3, color: '#627eea', direction: 'inflow' },

  // Real Estate: slight outflows
  { source: 'reits', target: 'cash', value: 4, color: '#ff4757', direction: 'outflow' },
  { source: 'cash', target: 'reits', value: 2, color: '#00d4aa', direction: 'inflow' },
];

// Simplified nodes for mobile
export const sankeyNodesMobile: SankeyNode[] = [
  { id: 'fed', label: 'Fed', category: 'central-bank', color: '#4facfe', column: 0 },
  { id: 'cash', label: 'Cash', category: 'cash', color: '#8b8f98', column: 1 },
  { id: 'us-treasury', label: 'Treasuries', category: 'govt-bond', color: '#4facfe', column: 2 },
  { id: 'ig-credit', label: 'IG Credit', category: 'corp-bond', color: '#7c8cf8', column: 2 },
  { id: 'us-equity', label: 'US Equity', category: 'equity', color: '#4facfe', column: 3 },
  { id: 'eu-equity', label: 'Europe', category: 'equity', color: '#ffd700', column: 3 },
  { id: 'em-equity', label: 'EM', category: 'equity', color: '#00d4aa', column: 3 },
  { id: 'gold', label: 'Gold', category: 'commodity', color: '#ffd700', column: 4 },
  { id: 'bitcoin', label: 'BTC', category: 'crypto', color: '#f7931a', column: 4 },
];

export const sankeyLinksMobile: SankeyLink[] = [
  { source: 'fed', target: 'us-treasury', value: 28, color: '#4facfe', direction: 'inflow' },
  { source: 'fed', target: 'cash', value: 15, color: '#4facfe', direction: 'inflow' },
  { source: 'cash', target: 'us-treasury', value: 32, color: '#00d4aa', direction: 'inflow' },
  { source: 'cash', target: 'ig-credit', value: 28, color: '#00d4aa', direction: 'inflow' },
  { source: 'us-equity', target: 'cash', value: 34, color: '#ff4757', direction: 'outflow' },
  { source: 'cash', target: 'eu-equity', value: 16, color: '#00d4aa', direction: 'inflow' },
  { source: 'cash', target: 'em-equity', value: 10, color: '#00d4aa', direction: 'inflow' },
  { source: 'cash', target: 'gold', value: 18, color: '#ffd700', direction: 'inflow' },
  { source: 'cash', target: 'bitcoin', value: 5, color: '#f7931a', direction: 'inflow' },
];
