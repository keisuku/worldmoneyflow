import Header from './components/Header.tsx';
import BubbleMap from './components/BubbleMap.tsx';
import AssetTable from './components/AssetTable.tsx';
import MarketInsights from './components/MarketInsights.tsx';

export default function App() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0e1a',
      color: '#e8eaed',
    }}>
      <Header />
      <main style={{ padding: '0 8px 40px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <BubbleMap />
        <AssetTable />
        <MarketInsights />
      </main>
    </div>
  );
}
