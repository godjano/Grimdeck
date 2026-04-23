import { useState, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { db } from '../db';
import type { ModelStatus } from '../types';
import GoldIcon from '../components/GoldIcon';
import ProjectGenerator from '../components/ProjectGenerator';
import PageBanner from '../components/PageBanner';
import PileOverview from '../components/grey-pile/PileOverview';
import PipelineKanban from '../components/grey-pile/PipelineKanban';
import ActiveWorkbench from '../components/grey-pile/ActiveWorkbench';
import GalleryView from '../components/grey-pile/GalleryView';
import TimelineView from '../components/grey-pile/TimelineView';
import { LevelBadge, StreakCounter, AchievementGrid, XPPopup, useGamification } from '../components/grey-pile/GamificationSystem';

const GREY_STATUSES: ModelStatus[] = ['unbuilt', 'built', 'primed'];

type ViewMode = 'pipeline' | 'compact' | 'cards' | 'gallery' | 'timeline';

export default function GreyPile() {
  const models = useLiveQuery(() => db.models.toArray()) ?? [];
  const nav = useNavigate();
  const { addXP, recordPaint, checkAchievements } = useGamification();

  const [sortBy, setSortBy] = useState<'status' | 'faction' | 'date'>('status');
  const [view, setView] = useState<ViewMode>('pipeline');
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [xpPopup, setXpPopup] = useState<{ xp: number; reason: string } | null>(null);
  const [showAchievements, setShowAchievements] = useState(false);

  const allModels = models.filter(m => !m.wishlist);
  const greyModels = allModels.filter(m => GREY_STATUSES.includes(m.status));
  const wipModels = allModels.filter(m => m.status === 'wip');
  const totalGrey = greyModels.reduce((s, m) => s + m.quantity, 0);
  const totalWip = wipModels.reduce((s, m) => s + m.quantity, 0);
  const totalPainted = allModels.filter(m => m.status === 'painted' || m.status === 'based').reduce((s, m) => s + m.quantity, 0);
  const totalAll = allModels.reduce((s, m) => s + m.quantity, 0);

  // Oldest model in pile
  const oldestModel = greyModels.length > 0 ? [...greyModels].sort((a, b) => a.createdAt - b.createdAt)[0] : null;

  // Recent paint count (this month)
  const recentPaintCount = allModels.filter(m => {
    if (m.status !== 'painted' && m.status !== 'based') return false;
    if (!m.lastPaintedAt) return false;
    const d = new Date(m.lastPaintedAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).reduce((s, m) => s + m.quantity, 0);

  const updateStatus = useCallback(async (id: number, status: ModelStatus) => {
    const model = await db.models.get(id);
    if (!model) return;
    const update: any = { status };
    if (status === 'wip' || status === 'painted' || status === 'based') update.lastPaintedAt = Date.now();
    await db.models.update(id, update);

    // Gamification
    if (status === 'painted' || status === 'based') {
      recordPaint(model.createdAt);
      const newXp = status === 'based' ? 50 : 30;
      addXP(newXp, status === 'based' ? 'Model completed & based!' : 'Model painted!');
      setXpPopup({ xp: newXp, reason: status === 'based' ? 'Model completed & based!' : 'Model painted!' });
      // Check achievements after a tick
      setTimeout(() => {
        checkAchievements();
      }, 100);
    } else if (status === 'wip') {
      addXP(5, 'Started painting!');
    }
  }, [addXP, recordPaint, checkAchievements]);

  // Group models for compact/cards view
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

  const isEmpty = totalGrey === 0 && totalWip === 0;

  const viewModes: { id: ViewMode; label: string; icon: string }[] = [
    { id: 'pipeline', label: 'Pipeline', icon: 'swords2' },
    { id: 'gallery', label: 'Gallery', icon: 'eagle-shield' },
    { id: 'timeline', label: 'Timeline', icon: 'winged-hour' },
    { id: 'compact', label: 'List', icon: 'scroll' },
    { id: 'cards', label: 'Cards', icon: 'tome' },
  ];

  return (
    <div>
      <PageBanner title="The Pile of Grey" subtitle="Face your shame — promote through the pipeline" icon="skull" />

      {isEmpty ? (
        <div className="empty">
          <span className="empty-icon"><GoldIcon name="medal" size={48} /></span>
          <p className="empty-text">Your pile is empty! You absolute legend.</p>
        </div>
      ) : (
        <>
          {/* Level badge + streak */}
          <div className="pile-top-bar">
            <LevelBadge />
            <StreakCounter />
            <button className="btn btn-sm btn-ghost" onClick={() => setShowAchievements(!showAchievements)}>
              <GoldIcon name="crown" size={14} /> Achievements
            </button>
          </div>

          {/* XP Popup */}
          {xpPopup && <XPPopup xp={xpPopup.xp} reason={xpPopup.reason} onDismiss={() => setXpPopup(null)} />}

          {/* Pile Overview (cinematic hero) */}
          <PileOverview
            totalGrey={totalGrey}
            totalWip={totalWip}
            totalPainted={totalPainted}
            totalAll={totalAll}
            greyModels={greyModels}
            oldestModel={oldestModel}
            recentPaintCount={recentPaintCount}
          />

          {/* Achievements panel */}
          {showAchievements && <AchievementGrid />}

          {/* Active Workbench */}
          {wipModels.length > 0 && (
            <ActiveWorkbench
              wipModels={wipModels}
              onUpdateStatus={updateStatus}
            />
          )}

          {/* Art divider */}
          <div className="art-divider">
            <div className="art-divider-line" />
            <GoldIcon name="skull-cog" size={18} />
            <div className="art-divider-line" />
          </div>

          {/* Project Generator */}
          <ProjectGenerator />

          {/* View controls */}
          <div className="grey-controls">
            <div className="grey-sort">
              <span className="grey-sort-label">View:</span>
              {viewModes.map(v => (
                <button
                  key={v.id}
                  className={`btn btn-sm ${view === v.id ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setView(v.id)}
                >
                  <GoldIcon name={v.icon} size={12} /> {v.label}
                </button>
              ))}
            </div>
            {(view === 'compact' || view === 'cards') && (
              <div className="grey-sort">
                <span className="grey-sort-label">Sort:</span>
                <button className={`btn btn-sm ${sortBy === 'status' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setSortBy('status')}>Status</button>
                <button className={`btn btn-sm ${sortBy === 'faction' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setSortBy('faction')}>Faction</button>
                <button className={`btn btn-sm ${sortBy === 'date' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setSortBy('date')}>Oldest</button>
              </div>
            )}
          </div>

          {/* View content */}
          {view === 'pipeline' && (
            <PipelineKanban
              models={allModels}
              onUpdateStatus={updateStatus}
            />
          )}

          {view === 'gallery' && (
            <GalleryView
              models={allModels}
              onUpdateStatus={updateStatus}
            />
          )}

          {view === 'timeline' && (
            <TimelineView
              models={allModels}
              onUpdateStatus={updateStatus}
            />
          )}

          {(view === 'compact' || view === 'cards') && groups.map(group => group.models.length > 0 && (
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
            {totalGrey <= 10 ? "Almost there! You can see the finish line!" :
             totalGrey <= 30 ? "Solid progress. Keep the momentum going." :
             totalGrey <= 100 ? "A worthy challenge. One model at a time." :
             "The pile is vast... but so is your determination."}
          </div>
        </>
      )}
    </div>
  );
}
