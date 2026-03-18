interface DataQualityProps {
  totalNodes: number;
  activeNodes: number;
  lastUpdate: number | null;
}

/**
 * データ品質インジケータ
 */
export function DataQuality({ totalNodes, activeNodes, lastUpdate }: DataQualityProps) {
  const coverage = totalNodes > 0 ? (activeNodes / totalNodes) * 100 : 0;
  const timeSinceUpdate = lastUpdate
    ? Math.round((Date.now() - lastUpdate) / 1000)
    : null;

  return (
    <div style={containerStyle}>
      <h3 style={titleStyle}>Data Quality</h3>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
        <span style={{ color: '#888' }}>Coverage</span>
        <span style={{ color: coverage > 80 ? '#4CAF50' : '#FF9800' }}>
          {coverage.toFixed(0)}% ({activeNodes}/{totalNodes})
        </span>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '10px',
          marginTop: '4px',
        }}
      >
        <span style={{ color: '#888' }}>Last Update</span>
        <span style={{ color: '#aaa' }}>
          {timeSinceUpdate !== null ? `${timeSinceUpdate}s ago` : '--'}
        </span>
      </div>
      <div
        style={{
          marginTop: '6px',
          height: '3px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '2px',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${coverage}%`,
            background: coverage > 80 ? '#4CAF50' : '#FF9800',
            borderRadius: '2px',
          }}
        />
      </div>
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  padding: '12px',
};

const titleStyle: React.CSSProperties = {
  margin: '0 0 8px 0',
  fontSize: '12px',
  color: '#fff',
  fontFamily: 'monospace',
  letterSpacing: '1px',
};
