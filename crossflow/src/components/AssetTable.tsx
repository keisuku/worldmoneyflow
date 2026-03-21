import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  GLOBAL_ASSETS,
  CATEGORY_META,
  type GlobalAsset,
  type AssetChanges,
  type Category,
} from '../data/globalAssets';

type ChangeKey = keyof AssetChanges;
type SortColumn = 'rank' | 'name' | 'totalValue' | ChangeKey;
type SortDir = 'asc' | 'desc';

const CHANGE_COLS: { key: ChangeKey; label: string }[] = [
  { key: 'h1', label: '1h' },
  { key: 'd1', label: '1d' },
  { key: 'w1', label: '1w' },
  { key: 'm1', label: '1m' },
  { key: 'y1', label: '1y' },
];

function fmtTrillion(v: number): string {
  if (v >= 1) return `$${v.toFixed(1)}T`;
  return `$${(v * 1000).toFixed(0)}B`;
}

function fmtChange(v: number): { text: string; color: string } {
  if (v === 0) return { text: '\u2014', color: '#555' };
  const abs = Math.abs(v);
  const sign = v > 0 ? '+' : '';
  const color = v > 0 ? '#22c55e' : '#ef4444';
  if (abs >= 1000) return { text: `${sign}${(v / 1000).toFixed(1)}T`, color };
  if (abs < 0.1) return { text: `${sign}<0.1`, color };
  if (abs < 10) return { text: `${sign}${v.toFixed(1)}`, color };
  return { text: `${sign}${v.toFixed(0)}`, color };
}

export default function AssetTable() {
  const [sortCol, setSortCol] = useState<SortColumn>('totalValue');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const handleSort = (col: SortColumn) => {
    if (col === sortCol) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortCol(col);
      setSortDir(col === 'name' ? 'asc' : 'desc');
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
        default:
          cmp = a.changes[sortCol as ChangeKey] - b.changes[sortCol as ChangeKey];
          break;
      }
      return cmp * dir;
    });
    return items;
  }, [sortCol, sortDir]);

  const summaryNonInst = useMemo(() => {
    const items = GLOBAL_ASSETS.filter(a => a.category !== 'institutional');
    const totalValue = items.reduce((s, a) => s + a.totalValue, 0);
    const changes: AssetChanges = { h1: 0, h4: 0, d1: 0, w1: 0, m1: 0, y1: 0 };
    for (const a of items) for (const k of Object.keys(changes) as ChangeKey[]) changes[k] += a.changes[k];
    return { label: '合計', totalValue, changes };
  }, []);

  const arrow = (col: SortColumn) => sortCol !== col ? '' : sortDir === 'asc' ? '\u25B2' : '\u25BC';

  const catDot = (cat: Category) => (
    <span style={{
      display: 'inline-block',
      width: 6, height: 6,
      borderRadius: '50%',
      background: CATEGORY_META[cat].color,
      marginRight: 4,
      flexShrink: 0,
    }} />
  );

  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 12,
      overflow: 'hidden',
    }}>
      <style>{`
        .ar:hover { background: rgba(255,255,255,0.06) !important; }
        .ath {
          padding: 8px 6px; text-align: right; font-size: 11px; font-weight: 600;
          color: #64748b; cursor: pointer; user-select: none; white-space: nowrap;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          position: sticky; top: 0; background: #0f1425; z-index: 2;
        }
        .atd {
          padding: 5px 6px; text-align: right; font-size: 12px; white-space: nowrap;
          font-family: 'JetBrains Mono', monospace;
        }
      `}</style>

      <div style={{
        padding: '12px 14px 8px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>
          世界の資産ランキング
        </span>
        <span style={{ fontSize: 11, color: '#64748b', marginLeft: 8 }}>
          {GLOBAL_ASSETS.length}資産
        </span>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th className="ath" style={{ width: 30, textAlign: 'center' }} onClick={() => handleSort('rank')}>#</th>
            <th className="ath" style={{ textAlign: 'left', paddingLeft: 8 }} onClick={() => handleSort('name')}>
              資産{arrow('name')}
            </th>
            <th className="ath" style={{ width: 60 }} onClick={() => handleSort('totalValue')}>
              規模{arrow('totalValue')}
            </th>
            {CHANGE_COLS.map(c => (
              <th key={c.key} className="ath" style={{ width: 50 }} onClick={() => handleSort(c.key)}>
                {c.label}{arrow(c.key)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((asset: GlobalAsset, idx: number) => (
            <motion.tr
              key={asset.id}
              className="ar"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15, delay: idx * 0.01 }}
              style={{
                background: idx % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'rgba(255,255,255,0.035)',
                height: 34,
              }}
            >
              <td className="atd" style={{ textAlign: 'center', color: '#555', fontSize: 10 }}>{idx + 1}</td>
              <td className="atd" style={{ textAlign: 'left', paddingLeft: 8, fontFamily: 'inherit' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {catDot(asset.category)}
                  <span style={{ fontSize: 12, marginRight: 3 }}>{asset.emoji}</span>
                  <span style={{ color: '#e2e8f0', fontSize: 12, fontWeight: 500 }}>{asset.nameJa}</span>
                </span>
              </td>
              <td className="atd" style={{ color: '#e2e8f0', fontWeight: 600 }}>{fmtTrillion(asset.totalValue)}</td>
              {CHANGE_COLS.map(c => {
                const { text, color } = fmtChange(asset.changes[c.key]);
                return <td key={c.key} className="atd" style={{ color, fontSize: 11 }}>{text}</td>;
              })}
            </motion.tr>
          ))}
          {/* Summary */}
          <tr style={{ background: 'rgba(255,255,255,0.05)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <td className="atd"></td>
            <td className="atd" style={{ textAlign: 'left', paddingLeft: 8, color: '#e2e8f0', fontWeight: 700, fontFamily: 'inherit', fontSize: 12 }}>
              {summaryNonInst.label}
            </td>
            <td className="atd" style={{ color: '#e2e8f0', fontWeight: 700 }}>{fmtTrillion(summaryNonInst.totalValue)}</td>
            {CHANGE_COLS.map(c => {
              const { text, color } = fmtChange(summaryNonInst.changes[c.key]);
              return <td key={c.key} className="atd" style={{ color, fontWeight: 600, fontSize: 11 }}>{text}</td>;
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
