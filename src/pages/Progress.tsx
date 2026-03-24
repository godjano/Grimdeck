import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { ModelStatus } from '../types';
import MonthlyStats from '../components/MonthlyStats';
import GoldIcon from '../components/GoldIcon';
import PageBanner from '../components/PageBanner';

// ─── RPG RANK SYSTEM ───
const RANKS = [
  { min: 0, title: 'Neophyte', icon: 'bases', tier: 'Bronze', desc: 'Fresh from the box. Your journey begins.', xpMult: 1 },
  { min: 5, title: 'Initiate', icon: 'brushes', tier: 'Bronze', desc: 'You have taken up the brush.', xpMult: 1.1 },
  { min: 15, title: 'Battle Brother', icon: 'star-shield2', tier: 'Bronze', desc: 'Your models stand ready for war.', xpMult: 1.2 },
  { min: 30, title: 'Veteran', icon: 'winged-hour', tier: 'Silver', desc: 'Seasoned by countless painting sessions.', xpMult: 1.3 },
  { min: 50, title: 'Champion', icon: 'chalice', tier: 'Silver', desc: 'Your skill is recognised across the chapter.', xpMult: 1.5 },
  { min: 75, title: 'Captain', icon: 'crown', tier: 'Silver', desc: 'You lead by example. Others follow your recipes.', xpMult: 1.7 },
  { min: 100, title: 'Chapter Master', icon: 'sunburst', tier: 'Gold', desc: 'A hundred souls given colour and purpose.', xpMult: 2 },
  { min: 150, title: 'Lord Commander', icon: 'dragon', tier: 'Gold', desc: 'Your armies are the stuff of legend.', xpMult: 2.5 },
  { min: 250, title: 'Primarch', icon: 'lightning', tier: 'Platinum', desc: 'You have transcended. The Emperor notices.', xpMult: 3 },
  { min: 500, title: 'Emperor of Mankind', icon: 'aquila', tier: 'Platinum', desc: 'There is only paint. And you are its master.', xpMult: 5 },
];

// ─── TROPHY SYSTEM (PlayStation style) ───
type TrophyTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'secret';
interface Trophy {
  id: string; name: string; desc: string; icon: string; tier: TrophyTier;
  check: (s: Stats) => boolean; rarity?: string;
}

interface Stats {
  total: number; painted: number; wip: number; grey: number; factions: number;
  factionsComplete: number; logs: number; photos: number; paints: number;
  campaigns: number; models: any[];
}

const TROPHIES: Trophy[] = [
  // Bronze
  { id: 'first_model', name: 'The Beginning', desc: 'Add your first model', icon: 'bases', tier: 'bronze', check: s => s.total >= 1, rarity: 'Common' },
  { id: 'first_paint', name: 'First Stroke', desc: 'Paint your first mini', icon: 'brushes', tier: 'bronze', check: s => s.painted >= 1, rarity: 'Common' },
  { id: 'five_painted', name: 'Getting Started', desc: 'Paint 5 minis', icon: 'paint-pot', tier: 'bronze', check: s => s.painted >= 5, rarity: 'Common' },
  { id: 'ten_paints', name: 'Colour Collector', desc: 'Own 10 paints', icon: 'paint-pot', tier: 'bronze', check: s => s.paints >= 10, rarity: 'Common' },
  { id: 'first_log', name: 'Dear Diary', desc: 'Write your first painting log', icon: 'tome', tier: 'bronze', check: s => s.logs >= 1, rarity: 'Common' },
  { id: 'first_photo', name: 'Say Cheese', desc: 'Add a photo to a model', icon: 'lens', tier: 'bronze', check: s => s.photos >= 1, rarity: 'Common' },
  { id: 'twenty_models', name: 'Growing Collection', desc: 'Own 20 minis', icon: 'chest', tier: 'bronze', check: s => s.total >= 20, rarity: 'Common' },

  // Silver
  { id: 'squad_done', name: 'Squad Complete!', desc: 'Paint 10 minis', icon: 'star-shield2', tier: 'silver', check: s => s.painted >= 10, rarity: 'Uncommon' },
  { id: 'multi_faction', name: 'Xenos Sympathiser', desc: 'Own models from 3+ factions', icon: 'cog-eye', tier: 'silver', check: s => s.factions >= 3, rarity: 'Uncommon' },
  { id: 'fifty_paints', name: 'Paint Hoarder', desc: 'Own 50 paints', icon: 'chest', tier: 'silver', check: s => s.paints >= 50, rarity: 'Uncommon' },
  { id: 'army_painted', name: 'Army Builder', desc: 'Paint 50 minis', icon: 'hammer', tier: 'silver', check: s => s.painted >= 50, rarity: 'Uncommon' },
  { id: 'ten_logs', name: 'Dedicated Scribe', desc: 'Log 10 painting sessions', icon: 'tome', tier: 'silver', check: s => s.logs >= 10, rarity: 'Uncommon' },
  { id: 'five_photos', name: 'Photographer', desc: 'Add photos to 5 models', icon: 'lens', tier: 'silver', check: s => s.photos >= 5, rarity: 'Uncommon' },
  { id: 'hundred_models', name: 'Hoarder', desc: 'Own 100 minis', icon: 'swords-chest', tier: 'silver', check: s => s.total >= 100, rarity: 'Uncommon' },
  { id: 'first_campaign', name: 'Warmaster', desc: 'Start a solo campaign', icon: 'campaigns', tier: 'silver', check: s => s.campaigns >= 1, rarity: 'Uncommon' },

  // Gold
  { id: 'centurion', name: 'Centurion', desc: 'Paint 100 minis', icon: 'medal', tier: 'gold', check: s => s.painted >= 100, rarity: 'Rare' },
  { id: 'faction_complete', name: 'Completionist', desc: 'Fully paint one faction', icon: 'chalice', tier: 'gold', check: s => s.factionsComplete >= 1, rarity: 'Rare' },
  { id: 'no_grey', name: 'Grey Pile Slayer', desc: 'Have zero unpainted minis', icon: 'chain-skull', tier: 'gold', check: s => s.total > 0 && s.grey === 0, rarity: 'Rare' },
  { id: 'two_fifty', name: 'Brush Master', desc: 'Paint 250 minis', icon: 'crown', tier: 'gold', check: s => s.painted >= 250, rarity: 'Very Rare' },
  { id: 'hundred_paints', name: 'Paint Library', desc: 'Own 100 paints', icon: 'paint-pot', tier: 'gold', check: s => s.paints >= 100, rarity: 'Rare' },

  // Platinum
  { id: 'five_hundred', name: 'Living Legend', desc: 'Paint 500 minis', icon: 'dragon', tier: 'platinum', check: s => s.painted >= 500, rarity: 'Ultra Rare' },
  { id: 'all_factions', name: 'Omnissiah\'s Chosen', desc: 'Own models from 10+ factions', icon: 'cog-eye', tier: 'platinum', check: s => s.factions >= 10, rarity: 'Ultra Rare' },

  // Secret
  { id: 'speed_demon', name: '???', desc: 'Have 20+ WIP at once', icon: 'flame-skull', tier: 'secret', check: s => s.wip >= 20, rarity: 'Secret' },
  { id: 'thousand', name: '???', desc: 'Own 1000 minis', icon: 'sunburst', tier: 'secret', check: s => s.total >= 1000, rarity: 'Secret' },
];

const TIER_COLORS: Record<TrophyTier, string> = {
  bronze: '#cd7f32', silver: '#c0c0c0', gold: '#ffd700', platinum: '#40e0d0', secret: '#8a2be2',
};

function getRank(painted: number) {
  let current = RANKS[0], next: typeof RANKS[0] | null = RANKS[1];
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (painted >= RANKS[i].min) { current = RANKS[i]; next = RANKS[i + 1] || null; break; }
  }
  return { current, next };
}

type Tab = 'profile' | 'trophies' | 'factions' | 'timeline';

export default function Progress() {
  const models = useLiveQuery(() => db.models.toArray()) ?? [];
  const logs = useLiveQuery(() => db.paintingLogs.orderBy('timestamp').reverse().toArray()) ?? [];
  const paintCount = useLiveQuery(() => db.paints.count()) ?? 0;
  const campaignCount = useLiveQuery(() => db.campaigns.count()) ?? 0;
  const [tab, setTab] = useState<Tab>('profile');
  const [showSecret, setShowSecret] = useState(false);

  const total = models.reduce((s, m) => s + m.quantity, 0);
  const byStat = (st: ModelStatus[]) => models.filter(m => st.includes(m.status)).reduce((s, m) => s + m.quantity, 0);
  const painted = byStat(['painted', 'based']);
  const wip = byStat(['wip']);
  const grey = byStat(['unbuilt', 'built', 'primed']);
  const unbuilt = byStat(['unbuilt']);
  const built = byStat(['built']);
  const primed = byStat(['primed']);
  const pctDone = total > 0 ? Math.round((painted / total) * 100) : 0;

  const factions = [...new Set(models.map(m => m.faction))];
  const factionStats = factions.map(f => {
    const fm = models.filter(m => m.faction === f);
    const ft = fm.reduce((s, m) => s + m.quantity, 0);
    const fp = fm.filter(m => m.status === 'painted' || m.status === 'based').reduce((s, m) => s + m.quantity, 0);
    return { faction: f, total: ft, painted: fp, pct: ft > 0 ? Math.round((fp / ft) * 100) : 0 };
  });

  const stats: Stats = {
    total, painted, wip, grey, factions: factions.length,
    factionsComplete: factionStats.filter(f => f.total > 0 && f.pct === 100).length,
    logs: logs.length, photos: models.filter(m => m.photoUrl).length,
    paints: paintCount, campaigns: campaignCount, models,
  };

  const { current: rank, next: nextRank } = getRank(painted);
  const nextProgress = nextRank ? Math.min(100, Math.round(((painted - rank.min) / (nextRank.min - rank.min)) * 100)) : 100;

  // XP system
  const xp = Math.round(painted * 10 * rank.xpMult + logs.length * 5 + stats.photos * 3);

  const trophiesEarned = TROPHIES.filter(t => t.check(stats));
  const trophyPct = Math.round((trophiesEarned.length / TROPHIES.length) * 100);

  const byTier = (tier: TrophyTier) => TROPHIES.filter(t => t.tier === tier);

  const b = import.meta.env.BASE_URL;
  return (
    <div>
      <PageBanner title="Progress" subtitle="Track your hobby journey and achievements" icon="progress" />
      <div className="gold-divider"><img src={`${b}decor/divider-gold.png`} alt="" /></div>
      {/* ─── Player Card (PSN Profile style) ─── */}
      <div className="player-card">
        <div className="player-card-bg" />
        <div className="player-card-content">
          <div className="player-avatar">
            <div className="player-avatar-ring" style={{ background: `conic-gradient(${TIER_COLORS[rank.tier.toLowerCase() as TrophyTier] || '#ffd700'} ${pctDone}%, var(--surface3) 0)` }}>
              <div className="player-avatar-inner"><GoldIcon name="medal" size={48} /></div>
            </div>
            <div className="player-level">LVL {RANKS.indexOf(rank) + 1}</div>
          </div>
          <div className="player-info">
            <div className="player-rank-tier" style={{ color: TIER_COLORS[rank.tier.toLowerCase() as TrophyTier] }}>{rank.tier}</div>
            <div className="player-rank-title">{rank.title}</div>
            <div className="player-rank-desc">{rank.desc}</div>
            <div className="player-xp-bar">
              <div className="player-xp-fill" style={{ width: `${nextProgress}%` }} />
              <span className="player-xp-text">{nextRank ? `${painted - rank.min} / ${nextRank.min - rank.min} to ${nextRank.title}` : 'MAX RANK'}</span>
            </div>
            <div className="player-xp-total">{xp.toLocaleString()} XP</div>
          </div>
          <div className="player-stats-col">
            <div className="player-mini-stat"><span className="pms-num">{painted}</span><span className="pms-label">Painted</span></div>
            <div className="player-mini-stat"><span className="pms-num">{total}</span><span className="pms-label">Owned</span></div>
            <div className="player-mini-stat"><span className="pms-num">{trophiesEarned.length}</span><span className="pms-label">Trophies</span></div>
            <div className="player-mini-stat"><span className="pms-num">{pctDone}%</span><span className="pms-label">Complete</span></div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="game-tabs" style={{ marginBottom: 24 }}>
        <button className={`game-tab ${tab === 'profile' ? 'active' : ''}`} onClick={() => setTab('profile')}><GoldIcon name="campaigns" size={16} /> Stats</button>
        <button className={`game-tab ${tab === 'trophies' ? 'active' : ''}`} onClick={() => setTab('trophies')}><GoldIcon name="medal" size={16} /> Trophies ({trophiesEarned.length}/{TROPHIES.length})</button>
        <button className={`game-tab ${tab === 'factions' ? 'active' : ''}`} onClick={() => setTab('factions')}><GoldIcon name="models" size={16} /> Factions</button>
        <button className={`game-tab ${tab === 'timeline' ? 'active' : ''}`} onClick={() => setTab('timeline')}><GoldIcon name="guides" size={16} /> Timeline</button>
      </div>

      {/* ─── Stats Tab ─── */}
      {tab === 'profile' && (
        <>
          <div className="rpg-stats-grid">
            {[
              { label: 'MODELS OWNED', val: total, iconName: 'models' },
              { label: 'PAINTED', val: painted, iconName: 'medal' },
              { label: 'IN PROGRESS', val: wip, iconName: 'paints' },
              { label: 'GREY PILE', val: grey, iconName: 'skull' },
              { label: 'PAINTS OWNED', val: paintCount, iconName: 'paints' },
              { label: 'FACTIONS', val: factions.length, iconName: 'campaigns' },
              { label: 'JOURNAL ENTRIES', val: logs.length, iconName: 'guides' },
              { label: 'CAMPAIGNS', val: campaignCount, iconName: 'campaigns' },
            ].map(s => (
              <div key={s.label} className="rpg-stat-card">
                <div className="rpg-sc-icon"><GoldIcon name={s.iconName} size={22} /></div>
                <div className="rpg-sc-val">{s.val}</div>
                <div className="rpg-sc-label">{s.label}</div>
              </div>
            ))}
          </div>

          <h3 className="section-title"><GoldIcon name="settings" size={18} /> Pipeline</h3>
          <div className="pipeline">
            {[
              { label: 'Unbuilt', count: unbuilt, color: '#555', iconName: 'models' },
              { label: 'Built', count: built, color: '#5d4037', iconName: 'campaigns' },
              { label: 'Primed', count: primed, color: '#37474f', iconName: 'skull' },
              { label: 'WIP', count: wip, color: '#e65100', iconName: 'paints' },
              { label: 'Done', count: painted, color: '#1b5e20', iconName: 'medal' },
            ].map(s => (
              <div className="pipeline-stage" key={s.label}>
                <div className="pipeline-bar" style={{ background: s.color, height: total > 0 ? Math.max(8, (s.count / total) * 140) : 8 }} />
                <div className="pipeline-icon"><GoldIcon name={s.iconName} size={20} /></div>
                <div className="pipeline-count">{s.count}</div>
                <div className="pipeline-label">{s.label}</div>
              </div>
            ))}
          </div>

          <MonthlyStats />

          <h3 className="section-title"><GoldIcon name="aquila" size={18} /> Rank Progression</h3>
          <div className="ranks-list">
            {RANKS.map((t, i) => {
              const isActive = rank.title === t.title;
              const isDone = painted >= t.min;
              return (
                <div key={i} className={`rank-item ${isActive ? 'active' : isDone ? 'done' : 'locked'}`}>
                  <span className="rank-item-icon"><GoldIcon name={t.icon} size={24} /></span>
                  <div className="rank-item-info">
                    <div className="rank-item-title">{t.title} <span className="rank-item-tier" style={{ color: TIER_COLORS[t.tier.toLowerCase() as TrophyTier] }}>{t.tier}</span></div>
                    <div className="rank-item-desc">{t.min} minis · {t.desc}</div>
                  </div>
                  {isDone && <span className="rank-item-check">✓</span>}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ─── Trophies Tab (PlayStation style) ─── */}
      {tab === 'trophies' && (
        <>
          <div className="trophy-summary">
            <div className="trophy-summary-bar">
              <div className="trophy-summary-fill" style={{ width: `${trophyPct}%` }} />
            </div>
            <div className="trophy-summary-text">{trophyPct}% · {trophiesEarned.length} of {TROPHIES.length} trophies</div>
            <div className="trophy-tier-counts">
              {(['platinum', 'gold', 'silver', 'bronze'] as TrophyTier[]).map(tier => (
                <span key={tier} className="trophy-tier-count" style={{ color: TIER_COLORS[tier] }}>
                  {byTier(tier).filter(t => t.check(stats)).length}/{byTier(tier).length}
                </span>
              ))}
            </div>
          </div>

          {(['platinum', 'gold', 'silver', 'bronze', 'secret'] as TrophyTier[]).map(tier => {
            const tierTrophies = byTier(tier);
            if (tier === 'secret' && !showSecret) {
              const earned = tierTrophies.filter(t => t.check(stats));
              return (
                <div key={tier}>
                  <div className="trophy-tier-header" style={{ color: TIER_COLORS[tier] }}>🤫 Secret ({earned.length}/{tierTrophies.length})</div>
                  <button className="btn btn-sm btn-ghost" onClick={() => setShowSecret(true)}>Reveal secret trophies</button>
                </div>
              );
            }
            return (
              <div key={tier}>
                <div className="trophy-tier-header" style={{ color: TIER_COLORS[tier] }}>
                  {tier === 'platinum' ? '💎' : tier === 'gold' ? '🥇' : tier === 'silver' ? '🥈' : tier === 'bronze' ? '🥉' : '🤫'} {tier.charAt(0).toUpperCase() + tier.slice(1)}
                </div>
                <div className="trophy-grid">
                  {tierTrophies.map(t => {
                    const earned = t.check(stats);
                    const isSecret = t.tier === 'secret' && !earned && !showSecret;
                    return (
                      <div key={t.id} className={`trophy-card ${earned ? 'earned' : 'locked'}`} style={{ borderColor: earned ? TIER_COLORS[t.tier] + '40' : undefined }}>
                        <div className="trophy-icon" style={{ filter: earned ? 'none' : 'grayscale(1) brightness(0.3)' }}>{isSecret ? <GoldIcon name="skull" size={28} /> : <GoldIcon name={t.icon} size={28} />}</div>
                        <div className="trophy-name">{isSecret ? '???' : t.name}</div>
                        <div className="trophy-desc">{isSecret ? 'Keep playing to discover' : t.desc}</div>
                        {t.rarity && <div className="trophy-rarity" style={{ color: TIER_COLORS[t.tier] }}>{earned ? '✓ ' : ''}{t.rarity}</div>}
                        {earned && <div className="trophy-earned-glow" style={{ background: TIER_COLORS[t.tier] }} />}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </>
      )}

      {/* ─── Factions Tab ─── */}
      {tab === 'factions' && (
        <div className="faction-cards">
          {factionStats.sort((a, b) => b.total - a.total).map(f => (
            <div key={f.faction} className="faction-card">
              <div className="faction-card-header">
                <span className="faction-card-name">{f.faction}</span>
                <span className="faction-card-pct" style={{ color: f.pct === 100 ? 'var(--success)' : f.pct > 50 ? 'var(--gold)' : 'var(--text-dim)' }}>{f.pct}%</span>
              </div>
              <div className="faction-bar-wrap"><div className="faction-bar" style={{ width: `${f.pct}%` }} /></div>
              <div className="faction-card-nums">{f.painted} painted / {f.total} total</div>
              {f.pct === 100 && <div className="faction-card-complete">🏆 COMPLETE</div>}
            </div>
          ))}
        </div>
      )}

      {/* ─── Timeline Tab ─── */}
      {tab === 'timeline' && (
        logs.length === 0 ? (
          <div className="empty"><span className="empty-icon">📅</span><p className="empty-text">No painting sessions logged yet.</p></div>
        ) : (
          <div className="timeline">
            {(() => {
              const byDate: Record<string, typeof logs> = {};
              for (const log of logs.slice(0, 30)) { const d = new Date(log.timestamp).toLocaleDateString(); (byDate[d] ??= []).push(log); }
              return Object.entries(byDate).map(([date, entries]) => (
                <div key={date} className="timeline-day">
                  <div className="timeline-date">{date}</div>
                  {entries.map(log => (
                    <div key={log.id} className="timeline-entry">
                      <div className="timeline-dot" />
                      <div className="timeline-content">
                        <div className="timeline-model">{models.find(m => m.id === log.modelId)?.name || 'Unknown'}</div>
                        {log.text && <div className="timeline-text">{log.text}</div>}
                        {log.photoUrl && <img src={log.photoUrl} alt="" className="timeline-photo" />}
                      </div>
                    </div>
                  ))}
                </div>
              ));
            })()}
          </div>
        )
      )}
    </div>
  );
}
