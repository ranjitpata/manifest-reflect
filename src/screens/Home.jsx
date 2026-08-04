import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, Pen, Check, ArrowRight } from 'lucide-react';
import { db } from '../db';
import { todayStr, greeting } from '../utils/helpers';

export default function Home() {
  const [todayEntries, setTodayEntries] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    db.entries.where('date').equals(todayStr()).toArray().then(setTodayEntries);
  }, []);

  const morningDone = todayEntries.some(e => e.type === 'morning');
  const eveningDone = todayEntries.some(e => e.type === 'evening');
  const freeformCount = todayEntries.filter(e => e.type === 'freeform').length;

  return (
    <div className="px-5 pt-safe max-w-md mx-auto fade-up">
      <p className="text-sm mt-6 mb-1" style={{ color: 'var(--text-soft)' }}>{greeting()}.</p>
      <h1 className="text-display text-[34px] mb-1 leading-tight">{new Date().toLocaleDateString([], { weekday: 'long' })}.</h1>
      <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>{new Date().toLocaleDateString([], { month: 'long', day: 'numeric' })}</p>

      <div className="space-y-3">
        <RitualCard title="Morning intention" subtitle={morningDone ? "Set for today." : "A few minutes to begin."} icon={Sun} done={morningDone} onClick={() => navigate('/flow/morning')} />
        <RitualCard title="Evening reflection" subtitle={eveningDone ? "Closed for today." : "Close the loop."} icon={Moon} done={eveningDone} onClick={() => navigate('/flow/evening')} />
      </div>

      <button onClick={() => navigate('/freeform')} className="w-full mt-3 p-5 rounded-2xl text-left flex items-center gap-4 transition-all hover:translate-y-[-1px]"
        style={{ background: 'var(--surface)', border: '1px dashed var(--border)' }}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>
          <Pen className="w-5 h-5" strokeWidth={1.5} />
        </div>
        <div className="flex-1">
          <div className="font-medium text-display text-lg">Write freely</div>
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{freeformCount > 0 ? `${freeformCount} notes today` : 'No prompt. Just words.'}</div>
        </div>
        <ArrowRight className="w-5 h-5" style={{ color: 'var(--text-soft)' }} strokeWidth={1.5} />
      </button>
    </div>
  );
}

function RitualCard({ title, subtitle, icon: Icon, done, onClick }) {
  return (
    <button onClick={onClick} className="w-full p-5 rounded-2xl text-left flex items-center gap-4 transition-all hover:translate-y-[-1px]"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: done ? 'var(--accent-bg)' : 'var(--surface-2)', color: done ? 'var(--accent)' : 'var(--text-muted)' }}>
        {done ? <Check className="w-5 h-5" strokeWidth={2} /> : <Icon className="w-5 h-5" strokeWidth={1.5} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-display text-lg">{title}</div>
        <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{subtitle}</div>
      </div>
    </button>
  );
}
