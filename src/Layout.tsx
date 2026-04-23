import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useTheme } from './components/ThemeProvider';
import FloatingTimer from './components/FloatingTimer';
import { getUser, onAuthChange } from './db/cloud-sync';
import GoldIcon from './components/GoldIcon';
import { db } from './db';
import { useLiveQuery } from 'dexie-react-hooks';
import type { User } from '@supabase/supabase-js';
import './app.css';

/* ─── Quick-Add Modal ─── */
function QuickAdd({ onClose }: { onClose: () => void }) {
  const nav = useNavigate();
  const [name, setName] = useState('');
  const [faction, setFaction] = useState('');
  const [system, setSystem] = useState('Warhammer 40K');
  const [qty, setQty] = useState(1);
  const [pts, setPts] = useState(0);
  const [unitType, setUnitType] = useState('Infantry');
  const submit = async () => {
    if (!name.trim()) return;
    const id = await db.models.add({ name: name.trim(), faction: faction.trim() || 'Unknown', gameSystem: system, unitType, quantity: qty, status: 'unbuilt', points: pts, createdAt: Date.now(), notes: '', photoUrl: '', manufacturer: 'Games Workshop', countsAs: '', pricePaid: 0, wishlist: false, forceOrg: 'Other' } as any);
    onClose();
    nav(`/model/${id}`);
  };
  return (
    <div className="quick-add-overlay" onClick={onClose}>
      <div className="quick-add-sheet" onClick={e => e.stopPropagation()}>
        <h3>Quick Add Model</h3>
        <input autoFocus placeholder="Model name *" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} />
        <input placeholder="Faction" value={faction} onChange={e => setFaction(e.target.value)} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <select value={system} onChange={e => setSystem(e.target.value)}>
            <option>Warhammer 40K</option><option>Kill Team</option><option>Age of Sigmar</option><option>Horus Heresy</option><option>Other</option>
          </select>
          <select value={unitType} onChange={e => setUnitType(e.target.value)}>
            {['Infantry', 'Character', 'Vehicle', 'Walker', 'Monster', 'Battleline', 'Transport', 'Other'].map(t => <option key={t}>{t}</option>)}
          </select>
          <input type="number" placeholder="Quantity" value={qty} onChange={e => setQty(Number(e.target.value))} min={1} />
          <input type="number" placeholder="Points" value={pts} onChange={e => setPts(Number(e.target.value))} min={0} />
        </div>
        <button className="btn btn-primary" onClick={submit}>Add to Collection</button>
        <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textAlign: 'center', marginTop: 4 }}>You can edit all details on the model page after adding</p>
      </div>
    </div>
  );
}

/* ─── Global Search (Cmd+K) ─── */
function CmdPalette({ onClose }: { onClose: () => void }) {
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const [idx, setIdx] = useState(0);
  const models = useLiveQuery(() => db.models.toArray()) ?? [];
  const paints = useLiveQuery(() => db.paints.toArray()) ?? [];
  const pages = [
    { name: 'Home', path: '/' }, { name: 'Models', path: '/models' }, { name: 'Paints', path: '/paints' },
    { name: 'Grey Pile', path: '/grey-pile' }, { name: 'Progress', path: '/progress' }, { name: 'Campaigns', path: '/campaigns' },
    { name: 'Community', path: '/community' }, { name: 'Army List', path: '/army-list' }, { name: 'Guides', path: '/suggestions' },
    { name: 'Reference', path: '/inspiration' }, { name: 'Tools', path: '/tools' }, { name: 'Settings', path: '/settings' },
    { name: 'Wishlist', path: '/wishlist' }, { name: 'Challenges', path: '/challenges' }, { name: 'Hobby Stats', path: '/hobby-stats' },
    { name: 'Showcase', path: '/showcase' }, { name: 'Battle Log', path: '/battle-log' },
  ];
  const lq = q.toLowerCase();
  const results: { name: string; meta: string; go: () => void }[] = !q ? [] : [
    ...pages.filter(p => p.name.toLowerCase().includes(lq)).map(p => ({ name: p.name, meta: 'Page', go: () => nav(p.path) })),
    ...models.filter(m => m.name.toLowerCase().includes(lq) || m.faction.toLowerCase().includes(lq)).slice(0, 8).map(m => ({ name: m.name, meta: m.faction, go: () => nav(`/model/${m.id}`) })),
    ...paints.filter(p => p.name.toLowerCase().includes(lq)).slice(0, 6).map(p => ({ name: p.name, meta: `${p.brand} · ${p.type}`, go: () => nav('/paints') })),
  ];
  const pick = (i: number) => { results[i]?.go(); onClose(); };
  return (
    <div className="cmd-overlay" onClick={onClose}>
      <div className="cmd-palette" onClick={e => e.stopPropagation()}>
        <input className="cmd-input" autoFocus placeholder="Search models, paints, pages…" value={q} onChange={e => { setQ(e.target.value); setIdx(0); }}
          onKeyDown={e => { if (e.key === 'ArrowDown') { e.preventDefault(); setIdx(i => Math.min(i + 1, results.length - 1)); } else if (e.key === 'ArrowUp') { e.preventDefault(); setIdx(i => Math.max(i - 1, 0)); } else if (e.key === 'Enter') pick(idx); else if (e.key === 'Escape') onClose(); }} />
        <div className="cmd-results">
          {results.map((r, i) => (
            <div key={i} className={`cmd-item ${i === idx ? 'active' : ''}`} onClick={() => pick(i)}>
              <div><div className="cmd-item-name">{r.name}</div><div className="cmd-item-meta">{r.meta}</div></div>
            </div>
          ))}
          {q && results.length === 0 && <div className="cmd-item"><div className="cmd-item-meta">No results</div></div>}
        </div>
      </div>
    </div>
  );
}

export default function Layout() {
  const { pathname } = useLocation();
  const { toggle } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [showMore, setShowMore] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [pageKey, setPageKey] = useState(0);

  useEffect(() => {
    getUser().then(u => setUser(u));
    const { data } = onAuthChange(session => setUser(session?.user || null));
    return () => data.subscription.unsubscribe();
  }, []);
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setPageKey(k => k + 1); }, [pathname]);
  useEffect(() => { setShowMore(false); }, [pathname]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setShowSearch(true); }
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); setShowShortcuts(s => !s); }
      if (e.key === '+' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); setShowQuickAdd(true); }
      if (e.key === '/' && !e.ctrlKey) { e.preventDefault(); document.querySelector<HTMLInputElement>('.filter-search')?.focus(); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="site">
      <a href="#main-content" className="skip-link">Skip to content</a>
      <header className="site-header" role="banner">
        <div className="header-inner">
          <NavLink to="/" className="logo" end>GRIMDECK</NavLink>
          <nav className="site-nav desktop-nav">
            <NavLink to="/models">Models</NavLink>
            <NavLink to="/paints">Paints</NavLink>
            <NavLink to="/grey-pile">Grey Pile</NavLink>
            <NavLink to="/progress">Progress</NavLink>
            <NavLink to="/campaigns">Campaigns</NavLink>
            <NavLink to="/community">Community</NavLink>
            <div className={`nav-more ${showMore ? 'open' : ''}`}>
              <button className="nav-more-btn" onClick={() => setShowMore(!showMore)}>More ▾</button>
              <div className="nav-dropdown" onClick={() => setShowMore(false)}>
                <NavLink to="/army-list"><GoldIcon name="scroll" size={14} /> Army List</NavLink>
                <NavLink to="/battle-log"><GoldIcon name="campaigns" size={14} /> Battle Log</NavLink>
                <NavLink to="/showcase"><GoldIcon name="trophy" size={14} /> Showcase</NavLink>
                <NavLink to="/hobby-stats"><GoldIcon name="winged-hour" size={14} /> Hobby Stats</NavLink>
                <NavLink to="/challenges"><GoldIcon name="lightning" size={14} /> Challenges</NavLink>
                <NavLink to="/wishlist"><GoldIcon name="medal" size={14} /> Wishlist</NavLink>
                <NavLink to="/suggestions"><GoldIcon name="guides" size={14} /> Guides</NavLink>
                <NavLink to="/inspiration"><GoldIcon name="brushes" size={14} /> Reference</NavLink>
                <NavLink to="/tools">🧰 Tools</NavLink>
                <NavLink to="/start"><GoldIcon name="medal" size={14} /> Getting Started</NavLink>
                <NavLink to="/data-manager"><GoldIcon name="settings" size={14} /> Data Manager</NavLink>
                <NavLink to="/settings"><GoldIcon name="settings" size={14} /> Settings</NavLink>
                <NavLink to="/account"><GoldIcon name="aquila" size={14} /> Account</NavLink>
              </div>
            </div>
            <button className="theme-toggle" onClick={toggle} title="Toggle theme"><GoldIcon name="sunburst" size={16} /></button>
            <NavLink to="/account" className="nav-user" title={user ? user.email || 'Account' : 'Sign in'}>
              <GoldIcon name="aquila" size={14} />
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="site-main" id="main-content" role="main">
        <div className="page-transition" key={pageKey}><Outlet /></div>
      </main>
      <footer className="site-footer">
        <div className="footer-inner">
          <span className="footer-brand">GRIMDECK</span>
          <span className="footer-tagline">Your miniature hobby companion</span>
        </div>
      </footer>
      {/* Mobile bottom nav */}
      <nav className="mobile-nav" aria-label="Main navigation">
        <NavLink to="/" end><GoldIcon name="home" size={22} /></NavLink>
        <NavLink to="/models"><GoldIcon name="models" size={22} /></NavLink>
        <NavLink to="/paints"><GoldIcon name="paints" size={22} /></NavLink>
        <NavLink to="/grey-pile"><GoldIcon name="skull" size={22} /></NavLink>
        <NavLink to="/progress"><GoldIcon name="progress" size={22} /></NavLink>
        <NavLink to="/account"><GoldIcon name="eagle-shield" size={22} /></NavLink>
        <button className="mobile-more-btn" onClick={() => setShowMore(!showMore)}><GoldIcon name="settings" size={22} /></button>
      </nav>
      {showMore && (
        <div className="mobile-more-overlay" onClick={() => setShowMore(false)}>
          <div className="mobile-more-menu" onClick={e => e.stopPropagation()}>
            <NavLink to="/campaigns" onClick={() => setShowMore(false)}><GoldIcon name="campaigns" size={18} /> Campaigns</NavLink>
            <NavLink to="/army-list" onClick={() => setShowMore(false)}><GoldIcon name="guides" size={18} /> Army List</NavLink>
            <NavLink to="/battle-log" onClick={() => setShowMore(false)}><GoldIcon name="campaigns" size={18} /> Battle Log</NavLink>
            <NavLink to="/showcase" onClick={() => setShowMore(false)}><GoldIcon name="trophy" size={18} /> Showcase</NavLink>
            <NavLink to="/hobby-stats" onClick={() => setShowMore(false)}><GoldIcon name="winged-hour" size={18} /> Hobby Stats</NavLink>
            <NavLink to="/challenges" onClick={() => setShowMore(false)}><GoldIcon name="lightning" size={18} /> Challenges</NavLink>
            <NavLink to="/wishlist" onClick={() => setShowMore(false)}><GoldIcon name="medal" size={18} /> Wishlist</NavLink>
            <NavLink to="/suggestions" onClick={() => setShowMore(false)}><GoldIcon name="guides" size={18} /> Guides</NavLink>
            <NavLink to="/inspiration" onClick={() => setShowMore(false)}><GoldIcon name="inspiration" size={18} /> Reference</NavLink>
            <NavLink to="/community" onClick={() => setShowMore(false)}><GoldIcon name="community" size={18} /> Community</NavLink>
            <NavLink to="/tools" onClick={() => setShowMore(false)}><GoldIcon name="settings" size={18} /> Tools</NavLink>
            <NavLink to="/start" onClick={() => setShowMore(false)}><GoldIcon name="home" size={18} /> Getting Started</NavLink>
            <NavLink to="/data-manager" onClick={() => setShowMore(false)}><GoldIcon name="settings" size={18} /> Data Manager</NavLink>
            <NavLink to="/settings" onClick={() => setShowMore(false)}><GoldIcon name="settings" size={18} /> Settings</NavLink>
          </div>
        </div>
      )}
      <FloatingTimer />
      <button className="fab" onClick={() => setShowQuickAdd(true)} title="Quick add model" aria-label="Quick add model">+</button>
      {showQuickAdd && <QuickAdd onClose={() => setShowQuickAdd(false)} />}
      {showSearch && <CmdPalette onClose={() => setShowSearch(false)} />}
      {showShortcuts && (
        <div className="shortcuts-overlay" onClick={() => setShowShortcuts(false)}>
          <div className="shortcuts-panel" onClick={e => e.stopPropagation()}>
            <h3>Keyboard Shortcuts</h3>
            {[['Ctrl + K', 'Search everything'], ['/', 'Focus filter/search'], ['?', 'Show this panel'], ['+', 'Quick add model']].map(([key, desc]) => (
              <div key={key} className="shortcut-row"><span>{desc}</span><span className="shortcut-key">{key}</span></div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
