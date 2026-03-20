import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { etfFlows } from '../data/mockFlowData.ts';
import type { MockETF } from '../data/mockFlowData.ts';

type SortKey = 'ticker' | 'price' | 'change1d' | 'weeklyFlow';

export default function ETFFlowTable() {
  const [sortKey, setSortKey] = useState<SortKey>('weeklyFlow');
  const [sortAsc, setSortAsc] = useState(false);

  const handleSort = useCallback((key: SortKey) => {
    if (sortKey === key) {
      setSortAsc((a) => !a);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  }, [sortKey]);

  const sorted = [...etfFlows].sort((a, b) => {
    const mul = sortAsc ? 1 : -1;
    if (sortKey === 'ticker') return mul * a.ticker.localeCompare(b.ticker);
    return mul * ((a[sortKey] as number) - (b[sortKey] as number));
  });

  const maxFlow = Math.max(...etfFlows.map((e) => Math.abs(e.weeklyFlow)));

  return (
    <motion.div
      className="glass-card"
      style={styles.container}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <h3 style={styles.title}>ETF Flows</h3>

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <Th label="Ticker" sortKey="ticker" current={sortKey} asc={sortAsc} onClick={handleSort} />
              <Th label="Price" sortKey="price" current={sortKey} asc={sortAsc} onClick={handleSort} align="right" />
              <Th label="1D %" sortKey="change1d" current={sortKey} asc={sortAsc} onClick={handleSort} align="right" />
              <Th label="Wk Flow" sortKey="weeklyFlow" current={sortKey} asc={sortAsc} onClick={handleSort} align="right" />
              <th style={{ ...styles.th, textAlign: 'center', width: 100 }}>Flow</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((etf) => (
              <Row key={etf.ticker} etf={etf} maxFlow={maxFlow} />
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

function Th({
  label,
  sortKey,
  current,
  asc,
  onClick,
  align = 'left',
}: {
  label: string;
  sortKey: SortKey;
  current: SortKey;
  asc: boolean;
  onClick: (k: SortKey) => void;
  align?: string;
}) {
  const active = current === sortKey;
  return (
    <th
      style={{ ...styles.th, textAlign: align as 'left' | 'right', cursor: 'pointer' }}
      onClick={() => onClick(sortKey)}
    >
      {label}
      {active && (
        <span style={{ marginLeft: 3, fontSize: 8 }}>
          {asc ? '\u25B2' : '\u25BC'}
        </span>
      )}
    </th>
  );
}

function Row({ etf, maxFlow }: { etf: MockETF; maxFlow: number }) {
  const changeColor = etf.change1d >= 0 ? '#00d4aa' : '#ff4757';
  const flowColor = etf.weeklyFlow >= 0 ? '#00d4aa' : '#ff4757';
  const barWidth = Math.abs(etf.weeklyFlow) / maxFlow;

  return (
    <motion.tr
      style={styles.row}
      whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
    >
      <td style={styles.td}>
        <span style={styles.ticker}>{etf.ticker}</span>
        <span style={styles.name}>{etf.name}</span>
      </td>
      <td style={{ ...styles.td, textAlign: 'right' }}>
        <span className="mono" style={styles.price}>
          {etf.price >= 1000 ? etf.price.toFixed(0) : etf.price.toFixed(2)}
        </span>
      </td>
      <td style={{ ...styles.td, textAlign: 'right' }}>
        <span className="mono" style={{ ...styles.change, color: changeColor }}>
          {etf.change1d > 0 ? '+' : ''}{etf.change1d.toFixed(2)}%
        </span>
      </td>
      <td style={{ ...styles.td, textAlign: 'right' }}>
        <span className="mono" style={{ ...styles.flow, color: flowColor }}>
          {etf.weeklyFlow > 0 ? '+' : ''}{etf.weeklyFlow.toFixed(1)}B
        </span>
      </td>
      <td style={{ ...styles.td, textAlign: 'center' }}>
        <div style={styles.barContainer}>
          {/* Center line */}
          <div style={styles.barCenter} />
          {/* Flow bar */}
          <div
            style={{
              position: 'absolute',
              top: 2,
              height: 8,
              borderRadius: 2,
              background: flowColor,
              opacity: 0.6,
              ...(etf.weeklyFlow >= 0
                ? { left: '50%', width: `${barWidth * 50}%` }
                : { right: '50%', width: `${barWidth * 50}%` }),
            }}
          />
        </div>
      </td>
    </motion.tr>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '14px 0',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    fontSize: 13,
    fontWeight: 600,
    color: '#e8eaed',
    padding: '0 18px 10px',
  },
  tableWrap: {
    overflowX: 'auto',
    overflowY: 'auto',
    flex: 1,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 12,
  },
  th: {
    padding: '6px 12px',
    fontSize: 10,
    fontWeight: 600,
    color: '#8b8f98',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    whiteSpace: 'nowrap' as const,
    userSelect: 'none' as const,
  },
  row: {
    borderBottom: '1px solid rgba(255,255,255,0.03)',
    transition: 'background 0.15s',
  },
  td: {
    padding: '7px 12px',
    whiteSpace: 'nowrap' as const,
    verticalAlign: 'middle' as const,
  },
  ticker: {
    fontWeight: 600,
    color: '#e8eaed',
    marginRight: 6,
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
  },
  name: {
    color: '#8b8f98',
    fontSize: 10,
  },
  price: {
    fontSize: 12,
    color: '#e8eaed',
  },
  change: {
    fontSize: 11,
    fontWeight: 500,
  },
  flow: {
    fontSize: 11,
    fontWeight: 600,
  },
  barContainer: {
    position: 'relative' as const,
    width: 80,
    height: 12,
    margin: '0 auto',
  },
  barCenter: {
    position: 'absolute' as const,
    left: '50%',
    top: 0,
    width: 1,
    height: '100%',
    background: 'rgba(255,255,255,0.1)',
  },
};
