import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import GoldIcon from '../GoldIcon';
import type { MiniatureModel, ModelStatus } from '../../types';

const STATUS_ORDER: ModelStatus[] = ['unbuilt', 'built', 'primed', 'wip', 'painted', 'based'];
const STATUS_COLORS: Record<string, string> = {
  unbuilt: '#888', built: '#c4952a', primed: '#ccc', wip: '#f97316', painted: '#e8c040', based: '#1e7331',
};

function daysAgo(timestamp: number): number {
  return Math.floor((Date.now() - timestamp) / 86400000);
}

function formatDays(d: number): string {
  if (d === 0) return 'Today';
  if (d === 1) return 'Yesterday';
  return `${d} days ago`;
}

interface TimelineViewProps {
  models: MiniatureModel[];
  onUpdateStatus: (id: number, status: ModelStatus) => void;
}

export default function TimelineView({ models, onUpdateStatus }: TimelineViewProps) {
  const nav = useNavigate();

  const sorted = useMemo(() => {
    return [...models].sort((a, b) => b.createdAt - a.createdAt);
  }, [models]);

  const oldest = sorted[sorted.length - 1];
  // Group by week
  const weeks = useMemo(() => {
    const groups: { label: string; models: typeof sorted }[] = [];
    let currentWeek: string | null = null;
    sorted.forEach(m => {
      const d = new Date(m.createdAt);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const key = weekStart.toISOString().split('T')[0];
      const label = `Week of ${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      if (key !== currentWeek) {
        currentWeek = key;
        groups.push({ label, models: [] });
      }
      groups[groups.length - 1].models.push(m);
    });
    return groups;
  }, [sorted]);

  // Statistics
  const avgTimeInPile = useMemo(() => {
    const painted = models.filter(m => m.status === 'painted' || m.status === 'based');
    if (painted.length === 0) return null;
    const avg = painted.reduce((s, m) => s + (m.lastPaintedAt ? m.lastPaintedAt - m.createdAt : Date.now() - m.createdAt), 0) / painted.length;
    return Math.round(avg / 86400000);
  }, [models]);

  return (
    <div className="timeline-view">
      {/* Timeline stats bar */}
      <div className="timeline-stats">
        <div className="timeline-stat">
          <GoldIcon name="skull-bones" size={14} />
          <span>Oldest: {oldest ? formatDays(daysAgo(oldest.createdAt)) : '—'}</span>
        </div>
        {avgTimeInPile !== null && (
          <div className="timeline-stat">
            <GoldIcon name="winged-hour" size={14} />
            <span>Avg time to paint: {avgTimeInPile} days</span>
          </div>
        )}
        <div className="timeline-stat">
          <GoldIcon name="figurine" size={14} />
          <span>{models.length} models tracked</span>
        </div>
      </div>

      {/* Timeline entries */}
      <div className="timeline-entries">
        {weeks.map(week => (
          <div key={week.label} className="timeline-week">
            <div className="timeline-week-label">
              <div className="timeline-week-dot" />
              <span>{week.label}</span>
              <span className="timeline-week-count">{week.models.length} model{week.models.length !== 1 ? 's' : ''}</span>
            </div>

            <div className="timeline-week-entries">
              {week.models.map((m, idx) => {
                const days = daysAgo(m.createdAt);
                const statusIdx = STATUS_ORDER.indexOf(m.status);
                const next = statusIdx < STATUS_ORDER.length - 1 ? STATUS_ORDER[statusIdx + 1] : null;

                return (
                  <div
                    key={m.id}
                    className="timeline-entry"
                    style={{ animationDelay: `${idx * 0.05}s` }}
                    onClick={() => nav(`/model/${m.id}`)}
                  >
                    {/* Timeline connector */}
                    <div className="timeline-connector">
                      <div className="timeline-node" style={{ background: STATUS_COLORS[m.status] }} />
                      {idx < week.models.length - 1 && <div className="timeline-line" />}
                    </div>

                    {/* Content */}
                    <div className={`timeline-entry-content ${days > 90 ? 'timeline-entry-old' : ''}`}>
                      <div className="timeline-entry-photo">
                        {m.photoUrl ? (
                          <img src={m.photoUrl} alt={m.name} loading="lazy" />
                        ) : (
                          <GoldIcon name="figurine" size={20} />
                        )}
                      </div>
                      <div className="timeline-entry-info">
                        <div className="timeline-entry-name">{m.name}</div>
                        <div className="timeline-entry-meta">
                          {m.faction}
                          {m.quantity > 1 ? ` · x${m.quantity}` : ''}
                        </div>
                      </div>
                      <div className="timeline-entry-badges">
                        <div className="timeline-badge" style={{ color: STATUS_COLORS[m.status], borderColor: STATUS_COLORS[m.status] }}>
                          {m.status}
                        </div>
                        <div className={`timeline-badge timeline-days-badge ${days > 90 ? 'timeline-days-critical' : days > 30 ? 'timeline-days-warning' : ''}`}>
                          {days === 0 ? 'New' : formatDays(days)}
                        </div>
                      </div>
                      {next && (
                        <button
                          className="timeline-promote-btn"
                          onClick={e => {
                            e.stopPropagation();
                            onUpdateStatus(m.id!, next);
                          }}
                        >
                          →
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
