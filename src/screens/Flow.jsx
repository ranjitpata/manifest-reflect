import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sun, Moon, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { db, drawSessionPrompts } from '../db';
import { todayStr, uuid } from '../utils/helpers';

export default function Flow() {
  const { session } = useParams();
  const navigate = useNavigate();
  const [prompts, setPrompts] = useState(null);
  const [current, setCurrent] = useState(0);
  const [responses, setResponses] = useState({});
  const [morningAnswer, setMorningAnswer] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const taRef = useRef(null);

  useEffect(() => {
    (async () => {
      const drawn = await drawSessionPrompts(session);
      setPrompts(drawn);
      if (session === 'evening') {
        const me = await db.entries.where('date').equals(todayStr()).and(e => e.type === 'morning').first();
        if (me?.answers[0]?.response) setMorningAnswer(me.answers[0].response);
      }
    })();
  }, [session]);

  useEffect(() => {
    if (taRef.current) taRef.current.focus();
  }, [current]);

  if (saved) return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="fade-up flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5" style={{ background: 'var(--accent-bg)' }}>
          <Check className="w-8 h-8" style={{ color: 'var(--accent)' }} strokeWidth={2} />
        </div>
        <p className="text-display text-2xl mb-1">Saved.</p>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{session === 'morning' ? 'Have a gentle day.' : 'Rest well.'}</p>
      </div>
    </div>
  );

  if (!prompts) return <div className="min-h-screen flex items-center justify-center"><div className="w-2 h-2 rounded-full breathe" style={{ background: 'var(--accent)' }} /></div>;
  if (prompts.length === 0) return (
    <div className="px-6 pt-safe min-h-screen flex flex-col items-center justify-center text-center">
      <p className="text-display text-2xl mb-3">No prompts enabled.</p>
      <button onClick={() => navigate(`/manage/${session}`)} className="btn-primary px-6 py-3 rounded-2xl">Manage prompts</button>
    </div>
  );

  const prompt = prompts[current];
  const isLast = current === prompts.length - 1;

  const handleNext = async () => {
    if (isLast) {
      setSaving(true);
      const now = Date.now();
      await db.entries.put({
        id: uuid(), date: todayStr(), type: session,
        answers: prompts.map(p => ({ promptId: p.id, promptText: p.text, response: responses[p.id] || '' })),
        freeformText: '', createdAt: now, updatedAt: now
      });
      setSaving(false);
      setSaved(true);
      setTimeout(() => navigate('/'), 1200);
    } else {
      setCurrent(c => c + 1);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="pt-safe px-5 pb-2 flex items-center justify-between">
        <button onClick={() => navigate('/')} className="btn-ghost rounded-full w-9 h-9 flex items-center justify-center -ml-1">
          <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
        </button>
        <div className="flex items-center gap-1.5">
          {prompts.map((_, i) => (
            <div key={i} className="dot" style={{ background: i === current ? 'var(--accent)' : i < current ? 'var(--accent-soft)' : 'var(--border)', width: i === current ? 22 : 6 }} />
          ))}
        </div>
        <div className="w-9" />
      </header>

      <div className="flex-1 flex flex-col px-6 pb-6 max-w-md mx-auto w-full">
        <div className="slide-in flex-1 flex flex-col" key={current}>
          <p className="text-xs uppercase tracking-wider mt-6 mb-4 flex items-center gap-2" style={{ color: 'var(--accent)' }}>
            {session === 'morning' ? <Sun className="w-3.5 h-3.5" strokeWidth={1.5} /> : <Moon className="w-3.5 h-3.5" strokeWidth={1.5} />}
            {session} · {current + 1} of {prompts.length}
          </p>
          <h2 className="text-display text-[26px] leading-snug mb-6">{prompt.text}</h2>

          {prompt.isLoopCloser && morningAnswer && (
            <div className="mb-5 p-4 rounded-2xl" style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-soft)' }}>
              <div className="flex items-center gap-2 text-[11px] mb-2 uppercase tracking-wider" style={{ color: 'var(--accent)' }}>
                <Sun className="w-3.5 h-3.5" strokeWidth={1.5} /> This morning you wrote
              </div>
              <p className="text-sm serif-body italic leading-relaxed" style={{ color: 'var(--text)' }}>"{morningAnswer}"</p>
            </div>
          )}

          <textarea
            ref={taRef}
            id={`prompt-${prompt.id}`}
            name={`prompt-${prompt.id}`}
            value={responses[prompt.id] || ''}
            onChange={(e) => setResponses(r => ({ ...r, [prompt.id]: e.target.value }))}
            placeholder="Write your answer…"
            className="field flex-1 min-h-[220px] p-4 rounded-2xl text-base leading-relaxed serif-body"
            style={{ fontSize: '1.05rem' }}
          />
        </div>
        <div className="pt-5 pb-safe">
          <button onClick={handleNext} disabled={saving} className="btn-primary w-full py-3.5 rounded-2xl font-medium flex items-center justify-center gap-2">
            {saving ? 'Saving…' : (isLast ? 'Save & finish' : 'Next')}
            {!saving && <ArrowRight className="w-4 h-4" strokeWidth={1.5} />}
          </button>
        </div>
      </div>
    </div>
  );
}