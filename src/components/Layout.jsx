// import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, History, Settings as SettingsIcon } from 'lucide-react';

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  const items = [
    { key: '/', label: 'Today', icon: Home },
    { key: '/history', label: 'History', icon: History },
    { key: '/settings', label: 'Settings', icon: SettingsIcon }
  ];

  return (
    <div className="min-h-screen pb-24">
      {children}
      <nav className="fixed bottom-0 left-0 right-0 z-20 pb-safe"
        style={{ background: 'color-mix(in srgb, var(--bg) 86%, transparent)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderTop: '1px solid var(--border-soft)' }}>
        <div className="max-w-md mx-auto flex items-stretch px-4">
          {items.map(it => {
            const active = location.pathname === it.key || (it.key !== '/' && location.pathname.startsWith(it.key));
            const I = it.icon;
            return (
              <button key={it.key} onClick={() => navigate(it.key)} className="flex-1 py-2.5 flex flex-col items-center gap-1 transition-colors"
                style={{ color: active ? 'var(--accent)' : 'var(--text-soft)' }}>
                <I className="w-5 h-5" strokeWidth={1.5} />
                <span className="text-[11px] font-medium">{it.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}