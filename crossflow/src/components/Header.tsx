import { motion } from 'framer-motion';
import { regimeData, headerIndicators } from '../data/mockFlowData.ts';

const regimeColors: Record<string, string> = {
  'RISK-ON': '#00d4aa',
  'CAUTIOUS': '#f59e0b',
  'RISK-OFF': '#ff4757',
};

export default function Header() {
  const regime = regimeData.label;
  const color = regimeColors[regime] ?? '#f59e0b';
  const { vix, vixChange, dxy, dxyChange, globalLiquidity, liquidityChange } = headerIndicators;

  return (
    <header style={styles.header}>
      <div style={styles.left}>
        <div style={styles.logo}>
          <span style={styles.logoMain}>CROSS</span>
          <span style={styles.logoAccent}>FLOW</span>
        </div>
        <motion.div
          style={{ ...styles.regimePill, borderColor: color }}
          whileHover={{ scale: 1.05 }}
        >
          <span style={{ ...styles.dot, backgroundColor: color, animation: 'pulse 2s infinite' }} />
          <span className="mono" style={{ color, fontSize: 11, fontWeight: 600, letterSpacing: '0.5px' }}>
            {regime}
          </span>
        </motion.div>
      </div>

      <div style={styles.indicators}>
        <Indicator label="VIX" value={vix} change={vixChange} negative />
        <Indicator label="DXY" value={dxy} change={dxyChange} />
        <Indicator label="Liquidity" value={`$${globalLiquidity}T`} change={liquidityChange} hideOnMobile />
      </div>
    </header>
  );
}

function Indicator({
  label,
  value,
  change,
  negative,
  hideOnMobile,
}: {
  label: string;
  value: number | string;
  change: number;
  negative?: boolean;
  hideOnMobile?: boolean;
}) {
  const isPositive = negative ? change < 0 : change > 0;
  const changeColor = isPositive ? '#00d4aa' : '#ff4757';
  const arrow = change > 0 ? '\u25B2' : '\u25BC';

  return (
    <div style={{ ...styles.indicator, ...(hideOnMobile ? { display: 'none' } : {}) }} className={hideOnMobile ? 'hide-mobile' : ''}>
      <span style={styles.indicatorLabel}>{label}</span>
      <span className="mono" style={styles.indicatorValue}>
        {typeof value === 'number' ? value.toFixed(1) : value}
      </span>
      <span className="mono" style={{ ...styles.indicatorChange, color: changeColor }}>
        {arrow} {Math.abs(change).toFixed(1)}
      </span>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 16px',
    background: 'rgba(10, 14, 26, 0.95)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    height: 56,
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },
  logo: {
    fontSize: 18,
    fontWeight: 700,
    letterSpacing: '1px',
  },
  logoMain: {
    color: '#e8eaed',
  },
  logoAccent: {
    color: '#00d4aa',
  },
  regimePill: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 10px',
    borderRadius: 20,
    border: '1px solid',
    background: 'rgba(255,255,255,0.03)',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    display: 'inline-block',
  },
  indicators: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  indicator: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  indicatorLabel: {
    fontSize: 11,
    color: '#8b8f98',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  indicatorValue: {
    fontSize: 13,
    fontWeight: 600,
    color: '#e8eaed',
  },
  indicatorChange: {
    fontSize: 10,
    fontWeight: 500,
  },
};
