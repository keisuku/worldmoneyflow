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

const CHANGE_COLS: { key: ChangeKey; label: string }[] = [
  { key: 'h1', label: '1h' },
  { key: 'h4', label: '4h' },
  { key: 'd1', label: '1d' },
  { key: 'w1', label: '1w' },
  { key: 'm1', label: '1m' },
  { key: 'y1', label: '1y' },
];

// ── Formatters ─────────────────────────────────────────────────────

function fmtTrillion(v: number): string {
  if (v >= 1) return `$${v.toFixed(1)}T`;
  return `$${(v * 1000).toFixed(0)}B`;
}

function fmtChange(v: number): { text: string; color: string } {
  if (v === 0) return { text: '\u2014', color: '#6b7280' };
  const abs = Math.abs(v);
  const sign = v > 0 ? '+' : '';
  const color = v > 0 ? '#10b981' : '#ef4444';
  if (abs >= 1000) return { text: `${sign}${(v / 1000).toFixed(1)}T`, color };
  if (abs < 0.1) return { text: `${sign}<0.1`, color };
  if (abs < 10) return { text: `${sign}${v.toFixed(1)}`, color };
  return { text: `${sign}${v.toFixed(0)}`, color };
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
          cmp = a.nameJa.localeCompare(b.nameJa);
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
    return { label: '合計（機関除く）', totalValue, changes };
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
    return { label: '機関投資家AUM', totalValue, changes };
  }, []);

  const sortArrow = (col: SortColumn) => {
    if (sortCol !== col) return '';
    return sortDir === 'asc' ? '\u25B2' : '\u25BC';
  };

  const renderCategoryBadge = (cat: Category) => {
    const meta = CATEGORY_META[cat];
    return (
      <span
        style={{
          display: 'inline-block',
          padding: '1px 5px',
          borderRadius: 3,
          fontSize: 9,
          fontWeight: 600,
          color: meta.color,
          background: `${meta.color}18`,
          border: `1px solid ${meta.color}30`,
          whiteSpace: 'nowrap',
        }}
      >
        {meta.labelJa}
      </span>
    );
  };

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
      <style>{`
        .asset-row:hover {
          background: rgba(255,255,255,0.06) !important;
        }
        .at-th {
          padding: 6px 4px;
          text-align: right;
          font-size: 10px;
          font-weight: 600;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          cursor: pointer;
          user-select: none;
          white-space: nowrap;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          position: sticky;
          top: 0;
          background: #0f1425;
          z-index: 2;
          font-family: 'JetBrains Mono', monospace;
        }
        .at-td {
          padding: 4px 4px;
          text-align: right;
          font-size: 11px;
          white-space: nowrap;
          font-family: 'JetBrains Mono', monospace;
        }
        @media (max-width: 480px) {
          .at-th, .at-td { padding: 3px 2px; font-size: 9px; }
        }
      `}</style>

      {/* Header */}
      <div
        style={{
          padding: '14px 16px 10px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'baseline',
          gap: 8,
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: 16,
            fontWeight: 700,
            color: '#f1f5f9',
            letterSpacing: '-0.02em',
          }}
        >
          世界の資産ランキング
        </h2>
        <span
          style={{
            fontSize: 11,
            color: '#64748b',
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {GLOBAL_ASSETS.length}資産
        </span>
      </div>

      {/* Table - no horizontal scroll, compact columns */}
      <div style={{ overflowX: 'hidden' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            tableLayout: 'fixed',
          }}
        >
          <colgroup>
            <col style={{ width: '28px' }} />     {/* # */}
            <col style={{ width: 'auto' }} />      {/* Asset name - takes remaining space */}
            <col style={{ width: '54px' }} />      {/* Category badge */}
            <col style={{ width: '52px' }} />      {/* Value */}
            {CHANGE_COLS.map(c => (
              <col key={c.key} style={{ width: '46px' }} />
            ))}
          </colgroup>
          <thead>
            <tr>
              <th className="at-th" style={{ textAlign: 'center', width: 28 }} onClick={() => handleSort('rank')}>
                #
              </th>
              <th className="at-th" style={{ textAlign: 'left', paddingLeft: 6 }} onClick={() => handleSort('name')}>
                資産{sortArrow('name')}
              </th>
              <th className="at-th" style={{ textAlign: 'center' }} onClick={() => handleSort('category')}>
                分類{sortArrow('category')}
              </th>
              <th className="at-th" onClick={() => handleSort('totalValue')}>
                規模{sortArrow('totalValue')}
              </th>
              {CHANGE_COLS.map(c => (
                <th
                  key={c.key}
                  className="at-th"
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
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.015 }}
                style={{
                  background: idx % 2 === 0
                    ? 'rgba(255,255,255,0.02)'
                    : 'rgba(255,255,255,0.04)',
                  height: 32,
                  cursor: 'default',
                }}
              >
                <td className="at-td" style={{ textAlign: 'center', color: '#64748b', fontSize: 10 }}>
                  {idx + 1}
                </td>
                <td
                  className="at-td"
                  style={{
                    textAlign: 'left',
                    color: '#e2e8f0',
                    fontFamily: 'inherit',
                    paddingLeft: 6,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                  title={`${asset.name} (${asset.nameJa})`}
                >
                  <span style={{ marginRight: 3, fontSize: 12 }}>{asset.emoji}</span>
                  <span style={{ fontSize: 11 }}>{asset.nameJa}</span>
                </td>
                <td className="at-td" style={{ textAlign: 'center' }}>
                  {renderCategoryBadge(asset.category)}
                </td>
                <td className="at-td" style={{ color: '#e2e8f0', fontWeight: 600, fontSize: 11 }}>
                  {fmtTrillion(asset.totalValue)}
                </td>
                {CHANGE_COLS.map(c => {
                  const { text, color } = fmtChange(asset.changes[c.key]);
                  return (
                    <td
                      key={c.key}
                      className="at-td"
                      style={{ color, fontSize: 10 }}
                    >
                      {text}
                    </td>
                  );
                })}
              </motion.tr>
            ))}

            {/* Summary rows */}
            {[summaryInvestable, summaryInstitutional].map((summary, si) => (
              <tr
                key={si}
                style={{
                  background: si === 0 ? 'rgba(16,185,129,0.04)' : 'rgba(99,102,241,0.04)',
                  borderTop: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <td className="at-td" style={{ color: '#64748b' }}></td>
                <td className="at-td" style={{ textAlign: 'left', color: '#e2e8f0', fontWeight: 700, fontSize: 11, paddingLeft: 6 }}>
                  {summary.label}
                </td>
                <td className="at-td"></td>
                <td className="at-td" style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 11 }}>
                  {fmtTrillion(summary.totalValue)}
                </td>
                {CHANGE_COLS.map(c => {
                  const { text, color } = fmtChange(summary.changes[c.key]);
                  return (
                    <td key={c.key} className="at-td" style={{ color, fontWeight: 600, fontSize: 10 }}>
                      {text}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
