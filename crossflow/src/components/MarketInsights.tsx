import { GLOBAL_ASSETS, CATEGORY_META, ASSET_POOLS, type Category } from '../data/globalAssets';
import { regimeData } from '../data/mockFlowData';

// ─── Asset commentary data ───
const ASSET_INSIGHTS: Record<string, { summary: string; trend: string; signal: 'bullish' | 'bearish' | 'neutral' }> = {
  // Real Estate
  residential: {
    summary: '世界最大の資産クラス。金利上昇局面で住宅価格に下方圧力がかかっている。',
    trend: '高金利の長期化で住宅ローン需要が低迷。米国・欧州で価格調整が進行中。中国の不動産危機も依然として重荷。',
    signal: 'bearish',
  },
  'commercial-re': {
    summary: 'オフィス空室率が歴史的高水準。リモートワーク定着で構造的な需要減退。',
    trend: '米国オフィス空室率20%超。商業用不動産ローンの借り換えリスクが2026年にピーク。物流施設のみ堅調。',
    signal: 'bearish',
  },
  agricultural: {
    summary: '食料安全保障の観点から長期的に価値が安定。インフレヘッジとして機関投資家の関心が増加。',
    trend: '気候変動リスクと人口増加で長期的には上昇基調。短期的にはコモディティ価格下落の影響。',
    signal: 'neutral',
  },
  reits: {
    summary: '上場不動産投資信託。金利感応度が高く、利下げ期待で反発の兆し。',
    trend: '金利ピークアウト期待はあるもの、オフィス系REITは引き続き弱い。データセンターREITはAI需要で好調。',
    signal: 'neutral',
  },

  // Equities
  'us-eq-mag7': {
    summary: 'Apple, Microsoft, Nvidia等のメガテック7銘柄。AI関連投資の中核。',
    trend: 'AI期待の反動で調整局面入り。バリュエーションの過熱感から利益確定売りが加速。ただし長期成長ストーリーは健在。',
    signal: 'bearish',
  },
  'us-eq-rest': {
    summary: 'Mag7を除く米国株式市場。S&P500の時価総額の約半分を占める。',
    trend: '景気後退懸念で広範な売り。ディフェンシブセクター（ヘルスケア、公益）への資金ローテーションが進行中。',
    signal: 'bearish',
  },
  'asia-eq': {
    summary: '中国・韓国・台湾・インド等のアジア株式市場（日本除く）。',
    trend: '中国の景気刺激策期待で底堅い。インドは成長率鈍化も長期的には有望。台湾は半導体サイクルに左右される。',
    signal: 'neutral',
  },
  'europe-eq': {
    summary: '独DAX、仏CAC等の欧州先進国株式。',
    trend: 'ECBの利下げサイクルが追い風。防衛関連株が地政学リスクで上昇。エネルギーコスト低下も好材料。',
    signal: 'neutral',
  },
  'japan-eq': {
    summary: '日経平均・TOPIX構成銘柄。円安とガバナンス改革が海外投資家を惹きつけている。',
    trend: 'BOJの金融正常化が進行中だが緩やかなペース。企業改革（自社株買い・増配）が評価され海外資金流入が続く。',
    signal: 'neutral',
  },
  'uk-eq': {
    summary: 'FTSE100中心の英国株式。資源・金融セクターのウェイトが高い。',
    trend: 'ポンド安で多国籍企業の業績にプラス。バリュエーションは割安だが成長期待は低い。',
    signal: 'neutral',
  },
  'other-eq': {
    summary: '新興国・フロンティア市場の株式。ブラジル、メキシコ、南アフリカ等。',
    trend: 'ドル安基調が新興国通貨を支援。ただし地政学リスクと資本流出懸念が重荷。',
    signal: 'bearish',
  },

  // Bonds
  'us-treasuries': {
    summary: '世界の安全資産の基軸。リスクオフ局面で最も買われる資産。',
    trend: 'FRBの利下げ期待で債券価格上昇。イールドカーブのフラット化が景気後退を示唆。2年-10年スプレッドは-18bp。',
    signal: 'bullish',
  },
  'us-bonds-other': {
    summary: '投資適格社債と地方債。米国企業の信用力を反映。',
    trend: 'クレジットスプレッドがやや拡大（142bp）。IG格は堅調だがHY（ハイイールド）には警戒感。',
    signal: 'neutral',
  },
  'europe-bonds': {
    summary: 'ドイツ国債（ブンド）を中心とした欧州債券市場。',
    trend: 'ECBは4月に追加利下げ予想。ドイツの財政拡大（防衛費増額）で供給増加懸念も。',
    signal: 'bullish',
  },
  'asia-bonds': {
    summary: '中国国債・韓国国債等のアジア債券。',
    trend: 'PBOCの緩和政策で中国債券は堅調。アジア全体でキャリートレードが活発。',
    signal: 'bullish',
  },
  'other-bonds': {
    summary: '新興国ソブリン債・社債。高利回りだがリスクも高い。',
    trend: 'ドル安でEM債のリターンが改善。ただしアルゼンチン、トルコなど個別リスクは残存。',
    signal: 'neutral',
  },

  // Gold & Commodities
  gold: {
    summary: '究極の安全資産。中央銀行の買い入れが過去最高ペースで継続中。',
    trend: 'BofA調査で「最も混雑したトレード」1位（35%）。中央銀行の脱ドル化需要と地政学リスクで$2,800超え。年初来+13%。',
    signal: 'bullish',
  },
  commodities: {
    summary: '原油・天然ガス・銅・農産物等。景気サイクルに敏感。',
    trend: '原油はOPEC+の減産継続も需要減退懸念で軟調。銅はAI・EV需要で中長期的には強気だが短期は調整。',
    signal: 'bearish',
  },

  // Crypto
  btc: {
    summary: 'デジタルゴールドとしての地位を確立。ETF承認後に機関投資家の参入が加速。',
    trend: 'ビットコインETFへの資金流入は鈍化も継続中。ハルビング後の供給減少効果とマクロ環境の不透明感で方向感なし。',
    signal: 'neutral',
  },
  eth: {
    summary: 'スマートコントラクト基盤。DeFi・NFTのインフラ。',
    trend: 'ETH/BTCレシオが低下傾向。L2の台頭でメインネット手数料収入が減少。Dencunアップグレード後もモメンタム弱い。',
    signal: 'bearish',
  },
  'other-crypto': {
    summary: 'SOL、ADA、DOGE等のアルトコイン。投機的性格が強い。',
    trend: 'リスクオフ局面でBTC以上に下落。ミームコインブームは沈静化。SOLはDeFi活況で相対的に堅調。',
    signal: 'bearish',
  },

  // Private Markets
  'private-equity': {
    summary: 'PE/VCファンド。非上場企業への投資。流動性が低い。',
    trend: 'IPO市場の低迷でエグジットが困難。バリュエーション調整（マークダウン）が進行中。ドライパウダーは潤沢。',
    signal: 'bearish',
  },
  'private-debt': {
    summary: 'プライベートクレジット・インフラ投資。安定的なキャッシュフロー。',
    trend: '高金利環境で変動金利のプライベートクレジットが好調。インフラ投資はESG需要で長期的に拡大基調。',
    signal: 'neutral',
  },

  // Institutional
  'pension-funds': {
    summary: '世界の年金基金の運用資産。長期投資の代表格。',
    trend: '債券比率引き上げとオルタナティブ投資拡大の動き。日本のGPIF（$1.7T）がポートフォリオ見直し中。',
    signal: 'neutral',
  },
  blackrock: {
    summary: '世界最大の資産運用会社。iShares ETFシリーズを運用。',
    trend: 'ETF市場の成長で資金流入続く。プライベートマーケットへの進出を加速（GIPの買収完了）。',
    signal: 'neutral',
  },
  vanguard: {
    summary: 'インデックス投資の先駆者。低コスト運用で個人投資家に人気。',
    trend: 'パッシブ投資への資金シフトが続く。債券ファンドへの流入が顕著。',
    signal: 'neutral',
  },
  swfs: {
    summary: '中東・ノルウェー・シンガポール等の政府系ファンド。',
    trend: 'ノルウェーGPFG（$1.7T）がテック株を削減、欧州防衛株へシフト。サウジPIFはVision2030で多角化投資。',
    signal: 'neutral',
  },
  fidelity: {
    summary: '米国大手運用会社。401(k)プランの最大手プロバイダー。',
    trend: '暗号資産事業を拡大。ビットコインETFの運用で新たな収益源を確保。',
    signal: 'neutral',
  },
  'hedge-funds': {
    summary: 'グローバルヘッジファンド業界。マルチストラテジーが主流。',
    trend: 'シタデル・ミレニアムなど大手は堅調。ロング・ショート戦略はボラティリティ上昇で収益機会拡大。',
    signal: 'neutral',
  },
};

// ─── Market overview text ───
function getMarketOverview(): string {
  const score = regimeData.score;
  if (score < 30) {
    return 'マーケットは強いリスクオフモードに入っています。投資家は株式から債券・金・現金へ急速に資金を移動させており、VIXは高止まり、クレジットスプレッドも拡大しています。守りのポジショニングが求められる局面です。';
  }
  if (score < 50) {
    return '現在のマーケットは「慎重」モードです。BofAファンドマネージャー調査では株式配分が2023年11月以来の低水準に低下。キャッシュ比率は4.1%に上昇し、ファンドマネージャーは守りの姿勢を強めています。金が「最も混雑したトレード」（35%）となり、米国株からの資金流出が欧州・新興国へ向かう「大回転」が進行中です。';
  }
  if (score < 70) {
    return 'マーケットは中立的なポジショニングです。リスク資産と安全資産の間で資金が均衡しており、方向感に欠ける展開が続いています。次の材料（中央銀行の政策決定、経済指標）を見極める局面です。';
  }
  return 'マーケットはリスクオンモードです。投資家はリスク資産への配分を積極的に増やしており、株式・暗号資産に資金が流入しています。';
}

// ─── Signal badge ───
function SignalBadge({ signal }: { signal: 'bullish' | 'bearish' | 'neutral' }) {
  const config = {
    bullish:  { text: '強気', color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
    bearish:  { text: '弱気', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
    neutral:  { text: '中立', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' },
  };
  const c = config[signal];
  return (
    <span style={{
      display: 'inline-block',
      padding: '1px 6px',
      borderRadius: 4,
      fontSize: 10,
      fontWeight: 700,
      color: c.color,
      background: c.bg,
      border: `1px solid ${c.color}25`,
    }}>
      {c.text}
    </span>
  );
}

// ─── Category summary ───
function getCategorySummary(cat: Category): string {
  const meta = CATEGORY_META[cat];
  const assets = GLOBAL_ASSETS.filter(a => a.category === cat);
  const total = assets.reduce((s, a) => s + a.totalValue, 0);
  const weekChange = assets.reduce((s, a) => s + a.changes.w1, 0);
  const sign = weekChange >= 0 ? '+' : '';
  return `${meta.labelJa}全体: $${total.toFixed(1)}T（週間${sign}${weekChange.toFixed(0)}B）`;
}

// ─── Component ───
export default function MarketInsights() {
  const overview = getMarketOverview();

  // Group assets by category for display
  const categoryOrder: Category[] = ['equities', 'bonds', 'real-estate', 'gold', 'crypto', 'private', 'institutional'];
  const grouped = categoryOrder.map(cat => ({
    category: cat,
    meta: CATEGORY_META[cat],
    assets: GLOBAL_ASSETS.filter(a => a.category === cat),
  }));

  // Key stats
  const totalInvestable = ASSET_POOLS.reduce((s, a) => s + a.totalValue, 0);
  const weekFlowBonds = GLOBAL_ASSETS.filter(a => a.category === 'bonds').reduce((s, a) => s + a.changes.w1, 0);
  const weekFlowEquities = GLOBAL_ASSETS.filter(a => a.category === 'equities').reduce((s, a) => s + a.changes.w1, 0);

  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 12,
      overflow: 'hidden',
    }}>
      <style>{`
        .insight-row:hover { background: rgba(255,255,255,0.04) !important; }
      `}</style>

      {/* Header */}
      <div style={{
        padding: '14px 14px 10px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>
          市場解説・動向分析
        </span>
        <span style={{ fontSize: 10, color: '#64748b', marginLeft: 8 }}>
          2026年3月
        </span>
      </div>

      {/* Overall summary card */}
      <div style={{
        margin: '10px 10px 6px',
        padding: '12px 14px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 10,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8,
        }}>
          <span style={{
            fontSize: 13, fontWeight: 700, color: '#f1f5f9',
          }}>
            全体総括
          </span>
          <span style={{
            padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700,
            color: regimeData.score < 40 ? '#ef4444' : regimeData.score < 60 ? '#f59e0b' : '#22c55e',
            background: regimeData.score < 40 ? 'rgba(239,68,68,0.1)' : regimeData.score < 60 ? 'rgba(245,158,11,0.1)' : 'rgba(34,197,94,0.1)',
            border: `1px solid ${regimeData.score < 40 ? '#ef444430' : regimeData.score < 60 ? '#f59e0b30' : '#22c55e30'}`,
          }}>
            リスクスコア {regimeData.score}/100
          </span>
        </div>
        <p style={{
          margin: 0, fontSize: 12, lineHeight: 1.7, color: '#cbd5e1',
        }}>
          {overview}
        </p>

        {/* Key flow metrics */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10,
        }}>
          {[
            { label: '世界資産総額', value: `$${totalInvestable.toFixed(0)}T`, color: '#e2e8f0' },
            { label: '株式→週間', value: `${weekFlowEquities >= 0 ? '+' : ''}${weekFlowEquities.toFixed(0)}B`, color: weekFlowEquities >= 0 ? '#22c55e' : '#ef4444' },
            { label: '債券→週間', value: `+${weekFlowBonds.toFixed(0)}B`, color: '#22c55e' },
            { label: 'VIX', value: `${regimeData.vix}`, color: regimeData.vix > 20 ? '#f59e0b' : '#22c55e' },
            { label: '流動性', value: `$${regimeData.globalLiquidity}T`, color: '#e2e8f0' },
          ].map((m, i) => (
            <div key={i} style={{
              padding: '4px 8px', borderRadius: 6,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{ fontSize: 9, color: '#64748b' }}>{m.label}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: m.color, fontFamily: 'monospace' }}>
                {m.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Per-category sections */}
      {grouped.map(({ category, meta, assets }) => (
        <div key={category} style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          {/* Category header */}
          <div style={{
            padding: '10px 14px 6px',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: meta.color, flexShrink: 0,
            }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: meta.color }}>
              {meta.labelJa}
            </span>
            <span style={{ fontSize: 10, color: '#64748b', fontFamily: 'monospace' }}>
              {getCategorySummary(category)}
            </span>
          </div>

          {/* Asset rows */}
          {assets.map((asset) => {
            const insight = ASSET_INSIGHTS[asset.id];
            if (!insight) return null;
            return (
              <div
                key={asset.id}
                className="insight-row"
                style={{
                  padding: '8px 14px 8px 28px',
                  transition: 'background 0.15s',
                }}
              >
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3,
                }}>
                  <span style={{ fontSize: 13 }}>{asset.emoji}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>
                    {asset.nameJa}
                  </span>
                  <span style={{ fontSize: 10, color: '#64748b' }}>
                    {asset.nameShort}
                  </span>
                  <span style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'monospace' }}>
                    ${asset.totalValue >= 1 ? `${asset.totalValue.toFixed(1)}T` : `${(asset.totalValue * 1000).toFixed(0)}B`}
                  </span>
                  <SignalBadge signal={insight.signal} />
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.5, marginBottom: 2 }}>
                  {insight.summary}
                </div>
                <div style={{ fontSize: 11, color: '#cbd5e1', lineHeight: 1.6 }}>
                  {insight.trend}
                </div>
              </div>
            );
          })}
        </div>
      ))}

      {/* Footer disclaimer */}
      <div style={{
        padding: '10px 14px',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        fontSize: 9, color: '#475569', lineHeight: 1.5,
      }}>
        ※ 上記は2026年3月時点のモックデータに基づく解説です。投資助言ではありません。
        データソース: Visual Capitalist, Goldman Sachs, Savills, CoinMarketCap, SIFMA, BofA FMS, Thinking Ahead Institute
      </div>
    </div>
  );
}
