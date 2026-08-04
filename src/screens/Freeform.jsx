import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import { Close, Pen } from 'lucide-react';
import { X, Pen } from 'lucide-react';
import { db } from '../db';
import { todayStr, uuid } from '../utils/helpers';

export default function Freeform() {
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const taRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => { taRef.current?.focus(); }, []);

  const handleSave = async () => {
    if (!text.trim()) { navigate('/'); return; }
    setSaving(true);
    const now = Date.now();
    await db.entries.put({
      id: uuid(), date: todayStr(), type: 'freeform',
      answers: [], freeformText: text.trim(), createdAt: now, updatedAt: now
    });
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="pt-safe px-5 pb-2 flex items-center justify-between">
        <button onClick={() => navigate('/')} className="btn-ghost rounded-full w-9 h-9 flex items-center justify-center -ml-1">
          <X className="w-5 h-5" strokeWidth={1.5} />
        </button>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</p>
        <div className="w-9" />
      </header>
      <div className="flex-1 flex flex-col px-6 pb-6 max-w-md mx-auto w-full">
        <p className="text-xs uppercase tracking-wider mt-4 mb-3 flex items-center gap-2" style={{ color: 'var(--accent)' }}>
          <Pen className="w-3.5 h-3.5" strokeWidth={1.5} /> Freeform
        </p>
        <h2 className="text-display text-[26px] mb-6 leading-snug">Whatever's here.</h2>
        <textarea
          ref={taRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write whatever arrives…"
          className="field flex-1 min-h-[320px] p-4 rounded-2xl text-base leading-relaxed serif-body"
          style={{ fontSize: '1.05rem' }}
        />
        <div className="pt-5 pb-safe">
          <button onClick={handleSave} disabled={saving} className="btn-primary w-full py-3.5 rounded-2xl font-medium">
            {saving ? 'Saving…' : (text.trim() ? 'Save' : 'Close')}
          </button>
        </div>
      </div>
    </div>
  );
}