import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { centralBankData, rateDecisions } from '../data/mockFlowData.ts';

export default function CentralBankWatch() {
  const latest = centralBankData[centralBankData.length - 1];
  const prev = centralBankData[centralBankData.length - 2];
  const total = latest.fed + latest.ecb + latest.boj + latest.pboc;
  const prevTotal = prev.fed + prev.ecb + prev.boj + prev.pboc;
  const change = total - prevTotal;
  const trendArrow = change >= 0 ? '\u25B2' : '\u25BC';

  return (
    <motion.div
      className="glass-card"
      style={styles.container}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.45 }}
    >
      <div style={styles.header}>
        <h3 style={styles.title}>Central Bank Watch</h3>
        <div style={styles.totalWrap}>
          <span className="mono" style={styles.totalValue}>${total.toFixed(1)}T</span>
          <span
            className="mono"
            style={{ ...styles.totalChange, color: change >= 0 ? '#00d4aa' : '#ff4757' }}
          >
            {trendArrow} {Math.abs(change).toFixed(1)}T
          </span>
        </div>
      </div>

      <div style={styles.chartWrap}>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={centralBankData} margin={{ top: 4, right: 8, bottom: 4, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: '#8b8f98', fontSize: 9 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
              tickLine={false}
              interval={2}
            />
            <YAxis
              tick={{ fill: '#8b8f98', fontSize: 9, fontFamily: "'JetBrains Mono', monospace" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `$${v}T`}
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
              formatter={(value) => [`$${Number(value).toFixed(1)}T`, '']}
            />
            <Area type="monotone" dataKey="pboc" stackId="1" stroke="#ff6b81" fill="#ff6b81" fillOpacity={0.3} strokeWidth={0} />
            <Area type="monotone" dataKey="boj" stackId="1" stroke="#ff4757" fill="#ff4757" fillOpacity={0.3} strokeWidth={0} />
            <Area type="monotone" dataKey="ecb" stackId="1" stroke="#ffd700" fill="#ffd700" fillOpacity={0.3} strokeWidth={0} />
            <Area type="monotone" dataKey="fed" stackId="1" stroke="#4facfe" fill="#4facfe" fillOpacity={0.3} strokeWidth={0} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div style={styles.bankLegend}>
        {[
          { name: 'Fed', color: '#4facfe' },
          { name: 'ECB', color: '#ffd700' },
          { name: 'BOJ', color: '#ff4757' },
          { name: 'PBOC', color: '#ff6b81' },
        ].map((b) => (
          <div key={b.name} style={styles.legendItem}>
            <span style={{ ...styles.legendDot, background: b.color }} />
            <span style={styles.legendText}>{b.name}</span>
          </div>
        ))}
      </div>

      {/* Rate Decisions */}
      <div style={styles.decisions}>
        <div style={styles.decisionsTitle}>Upcoming Decisions</div>
        {rateDecisions.map((d) => (
          <div key={d.bank + d.date} style={styles.decisionRow}>
            <span
              className="mono"
              style={{ ...styles.decisionBank, color: d.color }}
            >
              {d.bank}
            </span>
            <span className="mono" style={styles.decisionDate}>{d.date}</span>
            <span style={styles.decisionAction}>{d.action}</span>
          </div>
        ))}
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
  },
  title: {
    fontSize: 13,
    fontWeight: 600,
    color: '#e8eaed',
  },
  totalWrap: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 6,
  },
  totalValue: {
    fontSize: 14,
    fontWeight: 700,
    color: '#e8eaed',
  },
  totalChange: {
    fontSize: 10,
    fontWeight: 500,
  },
  chartWrap: {
    marginBottom: 4,
  },
  bankLegend: {
    display: 'flex',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 10,
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    display: 'inline-block',
  },
  legendText: {
    fontSize: 10,
    color: '#8b8f98',
  },
  decisions: {
    borderTop: '1px solid rgba(255,255,255,0.06)',
    paddingTop: 8,
  },
  decisionsTitle: {
    fontSize: 10,
    color: '#8b8f98',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    marginBottom: 6,
  },
  decisionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '3px 0',
  },
  decisionBank: {
    fontSize: 11,
    fontWeight: 600,
    width: 36,
  },
  decisionDate: {
    fontSize: 10,
    color: '#8b8f98',
    width: 44,
  },
  decisionAction: {
    fontSize: 10,
    color: '#e8eaed',
  },
};
