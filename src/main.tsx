import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeProvider';
import Layout from './Layout';
import Home from './pages/Home';
import Models from './pages/Models';
import Paints from './pages/Paints';
import GreyPile from './pages/GreyPile';
import Progress from './pages/Progress';
import Campaigns from './pages/Campaigns';
import CampaignPlay from './pages/CampaignPlayNew';
import Settings from './pages/Settings';
import PaintSuggestions from './pages/PaintSuggestions';
import ModelDetail from './pages/ModelDetail';
import Inspiration from './pages/Inspiration';
import ArmyList from './pages/ArmyList';
import GettingStarted from './pages/GettingStarted';
import Tools from './pages/Tools';

const router = createHashRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'models', element: <Models /> },
      { path: 'model/:id', element: <ModelDetail /> },
      { path: 'paints', element: <Paints /> },
      { path: 'grey-pile', element: <GreyPile /> },
      { path: 'progress', element: <Progress /> },
      { path: 'campaigns', element: <Campaigns /> },
      { path: 'campaign/:id', element: <CampaignPlay /> },
      { path: 'settings', element: <Settings /> },
      { path: 'suggestions', element: <PaintSuggestions /> },
      { path: 'inspiration', element: <Inspiration /> },
      { path: 'army-list', element: <ArmyList /> },
      { path: 'start', element: <GettingStarted /> },
      { path: 'tools', element: <Tools /> },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>
);
