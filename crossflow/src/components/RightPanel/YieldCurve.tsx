import type { YieldCurvePoint } from '../../types';

interface YieldCurveProps {
  data: YieldCurvePoint[];
}

/**
 * イールドカーブ表示
 */
export function YieldCurve({ data }: YieldCurveProps) {
  if (data.length === 0) {
    return (
      <div style={containerStyle}>
        <h3 style={titleStyle}>Yield Curve</h3>
        <p style={{ color: '#666', fontSize: '11px' }}>No data</p>
      </div>
    );
  }

  const maxYield = Math.max(...data.map((d) => d.yield), 0.1);
  const chartHeight = 60;

  return (
    <div style={containerStyle}>
      <h3 style={titleStyle}>Yield Curve</h3>
      <svg width="100%" height={chartHeight + 20} viewBox={`0 0 200 ${chartHeight + 20}`}>
        {/* Current curve */}
        <polyline
          points={data
            .map((d, i) => {
              const x = (i / (data.length - 1)) * 190 + 5;
              const y = chartHeight - (d.yield / maxYield) * chartHeight + 5;
              return `${x},${y}`;
            })
            .join(' ')}
          fill="none"
          stroke="#4CAF50"
          strokeWidth="1.5"
        />
        {/* Previous curve */}
        <polyline
          points={data
            .map((d, i) => {
              const x = (i / (data.length - 1)) * 190 + 5;
              const y = chartHeight - (d.previousYield / maxYield) * chartHeight + 5;
              return `${x},${y}`;
            })
            .join(' ')}
          fill="none"
          stroke="#666"
          strokeWidth="1"
          strokeDasharray="3,3"
        />
        {/* Labels */}
        {data.map((d, i) => {
          const x = (i / (data.length - 1)) * 190 + 5;
          return (
            <text
              key={d.maturity}
              x={x}
              y={chartHeight + 16}
              textAnchor="middle"
              fill="#666"
              fontSize="7"
            >
              {d.maturity}
            </text>
          );
        })}
      </svg>
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
