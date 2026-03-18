/**
 * データ品質管理サービス
 * 各ソースごとにステータスを追跡し、品質スコアを算出
 */

export type DataFreshness = 'live' | 'daily' | 'weekly' | 'stale' | 'mock';

export interface SourceStatus {
  source: string;
  freshness: DataFreshness;
  lastUpdate: number;
  lastError: string | null;
  errorCount: number;
  nodeCount: number;       // このソースが担当するノード数
  successCount: number;    // 正常取得できたノード数
}

export interface DataQualityReport {
  overallScore: number;   // 0-100
  sources: SourceStatus[];
  totalNodes: number;
  liveNodes: number;
  staleness: number;      // 最も古いデータの経過秒数
}

const freshnessScores: Record<DataFreshness, number> = {
  live: 100,
  daily: 80,
  weekly: 50,
  stale: 20,
  mock: 0,
};

export class DataQualityTracker {
  private sources = new Map<string, SourceStatus>();

  registerSource(source: string, nodeCount: number) {
    if (!this.sources.has(source)) {
      this.sources.set(source, {
        source,
        freshness: 'mock',
        lastUpdate: 0,
        lastError: null,
        errorCount: 0,
        nodeCount,
        successCount: 0,
      });
    }
  }

  recordSuccess(source: string, successCount: number) {
    const s = this.sources.get(source);
    if (!s) return;
    s.freshness = 'live';
    s.lastUpdate = Date.now();
    s.lastError = null;
    s.successCount = successCount;
  }

  recordError(source: string, error: string) {
    const s = this.sources.get(source);
    if (!s) return;
    s.lastError = error;
    s.errorCount++;

    // エラー後の経過時間でfreshness判定
    const elapsed = Date.now() - s.lastUpdate;
    if (elapsed > 3600_000) s.freshness = 'stale';
    else if (elapsed > 900_000) s.freshness = 'daily';
  }

  getReport(): DataQualityReport {
    const sources = [...this.sources.values()];
    const totalNodes = sources.reduce((sum, s) => sum + s.nodeCount, 0);
    const liveNodes = sources.reduce((sum, s) => sum + s.successCount, 0);

    // 加重平均スコア
    let weightedScore = 0;
    let totalWeight = 0;
    for (const s of sources) {
      const weight = s.nodeCount;
      weightedScore += freshnessScores[s.freshness] * weight;
      totalWeight += weight;
    }
    const overallScore = totalWeight > 0 ? weightedScore / totalWeight : 0;

    // 最も古いデータ
    const oldestUpdate = Math.min(...sources.map((s) => s.lastUpdate || Date.now()));
    const staleness = Math.round((Date.now() - oldestUpdate) / 1000);

    return { overallScore, sources, totalNodes, liveNodes, staleness };
  }
}

/** シングルトンインスタンス */
export const dataQuality = new DataQualityTracker();
