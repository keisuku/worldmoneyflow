/**
 * 価格バナー: 月額¥2,000プラン表示
 */
export function PricingBanner() {
  return (
    <div
      style={{
        padding: '8px 16px',
        background: 'linear-gradient(90deg, rgba(76,175,80,0.15), rgba(33,150,243,0.15))',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#ccc',
      }}
    >
      <span>
        Bloomberg Terminal ¥3M/年 → CrossFlow{' '}
        <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>¥2,000/月</span>
      </span>
      <button
        style={{
          padding: '4px 16px',
          border: '1px solid #4CAF50',
          borderRadius: '4px',
          background: 'transparent',
          color: '#4CAF50',
          cursor: 'pointer',
          fontSize: '11px',
          fontFamily: 'monospace',
        }}
      >
        Start Free Trial
      </button>
    </div>
  );
}
