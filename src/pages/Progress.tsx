import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { ModelStatus } from '../types';

const TITLES = [
  { min: 0, title: 'Fresh Recruit', icon: '🪖', desc: 'Everyone starts somewhere' },
  { min: 5, title: 'Brush Initiate', icon: '🖌️', desc: 'The first strokes of greatness' },
  { min: 15, title: 'Paint Squire', icon: '🛡️', desc: 'Getting comfortable with a brush' },
  { min: 30, title: 'Colour Sergeant', icon: '⚔️', desc: 'A reliable painter in the ranks' },
  { min: 50, title: 'Palette Knight', icon: '🏰', desc: 'Your skills are undeniable' },
  { min: 75, title: 'Master of Pigments', icon: '👑', desc: 'Few can match your output' },
  { min: 100, title: 'Legendary Artisan', icon: '🌟', desc: 'Songs are sung of your painted armies' },
  { min: 150, title: 'Daemon of the Brush', icon: '🔥', desc: 'Unstoppable. Relentless. Beautiful.' },
  { min: 250, title: 'Ascended Primarch', icon: '⚡', desc: 'You have transcended mortal painting' },
];

function getTitle(painted: number) {
  let current = TITLES[0];
  let next = TITLES[1];
  for (let i = TITLES.length - 1; i >= 0; i--) {
    if (painted >= TITLES[i].min) {
      current = TITLES[i];
      next = TITLES[i + 1] || null;
      break;
    }
  }
  return { current, next };
}

export default function Progress() {
  const models = useLiveQuery(() => db.models.toArray()) ?? [];

  const total = models.reduce((s, m) => s + m.quantity, 0);
  const byStat = (st: ModelStatus[]) => models.filter(m => st.includes(m.status)).reduce((s, m) => s + m.quantity, 0);

  const painted = byStat(['painted', 'based']);
  const wip = byStat(['wip']);
  const primed = byStat(['primed']);
  const built = byStat(['built']);
  const unbuilt = byStat(['unbuilt']);
  const grey = unbuilt + built + primed;

  const pctDone = total > 0 ? Math.round((painted / total) * 100) : 0;
  const _unused = total > 0 ? Math.round((wip / total) * 100) : 0; void _unused;

  const { current: rank, next: nextRank } = getTitle(painted);
  const nextProgress = nextRank ? Math.round(((painted - rank.min) / (nextRank.min - rank.min)) * 100) : 100;

  // Faction breakdown
  const factions = [...new Set(models.map(m => m.faction))].sort();
  const factionStats = factions.map(f => {
    const fm = models.filter(m => m.faction === f);
    const ft = fm.reduce((s, m) => s + m.quantity, 0);
    const fp = fm.filter(m => m.status === 'painted' || m.status === 'based').reduce((s, m) => s + m.quantity, 0);
    return { faction: f, total: ft, painted: fp, pct: ft > 0 ? Math.round((fp / ft) * 100) : 0 };
  });

  // Achievements
  const achievements = [
    { name: 'First Blood', desc: 'Paint your first mini', icon: '🩸', done: painted >= 1 },
    { name: 'Squad Complete', desc: 'Paint 10 minis', icon: '👥', done: painted >= 10 },
    { name: 'Army Builder', desc: 'Paint 50 minis', icon: '🏗️', done: painted >= 50 },
    { name: 'Centurion', desc: 'Paint 100 minis', icon: '💯', done: painted >= 100 },
    { name: 'No Grey Left', desc: 'Clear the pile completely', icon: '✨', done: total > 0 && grey === 0 },
    { name: 'Multi-faction', desc: 'Paint minis from 3+ factions', icon: '🌍', done: factionStats.filter(f => f.painted > 0).length >= 3 },
    { name: 'Completionist', desc: 'Finish an entire faction', icon: '🏆', done: factionStats.some(f => f.total > 0 && f.pct === 100) },
    { name: 'Hoarder', desc: 'Own 200+ minis', icon: '📦', done: total >= 200 },
    { name: 'Speed Painter', desc: 'Have 10+ WIP at once', icon: '⚡', done: wip >= 10 },
    { name: 'Brush Master', desc: 'Paint 250 minis', icon: '🎖️', done: painted >= 250 },
  ];

  const unlocked = achievements.filter(a => a.done).length;

  return (
    <div>
      <div className="page-header">
        <h2>📊 Progress Tracker</h2>
      </div>

      {/* Rank Card */}
      <div className="rank-card">
        <div className="rank-icon">{rank.icon}</div>
        <div className="rank-info">
          <div className="rank-title">{rank.title}</div>
          <div className="rank-desc">{rank.desc}</div>
          {nextRank && (
            <div className="rank-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${nextProgress}%` }} />
              </div>
              <div className="rank-next">{painted} / {nextRank.min} to {nextRank.title} {nextRank.icon}</div>
            </div>
          )}
        </div>
      </div>

      {/* Overview Stats */}
      <div className="stats">
        <div className="stat">
          <div className="stat-num">{total}</div>
          <div className="stat-label">Total</div>
        </div>
        <div className="stat stat-highlight">
          <div className="stat-num">{painted}</div>
          <div className="stat-label">Painted</div>
        </div>
        <div className="stat stat-wip">
          <div className="stat-num">{wip}</div>
          <div className="stat-label">WIP</div>
        </div>
        <div className="stat">
          <div className="stat-num">{grey}</div>
          <div className="stat-label">Grey Pile</div>
        </div>
        <div className="stat stat-highlight">
          <div className="stat-num">{pctDone}%</div>
          <div className="stat-label">Complete</div>
        </div>
      </div>

      {/* Pipeline */}
      <h3 className="section-title">🔄 Painting Pipeline</h3>
      <div className="pipeline">
        {[
          { label: 'Unbuilt', count: unbuilt, color: '#555' },
          { label: 'Built', count: built, color: '#5d4037' },
          { label: 'Primed', count: primed, color: '#37474f' },
          { label: 'WIP', count: wip, color: '#e65100' },
          { label: 'Done', count: painted, color: '#1b5e20' },
        ].map(s => (
          <div className="pipeline-stage" key={s.label}>
            <div className="pipeline-bar" style={{ background: s.color, height: total > 0 ? Math.max(4, (s.count / total) * 120) : 4 }} />
            <div className="pipeline-count">{s.count}</div>
            <div className="pipeline-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Faction Breakdown */}
      {factionStats.length > 0 && (
        <>
          <h3 className="section-title">⚔️ Faction Progress</h3>
          {factionStats.sort((a, b) => b.total - a.total).map(f => (
            <div className="faction-row" key={f.faction}>
              <div className="faction-name">{f.faction}</div>
              <div className="faction-bar-wrap">
                <div className="faction-bar" style={{ width: `${f.pct}%` }} />
              </div>
              <div className="faction-stat">{f.painted}/{f.total} <span className="faction-pct">{f.pct}%</span></div>
            </div>
          ))}
        </>
      )}

      {/* Achievements */}
      <h3 className="section-title">🏅 Achievements ({unlocked}/{achievements.length})</h3>
      <div className="achievements-grid">
        {achievements.map(a => (
          <div className={`achievement ${a.done ? 'unlocked' : 'locked'}`} key={a.name}>
            <div className="achievement-icon">{a.icon}</div>
            <div className="achievement-name">{a.name}</div>
            <div className="achievement-desc">{a.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
