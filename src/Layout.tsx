import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import './app.css';

export default function Layout() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [pathname]);

  return (
    <div className="site">
      <header className="site-header">
        <div className="header-inner">
          <NavLink to="/" className="logo" end>GRIMDECK</NavLink>
          <nav className="site-nav">
            <NavLink to="/" end>Home</NavLink>
            <NavLink to="/models">Models</NavLink>
            <NavLink to="/paints">Paints</NavLink>
            <NavLink to="/grey-pile">Grey Pile</NavLink>
            <NavLink to="/progress">Progress</NavLink>
            <NavLink to="/campaigns">Campaigns</NavLink>
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
    </div>
  );
}
