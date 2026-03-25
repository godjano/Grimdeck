import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { db } from '../db';
import type { ModelStatus } from '../types';
import GoldIcon from '../components/GoldIcon';
import ProjectGenerator from '../components/ProjectGenerator';
import PageBanner from '../components/PageBanner';

const GREY_STATUSES: ModelStatus[] = ['unbuilt', 'built', 'primed'];

export default function GreyPile() {
  const models = useLiveQuery(() => db.models.toArray()) ?? [];
  const nav = useNavigate();
  const [sortBy, setSortBy] = useState<'status' | 'faction' | 'date'>('status');
  const [view, setView] = useState<'cards' | 'compact' | 'kanban'>('compact');
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  const allModels = models.filter(m => !m.wishlist);
  const greyModels = allModels.filter(m => GREY_STATUSES.includes(m.status));
  const wipModels = allModels.filter(m => m.status === 'wip');
  const totalGrey = greyModels.reduce((s, m) => s + m.quantity, 0);
  const totalWip = wipModels.reduce((s, m) => s + m.quantity, 0);
  const totalPainted = allModels.filter(m => m.status === 'painted' || m.status === 'based').reduce((s, m) => s + m.quantity, 0);
  const totalAll = allModels.reduce((s, m) => s + m.quantity, 0);
  const pctDone = totalAll > 0 ? Math.round((totalPainted / totalAll) * 100) : 0;

  // Estimated time (rough: 2hrs per 5 minis)
  const estHours = Math.round((totalGrey / 5) * 2);

  const updateStatus = async (id: number, status: ModelStatus) => {
    await db.models.update(id, { status });
  };

  // Group models
  const getGroups = () => {
    if (sortBy === 'faction') {
      const factions: Record<string, typeof greyModels> = {};
      greyModels.forEach(m => { (factions[m.faction] ??= []).push(m); });
      return Object.entries(factions).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => ({ label: k, count: v.reduce((s, m) => s + m.quantity, 0), models: v }));
    }
    if (sortBy === 'date') {
      return [{ label: 'Oldest first (longest in the pile)', count: totalGrey, models: [...greyModels].sort((a, b) => a.createdAt - b.createdAt) }];
    }
    return GREY_STATUSES.map(s => ({
      label: s, count: greyModels.filter(m => m.status === s).reduce((sum, m) => sum + m.quantity, 0),
      models: greyModels.filter(m => m.status === s),
    })).filter(g => g.models.length > 0);
  };

  const groups = getGroups();

  return (
    <div>
      <PageBanner title="The Pile of Grey" subtitle="Face your shame — promote through the pipeline" icon="skull" />

      {totalGrey === 0 && totalWip === 0 ? (
        <div className="empty">
          <span className="empty-icon"><GoldIcon name="medal" size={48} /></span>
          <p className="empty-text">Your pile is empty! You absolute legend.</p>
        </div>
      ) : (
        <>
          {/* Shame Dashboard */}
          <div className="shame-dashboard">
            <div className="shame-main">
              <div className="shame-number">{totalGrey}</div>
              <div className="shame-label">unpainted minis</div>
              {estHours > 0 && <div className="shame-estimate">~{estHours} hours of painting ahead</div>}
            </div>
            <div className="shame-ring">
              <svg viewBox="0 0 120 120" className="shame-svg">
                <circle cx="60" cy="60" r="52" fill="none" stroke="var(--surface3)" strokeWidth="8" />
                <circle cx="60" cy="60" r="52" fill="none" stroke="var(--success)" strokeWidth="8"
                  strokeDasharray={`${pctDone * 3.27} ${327 - pctDone * 3.27}`}
                  strokeDashoffset="82" strokeLinecap="round" />
              </svg>
              <div className="shame-ring-text">
                <div className="shame-ring-pct">{pctDone}%</div>
                <div className="shame-ring-label">painted</div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grey-stats">
            <div className="grey-stat">
              <div className="grey-stat-icon"><GoldIcon name="models" size={20} /></div>
              <div className="grey-stat-num">{greyModels.filter(m => m.status === 'unbuilt').reduce((s, m) => s + m.quantity, 0)}</div>
              <div className="grey-stat-label">Unbuilt</div>
            </div>
            <div className="grey-stat">
              <div className="grey-stat-icon"><GoldIcon name="campaigns" size={20} /></div>
              <div className="grey-stat-num">{greyModels.filter(m => m.status === 'built').reduce((s, m) => s + m.quantity, 0)}</div>
              <div className="grey-stat-label">Built</div>
            </div>
            <div className="grey-stat">
              <div className="grey-stat-icon"><GoldIcon name="skull" size={20} /></div>
              <div className="grey-stat-num">{greyModels.filter(m => m.status === 'primed').reduce((s, m) => s + m.quantity, 0)}</div>
              <div className="grey-stat-label">Primed</div>
            </div>
            <div className="grey-stat grey-stat-wip">
              <div className="grey-stat-icon"><GoldIcon name="paints" size={20} /></div>
              <div className="grey-stat-num">{totalWip}</div>
              <div className="grey-stat-label">WIP</div>
            </div>
            <div className="grey-stat grey-stat-done">
              <div className="grey-stat-icon"><GoldIcon name="medal" size={20} /></div>
              <div className="grey-stat-num">{totalPainted}</div>
              <div className="grey-stat-label">Done</div>
            </div>
          </div>

          {/* Currently on the desk */}
          {wipModels.length > 0 && (
            <div className="grey-section">
              <h3 className="section-title"><GoldIcon name="paints" size={18} /> Currently Painting</h3>
              <div className="wip-strip">
                {wipModels.map(m => (
                  <div key={m.id} className="wip-mini" onClick={() => nav(`/model/${m.id}`)}>
                    {m.photoUrl ? <img src={m.photoUrl} alt={m.name} /> : <GoldIcon name="paints" size={20} />}
                    <div className="wip-mini-name">{m.name}</div>
                    <button className="btn btn-sm btn-ghost" onClick={e => { e.stopPropagation(); updateStatus(m.id!, 'painted'); }}>✓ Done</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Project Generator */}
          <ProjectGenerator />

          {/* Sort & View controls */}
          <div className="grey-controls">
            <div className="grey-sort">
              <span className="grey-sort-label">Sort by:</span>
              <button className={`btn btn-sm ${sortBy === 'status' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setSortBy('status')}>Status</button>
              <button className={`btn btn-sm ${sortBy === 'faction' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setSortBy('faction')}>Faction</button>
              <button className={`btn btn-sm ${sortBy === 'date' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setSortBy('date')}>Oldest</button>
            </div>
            <div className="view-toggle">
              <button className={`view-btn ${view === 'cards' ? 'active' : ''}`} onClick={() => setView('cards')}>☰</button>
              <button className={`view-btn ${view === 'compact' ? 'active' : ''}`} onClick={() => setView('compact')}>▤</button>
              <button className={`view-btn ${view === 'kanban' ? 'active' : ''}`} onClick={() => setView('kanban')}>▥</button>
            </div>
          </div>

          {/* Model Groups */}
          {view === 'kanban' ? (
            <div className="kanban">
              {(['unbuilt', 'built', 'primed', 'wip'] as const).map(status => {
                const col = models.filter(m => m.status === status);
                return (
                  <div key={status} className="kanban-col">
                    <div className="kanban-col-title">{status} ({col.length})</div>
                    {col.map(m => (
                      <div key={m.id} className="kanban-card" onClick={() => nav(`/model/${m.id}`)}>
                        <div className="kanban-card-name">{m.name}</div>
                        <div className="kanban-card-faction">{m.faction}</div>
                        <button className="btn btn-sm btn-ghost" style={{ width: '100%', marginTop: 4, fontSize: '0.7rem' }} onClick={e => {
                          e.stopPropagation();
                          const next = status === 'unbuilt' ? 'built' : status === 'built' ? 'primed' : 'wip';
                          updateStatus(m.id!, next);
                        }}>→ {status === 'unbuilt' ? 'built' : status === 'built' ? 'primed' : status === 'primed' ? 'wip' : 'painted'}</button>
                      </div>
                    ))}
                    {col.length === 0 && <div className="kanban-count">Empty</div>}
                  </div>
                );
              })}
            </div>
          ) : groups.map(group => group.models.length > 0 && (
            <div key={group.label} className="grey-section">
              <div className="group-header" onClick={() => setExpandedGroup(expandedGroup === group.label ? null : group.label)} style={{ cursor: 'pointer' }}>
                <span style={{ color: 'var(--text-dim)', fontSize: '0.7rem', marginRight: 6 }}>{expandedGroup === group.label ? '▾' : '▸'}</span>
                <span className={`status status-${group.label}`}>{group.label}</span>
                <span className="group-count">{group.count} minis · {group.models.length} units</span>
              </div>
              {expandedGroup === group.label && (view === 'compact' ? (
                <div className="grey-compact">
                  {group.models.map(m => (
                    <div key={m.id} className="grey-compact-item" onClick={() => nav(`/model/${m.id}`)}>
                      <span className="grey-compact-name">{m.name}</span>
                      <span className="grey-compact-qty">{m.quantity > 1 ? `×${m.quantity}` : ''}</span>
                      <span className="grey-compact-faction">{m.faction}</span>
                      <button className="btn btn-sm btn-ghost" onClick={e => { e.stopPropagation(); updateStatus(m.id!, m.status === 'unbuilt' ? 'built' : m.status === 'built' ? 'primed' : 'wip'); }}>→</button>
                    </div>
                  ))}
                </div>
              ) : (
                group.models.map(m => (
                  <div className="card" key={m.id} onClick={() => nav(`/model/${m.id}`)} style={{ cursor: 'pointer' }}>
                    {m.photoUrl && <img src={m.photoUrl} alt={m.name} className="card-photo" />}
                    <div className="card-body">
                      <div className="card-title">{m.name} {m.quantity > 1 && <span className="qty-badge">×{m.quantity}</span>}</div>
                      <div className="card-sub">{m.faction}{m.unitType ? ` · ${m.unitType}` : ''}</div>
                    </div>
                    <div className="promote-buttons">
                      {m.status === 'unbuilt' && <button className="btn btn-sm btn-ghost" onClick={e => { e.stopPropagation(); updateStatus(m.id!, 'built'); }}>Build</button>}
                      {(m.status === 'unbuilt' || m.status === 'built') && <button className="btn btn-sm btn-ghost" onClick={e => { e.stopPropagation(); updateStatus(m.id!, 'primed'); }}>Prime</button>}
                      <button className="btn btn-sm btn-primary" onClick={e => { e.stopPropagation(); updateStatus(m.id!, 'wip'); }}>Paint</button>
                    </div>
                  </div>
                ))
              ))}
            </div>
          ))}

          {/* Motivational footer */}
          <div className="grey-motivation">
            {totalGrey <= 10 ? "Almost there! You can see the finish line! 🏁" :
             totalGrey <= 30 ? "Solid progress. Keep the momentum going! " :
             totalGrey <= 100 ? "A worthy challenge. One model at a time. " :
             "The pile is vast... but so is your determination. "}
          </div>
        </>
      )}
    </div>
  );
}
