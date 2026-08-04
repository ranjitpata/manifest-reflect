import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db, DEFAULT_SETTINGS } from '../db';

const AppContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => useContext(AppContext);

let notifTimers = [];
function clearNotifSchedules() { notifTimers.forEach(t => clearTimeout(t)); notifTimers = []; }

function scheduleNotifications(settings) {
  clearNotifSchedules();
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  if (!('serviceWorker' in navigator)) return;

  const schedule = (timeStr, title, body, tag) => {
    const [h, m] = timeStr.split(':').map(Number);
    const now = new Date();
    const target = new Date();
    target.setHours(h, m, 0, 0);
    if (target <= now) target.setDate(target.getDate() + 1);
    const delay = target - now;
    
    const t = setTimeout(async () => {
      try {
        const reg = await navigator.serviceWorker.ready;
        reg.showNotification(title, { body, tag });
      } catch { 
        /* no-op: ignore notification errors */ 
      }
      schedule(timeStr, title, body, tag); // Re-arm for next day
    }, delay);
    notifTimers.push(t);
  };

  schedule(settings.morningTime, 'A quiet morning moment', "Set today's intention when you have a minute.", 'mnr-morning');
  schedule(settings.eveningTime, 'A quiet evening moment', 'Reflect on how today went, just for a moment.', 'mnr-evening');
}

export function AppProvider({ children }) {
  const [settings, setSettings] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      await db.open();
      const s = await db.settings.get('singleton');
      setSettings(s || DEFAULT_SETTINGS);
      setReady(true);
    })();
  }, []);

  const updateSettings = useCallback((patch) => {
    setSettings(prev => {
      const next = { ...(prev || DEFAULT_SETTINGS), ...patch };
      db.settings.put(next);
      return next;
    });
  }, []);

  // Theme Applier
  useEffect(() => {
    if (!settings) return;
    const apply = () => {
      const sys = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const isDark = settings.theme === 'dark' || (settings.theme === 'system' && sys);
      document.documentElement.classList.toggle('dark', isDark);
      const meta = document.getElementById('theme-color-meta');
      if (meta) meta.setAttribute('content', isDark ? '#1A1614' : '#F7F1E8');
    };
    apply();
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [settings]);

  // Notification Scheduler
  useEffect(() => {
    if (settings) scheduleNotifications(settings);
  }, [settings]);

  return (
    <AppContext.Provider value={{ settings, updateSettings, ready }}>
      {children}
    </AppContext.Provider>
  );
}