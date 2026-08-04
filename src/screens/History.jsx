import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, Pen, History as HistoryIcon } from 'lucide-react';
import { db } from '../db';
import { fmtDate, fmtTime } from '../utils/helpers';

export default function History() {
  const [entries, setEntries] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    db.entries.orderBy('createdAt').reverse().toArray().then(setEntries);
  }, []);

  const grouped = useMemo(() => {
    const map = new Map();
    for (const e of entries) {
      if (!map.has(e.date)) map.set(e.date, []);
      map.get(e.date).push(e);
    }
    return Array.from(map.entries());
  }, [entries]);

  return (
    <div className="px-5 pt-safe max-w-md mx-auto fade-up">
      <h1 className="text-display text-[34px] mt-6 mb-8 leading-tight">History.</h1>
      {grouped.length === 0 && (
        <div className="text-center py-24">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'var(--surface-2)' }}>
            <HistoryIcon className="w-6 h-6" style={{ color: 'var(--text-soft)' }} strokeWidth={1.5} />
          </div>
          <p className="text-display text-xl">Nothing here yet.</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Your entries will collect here.</p>
        </div>
      )}

      {grouped.map(([date, dayEntries]) => (
        <div key={date} className="mb-8">
          <h2 className="text-display text-lg mb-3 px-1">{fmtDate(date)}</h2>
          <div className="space-y-2">
            {dayEntries.sort((a, b) => b.createdAt - a.createdAt).map(e => (
              <EntryCard key={e.id} entry={e} onClick={() => navigate(`/entry/${e.id}`)} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function EntryCard({ entry, onClick }) {
  const cfg = {
    morning: { icon: Sun, label: 'Morning', color: 'var(--accent)' },
    evening: { icon: Moon, label: 'Evening', color: 'var(--accent)' },
    freeform: { icon: Pen, label: 'Freeform', color: 'var(--text-muted)' }
  }[entry.type];
  const I = cfg.icon;
  const preview = entry.type === 'freeform' ? entry.freeformText : entry.answers.map(a => a.response).filter(Boolean).join(' · ') || 'Empty entry';

  return (
    <button onClick={onClick} className="w-full p-4 rounded-2xl text-left flex gap-3 transition-all hover:translate-y-[-1px]"
      style={{ background: 'var(--surface)', border: '1px solid var(--border-soft)' }}>
      <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--surface-2)', color: cfg.color }}>
        <I className="w-4 h-4" strokeWidth={1.5} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{cfg.label}</span>
          <span className="text-xs" style={{ color: 'var(--text-soft)' }}>· {fmtTime(entry.createdAt)}</span>
        </div>
        <p className="text-sm line-clamp-2 serif-body" style={{ color: 'var(--text)' }}>{preview}</p>
      </div>
    </button>
  );
}