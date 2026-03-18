import type { CalendarEvent } from '../../types';

interface EventCalendarProps {
  events: CalendarEvent[];
}

const impactColors = {
  high: '#F44336',
  medium: '#FF9800',
  low: '#4CAF50',
};

/**
 * 経済イベントカレンダー
 */
export function EventCalendar({ events }: EventCalendarProps) {
  return (
    <div style={containerStyle}>
      <h3 style={titleStyle}>Events</h3>
      {events.slice(0, 5).map((e, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '3px 0',
            fontSize: '10px',
            borderBottom: '1px solid rgba(255,255,255,0.03)',
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: impactColors[e.impact],
              flexShrink: 0,
            }}
          />
          <span style={{ color: '#666', flexShrink: 0 }}>{e.date}</span>
          <span style={{ color: '#aaa' }}>{e.title}</span>
        </div>
      ))}
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  padding: '12px',
  borderBottom: '1px solid rgba(255,255,255,0.05)',
};

const titleStyle: React.CSSProperties = {
  margin: '0 0 8px 0',
  fontSize: '12px',
  color: '#fff',
  fontFamily: 'monospace',
  letterSpacing: '1px',
};
