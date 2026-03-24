import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useTheme } from './components/ThemeProvider';
import FloatingTimer from './components/FloatingTimer';
import { getUser, onAuthChange } from './db/cloud-sync';
import GoldIcon from './components/GoldIcon';
import type { User } from '@supabase/supabase-js';
import './app.css';

export default function Layout() {
  const { pathname } = useLocation();
  const { theme, toggle } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    getUser().then(u => setUser(u));
    const { data } = onAuthChange(session => setUser(session?.user || null));
    return () => data.subscription.unsubscribe();
  }, []);
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [pathname]);
  useEffect(() => { setShowMore(false); }, [pathname]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;
      if (e.key === '/' && !e.ctrlKey) { e.preventDefault(); document.querySelector<HTMLInputElement>('.filter-search')?.focus(); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="site">
      <header className="site-header">
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
                <NavLink to="/army-list">📋 Army List</NavLink>
                <NavLink to="/suggestions">📖 Guides</NavLink>
                <NavLink to="/inspiration">🖌️ Reference</NavLink>
                <NavLink to="/tools">🧰 Tools</NavLink>
                <NavLink to="/start">🎉 Getting Started</NavLink>
                <NavLink to="/data-manager">🔧 Data Manager</NavLink>
                <NavLink to="/settings">⚙️ Settings</NavLink>
                <NavLink to="/account">☁️ Account</NavLink>
              </div>
            </div>
            <button className="theme-toggle" onClick={toggle} title="Toggle theme">{theme === 'dark' ? '☀️' : '🌙'}</button>
            <NavLink to="/account" className="nav-user" title={user ? user.email || 'Account' : 'Sign in'}>
              {user ? '👤' : '🔒'}
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="site-main">
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="footer-inner">
          <span className="footer-brand">GRIMDECK</span>
          <span className="footer-tagline">Your miniature hobby companion</span>
        </div>
      </footer>
      {/* Mobile bottom nav */}
      <nav className="mobile-nav">
        <NavLink to="/" end><GoldIcon name="home" size={22} /></NavLink>
        <NavLink to="/models"><GoldIcon name="models" size={22} /></NavLink>
        <NavLink to="/paints"><GoldIcon name="paints" size={22} /></NavLink>
        <NavLink to="/grey-pile"><GoldIcon name="skull" size={22} /></NavLink>
        <NavLink to="/progress"><GoldIcon name="progress" size={22} /></NavLink>
        <NavLink to="/campaigns"><GoldIcon name="campaigns" size={22} /></NavLink>
        <button className="mobile-more-btn" onClick={() => setShowMore(!showMore)}><GoldIcon name="settings" size={22} /></button>
      </nav>
      {showMore && (
        <div className="mobile-more-overlay" onClick={() => setShowMore(false)}>
          <div className="mobile-more-menu" onClick={e => e.stopPropagation()}>
            <NavLink to="/account" onClick={() => setShowMore(false)}><GoldIcon name="eagle-shield" size={18} /> Account</NavLink>
            <NavLink to="/army-list" onClick={() => setShowMore(false)}><GoldIcon name="guides" size={18} /> Army List</NavLink>
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
    </div>
  );
}
