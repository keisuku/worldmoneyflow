import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ===== Yahoo Finance Proxy =====
// Yahoo Finance v8 API doesn't support CORS, so we proxy through here

app.get('/api/yahoo/quote', async (req, res) => {
  const symbol = req.query.symbol as string;
  if (!symbol) return res.status(400).json({ error: 'symbol required' });

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=5d&interval=1d`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'CrossFlow/1.0' },
    });
    if (!response.ok) throw new Error(`Yahoo API ${response.status}`);
    const data = await response.json();

    const result = data.chart?.result?.[0];
    if (!result) throw new Error('No data returned');

    const meta = result.meta;
    const closes = result.indicators?.quote?.[0]?.close ?? [];
    const volumes = result.indicators?.quote?.[0]?.volume ?? [];
    const prevClose = meta.chartPreviousClose ?? meta.previousClose ?? closes[closes.length - 2];
    const currentPrice = meta.regularMarketPrice ?? closes[closes.length - 1];
    const change = currentPrice - prevClose;
    const changePercent = prevClose ? (change / prevClose) * 100 : 0;

    // 週次変動計算
    const firstClose = closes[0] ?? currentPrice;
    const weekChange = firstClose ? ((currentPrice - firstClose) / firstClose) * 100 : 0;

    res.json({
      symbol: meta.symbol,
      regularMarketPrice: currentPrice,
      regularMarketChange: change,
      regularMarketChangePercent: changePercent,
      regularMarketVolume: volumes[volumes.length - 1] ?? 0,
      previousClose: prevClose,
      weekChange,
    });
  } catch (err) {
    console.error(`Yahoo quote error [${symbol}]:`, err);
    res.status(502).json({ error: `Failed to fetch ${symbol}` });
  }
});

app.get('/api/yahoo/quotes', async (req, res) => {
  const symbols = (req.query.symbols as string)?.split(',') ?? [];
  if (symbols.length === 0) return res.status(400).json({ error: 'symbols required' });

  try {
    const results = await Promise.allSettled(
      symbols.map(async (symbol) => {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol.trim())}?range=1mo&interval=1d`;
        const response = await fetch(url, {
          headers: { 'User-Agent': 'CrossFlow/1.0' },
        });
        if (!response.ok) throw new Error(`Yahoo API ${response.status}`);
        const data = await response.json();

        const result = data.chart?.result?.[0];
        if (!result) throw new Error('No data');

        const meta = result.meta;
        const closes = result.indicators?.quote?.[0]?.close?.filter((c: number | null) => c !== null) ?? [];
        const volumes = result.indicators?.quote?.[0]?.volume ?? [];
        const prevClose = meta.chartPreviousClose ?? meta.previousClose ?? closes[closes.length - 2];
        const currentPrice = meta.regularMarketPrice ?? closes[closes.length - 1];
        const change = currentPrice - prevClose;
        const changePercent = prevClose ? (change / prevClose) * 100 : 0;

        // 月次変動 (最初の終値 vs 現在)
        const firstClose = closes[0] ?? currentPrice;
        const monthChange = firstClose ? ((currentPrice - firstClose) / firstClose) * 100 : 0;

        // 週次変動 (5営業日前 vs 現在)
        const weekIdx = Math.max(0, closes.length - 6);
        const weekClose = closes[weekIdx] ?? firstClose;
        const weekChange = weekClose ? ((currentPrice - weekClose) / weekClose) * 100 : 0;

        return {
          symbol: meta.symbol ?? symbol.trim(),
          regularMarketPrice: currentPrice,
          regularMarketChange: change,
          regularMarketChangePercent: changePercent,
          regularMarketVolume: volumes[volumes.length - 1] ?? 0,
          previousClose: prevClose,
          weekChange,
          monthChange,
        };
      }),
    );

    const quotes = results
      .filter((r): r is PromiseFulfilledResult<Record<string, unknown>> => r.status === 'fulfilled')
      .map((r) => r.value);

    res.json(quotes);
  } catch (err) {
    console.error('Yahoo quotes error:', err);
    res.status(502).json({ error: 'Failed to fetch quotes' });
  }
});

// ===== FRED API Proxy =====

const FRED_API_KEY = process.env.FRED_API_KEY || 'DEMO_KEY';

app.get('/api/fred/series', async (req, res) => {
  const seriesId = req.query.id as string;
  const limit = parseInt(req.query.limit as string) || 10;
  if (!seriesId) return res.status(400).json({ error: 'id required' });

  try {
    const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${FRED_API_KEY}&file_type=json&sort_order=desc&limit=${limit}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`FRED API ${response.status}`);
    const data = await response.json();

    const observations = (data.observations ?? [])
      .filter((o: { value: string }) => o.value !== '.')
      .map((o: { date: string; value: string }) => ({
        date: o.date,
        value: parseFloat(o.value),
      }));

    res.json(observations);
  } catch (err) {
    console.error(`FRED error [${seriesId}]:`, err);
    res.status(502).json({ error: `Failed to fetch ${seriesId}` });
  }
});

app.get('/api/fred/yield-curve', async (_req, res) => {
  const series = ['DGS1MO', 'DGS3MO', 'DGS6MO', 'DGS1', 'DGS2', 'DGS5', 'DGS10', 'DGS30'];

  try {
    const results = await Promise.allSettled(
      series.map(async (id) => {
        const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${id}&api_key=${FRED_API_KEY}&file_type=json&sort_order=desc&limit=2`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`FRED ${response.status}`);
        const data = await response.json();
        const obs = (data.observations ?? []).filter((o: { value: string }) => o.value !== '.');
        return {
          id,
          current: obs[0] ? parseFloat(obs[0].value) : null,
          previous: obs[1] ? parseFloat(obs[1].value) : null,
        };
      }),
    );

    const curve: Record<string, { current: number | null; previous: number | null }> = {};
    for (const r of results) {
      if (r.status === 'fulfilled' && r.value.current !== null) {
        curve[r.value.id] = { current: r.value.current, previous: r.value.previous };
      }
    }

    res.json(curve);
  } catch (err) {
    console.error('FRED yield curve error:', err);
    res.status(502).json({ error: 'Failed to fetch yield curve' });
  }
});

// ===== Health Check =====

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.listen(PORT, () => {
  console.log(`CrossFlow API server running on port ${PORT}`);
});
