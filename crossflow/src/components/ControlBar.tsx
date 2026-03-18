import type { Period, Region, ViewMode, SizeMode } from '../types';

interface ControlBarProps {
  period: Period;
  region: Region;
  viewMode: ViewMode;
  sizeMode: SizeMode;
  onPeriodChange: (p: Period) => void;
  onRegionChange: (r: Region) => void;
  onViewModeChange: (v: ViewMode) => void;
  onSizeModeChange: (s: SizeMode) => void;
}

const PERIODS: Period[] = ['1D', '1W', '1M', '3M', '6M', '1Y'];
const REGIONS: { value: Region; label: string }[] = [
  { value: 'global', label: 'Global' },
  { value: 'japan', label: 'Japan' },
  { value: 'us', label: 'US' },
  { value: 'europe', label: 'Europe' },
  { value: 'asia', label: 'Asia' },
];

export function ControlBar({
  period,
  region,
  viewMode,
  sizeMode,
  onPeriodChange,
  onRegionChange,
  onViewModeChange,
  onSizeModeChange,
}: ControlBarProps) {
  const buttonStyle = (active: boolean): React.CSSProperties => ({
    padding: '4px 8px',
    border: 'none',
    borderRadius: '4px',
    background: active ? 'rgba(76, 175, 80, 0.3)' : 'transparent',
    color: active ? '#4CAF50' : '#888',
    cursor: 'pointer',
    fontSize: '11px',
    fontFamily: 'monospace',
    fontWeight: active ? 'bold' : 'normal',
    whiteSpace: 'nowrap',
  });

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 8px',
        background: 'rgba(10, 14, 39, 0.9)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        gap: '4px',
        flexWrap: 'wrap',
      }}
    >
      {/* Period */}
      <div style={{ display: 'flex', gap: '4px' }}>
        {PERIODS.map((p) => (
          <button key={p} style={buttonStyle(period === p)} onClick={() => onPeriodChange(p)}>
            {p}
          </button>
        ))}
      </div>

      {/* Region */}
      <div style={{ display: 'flex', gap: '4px' }}>
        {REGIONS.map((r) => (
          <button key={r.value} style={buttonStyle(region === r.value)} onClick={() => onRegionChange(r.value)}>
            {r.label}
          </button>
        ))}
      </div>

      {/* Size Mode */}
      <div style={{ display: 'flex', gap: '4px' }}>
        <button style={buttonStyle(sizeMode === 'stock')} onClick={() => onSizeModeChange('stock')}>
          Stock
        </button>
        <button style={buttonStyle(sizeMode === 'flow')} onClick={() => onSizeModeChange('flow')}>
          Flow
        </button>
      </div>

      {/* View Mode */}
      <div style={{ display: 'flex', gap: '4px' }}>
        <button style={buttonStyle(viewMode === 'bubble')} onClick={() => onViewModeChange('bubble')}>
          Bubble
        </button>
        <button style={buttonStyle(viewMode === 'heatmap')} onClick={() => onViewModeChange('heatmap')}>
          Heatmap
        </button>
        <button style={buttonStyle(viewMode === 'sankey')} onClick={() => onViewModeChange('sankey')}>
          Sankey
        </button>
      </div>
    </div>
  );
}
