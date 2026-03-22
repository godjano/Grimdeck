import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';

export default function MonthlyStats() {
  const logs = useLiveQuery(() => db.paintingLogs.toArray()) ?? [];
  const models = useLiveQuery(() => db.models.toArray()) ?? [];

  // Group by month
  const months: Record<string, { sessions: number; }> = {};
  for (const log of logs) {
    const month = new Date(log.timestamp).toISOString().slice(0, 7); // YYYY-MM
    months[month] = months[month] || { sessions: 0 };
    months[month].sessions++;
  }

  const sortedMonths = Object.entries(months).sort(([a], [b]) => b.localeCompare(a)).slice(0, 12);
  const maxSessions = Math.max(...sortedMonths.map(([, v]) => v.sessions), 1);

  // Total stats
  const totalSessions = logs.length;
  const painted = models.filter(m => m.status === 'painted' || m.status === 'based').reduce((s, m) => s + m.quantity, 0);

  const streak = (() => {
    try { const d = JSON.parse(localStorage.getItem('grimdeck_streak') || '{}'); return d.dates?.length || 0; } catch { return 0; }
  })();

  if (totalSessions === 0) return null;

  return (
    <div className="monthly-stats">
      <h3 className="section-title">📈 Painting Stats</h3>
      <div className="monthly-summary">
        <div className="monthly-stat"><span className="monthly-num">{totalSessions}</span><span className="monthly-label">Sessions</span></div>
        <div className="monthly-stat"><span className="monthly-num">{painted}</span><span className="monthly-label">Painted</span></div>
        <div className="monthly-stat"><span className="monthly-num">{streak}</span><span className="monthly-label">Days Active</span></div>
      </div>
      <div className="monthly-chart">
        {sortedMonths.reverse().map(([month, data]) => (
          <div key={month} className="monthly-bar-col">
            <div className="monthly-bar" style={{ height: `${(data.sessions / maxSessions) * 100}%` }} />
            <div className="monthly-bar-label">{new Date(month + '-01').toLocaleDateString(undefined, { month: 'short' })}</div>
            <div className="monthly-bar-val">{data.sessions}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
