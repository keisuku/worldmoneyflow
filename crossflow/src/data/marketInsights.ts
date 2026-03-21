import type { Category } from './globalAssets';

export interface AssetInsight {
  summary: string;
  trend: string;
  signal: 'bullish' | 'bearish' | 'neutral';
}

export interface KeyEvent {
  title: string;
  detail: string;
  type: 'warning' | 'positive' | 'info';
}

export const KEY_EVENTS: KeyEvent[] = [
  {
    title: 'FRB 4.25-4.50%据え置き（3/19）',
    detail: '市場は年内2回の利下げを織り込み。パウエル議長は「忍耐強く」と発言、早期利下げ期待を牽制。',
    type: 'info',
  },
  {
    title: '金が最も混雑したトレード（35%）',
    detail: 'BofAファンドマネージャー調査。ロングセミコンダクター（35%）と並び首位。中央銀行の脱ドル化買いが継続。',
    type: 'warning',
  },
  {
    title: '株式配分が2023年11月以来の低水準',
    detail: '機関投資家がキャッシュ比率を4.1%に引き上げ。米国株→欧州・新興国への「大回転」が進行中。',
    type: 'warning',
  },
];

export const DEFAULT_OPEN_CATS: Category[] = ['equities', 'bonds', 'gold'];

export const CATEGORY_SUMMARIES: Partial<Record<Category, string>> = {
  equities: '景気後退懸念で全面安。Mag7のAI期待反動とファンドマネージャーの配分削減が重なり、特に米国株が大幅流出。欧州は防衛費増額が好材料だが、グローバルなリスクオフに抗えず。',
  bonds: '典型的なフライト・トゥ・クオリティ。FRB利下げ期待と安全資産需要で米国債を中心に全面的に資金流入。イールドカーブのフラット化は景気後退を示唆。',
  'real-estate': '金利上昇の長期化で全セクター下落。特に商業不動産はリモートワーク定着とローン借り換えリスクで二重苦。',
  gold: '中央銀行の記録的な買い入れと地政学リスクで$2,800超え。コモディティはOPEC+減産も需要減退懸念で軟調。',
  crypto: 'BTCはETF資金流入で底堅いが方向感なし。アルトコインはリスクオフで売られやすい。',
  private: 'IPO市場低迷でエグジット困難。プライベートクレジットは高金利で変動金利ローン需要が底堅い。',
  institutional: '年金基金は債券シフト、SWFは欧州防衛株へローテーション。大手運用会社はETF資金流入でAUM堅調だが市場下落で目減り。',
};

export const ASSET_INSIGHTS: Record<string, AssetInsight> = {
  residential: {
    summary: '世界最大の資産クラス（$287T）。金利上昇で住宅ローン需要低迷。',
    trend: '米国・欧州で価格調整中。中国不動産危機も重荷。',
    signal: 'bearish',
  },
  'commercial-re': {
    summary: 'オフィス空室率が歴史的高水準（米国20%超）。',
    trend: 'ローン借り換えリスクが2026年にピーク。物流施設のみ堅調。',
    signal: 'bearish',
  },
  agricultural: {
    summary: '食料安全保障で長期安定。インフレヘッジとして注目。',
    trend: '気候変動リスクと人口増加で長期上昇基調。',
    signal: 'neutral',
  },
  reits: {
    summary: '金利感応度が高い上場不動産投信。',
    trend: 'オフィス系弱い。データセンターREITはAI需要で好調。',
    signal: 'neutral',
  },
  'us-eq-mag7': {
    summary: 'Apple, MSFT, NVDA等メガテック7銘柄。AI投資の中核。',
    trend: 'AI期待の反動で調整局面。バリュエーション過熱感から利確売り加速。',
    signal: 'bearish',
  },
  'us-eq-rest': {
    summary: 'Mag7を除く米国株。S&P500時価総額の約半分。',
    trend: 'ディフェンシブ（ヘルスケア、公益）へのローテーション進行中。',
    signal: 'bearish',
  },
  'asia-eq': {
    summary: '中国・韓国・台湾・インド等（日本除く）。',
    trend: '中国の景気刺激策で底堅い。台湾は半導体サイクル次第。',
    signal: 'neutral',
  },
  'europe-eq': {
    summary: 'DAX, CAC等の欧州先進国株式。',
    trend: 'ECB利下げ＋防衛関連株上昇。エネルギーコスト低下も好材料。',
    signal: 'neutral',
  },
  'japan-eq': {
    summary: '日経平均・TOPIX。円安とガバナンス改革が追い風。',
    trend: 'BOJ正常化は緩やか。自社株買い・増配で海外資金流入続く。',
    signal: 'neutral',
  },
  'uk-eq': {
    summary: 'FTSE100。資源・金融セクター中心。',
    trend: 'ポンド安が多国籍企業にプラス。割安だが成長期待は低い。',
    signal: 'neutral',
  },
  'other-eq': {
    summary: '新興国・フロンティア株式。',
    trend: 'ドル安が通貨を支援。地政学リスクと資本流出懸念が重荷。',
    signal: 'bearish',
  },
  'us-treasuries': {
    summary: '世界の安全資産の基軸。リスクオフで最も買われる。',
    trend: 'FRB利下げ期待で価格上昇。2年-10年スプレッド-18bp。',
    signal: 'bullish',
  },
  'us-bonds-other': {
    summary: '投資適格社債と地方債。',
    trend: 'スプレッド142bpにやや拡大。IG格は堅調、HYに警戒感。',
    signal: 'neutral',
  },
  'europe-bonds': {
    summary: 'ブンド中心の欧州債券。',
    trend: 'ECB 4月追加利下げ予想。防衛費増で供給増加懸念も。',
    signal: 'bullish',
  },
  'asia-bonds': {
    summary: '中国国債・韓国国債等。',
    trend: 'PBOC緩和で中国債堅調。アジア全体でキャリートレード活発。',
    signal: 'bullish',
  },
  'other-bonds': {
    summary: '新興国ソブリン・社債。高利回りだが高リスク。',
    trend: 'ドル安でEM債リターン改善。個別国リスクは残存。',
    signal: 'neutral',
  },
  gold: {
    summary: '究極の安全資産。中央銀行買い入れが過去最高ペース。',
    trend: '「最も混雑したトレード」1位（35%）。脱ドル化需要で$2,800超。',
    signal: 'bullish',
  },
  commodities: {
    summary: '原油・天然ガス・銅・農産物。景気敏感。',
    trend: 'OPEC+減産も需要減退で原油軟調。銅はAI/EV需要で中長期強気。',
    signal: 'bearish',
  },
  btc: {
    summary: 'デジタルゴールド。ETF承認で機関投資家参入加速。',
    trend: 'ETF流入鈍化も継続。ハルビング後の供給減＋マクロ不透明感。',
    signal: 'neutral',
  },
  eth: {
    summary: 'スマートコントラクト基盤。DeFi/NFTインフラ。',
    trend: 'ETH/BTCレシオ低下。L2台頭でメインネット手数料減。',
    signal: 'bearish',
  },
  'other-crypto': {
    summary: 'SOL, ADA, DOGE等アルトコイン。投機性が強い。',
    trend: 'リスクオフでBTC以上に下落。SOLのみDeFi活況で相対堅調。',
    signal: 'bearish',
  },
  'private-equity': {
    summary: 'PE/VCファンド。非上場企業投資。',
    trend: 'IPO低迷でエグジット困難。バリュエーション調整中。ドライパウダーは潤沢。',
    signal: 'bearish',
  },
  'private-debt': {
    summary: 'プライベートクレジット・インフラ投資。',
    trend: '高金利で変動金利クレジット好調。ESG需要でインフラ拡大。',
    signal: 'neutral',
  },
  'pension-funds': {
    summary: '世界の年金基金AUM（GPIF $1.7T含む）。',
    trend: '債券比率引き上げ。オルタナティブ投資拡大の動き。',
    signal: 'neutral',
  },
  blackrock: {
    summary: '世界最大の資産運用会社（iShares）。',
    trend: 'ETF成長で資金流入。GIP買収でプライベートマーケット進出加速。',
    signal: 'neutral',
  },
  vanguard: {
    summary: 'インデックス投資の先駆者。低コスト運用。',
    trend: 'パッシブ投資シフト継続。債券ファンドへの流入顕著。',
    signal: 'neutral',
  },
  swfs: {
    summary: '中東・ノルウェー・シンガポール等の政府系ファンド。',
    trend: 'ノルウェーGPFGがテック株削減、欧州防衛株へシフト。',
    signal: 'neutral',
  },
  fidelity: {
    summary: '米国大手。401(k)最大手。',
    trend: '暗号資産事業拡大。ビットコインETF運用で新収益源。',
    signal: 'neutral',
  },
  'hedge-funds': {
    summary: 'グローバルHF。マルチストラテジー主流。',
    trend: 'ボラティリティ上昇でL/S戦略に収益機会。大手は堅調。',
    signal: 'neutral',
  },
};
