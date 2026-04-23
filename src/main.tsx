import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeProvider';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './Layout';

// Eager load: Home (landing page, critical path) + Layout + ErrorBoundary
import Home from './pages/Home';

// Lazy load all other pages for code splitting
const Models = lazy(() => import('./pages/Models'));
const Paints = lazy(() => import('./pages/Paints'));
const GreyPile = lazy(() => import('./pages/GreyPile'));
const Progress = lazy(() => import('./pages/Progress'));
const Campaigns = lazy(() => import('./pages/Campaigns'));
const CampaignPlay = lazy(() => import('./pages/CampaignPlayNew'));
const Settings = lazy(() => import('./pages/Settings'));
const Account = lazy(() => import('./pages/Account'));
const Community = lazy(() => import('./pages/Community'));
const PaintSuggestions = lazy(() => import('./pages/PaintSuggestions'));
const ModelDetail = lazy(() => import('./pages/ModelDetail'));
const Inspiration = lazy(() => import('./pages/Inspiration'));
const ArmyList = lazy(() => import('./pages/ArmyList'));
const GettingStarted = lazy(() => import('./pages/GettingStarted'));
const Tools = lazy(() => import('./pages/Tools'));
const DataManager = lazy(() => import('./pages/DataManager'));
const BattleLogPage = lazy(() => import('./pages/BattleLog'));
const Showcase = lazy(() => import('./pages/Showcase'));
const HobbyStats = lazy(() => import('./pages/HobbyStats'));
const Challenges = lazy(() => import('./pages/Challenges'));
const Wishlist = lazy(() => import('./pages/Wishlist'));

// 404 Not Found page
const NotFound = lazy(() => import('./pages/NotFound'));

function LazyPage({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200, color: 'var(--text-dim)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.8rem', letterSpacing: 2, textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 8 }}>Loading</div>
          <div className="skeleton" style={{ width: 200, height: 16, margin: '0 auto' }} />
        </div>
      </div>
    }>
      {children}
    </Suspense>
  );
}

const router = createHashRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'models', element: <LazyPage><Models /></LazyPage> },
      { path: 'model/:id', element: <LazyPage><ModelDetail /></LazyPage> },
      { path: 'paints', element: <LazyPage><Paints /></LazyPage> },
      { path: 'grey-pile', element: <LazyPage><GreyPile /></LazyPage> },
      { path: 'progress', element: <LazyPage><Progress /></LazyPage> },
      { path: 'campaigns', element: <LazyPage><Campaigns /></LazyPage> },
      { path: 'campaign/:id', element: <LazyPage><CampaignPlay /></LazyPage> },
      { path: 'settings', element: <LazyPage><Settings /></LazyPage> },
      { path: 'account', element: <LazyPage><Account /></LazyPage> },
      { path: 'community', element: <LazyPage><Community /></LazyPage> },
      { path: 'suggestions', element: <LazyPage><PaintSuggestions /></LazyPage> },
      { path: 'inspiration', element: <LazyPage><Inspiration /></LazyPage> },
      { path: 'army-list', element: <LazyPage><ArmyList /></LazyPage> },
      { path: 'start', element: <LazyPage><GettingStarted /></LazyPage> },
      { path: 'tools', element: <LazyPage><Tools /></LazyPage> },
      { path: 'data-manager', element: <LazyPage><DataManager /></LazyPage> },
      { path: 'battle-log', element: <LazyPage><BattleLogPage /></LazyPage> },
      { path: 'showcase', element: <LazyPage><Showcase /></LazyPage> },
      { path: 'hobby-stats', element: <LazyPage><HobbyStats /></LazyPage> },
      { path: 'challenges', element: <LazyPage><Challenges /></LazyPage> },
      { path: 'wishlist', element: <LazyPage><Wishlist /></LazyPage> },
      { path: '*', element: <LazyPage><NotFound /></LazyPage> },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>
);
