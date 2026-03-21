import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { yieldCurveData } from '../data/marketData.ts';

export default function YieldCurve() {
  const spread2s10s = (() => {
    const y2 = yieldCurveData.find((d) => d.maturity === '2Y');
    const y10 = yieldCurveData.find((d) => d.maturity === '10Y');
    if (y2 && y10) return y10.current - y2.current;
    return 0;
  })();

  const isInverted = spread2s10s < 0;

  return (
    <motion.div
      className="glass-card"
      style={styles.container}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <div style={styles.header}>
        <h3 style={styles.title}>US Treasury Yield Curve</h3>
        <div style={styles.spread}>
          <span style={styles.spreadLabel}>2s10s:</span>
          <span
            className="mono"
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: isInverted ? '#ff4757' : '#00d4aa',
            }}
          >
            {spread2s10s > 0 ? '+' : ''}
            {(spread2s10s * 100).toFixed(0)}bp
          </span>
          {isInverted && (
            <span style={styles.inversionBadge}>INVERTED</span>
          )}
        </div>
      </div>

      <div style={styles.chartWrap}>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={yieldCurveData} margin={{ top: 8, right: 16, bottom: 4, left: -10 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.04)"
              vertical={false}
            />
            <XAxis
              dataKey="maturity"
              tick={{ fill: '#8b8f98', fontSize: 10 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#8b8f98', fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}
              axisLine={false}
              tickLine={false}
              domain={['auto', 'auto']}
              tickFormatter={(v: number) => `${v.toFixed(1)}%`}
            />
            <Tooltip
              contentStyle={{
                background: 'rgba(15, 20, 40, 0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                fontSize: 11,
                fontFamily: "'JetBrains Mono', monospace",
              }}
              labelStyle={{ color: '#8b8f98' }}
              formatter={(value) => [
                `${Number(value).toFixed(2)}%`,
                '',
              ]}
            />
            <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" />
            <Line
              type="monotone"
              dataKey="previous"
              stroke="#8b8f98"
              strokeWidth={1.5}
              strokeDasharray="6 3"
              dot={false}
              name="previous"
            />
            <Line
              type="monotone"
              dataKey="current"
              stroke="#4facfe"
              strokeWidth={2}
              dot={{ r: 3, fill: '#4facfe', stroke: '#0a0e1a', strokeWidth: 2 }}
              activeDot={{ r: 5, fill: '#4facfe' }}
              name="current"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={styles.legendRow}>
        <div style={styles.legendItem}>
          <div style={{ width: 16, height: 2, background: '#4facfe', borderRadius: 1 }} />
          <span style={styles.legendText}>Current</span>
        </div>
        <div style={styles.legendItem}>
          <div style={{ width: 16, height: 2, background: '#8b8f98', borderRadius: 1, borderTop: '1px dashed #8b8f98' }} />
          <span style={styles.legendText}>Previous</span>
        </div>
      </div>
    </motion.div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '14px 18px',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    flexWrap: 'wrap' as const,
    gap: 6,
  },
  title: {
    fontSize: 13,
    fontWeight: 600,
    color: '#e8eaed',
  },
  spread: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  spreadLabel: {
    fontSize: 11,
    color: '#8b8f98',
  },
  inversionBadge: {
    fontSize: 9,
    fontWeight: 700,
    color: '#ff4757',
    background: 'rgba(255, 71, 87, 0.15)',
    padding: '2px 6px',
    borderRadius: 4,
    letterSpacing: '0.5px',
    fontFamily: "'JetBrains Mono', monospace",
  },
  chartWrap: {
    flex: 1,
  },
  legendRow: {
    display: 'flex',
    gap: 16,
    justifyContent: 'center',
    marginTop: 4,
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
  },
  legendText: {
    fontSize: 10,
    color: '#8b8f98',
  },
};
