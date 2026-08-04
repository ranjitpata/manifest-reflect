import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { db } from '../db';
import { Sun, Moon, Download, ArrowRight, Bell } from 'lucide-react';
import Toggle from '../components/Toggle';
import { todayStr, isIOS, isStandalone } from '../utils/helpers';

export default function Settings() {
  const { settings, updateSettings } = useApp();

  if (!settings) return null;

  const handleExport = async () => {
    const [prompts, entries, bags] = await Promise.all([db.prompts.toArray(), db.entries.toArray(), db.shuffleBags.toArray()]);
    const data = { version: 1, exportedAt: new Date().toISOString(), settings, prompts, entries, shuffleBags: bags };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `manifest-reflect-${todayStr()}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const enableNotifs = async () => {
    const r = await Notification.requestPermission();
    if (r === 'granted') updateSettings({ }); 
  };

  return (
    <div className="px-5 pt-safe max-w-md mx-auto fade-up pb-10">
      <h1 className="text-display text-[34px] mt-6 mb-8 leading-tight">Settings.</h1>
      
      <Section title="Quiet reminders">
        <TimeRow label="Morning" icon={Sun} value={settings.morningTime} onChange={v => updateSettings({ morningTime: v })} />
        <TimeRow label="Evening" icon={Moon} value={settings.eveningTime} onChange={v => updateSettings({ eveningTime: v })} />
        {typeof Notification !== 'undefined' && Notification.permission !== 'granted' && Notification.permission !== 'denied' && (
          <button onClick={enableNotifs} className="btn-ghost mt-3 px-4 py-2 rounded-xl text-sm flex items-center gap-2">
            <Bell className="w-4 h-4" strokeWidth={1.5} /> Enable notifications
          </button>
        )}
        {isIOS() && !isStandalone() && <p className="text-xs mt-2" style={{ color: 'var(--text-soft)' }}>On iPhone, add to Home Screen for reminders.</p>}
      </Section>

      <Section title="Prompts per session">
        <StepperRow label="Morning" value={settings.morningSessionSize} onChange={v => updateSettings({ morningSessionSize: v })} />
        <StepperRow label="Evening" value={settings.eveningSessionSize} onChange={v => updateSettings({ eveningSessionSize: v })} />
      </Section>

      <Section title="Loop-closing prompt">
        <div className="flex items-start gap-3">
          <p className="text-sm leading-relaxed flex-1">Each evening, the first prompt asks whether today felt the way you hoped this morning.</p>
          <Toggle on={settings.loopCloserEnabled} onChange={v => updateSettings({ loopCloserEnabled: v })} />
        </div>
      </Section>

      <Section title="Manage prompts">
        <ManageLink session="morning" icon={Sun} />
        <ManageLink session="evening" icon={Moon} />
      </Section>

      <Section title="Appearance">
        <div className="flex gap-2">
          {['system', 'light', 'dark'].map(t => (
            <button key={t} onClick={() => updateSettings({ theme: t })}
              className="flex-1 py-2.5 rounded-xl text-sm capitalize transition-all"
              style={{ background: settings.theme === t ? 'var(--accent-bg)' : 'transparent', border: '1px solid ' + (settings.theme === t ? 'var(--accent-soft)' : 'var(--border-soft)'), color: settings.theme === t ? 'var(--accent)' : 'var(--text-muted)' }}>
              {t}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Your data">
        <button onClick={handleExport} className="btn-ghost w-full py-3 rounded-xl text-sm flex items-center justify-center gap-2">
          <Download className="w-4 h-4" strokeWidth={1.5} /> Export to file
        </button>
      </Section>
    </div>
  );
}

const Section = ({ title, children }) => (
  <div className="mb-6">
    <h2 className="text-[11px] uppercase tracking-wider mb-3 px-1 font-medium" style={{ color: 'var(--text-soft)' }}>{title}</h2>
    <div className="p-4 rounded-2xl space-y-3" style={{ background: 'var(--surface)', border: '1px solid var(--border-soft)' }}>{children}</div>
  </div>
);

const TimeRow = ({ label, icon: Icon, value, onChange }) => (
  <div className="flex items-center gap-3">
    <Icon className="w-4 h-4" strokeWidth={1.5} style={{ color: 'var(--accent)' }} />
    <span className="flex-1 text-sm">{label}</span>
    <input type="time" value={value} onChange={e => onChange(e.target.value)} className="field px-3 py-1.5 rounded-lg text-sm" />
  </div>
);

const StepperRow = ({ label, value, onChange }) => {
  const set = (v) => onChange(Math.max(1, Math.min(3, v)));
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 text-sm">{label}</div>
      <div className="flex items-center gap-2">
        <button onClick={() => set(value - 1)} disabled={value <= 1} className="w-8 h-8 rounded-full flex items-center justify-center text-base" style={{ background: 'var(--surface-2)', color: 'var(--text-muted)', opacity: value <= 1 ? 0.4 : 1 }}>−</button>
        <span className="w-6 text-center font-medium">{value}</span>
        <button onClick={() => set(value + 1)} disabled={value >= 3} className="w-8 h-8 rounded-full flex items-center justify-center text-base" style={{ background: 'var(--surface-2)', color: 'var(--text-muted)', opacity: value >= 3 ? 0.4 : 1 }}>+</button>
      </div>
    </div>
  );
};

const ManageLink = ({ session, icon: Icon }) => {
  const navigate = useNavigate(); 
  return (
    <button onClick={() => navigate(`/manage/${session}`)} className="w-full p-4 rounded-xl text-left flex items-center gap-3 transition-colors hover:bg-[color:var(--surface-2)]"
      style={{ background: 'var(--surface-2)', border: '1px solid var(--border-soft)' }}>
      <Icon className="w-5 h-5" style={{ color: 'var(--accent)' }} strokeWidth={1.5} />
      <div className="flex-1">
        <div className="font-medium capitalize">{session} prompts</div>
        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Edit, reorder, add your own</div>
      </div>
      <ArrowRight className="w-4 h-4" style={{ color: 'var(--text-soft)' }} strokeWidth={1.5} />
    </button>
  );
};