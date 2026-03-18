import type { MarketDataPoint, MarketRegime } from '../types';

interface TopBarProps {
  regime: MarketRegime;
  vixValue: number | null;
  dxyValue: number | null;
  marketData: Map<string, MarketDataPoint>;
}

/**
 * 上部バー: ロゴ / Regime表示 / VIX / DXY
 */
export function TopBar({ regime, vixValue, dxyValue }: TopBarProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 16px',
        background: 'rgba(10, 14, 39, 0.95)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        color: '#fff',
        fontFamily: 'monospace',
      }}
    >
      {/* ロゴ */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '18px', fontWeight: 'bold', letterSpacing: '2px' }}>
          CROSS<span style={{ color: '#4CAF50' }}>FLOW</span>
        </span>
        <span style={{ fontSize: '11px', color: '#888' }}>
          Cross-Asset Money Flow
        </span>
      </div>

      {/* Regime + Indicators */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        {/* Market Regime */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: regime.color,
              boxShadow: `0 0 6px ${regime.color}`,
            }}
          />
          <span style={{ fontSize: '12px', color: regime.color }}>
            {regime.label}
          </span>
        </div>

        {/* VIX */}
        <div style={{ fontSize: '12px' }}>
          <span style={{ color: '#888' }}>VIX </span>
          <span
            style={{
              color: vixValue && vixValue > 25 ? '#F44336' : '#4CAF50',
              fontWeight: 'bold',
            }}
          >
            {vixValue?.toFixed(1) ?? '--'}
          </span>
        </div>

        {/* DXY */}
        <div style={{ fontSize: '12px' }}>
          <span style={{ color: '#888' }}>DXY </span>
          <span style={{ fontWeight: 'bold' }}>
            {dxyValue?.toFixed(2) ?? '--'}
          </span>
        </div>
      </div>
    </div>
  );
}
