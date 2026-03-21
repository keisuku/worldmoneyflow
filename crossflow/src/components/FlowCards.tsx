import { motion } from 'framer-motion';
import { flowMetrics } from '../data/marketData.ts';

const icons: Record<string, string> = {
  equity: '\u{1F4C9}',
  bonds: '\u{1F3E6}',
  em: '\u{1F30D}',
  gold: '\u{1F947}',
};

function MiniSparkline({ data, positive }: { data: number[]; positive: boolean }) {
  const width = 64;
  const height = 24;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');

  const color = positive ? '#00d4aa' : '#ff4757';

  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <defs>
        <linearGradient id={`spark-${positive ? 'g' : 'r'}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${height} ${points} ${width},${height}`}
        fill={`url(#spark-${positive ? 'g' : 'r'})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function FlowCards() {
  return (
    <div style={styles.grid}>
      {flowMetrics.map((metric, i) => {
        const color = metric.positive ? '#00d4aa' : '#ff4757';
        const arrow = metric.change > 0 ? '\u25B2' : '\u25BC';

        return (
          <motion.div
            key={metric.id}
            className="glass-card"
            style={styles.card}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 * i }}
            whileHover={{ borderColor: 'rgba(255,255,255,0.12)' }}
          >
            <div style={styles.cardHeader}>
              <span style={styles.icon}>{icons[metric.id]}</span>
              <span style={styles.label}>{metric.label}</span>
            </div>

            <div style={styles.valueRow}>
              <span className="mono" style={{ ...styles.value, color }}>
                {metric.value > 0 ? '+' : ''}
                {metric.value.toFixed(1)}B
              </span>
              <span className="mono" style={{ ...styles.change, color: metric.change > 0 ? '#00d4aa' : '#ff4757' }}>
                {arrow} {Math.abs(metric.change).toFixed(1)}
              </span>
            </div>

            <div style={styles.sparkWrap}>
              <MiniSparkline data={metric.sparkline} positive={metric.positive} />
              <span className="mono" style={styles.weekLabel}>8w</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 10,
  },
  card: {
    padding: '12px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    transition: 'border-color 0.2s',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  icon: {
    fontSize: 14,
  },
  label: {
    fontSize: 11,
    color: '#8b8f98',
    fontWeight: 500,
  },
  valueRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 8,
  },
  value: {
    fontSize: 18,
    fontWeight: 700,
  },
  change: {
    fontSize: 10,
    fontWeight: 500,
  },
  sparkWrap: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 4,
  },
  weekLabel: {
    fontSize: 9,
    color: '#8b8f98',
  },
};
