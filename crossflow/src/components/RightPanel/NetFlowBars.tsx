import type { NetFlowData } from '../../types';

interface NetFlowBarsProps {
  flows: NetFlowData[];
}

/**
 * ネットフローバーチャート: アセットクラス別の資金流入/流出
 */
export function NetFlowBars({ flows }: NetFlowBarsProps) {
  const maxAbs = Math.max(...flows.map((f) => Math.abs(f.net)), 1);

  return (
    <div style={containerStyle}>
      <h3 style={titleStyle}>Net Flows</h3>
      {flows.map((f) => {
        const width = (Math.abs(f.net) / maxAbs) * 100;
        const isPositive = f.net >= 0;
        return (
          <div key={f.assetClass} style={{ marginBottom: '6px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '10px',
                color: '#888',
                marginBottom: '2px',
              }}
            >
              <span>{f.label}</span>
              <span style={{ color: isPositive ? '#4CAF50' : '#F44336' }}>
                {isPositive ? '+' : ''}{f.net.toFixed(1)}B
              </span>
            </div>
            <div
              style={{
                height: '4px',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '2px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${width}%`,
                  background: isPositive ? '#4CAF50' : '#F44336',
                  borderRadius: '2px',
                  float: isPositive ? 'left' : 'right',
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  padding: '12px',
  borderBottom: '1px solid rgba(255,255,255,0.05)',
};

const titleStyle: React.CSSProperties = {
  margin: '0 0 8px 0',
  fontSize: '12px',
  color: '#fff',
  fontFamily: 'monospace',
  letterSpacing: '1px',
};
