import Header from './components/Header.tsx';
import FlowSankey from './components/FlowSankey.tsx';
import RegimeGauge from './components/RegimeGauge.tsx';
import FlowCards from './components/FlowCards.tsx';
import ETFFlowTable from './components/ETFFlowTable.tsx';
import SectorRotation from './components/SectorRotation.tsx';
import YieldCurve from './components/YieldCurve.tsx';
import CentralBankWatch from './components/CentralBankWatch.tsx';

export default function App() {
  return (
    <div className="dashboard">
      <Header />
      <div className="dashboard-content">
        {/* Main Sankey diagram */}
        <div className="grid-main">
          <FlowSankey />
        </div>

        {/* Right column: Regime + Flow Cards */}
        <div className="grid-right-top">
          <RegimeGauge />
        </div>
        <div className="grid-right-bottom" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <FlowCards />
        </div>

        {/* Bottom row */}
        <div className="grid-bottom-left">
          <ETFFlowTable />
        </div>
        <div className="grid-bottom-center">
          <SectorRotation />
          <YieldCurve />
        </div>
        <div className="grid-bottom-right">
          <CentralBankWatch />
        </div>
      </div>
    </div>
  );
}
