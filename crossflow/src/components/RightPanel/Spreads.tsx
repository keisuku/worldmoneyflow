import type { SpreadData } from '../../types';

interface SpreadsProps {
  data: SpreadData[];
}

/**
 * スプレッド表示パネル
 */
export function Spreads({ data }: SpreadsProps) {
  return (
    <div style={containerStyle}>
      <h3 style={titleStyle}>Spreads</h3>
      {data.map((s) => (
        <div
          key={s.name}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '3px 0',
            fontSize: '11px',
            borderBottom: '1px solid rgba(255,255,255,0.03)',
          }}
        >
          <span style={{ color: '#888' }}>{s.name}</span>
          <div>
            <span style={{ color: '#fff', marginRight: '8px' }}>
              {s.value.toFixed(0)}bp
            </span>
            <span style={{ color: s.change >= 0 ? '#4CAF50' : '#F44336', fontSize: '10px' }}>
              {s.change >= 0 ? '+' : ''}{s.change.toFixed(0)}
            </span>
          </div>
        </div>
      ))}
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
