import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import Layout from './Layout';
import Home from './pages/Home';
import Models from './pages/Models';
import Paints from './pages/Paints';
import GreyPile from './pages/GreyPile';
import Progress from './pages/Progress';
import Campaigns from './pages/Campaigns';
import CampaignPlay from './pages/CampaignPlayNew';

const router = createHashRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'models', element: <Models /> },
      { path: 'paints', element: <Paints /> },
      { path: 'grey-pile', element: <GreyPile /> },
      { path: 'progress', element: <Progress /> },
      { path: 'campaigns', element: <Campaigns /> },
      { path: 'campaign/:id', element: <CampaignPlay /> },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
