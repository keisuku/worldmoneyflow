import { motion } from 'framer-motion';
import { sectorData } from '../data/mockFlowData.ts';

const quadrantColors: Record<string, string> = {
  leading: '#00d4aa',
  weakening: '#f59e0b',
  lagging: '#ff4757',
  improving: '#4facfe',
};

const quadrantLabels: Record<string, string> = {
  leading: 'Leading',
  weakening: 'Weakening',
  lagging: 'Lagging',
  improving: 'Improving',
};

export default function SectorRotation() {
  const svgW = 300;
  const svgH = 240;
  const pad = 40;
  const cx = svgW / 2;
  const cy = svgH / 2;
  const rangeX = (svgW - pad * 2) / 2;
  const rangeY = (svgH - pad * 2) / 2;

  // Scale data to SVG coords
  const maxPerf = Math.max(...sectorData.map((s) => Math.abs(s.relPerformance)), 3);
  const maxMom = Math.max(...sectorData.map((s) => Math.abs(s.momentum)), 1);

  return (
    <motion.div
      className="glass-card"
      style={styles.container}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35 }}
    >
      <h3 style={styles.title}>Sector Rotation</h3>

      <div style={styles.chartWrap}>
        <svg viewBox={`0 0 ${svgW} ${svgH}`} width="100%" style={{ maxWidth: 360 }}>
          {/* Quadrant backgrounds */}
          <rect x={cx} y={pad} width={rangeX} height={cy - pad} fill="#00d4aa" fillOpacity={0.03} />
          <rect x={pad} y={pad} width={cx - pad} height={cy - pad} fill="#4facfe" fillOpacity={0.03} />
          <rect x={pad} y={cy} width={cx - pad} height={svgH - cy - pad} fill="#ff4757" fillOpacity={0.03} />
          <rect x={cx} y={cy} width={rangeX} height={svgH - cy - pad} fill="#f59e0b" fillOpacity={0.03} />

          {/* Quadrant labels */}
          <text x={svgW - pad - 4} y={pad + 12} textAnchor="end" fill="#00d4aa" fontSize={8} fillOpacity={0.5}>LEADING</text>
          <text x={pad + 4} y={pad + 12} textAnchor="start" fill="#4facfe" fontSize={8} fillOpacity={0.5}>IMPROVING</text>
          <text x={pad + 4} y={svgH - pad - 4} textAnchor="start" fill="#ff4757" fontSize={8} fillOpacity={0.5}>LAGGING</text>
          <text x={svgW - pad - 4} y={svgH - pad - 4} textAnchor="end" fill="#f59e0b" fontSize={8} fillOpacity={0.5}>WEAKENING</text>

          {/* Axes */}
          <line x1={pad} y1={cy} x2={svgW - pad} y2={cy} stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
          <line x1={cx} y1={pad} x2={cx} y2={svgH - pad} stroke="rgba(255,255,255,0.1)" strokeWidth={1} />

          {/* Axis labels */}
          <text x={svgW - pad + 2} y={cy - 4} fill="#8b8f98" fontSize={8} textAnchor="start">Perf +</text>
          <text x={pad - 2} y={cy - 4} fill="#8b8f98" fontSize={8} textAnchor="end">Perf -</text>
          <text x={cx + 4} y={pad - 4} fill="#8b8f98" fontSize={8}>Mom +</text>

          {/* Data points */}
          {sectorData.map((sector, i) => {
            const sx = cx + (sector.relPerformance / maxPerf) * rangeX;
            const sy = cy - (sector.momentum / maxMom) * rangeY;
            const color = quadrantColors[sector.quadrant];

            return (
              <motion.g
                key={sector.name}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * i + 0.3, duration: 0.4 }}
              >
                <circle cx={sx} cy={sy} r={14} fill={color} fillOpacity={0.15} stroke={color} strokeWidth={1} strokeOpacity={0.4} />
                <circle cx={sx} cy={sy} r={3} fill={color} />
                <text
                  x={sx}
                  y={sy - 18}
                  textAnchor="middle"
                  fill="#e8eaed"
                  fontSize={8}
                  fontWeight={500}
                >
                  {sector.name}
                </text>
              </motion.g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div style={styles.legend}>
        {Object.entries(quadrantLabels).map(([key, label]) => (
          <div key={key} style={styles.legendItem}>
            <span style={{ ...styles.legendDot, background: quadrantColors[key] }} />
            <span style={styles.legendText}>{label}</span>
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
  title: {
    fontSize: 13,
    fontWeight: 600,
    color: '#e8eaed',
    marginBottom: 8,
  },
  chartWrap: {
    display: 'flex',
    justifyContent: 'center',
    flex: 1,
  },
  legend: {
    display: 'flex',
    justifyContent: 'center',
    gap: 14,
    marginTop: 8,
    flexWrap: 'wrap' as const,
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
};
