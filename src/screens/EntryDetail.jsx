import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sun, Moon, Pen, ArrowLeft } from 'lucide-react';
import { db } from '../db';
import { fmtDate, fmtTime } from '../utils/helpers';

export default function EntryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [entry, setEntry] = useState(null);

  useEffect(() => { db.entries.get(id).then(setEntry); }, [id]);
  if (!entry) return <div className="min-h-screen flex items-center justify-center"><div className="w-2 h-2 rounded-full breathe" style={{ background: 'var(--accent)' }} /></div>;

  const cfg = {
    morning: { icon: Sun, label: 'Morning intention' },
    evening: { icon: Moon, label: 'Evening reflection' },
    freeform: { icon: Pen, label: 'Freeform note' }
  }[entry.type];
  const I = cfg.icon;

  return (
    <div className="px-5 pt-safe max-w-md mx-auto fade-up pb-10">
      <button onClick={() => navigate('/history')} className="btn-ghost rounded-full w-9 h-9 flex items-center justify-center -ml-1 mb-6">
        <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
      </button>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>
          <I className="w-5 h-5" strokeWidth={1.5} />
        </div>
        <div>
          <div className="font-medium text-display text-lg">{cfg.label}</div>
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{fmtDate(entry.date)} · {fmtTime(entry.createdAt)}</div>
        </div>
      </div>

      {entry.type === 'freeform' ? (
        <div className="p-5 rounded-2xl" style={{ background: 'var(--surface)', border: '1px solid var(--border-soft)' }}>
          <p className="whitespace-pre-wrap leading-relaxed serif-body" style={{ fontSize: '1.05rem' }}>{entry.freeformText}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {entry.answers.map((a, i) => (
            <div key={i} className="p-5 rounded-2xl" style={{ background: 'var(--surface)', border: '1px solid var(--border-soft)' }}>
              <p className="text-[11px] uppercase tracking-wider mb-3" style={{ color: 'var(--text-soft)' }}>{a.promptText}</p>
              <p className="whitespace-pre-wrap leading-relaxed serif-body" style={{ fontSize: '1.05rem' }}>
                {a.response?.trim() ? a.response : <span style={{ color: 'var(--text-soft)', fontStyle: 'italic' }}>— no answer —</span>}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}