import type { AIReport } from '../../types';

interface AIAnalysisProps {
  report: AIReport | null;
}

/**
 * AI分析パネル: Claude APIによる日次レポート
 */
export function AIAnalysis({ report }: AIAnalysisProps) {
  if (!report) {
    return (
      <div style={containerStyle}>
        <h3 style={titleStyle}>AI Analysis</h3>
        <p style={{ color: '#666', fontSize: '11px' }}>Loading analysis...</p>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <h3 style={titleStyle}>AI Analysis</h3>
      <p style={{ color: '#ccc', fontSize: '11px', lineHeight: '1.5' }}>
        {report.summary}
      </p>

      {report.keyFlows.length > 0 && (
        <div style={{ marginTop: '8px' }}>
          <span style={{ color: '#4CAF50', fontSize: '10px' }}>KEY FLOWS</span>
          {report.keyFlows.map((f, i) => (
            <div key={i} style={{ color: '#aaa', fontSize: '10px', paddingLeft: '8px' }}>
              • {f}
            </div>
          ))}
        </div>
      )}

      {report.risks.length > 0 && (
        <div style={{ marginTop: '8px' }}>
          <span style={{ color: '#F44336', fontSize: '10px' }}>RISKS</span>
          {report.risks.map((r, i) => (
            <div key={i} style={{ color: '#aaa', fontSize: '10px', paddingLeft: '8px' }}>
              • {r}
            </div>
          ))}
        </div>
      )}
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
