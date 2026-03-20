import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';

export default function Home() {
  const models = useLiveQuery(() => db.models.toArray()) ?? [];
  const paintCount = useLiveQuery(() => db.paints.count()) ?? 0;
  const nav = useNavigate();

  const total = models.reduce((s, m) => s + m.quantity, 0);
  const painted = models.filter(m => m.status === 'painted' || m.status === 'based').reduce((s, m) => s + m.quantity, 0);
  const pct = total > 0 ? Math.round((painted / total) * 100) : 0;
  const wip = models.filter(m => m.status === 'wip');
  const recent = [...models].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);

  return (
    <div>
      <section className="hero">
        <p className="hero-eyebrow">Your Hobby Companion</p>
        <h1 className="hero-title">Track. Paint.<br /><span>Conquer.</span></h1>
        <p className="hero-sub">Manage your miniature collection, track your painting progress, and play solo narrative campaigns — all in one place.</p>
        <div className="hero-actions">
          <button className="btn btn-primary btn-lg" onClick={() => nav('/models')}>My Collection</button>
          <button className="btn btn-outline btn-lg" onClick={() => nav('/start')}>I'm New — Start Here</button>
        </div>
      </section>

      <section className="stats-band">
        <div className="stats-band-inner">
          <div className="band-stat"><div className="band-num">{total}</div><div className="band-label">Models</div></div>
          <div className="band-divider" />
          <div className="band-stat"><div className="band-num">{paintCount}</div><div className="band-label">Paints</div></div>
          <div className="band-divider" />
          <div className="band-stat"><div className="band-num">{painted}</div><div className="band-label">Painted</div></div>
          <div className="band-divider" />
          <div className="band-stat"><div className="band-num">{pct}<span className="band-unit">%</span></div><div className="band-label">Complete</div></div>
        </div>
      </section>

      {/* Currently Painting */}
      {wip.length > 0 && (
        <section className="section">
          <p className="section-eyebrow">On the desk</p>
          <h2 className="section-heading">Currently Painting</h2>
          <div className="wip-cards">
            {wip.slice(0, 4).map(m => (
              <div key={m.id} className="wip-card" onClick={() => nav(`/model/${m.id}`)}>
                {m.photoUrl ? <img src={m.photoUrl} alt={m.name} className="wip-photo" /> : <div className="wip-photo-empty">🎨</div>}
                <div className="wip-info">
                  <div className="wip-name">{m.name}</div>
                  <div className="wip-faction">{m.faction}</div>
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
          {recent.map(m => (
            <div key={m.id} className="card" onClick={() => nav(`/model/${m.id}`)} style={{ cursor: 'pointer' }}>
              <div className="card-body">
                <div className="card-title">{m.name} {m.quantity > 1 && <span className="qty-badge">×{m.quantity}</span>}</div>
                <div className="card-sub">{m.faction} · {timeAgo(m.createdAt)}</div>
              </div>
              <span className={`status status-${m.status}`}>{m.status}</span>
            </div>
          ))}
        </section>
      )}

      {/* Feature Grid */}
      <section className="section">
        <p className="section-eyebrow">Features</p>
        <h2 className="section-heading">Everything you need</h2>
        <div className="feature-grid">
          <div className="feature-card" onClick={() => nav('/models')}>
            <div className="feature-icon">🛡️</div>
            <h3>Model Collection</h3>
            <p>Track every miniature by faction, unit type, and painting status.</p>
          </div>
          <div className="feature-card" onClick={() => nav('/paints')}>
            <div className="feature-icon">🎨</div>
            <h3>Paint Inventory</h3>
            <p>Catalog 500+ paints across Citadel, Vallejo, and Army Painter.</p>
          </div>
          <div className="feature-card" onClick={() => nav('/grey-pile')}>
            <div className="feature-icon">🪦</div>
            <h3>Pile of Grey</h3>
            <p>Face your shame and promote models through the pipeline.</p>
          </div>
          <div className="feature-card" onClick={() => nav('/progress')}>
            <div className="feature-icon">📊</div>
            <h3>Progress & Ranks</h3>
            <p>Gamified stats, achievements, and ranks to stay motivated.</p>
          </div>
          <div className="feature-card" onClick={() => nav('/campaigns')}>
            <div className="feature-icon">⚔️</div>
            <h3>Solo Campaigns</h3>
            <p>Narrative Kill Team campaigns with AI opponents.</p>
          </div>
          <div className="feature-card" onClick={() => nav('/suggestions')}>
            <div className="feature-icon">💡</div>
            <h3>Paint Guides</h3>
            <p>Step-by-step tutorials and colour scheme tools.</p>
          </div>
          <div className="feature-card" onClick={() => nav('/inspiration')}>
            <div className="feature-icon">🖌️</div>
            <h3>Inspiration</h3>
            <p>Techniques, recipes, and pro tips library.</p>
          </div>
          <div className="feature-card" onClick={() => nav('/settings')}>
            <div className="feature-icon">☁️</div>
            <h3>Cloud Sync</h3>
            <p>Back up and sync across devices via GitHub.</p>
          </div>
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
