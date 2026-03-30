import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import GoldIcon from '../components/GoldIcon';
import PageBanner from '../components/PageBanner';

function parseSessionSeconds(text: string): number {
  const m = text.match(/(\d+):(\d+):(\d+)/);
  if (!m) return 0;
  return parseInt(m[1]) * 3600 + parseInt(m[2]) * 60 + parseInt(m[3]);
}

function fmt(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function HobbyStats() {
  const logs = useLiveQuery(() => db.paintingLogs.toArray()) ?? [];
  const models = useLiveQuery(() => db.models.toArray()) ?? [];

  // Parse timer sessions from logs
  const sessions = logs
    .filter(l => l.text.includes('⏱'))
    .map(l => ({ modelId: l.modelId, seconds: parseSessionSeconds(l.text), timestamp: l.timestamp }));

  const totalSeconds = sessions.reduce((s, l) => s + l.seconds, 0);
  const totalSessions = sessions.length;

  // Per-model time
  const modelTime: Record<number, number> = {};
  for (const s of sessions) modelTime[s.modelId] = (modelTime[s.modelId] || 0) + s.seconds;

  const modelTimeList = Object.entries(modelTime)
    .map(([id, secs]) => ({ model: models.find(m => m.id === Number(id)), seconds: secs }))
    .filter(e => e.model)
    .sort((a, b) => b.seconds - a.seconds);

  const avgPerModel = modelTimeList.length > 0 ? totalSeconds / modelTimeList.length : 0;
  const fastest = modelTimeList.length > 0 ? modelTimeList[modelTimeList.length - 1] : null;
  const slowest = modelTimeList.length > 0 ? modelTimeList[0] : null;

  // Monthly breakdown
  const monthly: Record<string, number> = {};
  for (const s of sessions) {
    const d = new Date(s.timestamp);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthly[key] = (monthly[key] || 0) + s.seconds;
  }
  const monthlyList = Object.entries(monthly).sort((a, b) => b[0].localeCompare(a[0]));

  // Weekly streak
  const thisWeek = sessions.filter(s => Date.now() - s.timestamp < 7 * 86400000);
  const thisWeekTotal = thisWeek.reduce((s, l) => s + l.seconds, 0);

  return (
    <div>
      <PageBanner title="Hobby Stats" subtitle="Your painting time tracked" icon="winged-hour" />

      {/* Big stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total Time', value: fmt(totalSeconds), icon: 'winged-hour' },
          { label: 'Sessions', value: String(totalSessions), icon: 'guides' },
          { label: 'Models Tracked', value: String(modelTimeList.length), icon: 'models' },
          { label: 'Avg per Model', value: fmt(avgPerModel), icon: 'gear' },
          { label: 'This Week', value: fmt(thisWeekTotal), icon: 'lightning' },
          { label: 'Avg per Session', value: fmt(totalSessions > 0 ? totalSeconds / totalSessions : 0), icon: 'clock' },
        ].map(s => (
          <div key={s.label} className="stat">
            <div className="stat-num" style={{ fontSize: '1.2rem' }}><GoldIcon name={s.icon} size={16} /> {s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Records */}
      {(fastest || slowest) && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          {slowest && (
            <div className="goal-ring" style={{ flex: 1, minWidth: 200 }}>
              <GoldIcon name="trophy" size={24} />
              <div className="goal-ring-info">
                <div className="goal-ring-title">Most Time Spent</div>
                <div className="goal-ring-sub">{slowest.model!.name} — {fmt(slowest.seconds)}</div>
              </div>
            </div>
          )}
          {fastest && fastest !== slowest && (
            <div className="goal-ring" style={{ flex: 1, minWidth: 200 }}>
              <GoldIcon name="lightning" size={24} />
              <div className="goal-ring-info">
                <div className="goal-ring-title">Speed Painter</div>
                <div className="goal-ring-sub">{fastest.model!.name} — {fmt(fastest.seconds)}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Per-model breakdown */}
      {modelTimeList.length > 0 ? (
        <>
          <h3 style={{ fontFamily: "'Cinzel', serif", color: 'var(--gold)', fontSize: '1rem', marginBottom: 12 }}>Time per Model</h3>
          {modelTimeList.map(({ model: m, seconds: secs }) => (
            <div key={m!.id} className="card" style={{ cursor: 'default' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{m!.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{m!.faction} · {m!.status}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, color: 'var(--gold)', fontSize: '0.95rem' }}>{fmt(secs)}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>{sessions.filter(s => s.modelId === m!.id).length} sessions</div>
              </div>
            </div>
          ))}
        </>
      ) : (
        <div className="md-empty-tab" style={{ marginTop: 40 }}>
          <GoldIcon name="winged-hour" size={32} />
          <p>No painting sessions logged yet</p>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Use the floating timer to track your painting time — it'll show up here.</p>
        </div>
      )}

      {/* Monthly breakdown */}
      {monthlyList.length > 0 && (
        <>
          <h3 style={{ fontFamily: "'Cinzel', serif", color: 'var(--gold)', fontSize: '1rem', margin: '24px 0 12px' }}>Monthly Breakdown</h3>
          {monthlyList.map(([month, secs]) => {
            const maxSecs = Math.max(...monthlyList.map(m => m[1]));
            return (
              <div key={month} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                <span style={{ width: 70, fontSize: '0.78rem', color: 'var(--text-dim)' }}>{month}</span>
                <div style={{ flex: 1, height: 20, background: 'var(--surface2)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${(secs / maxSecs) * 100}%`, height: '100%', background: 'linear-gradient(90deg, var(--gold-dim), var(--gold))', borderRadius: 4 }} />
                </div>
                <span style={{ width: 60, textAlign: 'right', fontSize: '0.78rem', color: 'var(--gold)' }}>{fmt(secs)}</span>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
