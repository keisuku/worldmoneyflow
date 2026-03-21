import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GLOBAL_ASSETS, CATEGORY_META, ASSET_POOLS, type Category } from '../data/globalAssets';
import { regimeData } from '../data/mockFlowData';
import { KEY_EVENTS, ASSET_INSIGHTS, CATEGORY_SUMMARIES, DEFAULT_OPEN_CATS } from '../data/marketInsights';
import { T, REGIME_JA, DATA_TIMESTAMP } from '../theme';

// ─── Helpers ───
function fmtT(v: number) { return v >= 1 ? `$${v.toFixed(1)}T` : `$${(v * 1000).toFixed(0)}B`; }
function fmtB(v: number) { const s = v >= 0 ? '+' : ''; return Math.abs(v) >= 1000 ? `${s}${(v / 1000).toFixed(1)}T` : `${s}${v.toFixed(0)}B`; }

const SIGNAL_CONF = {
  bullish: { text: '強気', color: T.positive, bg: 'rgba(0,212,170,0.1)' },
  bearish: { text: '弱気', color: T.negative, bg: 'rgba(239,68,68,0.1)' },
  neutral: { text: '中立', color: T.textSec, bg: 'rgba(148,163,184,0.08)' },
};

const EVENT_BORDER = { warning: T.caution, positive: T.positive, info: '#3b82f6' };

const CAT_ORDER: Category[] = ['equities', 'bonds', 'real-estate', 'gold', 'crypto', 'private', 'institutional'];

// ─── Regime overview ───
function getOverview(): string {
  const s = regimeData.score;
  if (s < 30) return 'マーケットは強いリスクオフ。株式→債券・金・現金へ急速な資金移動。VIXは高止まり、クレジットスプレッド拡大。守りのポジショニングが求められる局面。';
  if (s < 50) return 'マーケットは「慎重」モード。BofA FMS調査では株式配分が2023年11月以来の低水準に低下。キャッシュ比率4.1%に上昇。金が「最も混雑したトレード」（35%）。米国株からの資金流出が欧州・新興国へ向かう「大回転」が進行中。';
  if (s < 70) return 'マーケットは中立的。リスク資産と安全資産の間で資金が均衡。次の材料（中銀政策、経済指標）を見極める局面。';
  return 'マーケットはリスクオン。リスク資産への配分が積極化。株式・暗号資産に資金流入。';
}

// ─── Component ───
export default function MarketInsights() {
  const [expanded, setExpanded] = useState<Set<Category>>(new Set(DEFAULT_OPEN_CATS));
  const toggle = (cat: Category) => setExpanded(prev => {
    const next = new Set(prev);
    next.has(cat) ? next.delete(cat) : next.add(cat);
    return next;
  });

  const score = regimeData.score;
  const regimeColor = T.regime[regimeData.label] ?? T.caution;

  // Metrics
  const totalVal = ASSET_POOLS.reduce((s, a) => s + a.totalValue, 0);
  const eqWeek = GLOBAL_ASSETS.filter(a => a.category === 'equities').reduce((s, a) => s + a.changes.w1, 0);
  const bondWeek = GLOBAL_ASSETS.filter(a => a.category === 'bonds').reduce((s, a) => s + a.changes.w1, 0);
  const goldWeek = GLOBAL_ASSETS.filter(a => a.category === 'gold').reduce((s, a) => s + a.changes.w1, 0);

  const metrics = [
    { label: '世界資産総額', value: `$${totalVal.toFixed(0)}T`, color: T.text },
    { label: 'VIX', value: `${regimeData.vix}`, color: regimeData.vix > 20 ? T.caution : T.positive },
    { label: '株式 週間', value: fmtB(eqWeek), color: eqWeek >= 0 ? T.positive : T.negative },
    { label: '債券 週間', value: fmtB(bondWeek), color: bondWeek >= 0 ? T.positive : T.negative },
    { label: '金 週間', value: fmtB(goldWeek), color: goldWeek >= 0 ? T.positive : T.negative },
    { label: '流動性', value: `$${regimeData.globalLiquidity}T`, color: T.text },
  ];

  return (
    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, overflow: 'hidden' }}>
      {/* Section header */}
      <div style={{ padding: '14px 14px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: T.text }}>市場解説・動向分析</span>
        <span style={{ fontSize: 9, color: T.textDim }}>{DATA_TIMESTAMP}</span>
      </div>

      {/* ─── Hero summary card ─── */}
      <div style={{
        margin: '10px 10px 8px', padding: '14px', borderRadius: 10,
        background: 'rgba(255,255,255,0.025)',
        border: `1px solid ${regimeColor}25`,
        borderLeft: `3px solid ${regimeColor}`,
      }}>
        {/* Regime bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>全体総括</span>
          <span style={{
            padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700,
            color: regimeColor, background: `${regimeColor}15`, border: `1px solid ${regimeColor}30`,
          }}>
            {REGIME_JA[regimeData.label] ?? regimeData.label} ({score}/100)
          </span>
        </div>

        {/* Regime score bar */}
        <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', marginBottom: 10, overflow: 'hidden', position: 'relative' }}>
          <div style={{
            height: '100%', width: `${score}%`, borderRadius: 3,
            background: `linear-gradient(90deg, ${T.negative}, ${T.caution} 50%, ${T.positive})`,
            transition: 'width 0.5s',
          }} />
          <div style={{
            position: 'absolute', left: `${score}%`, top: -2, width: 10, height: 10,
            borderRadius: '50%', background: regimeColor, border: '2px solid #0a0e1a',
            transform: 'translateX(-50%)',
          }} />
        </div>

        {/* Overview text */}
        <p style={{ margin: '0 0 10px', fontSize: 12, lineHeight: 1.7, color: '#cbd5e1' }}>
          {getOverview()}
        </p>

        {/* Key metrics grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 6 }}>
          {metrics.map((m, i) => (
            <div key={i} style={{
              padding: '4px 8px', borderRadius: 6,
              background: 'rgba(255,255,255,0.03)', border: `1px solid ${T.border}`,
            }}>
              <div style={{ fontSize: 8, color: T.textDim, marginBottom: 1 }}>{m.label}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: m.color, fontFamily: 'monospace' }}>{m.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Key Events ─── */}
      <div style={{ padding: '0 10px 8px' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 6, paddingLeft: 4 }}>注目イベント</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {KEY_EVENTS.map((ev, i) => (
            <div key={i} style={{
              padding: '8px 10px', borderRadius: 8,
              background: 'rgba(255,255,255,0.02)',
              borderLeft: `3px solid ${EVENT_BORDER[ev.type]}`,
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.text, marginBottom: 2 }}>{ev.title}</div>
              <div style={{ fontSize: 10, color: T.textSec, lineHeight: 1.5 }}>{ev.detail}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Category Accordion ─── */}
      {CAT_ORDER.map(cat => {
        const meta = CATEGORY_META[cat];
        const assets = GLOBAL_ASSETS.filter(a => a.category === cat);
        const total = assets.reduce((s, a) => s + a.totalValue, 0);
        const weekChange = assets.reduce((s, a) => s + a.changes.w1, 0);
        const isOpen = expanded.has(cat);
        const catSummary = CATEGORY_SUMMARIES[cat];

        return (
          <div key={cat} style={{ borderTop: `1px solid ${T.border}` }}>
            {/* Accordion header */}
            <button
              onClick={() => toggle(cat)}
              style={{
                width: '100%', padding: '10px 14px', border: 'none', background: 'transparent',
                display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: meta.color, flexShrink: 0 }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: meta.color, flex: 1 }}>{meta.labelJa}</span>
              <span style={{ fontSize: 11, color: T.textSec, fontFamily: 'monospace' }}>{fmtT(total)}</span>
              <span style={{ fontSize: 10, color: weekChange >= 0 ? T.positive : T.negative, fontFamily: 'monospace', minWidth: 50, textAlign: 'right' }}>
                {fmtB(weekChange)}/週
              </span>
              <span style={{ color: T.textMuted, fontSize: 12, transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }}>
                ▼
              </span>
            </button>

            {/* Accordion content */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ overflow: 'hidden' }}
                >
                  {/* Category summary */}
                  {catSummary && (
                    <div style={{ padding: '0 14px 8px 30px', fontSize: 11, color: T.textSec, lineHeight: 1.6 }}>
                      {catSummary}
                    </div>
                  )}

                  {/* Asset cards grid */}
                  <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                    gap: 6, padding: '0 10px 12px',
                  }}>
                    {assets.map(asset => {
                      const insight = ASSET_INSIGHTS[asset.id];
                      if (!insight) return null;
                      const sig = SIGNAL_CONF[insight.signal];
                      const weekPct = asset.totalValue > 0 ? (asset.changes.w1 / (asset.totalValue * 1000)) * 100 : 0;
                      const barWidth = Math.min(50, Math.abs(weekPct) * 30);

                      return (
                        <div key={asset.id} style={{
                          padding: '8px 10px', borderRadius: 8,
                          background: 'rgba(255,255,255,0.02)',
                          border: `1px solid ${T.border}`,
                          transition: 'background 0.15s',
                        }}>
                          {/* Top row */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                            <span style={{ fontSize: 13 }}>{asset.emoji}</span>
                            <span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{asset.nameJa}</span>
                            <span style={{ fontSize: 9, color: T.textDim }}>{asset.nameShort}</span>
                            <span style={{ marginLeft: 'auto', padding: '1px 5px', borderRadius: 3, fontSize: 9, fontWeight: 700, color: sig.color, background: sig.bg }}>
                              {sig.text}
                            </span>
                          </div>

                          {/* Value + change bar */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: T.text, fontFamily: 'monospace' }}>
                              {fmtT(asset.totalValue)}
                            </span>
                            {/* Mini change bar */}
                            <div style={{ flex: 1, height: 4, position: 'relative', borderRadius: 2, background: 'rgba(255,255,255,0.04)' }}>
                              <div style={{ position: 'absolute', left: '50%', top: 0, width: 1, height: '100%', background: 'rgba(255,255,255,0.1)' }} />
                              <div style={{
                                position: 'absolute',
                                [weekPct >= 0 ? 'left' : 'right']: '50%',
                                top: 0, height: '100%',
                                width: `${barWidth}%`,
                                borderRadius: 2,
                                background: weekPct >= 0 ? T.positive : T.negative,
                                opacity: 0.6,
                              }} />
                            </div>
                            <span style={{ fontSize: 9, fontFamily: 'monospace', color: weekPct >= 0 ? T.positive : T.negative, minWidth: 35, textAlign: 'right' }}>
                              {fmtB(asset.changes.w1)}
                            </span>
                          </div>

                          {/* Summary */}
                          <div style={{ fontSize: 10, color: T.textSec, lineHeight: 1.5 }}>
                            {insight.summary}
                          </div>
                          <div style={{ fontSize: 10, color: '#cbd5e1', lineHeight: 1.5, marginTop: 2 }}>
                            {insight.trend}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      {/* Footer */}
      <div style={{ padding: '10px 14px', borderTop: `1px solid ${T.border}`, fontSize: 9, color: T.textDim, lineHeight: 1.5 }}>
        ※ 上記はモックデータに基づく解説であり、投資助言ではありません。
        ソース: Visual Capitalist, Goldman Sachs, Savills, CoinMarketCap, SIFMA, BofA FMS, Thinking Ahead Institute
      </div>
    </div>
  );
}
