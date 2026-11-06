import React from 'react';
import { BrowserRouter, HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { TeamDrawPage } from './routes/TeamDrawPage';
import { PrizeDrawPage } from './routes/PrizeDrawPage';

// Gunakan HashRouter saat di Electron atau protokol file:// agar routing tetap mulus tanpa server web
const isElectronOrFile = typeof window !== 'undefined' && 
  (window.location.protocol === 'file:' || Boolean(window.navigator.userAgent.match(/Electron/i)));

const RouterComponent = isElectronOrFile ? HashRouter : BrowserRouter;

export const App: React.FC = () => {
  return (
    <RouterComponent>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<TeamDrawPage />} />
          <Route path="hadiah" element={<PrizeDrawPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </RouterComponent>
  );
};
export default App;
