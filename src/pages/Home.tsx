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

  return (
    <div>
      {/* Hero */}
      <section className="hero">
        <p className="hero-eyebrow">Your Hobby Companion</p>
        <h1 className="hero-title">Track. Paint.<br /><span>Conquer.</span></h1>
        <p className="hero-sub">Manage your miniature collection, track your painting progress, and play solo narrative campaigns — all in one place.</p>
        <div className="hero-actions">
          <button className="btn btn-primary btn-lg" onClick={() => nav('/models')}>Get Started</button>
          <button className="btn btn-outline btn-lg" onClick={() => nav('/campaigns')}>Play Solo</button>
        </div>
      </section>

      {/* Stats Band */}
      <section className="stats-band">
        <div className="stats-band-inner">
          <div className="band-stat">
            <div className="band-num">{total}</div>
            <div className="band-label">Models</div>
          </div>
          <div className="band-divider" />
          <div className="band-stat">
            <div className="band-num">{paintCount}</div>
            <div className="band-label">Paints</div>
          </div>
          <div className="band-divider" />
          <div className="band-stat">
            <div className="band-num">{painted}</div>
            <div className="band-label">Painted</div>
          </div>
          <div className="band-divider" />
          <div className="band-stat">
            <div className="band-num">{pct}<span className="band-unit">%</span></div>
            <div className="band-label">Complete</div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="section">
        <p className="section-eyebrow">Features</p>
        <h2 className="section-heading">Everything you need</h2>
        <div className="feature-grid">
          <div className="feature-card" onClick={() => nav('/models')}>
            <div className="feature-icon">🛡️</div>
            <h3>Model Collection</h3>
            <p>Track every miniature by faction, unit type, and painting status. Autocomplete from 300+ unit presets.</p>
          </div>
          <div className="feature-card" onClick={() => nav('/paints')}>
            <div className="feature-icon">🎨</div>
            <h3>Paint Inventory</h3>
            <p>Catalog 400+ paints across Citadel, Vallejo, and Army Painter with automatic colour matching.</p>
          </div>
          <div className="feature-card" onClick={() => nav('/grey-pile')}>
            <div className="feature-icon">🪦</div>
            <h3>Pile of Grey</h3>
            <p>Face your unpainted shame. Quick-promote models through the pipeline from sprue to display shelf.</p>
          </div>
          <div className="feature-card" onClick={() => nav('/progress')}>
            <div className="feature-icon">📊</div>
            <h3>Progress & Ranks</h3>
            <p>Gamified stats, achievements, and a rank system to keep you motivated through the grey pile.</p>
          </div>
          <div className="feature-card feature-card-wide" onClick={() => nav('/campaigns')}>
            <div className="feature-icon">⚔️</div>
            <h3>Solo Campaigns</h3>
            <p>Play narrative Kill Team campaigns with branching stories, AI opponents, interactive board maps, and full operative datasheets. Your tabletop game master in a browser.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
