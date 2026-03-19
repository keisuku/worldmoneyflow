import { useState, useMemo, useEffect } from 'react';
import type { Period, Region, ViewMode, MarketRegime, NetFlowData, YieldCurvePoint, SpreadData, CalendarEvent, SizeMode } from './types';
import { globalNodes } from './data/globalNodes';
import { japanNodes } from './data/japanNodes';
import { groundLayers } from './data/groundLayers';
import { correlationPairs } from './data/correlations';
import { useMarketData } from './hooks/useMarketData';
import { useFlowCalculation } from './hooks/useFlowCalculation';
import { BubbleMap } from './components/BubbleMap';
import { TopBar } from './components/TopBar';
import { ControlBar } from './components/ControlBar';
import { PricingBanner } from './components/PricingBanner';
import { AIAnalysis } from './components/RightPanel/AIAnalysis';
import { NetFlowBars } from './components/RightPanel/NetFlowBars';
import { YieldCurve } from './components/RightPanel/YieldCurve';
import { Spreads } from './components/RightPanel/Spreads';
import { EventCalendar } from './components/RightPanel/EventCalendar';
import { DataQuality } from './components/RightPanel/DataQuality';

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false,
  );
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    setIsMobile(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [breakpoint]);
  return isMobile;
}

function App() {
  const isMobile = useIsMobile();
  const [period, setPeriod] = useState<Period>('1D');
  const [region, setRegion] = useState<Region>('global');
  const [viewMode, setViewMode] = useState<ViewMode>('bubble');
  const [sizeMode, setSizeMode] = useState<SizeMode>('flow');

  const nodes = useMemo(
    () => (region === 'japan' ? japanNodes : globalNodes),
    [region],
  );

  const { data: marketData } = useMarketData(nodes);
  const flows = useFlowCalculation(marketData);

  const regime: MarketRegime = useMemo(() => {
    const vixData = marketData.get('vix') ?? marketData.get('vix2');
    const vixVal = vixData?.price ?? 16;
    if (vixVal > 25) return { label: 'RISK-OFF', labelJa: 'リスクオフ', color: '#ef4444', description: 'High volatility', type: 'risk-off' as const };
    if (vixVal > 20) return { label: 'CAUTIOUS', labelJa: '警戒', color: '#f59e0b', description: 'Elevated volatility', type: 'risk-off' as const };
    return { label: 'RISK-ON', labelJa: 'リスクオン', color: '#22c55e', description: 'Low volatility', type: 'risk-on' as const };
  }, [marketData]);

  const mockNetFlows: NetFlowData[] = [
    { assetClass: 'equity', label: 'Equity', inflow: 12.3, outflow: 8.1, net: 4.2 },
    { assetClass: 'bond', label: 'Bonds', inflow: 6.8, outflow: 9.2, net: -2.4 },
    { assetClass: 'commodity', label: 'Commodities', inflow: 3.1, outflow: 2.0, net: 1.1 },
    { assetClass: 'crypto', label: 'Crypto', inflow: 2.5, outflow: 1.8, net: 0.7 },
    { assetClass: 'cash', label: 'Cash', inflow: 5.0, outflow: 8.5, net: -3.5 },
  ];

  const mockYieldCurve: YieldCurvePoint[] = [
    { maturity: '3M', yield: 5.3, previousYield: 5.35 },
    { maturity: '2Y', yield: 4.6, previousYield: 4.7 },
    { maturity: '5Y', yield: 4.3, previousYield: 4.4 },
    { maturity: '10Y', yield: 4.25, previousYield: 4.3 },
    { maturity: '30Y', yield: 4.45, previousYield: 4.5 },
  ];

  const mockSpreads: SpreadData[] = [
    { name: 'IG OAS', value: 95, change: -3 },
    { name: 'HY OAS', value: 350, change: 8 },
    { name: '2s10s', value: -40, change: 5 },
    { name: 'TED Spread', value: 25, change: -2 },
  ];

  const mockEvents: CalendarEvent[] = [
    { date: 'Mar 19', title: 'FOMC Decision', titleJa: 'FOMC金利決定', impact: 'high' },
    { date: 'Mar 20', title: 'BOJ Policy', titleJa: '日銀政策決定', impact: 'high' },
    { date: 'Mar 21', title: 'US Jobless Claims', titleJa: '米失業保険申請件数', impact: 'medium' },
    { date: 'Mar 22', title: 'EU PMI Flash', titleJa: '欧州PMI速報', impact: 'medium' },
    { date: 'Mar 25', title: 'US Consumer Confidence', titleJa: '米消費者信頼感', impact: 'low' },
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100dvh',
        background: '#0a0e27',
        color: '#fff',
      }}
    >
      <TopBar
        regime={regime}
        vixValue={marketData.get('vix')?.price ?? marketData.get('vix2')?.price ?? null}
        dxyValue={marketData.get('usd')?.price ?? null}
        marketData={marketData}
      />
      <ControlBar
        period={period}
        region={region}
        viewMode={viewMode}
        sizeMode={sizeMode}
        onPeriodChange={setPeriod}
        onRegionChange={setRegion}
        onViewModeChange={setViewMode}
        onSizeModeChange={setSizeMode}
      />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <BubbleMap
            nodes={nodes}
            flows={flows}
            marketData={marketData}
            groundLayers={groundLayers}
            correlationPairs={correlationPairs}
            regime={regime.type}
            sizeMode={sizeMode}
          />
        </div>

        {!isMobile && (
          <div
            style={{
              width: '280px',
              flexShrink: 0,
              background: 'rgba(13, 17, 23, 0.95)',
              borderLeft: '1px solid rgba(255,255,255,0.05)',
              overflowY: 'auto',
            }}
          >
            <AIAnalysis
              report={{
                summary:
                  'Risk-on sentiment continues with equity inflows outpacing bond demand. Watch FOMC decision for potential regime shift.',
                keyFlows: [
                  'Bonds → Equity rotation accelerating',
                  'Cash leaving money market funds',
                  'Crypto seeing fresh inflows',
                ],
                risks: [
                  'Yield curve inversion deepening',
                  'HY spreads widening',
                ],
                opportunities: [],
                generatedAt: Date.now(),
              }}
            />
            <NetFlowBars flows={mockNetFlows} />
            <YieldCurve data={mockYieldCurve} />
            <Spreads data={mockSpreads} />
            <EventCalendar events={mockEvents} />
            <DataQuality
              totalNodes={nodes.length}
              activeNodes={marketData.size}
              lastUpdate={Date.now()}
            />
          </div>
        )}
      </div>

      <PricingBanner />
    </div>
  );
}

export default App;
