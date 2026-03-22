import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useTheme } from './components/ThemeProvider';
import FloatingTimer from './components/FloatingTimer';
import './app.css';

export default function Layout() {
  const { pathname } = useLocation();
  const { theme, toggle } = useTheme();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [pathname]);

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
            <div className="nav-more">
              <button className="nav-more-btn">More ▾</button>
              <div className="nav-dropdown">
                <NavLink to="/army-list">📋 Army List</NavLink>
                <NavLink to="/suggestions">📖 Guides</NavLink>
                <NavLink to="/inspiration">🖌️ Reference</NavLink>
                <NavLink to="/tools">🧰 Tools</NavLink>
                <NavLink to="/start">🎉 Getting Started</NavLink>
                <NavLink to="/data-manager">🔧 Data Manager</NavLink>
                <NavLink to="/settings">⚙️ Settings</NavLink>
              </div>
            </div>
            <button className="theme-toggle" onClick={toggle} title="Toggle theme">{theme === 'dark' ? '☀️' : '🌙'}</button>
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
        <NavLink to="/" end>🏠</NavLink>
        <NavLink to="/models">🛡️</NavLink>
        <NavLink to="/paints">🎨</NavLink>
        <NavLink to="/grey-pile">🪦</NavLink>
        <NavLink to="/progress">📊</NavLink>
        <NavLink to="/campaigns">⚔️</NavLink>
        <NavLink to="/settings">⚙️</NavLink>
      </nav>
      <FloatingTimer />
    </div>
  );
}
