import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import GoldIcon from '../components/GoldIcon';

import PaintingStreak from '../components/PaintingStreak';
import SessionPlanner from '../components/SessionPlanner';

export default function Home() {
  const models = useLiveQuery(() => db.models.toArray()) ?? [];
  const paintCount = useLiveQuery(() => db.paints.count()) ?? 0;
  const nav = useNavigate();
  const isNew = models.length === 0 && paintCount === 0;

  const total = models.reduce((s, m) => s + m.quantity, 0);
  const painted = models.filter(m => m.status === 'painted' || m.status === 'based').reduce((s, m) => s + m.quantity, 0);
  const pct = total > 0 ? Math.round((painted / total) * 100) : 0;
  const wip = models.filter(m => m.status === 'wip');
  const recent = [...models].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);

  // Monthly goal
  const now = new Date();
  const thisMonth = models.filter(m => (m.status === 'painted' || m.status === 'based') && m.lastPaintedAt && new Date(m.lastPaintedAt).getMonth() === now.getMonth() && new Date(m.lastPaintedAt).getFullYear() === now.getFullYear());
  const monthlyPainted = thisMonth.reduce((s, m) => s + m.quantity, 0);
  const monthlyGoal = Number(localStorage.getItem('grimdeck_monthly_goal') || 5);
  const goalPct = Math.min(100, Math.round((monthlyPainted / monthlyGoal) * 100));

  const divider = <div className="gold-divider"><img src={`${import.meta.env.BASE_URL}decor/divider-gold.png`} alt="" loading="lazy" /></div>;

  return (
    <div>
      <section className="hero">
        <p className="hero-eyebrow">Your Hobby Companion</p>
        <h1 className="hero-title">Track. Paint.<br /><span>Conquer.</span></h1>
        <p className="hero-sub">Track your miniature collection, log painting progress, manage your paint rack, and play solo campaigns — all in one app.</p>
        <div className="hero-actions">
          <button className="btn btn-primary btn-lg" onClick={() => nav('/models')}>My Collection</button>
          <button className="btn btn-outline btn-lg" onClick={() => nav('/start')}>I'm New — Start Here</button>
        </div>
      </section>

      <section className="stats-band">
        {total > 0 ? (
        <div className="stats-band-inner">
          <div className="band-stat"><div className="band-num">{total}</div><div className="band-label">Models</div></div>
          <div className="band-divider" />
          <div className="band-stat"><div className="band-num">{paintCount}</div><div className="band-label">Paints</div></div>
          <div className="band-divider" />
          <div className="band-stat"><div className="band-num">{painted}</div><div className="band-label">Painted</div></div>
          <div className="band-divider" />
          <div className="band-stat"><div className="band-num">{pct}<span className="band-unit">%</span></div><div className="band-label">Complete</div></div>
        </div>
        ) : (
        <div className="stats-band-inner" style={{ flexDirection: 'column', gap: 4, padding: '8px 0' }}>
          <div style={{ color: 'var(--gold)', fontFamily: "'Cinzel', serif", fontSize: '0.95rem' }}>Your hobby journey starts here</div>
          <div style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Add your first models to see your stats</div>
        </div>
        )}
      </section>

      {divider}

      {/* New user banner */}
      {isNew && (
        <div className="onboarding-banner" onClick={() => nav('/start')}>
          <div className="onboarding-icon"><GoldIcon name="medal" size={32} /></div>
          <div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>New here? Let's get you set up!</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>We'll help you add your first models and paints in under a minute.</div>
          </div>
          <span style={{ color: 'var(--gold)' }}>Start →</span>
        </div>
      )}

      {/* Streak + Session Planner */}
      {total > 0 && (
        <section className="section">
          <PaintingStreak />
          <SessionPlanner />
          <div className="goal-ring">
            <svg width="56" height="56" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="24" fill="none" stroke="var(--surface)" strokeWidth="5" />
              <circle cx="28" cy="28" r="24" fill="none" stroke="var(--gold)" strokeWidth="5" strokeDasharray={`${goalPct * 1.508} 151`} strokeLinecap="round" transform="rotate(-90 28 28)" />
              <text x="28" y="32" textAnchor="middle" fill="var(--gold)" fontSize="14" fontWeight="bold">{monthlyPainted}</text>
            </svg>
            <div className="goal-ring-info">
              <div className="goal-ring-title" style={{ cursor: 'pointer' }} onClick={() => { const v = prompt('Set monthly painting goal:', String(monthlyGoal)); if (v && !isNaN(Number(v)) && Number(v) > 0) { localStorage.setItem('grimdeck_monthly_goal', v); window.location.reload(); } }}>Monthly Goal</div>
              <div className="goal-ring-sub">{monthlyPainted} of {monthlyGoal} models painted this month</div>
            </div>
          </div>
        </section>
      )}

      {/* Currently Painting */}
      {wip.length > 0 && (
        <section className="section">
          <p className="section-eyebrow">On the desk</p>
          <h2 className="section-heading">Currently Painting</h2>
          <div className="wip-grid">
            {wip.slice(0, 4).map(m => (
              <div key={m.id} className="wip-showcase" onClick={() => nav(`/model/${m.id}`)}>
                <div className="wip-showcase-img">
                  {m.photoUrl ? <img src={m.photoUrl} alt={m.name} /> : <div className="wip-showcase-empty"><GoldIcon name="paints" size={24} /></div>}
                  <div className="wip-showcase-badge">WIP</div>
                </div>
                <div className="wip-showcase-info">
                  <div className="wip-showcase-name">{m.name}</div>
                  <div className="wip-showcase-faction">{m.faction}</div>
                </div>
              </div>
            ))}
          </div>
          {wip.length > 4 && <p className="home-more" onClick={() => nav('/grey-pile')}>+{wip.length - 4} more on the desk →</p>}
        </section>
      )}

      {/* Recently Added */}
      {recent.length > 0 && (
        <section className="section">
          <p className="section-eyebrow">Latest</p>
          <h2 className="section-heading">Recently Added</h2>
          <div className="recent-list">
            {recent.map(m => (
              <div key={m.id} className="recent-card" onClick={() => nav(`/model/${m.id}`)}>
                <div className="recent-avatar">
                  {m.photoUrl ? <img src={m.photoUrl} alt={m.name} /> : <GoldIcon name="models" size={16} />}
                </div>
                <div className="recent-info">
                  <div className="recent-name">{m.name} {m.quantity > 1 && <span className="qty-badge">×{m.quantity}</span>}</div>
                  <div className="recent-meta">{m.faction} · {timeAgo(m.createdAt)}</div>
                </div>
                <span className={`ml-card-status status-${m.status}`}>{m.status}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {divider}

      {/* Feature Grid */}
      <section className="section">
        <p className="section-eyebrow">Features</p>
        <h2 className="section-heading">Everything you need</h2>
        <div className="feature-grid">
          {(() => { const b = import.meta.env.BASE_URL; return [
            { to: '/models', img: 'icon-figurine.png', title: 'Collection', desc: 'Track every miniature by faction and status', color: '#3b82f6' },
            { to: '/paints', img: 'icon-palette2.png', title: 'Paint Rack', desc: 'Catalog paints across all major brands', color: '#a855f7' },
            { to: '/grey-pile', img: 'icon-skull2.png', title: 'Pile of Grey', desc: 'Your unpainted models — track them from box to battlefield', color: '#6b7280' },
            { to: '/progress', img: 'icon-trophy2.png', title: 'Progress', desc: 'Ranks, trophies, and painting streaks', color: '#f59e0b' },
            { to: '/campaigns', img: 'icon-swords2.png', title: 'Campaigns', desc: 'Solo Kill Team narrative missions', color: '#ef4444' },
            { to: '/suggestions', img: 'icon-book2.png', title: 'Paint Guides', desc: 'Step-by-step tutorials and recipes', color: '#10b981' },
            { to: '/inspiration', img: 'icon-eagle-shield.png', title: 'Inspiration', desc: 'Techniques, tips, and pro recipes', color: '#ec4899' },
            { to: '/community', img: 'icon-compass.png', title: 'Community', desc: 'Share models and browse the gallery', color: '#06b6d4' },
            { to: '/battle-log', img: 'icon-swords2.png', title: 'Battle Log', desc: 'Track your games — wins, losses, and rivals', color: '#e74c3c' },
            { to: '/showcase', img: 'icon-trophy2.png', title: 'Showcase', desc: 'Your shelf of pride — finished masterpieces', color: '#f1c40f' },
            { to: '/wishlist', img: 'icon-medal.png', title: 'Wishlist', desc: 'Track models and paints you want to buy', color: '#8b5cf6' },
            { to: '/tools', img: 'icon-gear.png', title: 'Dice Roller & Tools', desc: 'Roll dice, match paints, plan sessions, and more', color: '#14b8a6' },
          ].map(f => (
            <div key={f.to} className="feature-card" onClick={() => nav(f.to)} style={{ '--feat-color': f.color } as React.CSSProperties}>
              <div className="feature-icon"><img src={`${b}decor/${f.img}`} alt="" width={44} height={44} /></div>
              <div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            </div>
          )); })()}
        </div>
      </section>
    </div>
  );
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
}
