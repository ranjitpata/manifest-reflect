import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useApp } from './context/AppContext';
import { seedDefaults } from './db';
import Layout from './components/Layout';

import Onboarding from './screens/Onboarding';
import Home from './screens/Home';
import Flow from './screens/Flow';
import Freeform from './screens/Freeform';
import History from './screens/History';
import EntryDetail from './screens/EntryDetail';
import Settings from './screens/Settings';
import ManagePrompts from './screens/ManagePrompts';


export default function App() {
  const { ready, settings } = useApp();
  const location = useLocation();

  useEffect(() => { seedDefaults(); }, []);

  if (!ready || !settings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-2 h-2 rounded-full breathe" style={{ background: 'var(--accent)' }} />
      </div>
    );
  }

  if (!settings.onboardingComplete && location.pathname !== '/onboarding') {
    return <Onboarding />;
  }

  return (
    <div className="grain">
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/flow/:session" element={<Flow />} />
        <Route path="/freeform" element={<Freeform />} />
        <Route path="/entry/:id" element={<EntryDetail />} />
        <Route path="/manage/:session" element={<ManagePrompts />} />
        
        {/* Routes with Bottom Nav */}
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/history" element={<Layout><History /></Layout>} />
        <Route path="/settings" element={<Layout><Settings /></Layout>} />
      </Routes>
    </div>
  );
}