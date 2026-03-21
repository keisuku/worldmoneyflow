import { motion } from 'framer-motion';
import { regimeData, headerIndicators } from '../data/marketData.ts';
import { T, REGIME_JA, DATA_TIMESTAMP } from '../theme.ts';

export default function Header() {
  const regime = regimeData.label;
  const color = T.regime[regime] ?? T.caution;
  const regimeJa = REGIME_JA[regime] ?? regime;

  const { vix, vixChange, dxy, dxyChange, globalLiquidity, liquidityChange } = headerIndicators;

  return (
    <header style={styles.header}>
      <div style={styles.left}>
        <div style={styles.logo}>
          <span style={{ color: T.text }}>CROSS</span>
          <span style={{ color: T.brand }}>FLOW</span>
        </div>
        <motion.div
          style={{ ...styles.regimePill, borderColor: color }}
          whileHover={{ scale: 1.05 }}
        >
          <span style={{ ...styles.dot, backgroundColor: color, animation: 'pulse 2s infinite' }} />
          <span className="mono" style={{ color, fontSize: 11, fontWeight: 600, letterSpacing: '0.5px' }}>
            {regimeJa}
          </span>
        </motion.div>
      </div>

      <div style={styles.indicators}>
        <Indicator label="VIX" value={vix} change={vixChange} negative />
        <Indicator label="DXY" value={dxy} change={dxyChange} />
        <Indicator label="流動性" value={`$${globalLiquidity}T`} change={liquidityChange} hideOnMobile />
        <span className="hide-mobile" style={{ fontSize: 9, color: T.textDim, whiteSpace: 'nowrap' }}>
          {DATA_TIMESTAMP}
        </span>
      </div>
    </header>
  );
}

function Indicator({
  label, value, change, negative, hideOnMobile,
}: {
  label: string; value: number | string; change: number; negative?: boolean; hideOnMobile?: boolean;
}) {
  const isPositive = negative ? change < 0 : change > 0;
  const changeColor = isPositive ? T.positive : T.negative;
  const arrow = change > 0 ? '\u25B2' : '\u25BC';

  return (
    <div style={{ ...styles.indicator }} className={hideOnMobile ? 'hide-mobile' : ''}>
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
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '10px 16px', background: 'rgba(10, 14, 26, 0.95)',
    backdropFilter: 'blur(20px)', borderBottom: `1px solid ${T.border}`,
    position: 'sticky', top: 0, zIndex: 100, height: 56,
  },
  left: { display: 'flex', alignItems: 'center', gap: 14 },
  logo: { fontSize: 18, fontWeight: 700, letterSpacing: '1px' },
  regimePill: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '4px 10px', borderRadius: 20, border: '1px solid',
    background: 'rgba(255,255,255,0.03)',
  },
  dot: { width: 7, height: 7, borderRadius: '50%', display: 'inline-block' },
  indicators: { display: 'flex', alignItems: 'center', gap: 12 },
  indicator: { display: 'flex', alignItems: 'center', gap: 5 },
  indicatorLabel: { fontSize: 10, color: T.textMuted, textTransform: 'uppercase' as const, letterSpacing: '0.5px' },
  indicatorValue: { fontSize: 13, fontWeight: 600, color: T.text },
  indicatorChange: { fontSize: 10, fontWeight: 500 },
};
