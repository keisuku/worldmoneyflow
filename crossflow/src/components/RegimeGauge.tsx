import { motion } from 'framer-motion';
import { regimeData } from '../data/marketData.ts';

function scoreToColor(score: number): string {
  if (score >= 65) return '#00d4aa';
  if (score >= 40) return '#f59e0b';
  return '#ff4757';
}

export default function RegimeGauge() {
  const { score, label, components } = regimeData;
  const mainColor = scoreToColor(score);

  // Arc parameters
  const cx = 100;
  const cy = 90;
  const r = 70;
  const startAngle = Math.PI * 0.8;
  const endAngle = Math.PI * 0.2;
  const totalArc = startAngle + (Math.PI * 2 - startAngle) + endAngle;
  const progressArc = (score / 100) * totalArc;

  function arcPoint(angle: number) {
    const a = Math.PI - startAngle + angle;
    return {
      x: cx + r * Math.cos(a),
      y: cy - r * Math.sin(a),
    };
  }

  function describeArc(start: number, end: number): string {
    const s = arcPoint(start);
    const e = arcPoint(end);
    const largeArc = end - start > Math.PI ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 1 ${e.x} ${e.y}`;
  }

  const needlePoint = arcPoint(progressArc);

  return (
    <motion.div
      className="glass-card"
      style={styles.container}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <h3 style={styles.title}>Market Regime</h3>

      <div style={styles.gaugeWrap}>
        <svg viewBox="0 0 200 120" width="100%" style={{ maxWidth: 220 }}>
          {/* Background arc */}
          <path
            d={describeArc(0, totalArc)}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={10}
            strokeLinecap="round"
          />

          {/* Color segments */}
          <path d={describeArc(0, totalArc * 0.33)} fill="none" stroke="#ff4757" strokeWidth={10} strokeLinecap="round" strokeOpacity={0.3} />
          <path d={describeArc(totalArc * 0.33, totalArc * 0.66)} fill="none" stroke="#f59e0b" strokeWidth={10} strokeLinecap="round" strokeOpacity={0.3} />
          <path d={describeArc(totalArc * 0.66, totalArc)} fill="none" stroke="#00d4aa" strokeWidth={10} strokeLinecap="round" strokeOpacity={0.3} />

          {/* Progress arc */}
          <motion.path
            d={describeArc(0, progressArc)}
            fill="none"
            stroke={mainColor}
            strokeWidth={10}
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />

          {/* Needle dot */}
          <motion.circle
            cx={needlePoint.x}
            cy={needlePoint.y}
            r={6}
            fill={mainColor}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.8 }}
          />
          <circle cx={needlePoint.x} cy={needlePoint.y} r={3} fill="#0a0e1a" />

          {/* Center text */}
          <text x={cx} y={cy - 8} textAnchor="middle" fill={mainColor} fontSize={22} fontWeight={700} fontFamily="'JetBrains Mono', monospace">
            {score}
          </text>
          <text x={cx} y={cy + 10} textAnchor="middle" fill="#8b8f98" fontSize={10} fontFamily="system-ui">
            / 100
          </text>
        </svg>

        <div style={{ ...styles.regimeLabel, color: mainColor }}>
          {label}
        </div>
      </div>

      {/* Component scores */}
      <div style={styles.components}>
        {components.map((comp) => (
          <div key={comp.name} style={styles.compRow}>
            <span style={styles.compName}>{comp.name}</span>
            <div style={styles.compBar}>
              <motion.div
                style={{
                  ...styles.compFill,
                  background: comp.color,
                }}
                initial={{ width: 0 }}
                animate={{ width: `${comp.score}%` }}
                transition={{ duration: 0.8, delay: 0.3 }}
              />
            </div>
            <span className="mono" style={{ ...styles.compScore, color: comp.color }}>
              {comp.score}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '16px 18px',
  },
  title: {
    fontSize: 13,
    fontWeight: 600,
    color: '#e8eaed',
    marginBottom: 8,
  },
  gaugeWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 12,
  },
  regimeLabel: {
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: '1px',
    marginTop: -4,
    fontFamily: "'JetBrains Mono', monospace",
  },
  components: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  compRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  compName: {
    fontSize: 11,
    color: '#8b8f98',
    width: 90,
    flexShrink: 0,
  },
  compBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    background: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  compFill: {
    height: '100%',
    borderRadius: 2,
  },
  compScore: {
    fontSize: 11,
    fontWeight: 600,
    width: 24,
    textAlign: 'right' as const,
  },
};
