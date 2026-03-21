import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { GLOBAL_ASSETS, CATEGORY_META, type GlobalAsset, type AssetChanges, type Category } from '../data/globalAssets';
import { T } from '../theme';

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

const CAT_FILTERS: { key: Category | 'all'; label: string }[] = [
  { key: 'all', label: '全て' },
  { key: 'equities', label: '株式' },
  { key: 'bonds', label: '債券' },
  { key: 'real-estate', label: '不動産' },
  { key: 'gold', label: '金・商品' },
  { key: 'crypto', label: '暗号資産' },
  { key: 'private', label: 'PE' },
];

function fmtT(v: number) {
  return v >= 1 ? `$${v.toFixed(1)}T` : `$${(v * 1000).toFixed(0)}B`;
}

function fmtC(v: number): { text: string; color: string } {
  if (v === 0) return { text: '\u2014', color: '#555' };
  const sign = v > 0 ? '+' : '';
  const color = v > 0 ? T.positive : T.negative;
  const abs = Math.abs(v);
  if (abs >= 1000) return { text: `${sign}${(v / 1000).toFixed(1)}T`, color };
  if (abs < 0.1) return { text: `${sign}<0.1`, color };
  if (abs < 10) return { text: `${sign}${v.toFixed(1)}`, color };
  return { text: `${sign}${v.toFixed(0)}`, color };
}

export default function AssetTable() {
  const [sortCol, setSortCol] = useState<SortColumn>('totalValue');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<Category | 'all'>('all');

  const mainAssets = useMemo(() => GLOBAL_ASSETS.filter(a => a.category !== 'institutional'), []);
  const instAssets = useMemo(() => GLOBAL_ASSETS.filter(a => a.category === 'institutional'), []);

  const handleSort = (col: SortColumn) => {
    if (col === sortCol) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir(col === 'name' ? 'asc' : 'desc'); }
  };

  const filterAndSort = (assets: GlobalAsset[]) => {
    let items = [...assets];
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(a =>
        a.nameJa.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q) ||
        a.nameShort.toLowerCase().includes(q)
      );
    }
    if (catFilter !== 'all') items = items.filter(a => a.category === catFilter);
    const dir = sortDir === 'asc' ? 1 : -1;
    items.sort((a, b) => {
      let cmp = 0;
      if (sortCol === 'rank' || sortCol === 'totalValue') cmp = a.totalValue - b.totalValue;
      else if (sortCol === 'name') cmp = a.nameJa.localeCompare(b.nameJa);
      else cmp = a.changes[sortCol as ChangeKey] - b.changes[sortCol as ChangeKey];
      return cmp * dir;
    });
    return items;
  };

  const sortedMain = useMemo(() => filterAndSort(mainAssets), [sortCol, sortDir, search, catFilter, mainAssets]);
  const sortedInst = useMemo(() => filterAndSort(instAssets), [sortCol, sortDir, search, catFilter, instAssets]);

  const arrow = (col: SortColumn) => sortCol !== col ? '' : sortDir === 'asc' ? '\u25B2' : '\u25BC';

  const summaryRow = (assets: GlobalAsset[], label: string, bg: string) => {
    const tv = assets.reduce((s, a) => s + a.totalValue, 0);
    const ch: AssetChanges = { h1: 0, h4: 0, d1: 0, w1: 0, m1: 0, y1: 0 };
    for (const a of assets) for (const k of Object.keys(ch) as ChangeKey[]) ch[k] += a.changes[k];
    return (
      <tr style={{ background: bg, borderTop: `1px solid ${T.borderHi}` }}>
        <td className="atd"></td>
        <td className="atd" style={{ textAlign: 'left', paddingLeft: 8, color: T.text, fontWeight: 700, fontFamily: 'inherit', fontSize: 12 }}>{label}</td>
        <td className="atd" style={{ color: T.text, fontWeight: 700 }}>{fmtT(tv)}</td>
        {CHANGE_COLS.map(c => { const { text, color } = fmtC(ch[c.key]); return <td key={c.key} className="atd" style={{ color, fontWeight: 600, fontSize: 10 }}>{text}</td>; })}
      </tr>
    );
  };

  const renderTable = (assets: GlobalAsset[], startIdx: number) =>
    assets.map((asset, idx) => (
      <motion.tr
        key={asset.id}
        className="ar"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.12, delay: idx * 0.008 }}
        style={{ background: idx % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'rgba(255,255,255,0.035)', height: 34 }}
      >
        <td className="atd" style={{ textAlign: 'center', color: '#555', fontSize: 10 }}>{startIdx + idx + 1}</td>
        <td className="atd" style={{ textAlign: 'left', paddingLeft: 8, fontFamily: 'inherit' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: CATEGORY_META[asset.category].color, flexShrink: 0, marginRight: 3 }} />
            <span style={{ fontSize: 12, marginRight: 2 }}>{asset.emoji}</span>
            <span style={{ color: T.text, fontSize: 12, fontWeight: 500 }}>{asset.nameJa}</span>
          </span>
        </td>
        <td className="atd" style={{ color: T.text, fontWeight: 600 }}>{fmtT(asset.totalValue)}</td>
        {CHANGE_COLS.map(c => { const { text, color } = fmtC(asset.changes[c.key]); return <td key={c.key} className="atd" style={{ color, fontSize: 11 }}>{text}</td>; })}
      </motion.tr>
    ));

  return (
    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, overflow: 'hidden' }}>
      <style>{`
        .ar:hover { background: ${T.cardHover} !important; }
        .ath { padding: 8px 6px; text-align: right; font-size: 11px; font-weight: 600; color: ${T.textMuted}; cursor: pointer; user-select: none; white-space: nowrap; border-bottom: 1px solid ${T.border}; position: sticky; top: 0; background: ${T.surfaceAlt}; z-index: 2; }
        .atd { padding: 5px 6px; text-align: right; font-size: 12px; white-space: nowrap; font-family: 'JetBrains Mono', monospace; }
      `}</style>

      {/* Header + Search */}
      <div style={{ padding: '12px 14px 8px', borderBottom: `1px solid ${T.border}`, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: T.text }}>世界の資産ランキング</span>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="資産を検索..."
          style={{
            background: 'rgba(255,255,255,0.04)', border: `1px solid ${T.border}`, borderRadius: 6,
            padding: '4px 10px', color: T.text, fontSize: 12, outline: 'none', width: 130,
          }}
        />
      </div>

      {/* Category filter chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, padding: '6px 14px 8px' }}>
        {CAT_FILTERS.map(cf => {
          const active = catFilter === cf.key;
          const dotColor = cf.key === 'all' ? T.textMuted : (CATEGORY_META[cf.key as Category]?.color ?? T.textMuted);
          return (
            <button
              key={cf.key}
              onClick={() => setCatFilter(cf.key)}
              style={{
                padding: '2px 8px', borderRadius: 10, border: `1px solid ${active ? 'rgba(255,255,255,0.2)' : T.border}`,
                background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
                color: active ? T.text : T.textMuted, fontSize: 10, fontWeight: active ? 600 : 400,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3,
              }}
            >
              {cf.key !== 'all' && <span style={{ width: 5, height: 5, borderRadius: '50%', background: dotColor }} />}
              {cf.label}
            </button>
          );
        })}
      </div>

      {/* Main asset table */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th className="ath" style={{ width: 30, textAlign: 'center' }} onClick={() => handleSort('rank')}>#</th>
            <th className="ath" style={{ textAlign: 'left', paddingLeft: 8 }} onClick={() => handleSort('name')}>資産{arrow('name')}</th>
            <th className="ath" style={{ width: 60 }} onClick={() => handleSort('totalValue')}>規模{arrow('totalValue')}</th>
            {CHANGE_COLS.map(c => <th key={c.key} className="ath" style={{ width: 50 }} onClick={() => handleSort(c.key)}>{c.label}{arrow(c.key)}</th>)}
          </tr>
        </thead>
        <tbody>
          {renderTable(sortedMain, 0)}
          {sortedMain.length > 0 && summaryRow(mainAssets, '合計', 'rgba(0,212,170,0.03)')}
        </tbody>
      </table>

      {/* Institutional section */}
      {(catFilter === 'all' || catFilter === 'institutional' as Category) && sortedInst.length > 0 && (
        <div style={{ borderTop: `2px solid ${CATEGORY_META.institutional.color}30` }}>
          <div style={{ padding: '10px 14px 6px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: CATEGORY_META.institutional.color }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: CATEGORY_META.institutional.color }}>重複AUM（参考値）</span>
          </div>
          <div style={{ padding: '0 14px 8px', fontSize: 10, color: T.textDim, lineHeight: 1.5 }}>
            ※ 以下の運用資産は上記の株式・債券等の資産クラスと重複しています。合計には含まれません。
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {renderTable(sortedInst, sortedMain.length)}
              {summaryRow(instAssets, '機関投資家AUM合計', 'rgba(99,102,241,0.04)')}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
