import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  GLOBAL_ASSETS,
  CATEGORY_META,
  type GlobalAsset,
  type AssetChanges,
  type Category,
} from '../data/globalAssets';

// ── Types ──────────────────────────────────────────────────────────

type ChangeKey = keyof AssetChanges;

type SortColumn =
  | 'rank'
  | 'name'
  | 'category'
  | 'totalValue'
  | ChangeKey;

type SortDir = 'asc' | 'desc';

const CHANGE_COLS: { key: ChangeKey; label: string; hideClass?: string }[] = [
  { key: 'h1', label: '1h \u0394' },
  { key: 'h4', label: '4h \u0394', hideClass: 'hide-mobile' },
  { key: 'd1', label: '1d \u0394' },
  { key: 'w1', label: '1w \u0394' },
  { key: 'm1', label: '1m \u0394' },
  { key: 'y1', label: '1y \u0394', hideClass: 'hide-mobile' },
];

// ── Formatters ─────────────────────────────────────────────────────

function fmtTrillion(v: number): string {
  return `$${v.toFixed(1)}T`;
}

function fmtChange(v: number): { text: string; color: string } {
  if (v === 0) return { text: '\u2014', color: '#6b7280' };
  const abs = Math.abs(v);
  const sign = v > 0 ? '+' : '-';
  const color = v > 0 ? '#10b981' : '#ef4444';
  if (abs < 0.1) return { text: `${sign}<0.1B`, color };
  return { text: `${sign}${abs.toFixed(1)}B`, color };
}

// ── Component ──────────────────────────────────────────────────────

export default function AssetTable() {
  const [sortCol, setSortCol] = useState<SortColumn>('totalValue');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const handleSort = (col: SortColumn) => {
    if (col === sortCol) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortCol(col);
      setSortDir(col === 'name' || col === 'category' ? 'asc' : 'desc');
    }
  };

  const sorted = useMemo(() => {
    const items = [...GLOBAL_ASSETS];
    const dir = sortDir === 'asc' ? 1 : -1;

    items.sort((a, b) => {
      let cmp = 0;
      switch (sortCol) {
        case 'rank':
        case 'totalValue':
          cmp = a.totalValue - b.totalValue;
          break;
        case 'name':
          cmp = a.nameShort.localeCompare(b.nameShort);
          break;
        case 'category':
          cmp = a.category.localeCompare(b.category);
          break;
        default:
          cmp = a.changes[sortCol as ChangeKey] - b.changes[sortCol as ChangeKey];
          break;
      }
      return cmp * dir;
    });
    return items;
  }, [sortCol, sortDir]);

  // ── Summary calculations ──

  const summaryInvestable = useMemo(() => {
    const nonInst = GLOBAL_ASSETS.filter(a => a.category !== 'institutional');
    const totalValue = nonInst.reduce((s, a) => s + a.totalValue, 0);
    const changes: AssetChanges = { h1: 0, h4: 0, d1: 0, w1: 0, m1: 0, y1: 0 };
    for (const a of nonInst) {
      for (const k of Object.keys(changes) as ChangeKey[]) {
        changes[k] += a.changes[k];
      }
    }
    return { label: 'Total Non-Institutional', totalValue, changes };
  }, []);

  const summaryInstitutional = useMemo(() => {
    const inst = GLOBAL_ASSETS.filter(a => a.category === 'institutional');
    const totalValue = inst.reduce((s, a) => s + a.totalValue, 0);
    const changes: AssetChanges = { h1: 0, h4: 0, d1: 0, w1: 0, m1: 0, y1: 0 };
    for (const a of inst) {
      for (const k of Object.keys(changes) as ChangeKey[]) {
        changes[k] += a.changes[k];
      }
    }
    return { label: 'Institutional AUM', totalValue, changes };
  }, []);

  // ── Styles ──

  const mono: React.CSSProperties = {
    fontFamily: "'JetBrains Mono', monospace",
  };

  const thStyle = (col: SortColumn, extra?: React.CSSProperties): React.CSSProperties => ({
    padding: '10px 12px',
    textAlign: col === 'name' ? 'left' : 'right',
    fontSize: 12,
    fontWeight: 600,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    cursor: 'pointer',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    position: 'sticky',
    top: 0,
    background: '#0f1425',
    zIndex: 2,
    ...mono,
    ...extra,
  });

  const tdStyle = (align: 'left' | 'right' = 'right'): React.CSSProperties => ({
    padding: '6px 12px',
    textAlign: align,
    fontSize: 14,
    whiteSpace: 'nowrap',
    ...mono,
  });

  const sortArrow = (col: SortColumn) => {
    if (sortCol !== col) return '';
    return sortDir === 'asc' ? ' \u25B2' : ' \u25BC';
  };

  const renderCategoryBadge = (cat: Category) => {
    const meta = CATEGORY_META[cat];
    return (
      <span
        style={{
          display: 'inline-block',
          padding: '2px 8px',
          borderRadius: 4,
          fontSize: 11,
          fontWeight: 600,
          color: meta.color,
          background: `${meta.color}18`,
          border: `1px solid ${meta.color}30`,
          letterSpacing: '0.03em',
        }}
      >
        {meta.label}
      </span>
    );
  };

  const renderChangeCell = (val: number, hideClass?: string) => {
    const { text, color } = fmtChange(val);
    return (
      <td
        className={hideClass}
        style={{ ...tdStyle(), color }}
      >
        {text}
      </td>
    );
  };

  const renderSummaryRow = (
    summary: { label: string; totalValue: number; changes: AssetChanges },
    bg: string,
  ) => (
    <tr style={{ background: bg, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
      <td style={{ ...tdStyle(), color: '#64748b' }}></td>
      <td style={{ ...tdStyle('left'), color: '#e2e8f0', fontWeight: 700, fontSize: 13 }} colSpan={1}>
        {summary.label}
      </td>
      <td style={tdStyle()}></td>
      <td style={{ ...tdStyle(), color: '#e2e8f0', fontWeight: 700 }}>
        {fmtTrillion(summary.totalValue)}
      </td>
      {CHANGE_COLS.map(c => {
        const { text, color } = fmtChange(summary.changes[c.key]);
        return (
          <td
            key={c.key}
            className={c.hideClass}
            style={{ ...tdStyle(), color, fontWeight: 600 }}
          >
            {text}
          </td>
        );
      })}
    </tr>
  );

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 16,
        overflow: 'hidden',
      }}
    >
      {/* Responsive style tag */}
      <style>{`
        .hide-mobile {}
        @media (max-width: 768px) {
          .hide-mobile { display: none !important; }
        }
        .asset-table-wrap {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        .asset-table-wrap::-webkit-scrollbar {
          height: 6px;
        }
        .asset-table-wrap::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.02);
        }
        .asset-table-wrap::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 3px;
        }
        .asset-row:hover {
          background: rgba(255,255,255,0.06) !important;
        }
      `}</style>

      {/* Header */}
      <div
        style={{
          padding: '20px 24px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'baseline',
          gap: 12,
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: 20,
            fontWeight: 700,
            color: '#f1f5f9',
            letterSpacing: '-0.02em',
          }}
        >
          Global Asset Rankings
        </h2>
        <span
          style={{
            fontSize: 13,
            color: '#64748b',
            ...mono,
          }}
        >
          {GLOBAL_ASSETS.length} assets
        </span>
      </div>

      {/* Table */}
      <div className="asset-table-wrap">
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            minWidth: 900,
          }}
        >
          <thead>
            <tr>
              <th style={thStyle('rank', { width: 48, textAlign: 'right' })} onClick={() => handleSort('rank')}>
                #{sortArrow('rank')}
              </th>
              <th style={thStyle('name', { textAlign: 'left', minWidth: 140 })} onClick={() => handleSort('name')}>
                Asset{sortArrow('name')}
              </th>
              <th style={thStyle('category', { textAlign: 'right' })} onClick={() => handleSort('category')}>
                Category{sortArrow('category')}
              </th>
              <th style={thStyle('totalValue')} onClick={() => handleSort('totalValue')}>
                Value{sortArrow('totalValue')}
              </th>
              {CHANGE_COLS.map(c => (
                <th
                  key={c.key}
                  className={c.hideClass}
                  style={thStyle(c.key)}
                  onClick={() => handleSort(c.key)}
                >
                  {c.label}{sortArrow(c.key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((asset: GlobalAsset, idx: number) => (
              <motion.tr
                key={asset.id}
                className="asset-row"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.02 }}
                style={{
                  background: idx % 2 === 0
                    ? 'rgba(255,255,255,0.02)'
                    : 'rgba(255,255,255,0.04)',
                  height: 40,
                  cursor: 'default',
                }}
              >
                <td style={{ ...tdStyle(), color: '#64748b', fontSize: 12 }}>
                  {idx + 1}
                </td>
                <td
                  style={{ ...tdStyle('left'), color: '#e2e8f0', fontFamily: 'inherit' }}
                  title={asset.name}
                >
                  <span style={{ marginRight: 6 }}>{asset.emoji}</span>
                  {asset.nameShort}
                </td>
                <td style={{ ...tdStyle(), textAlign: 'right' }}>
                  {renderCategoryBadge(asset.category)}
                </td>
                <td style={{ ...tdStyle(), color: '#e2e8f0', fontWeight: 600 }}>
                  {fmtTrillion(asset.totalValue)}
                </td>
                {CHANGE_COLS.map(c => renderChangeCell(asset.changes[c.key], c.hideClass))}
              </motion.tr>
            ))}

            {/* Summary rows */}
            {renderSummaryRow(summaryInvestable, 'rgba(16, 185, 129, 0.04)')}
            {renderSummaryRow(summaryInstitutional, 'rgba(99, 102, 241, 0.04)')}
          </tbody>
        </table>
      </div>
    </div>
  );
}
