import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GoldIcon from '../GoldIcon';
import type { MiniatureModel, ModelStatus } from '../../types';

const STATUS_COLORS: Record<string, string> = {
  unbuilt: '#888', built: '#c4952a', primed: '#ccc', wip: '#f97316', painted: '#e8c040', based: '#1e7331',
};

interface GalleryViewProps {
  models: MiniatureModel[];
  onUpdateStatus: (id: number, status: ModelStatus) => void;
}

export default function GalleryView({ models, onUpdateStatus }: GalleryViewProps) {
  const nav = useNavigate();
  const [filter, setFilter] = useState<'all' | ModelStatus>('all');
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const filtered = filter === 'all' ? models : models.filter(m => m.status === filter);
  const statuses: ModelStatus[] = ['unbuilt', 'built', 'primed', 'wip', 'painted', 'based'];

  return (
    <div className="gallery-view">
      {/* Filter bar */}
      <div className="gallery-filters">
        <button className={`gallery-filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
          All ({models.length})
        </button>
        {statuses.map(s => {
          const count = models.filter(m => m.status === s).length;
          if (count === 0) return null;
          return (
            <button
              key={s}
              className={`gallery-filter-btn ${filter === s ? 'active' : ''}`}
              style={{ '--filter-color': STATUS_COLORS[s] } as React.CSSProperties}
              onClick={() => setFilter(s)}
            >
              <span className="gallery-filter-dot" style={{ background: STATUS_COLORS[s] }} />
              {s} ({count})
            </button>
          );
        })}
      </div>

      {/* Gallery grid */}
      <div className="gallery-grid">
        {filtered.map((m, idx) => (
          <div
            key={m.id}
            className="gallery-card"
            style={{ animationDelay: `${idx * 0.05}s` }}
            onMouseEnter={() => setHoveredId(m.id!)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => nav(`/model/${m.id}`)}
          >
            {/* Photo */}
            <div className="gallery-card-photo">
              {m.photoUrl ? (
                <img src={m.photoUrl} alt={m.name} loading="lazy" />
              ) : (
                <div className="gallery-card-photo-empty">
                  <GoldIcon name="figurine" size={36} />
                </div>
              )}

              {/* Status badge */}
              <div className="gallery-card-status" style={{ background: STATUS_COLORS[m.status] }}>
                {m.status}
              </div>

              {/* Hover overlay */}
              {hoveredId === m.id && (
                <div className="gallery-card-overlay">
                  <div className="gallery-card-overlay-name">{m.name}</div>
                  <div className="gallery-card-overlay-faction">{m.faction}</div>
                  {m.quantity > 1 && <div className="gallery-card-overlay-qty">x{m.quantity}</div>}
                  <div className="gallery-card-overlay-hint">Click to view</div>
                </div>
              )}
            </div>

            {/* Card footer */}
            <div className="gallery-card-footer">
              <div className="gallery-card-name">{m.name}</div>
              <div className="gallery-card-faction">{m.faction}</div>
            </div>

            {/* Quick promote */}
            {(m.status === 'unbuilt' || m.status === 'built' || m.status === 'primed' || m.status === 'wip') && (
              <button
                className="gallery-promote-btn"
                onClick={e => {
                  e.stopPropagation();
                  const next = m.status === 'unbuilt' ? 'built' : m.status === 'built' ? 'primed' : m.status === 'primed' ? 'wip' : 'painted';
                  onUpdateStatus(m.id!, next);
                }}
              >
                → {m.status === 'unbuilt' ? 'Build' : m.status === 'built' ? 'Prime' : m.status === 'primed' ? 'Paint' : 'Done'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
