import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { ArrowUp, ArrowDown, Edit, Trash, Plus, ArrowLeft, Link as LinkIcon } from 'lucide-react';
import { db } from '../db';
import { uuid } from '../utils/helpers';
import Toggle from '../components/Toggle';

export default function ManagePrompts() {
  const { session } = useParams();
  const navigate = useNavigate();
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [adding, setAdding] = useState(false);
  const [newText, setNewText] = useState('');

  const prompts = useLiveQuery(async () => {
    const all = await db.prompts.where('session').equals(session).toArray();
    return all.sort((a, b) => a.order - b.order);
  }, [session]);

  const updatePrompt = async (id, patch) => {
    await db.prompts.update(id, patch);
  };

  const movePrompt = async (id, dir) => {
    if (!prompts) return;
    const idx = prompts.findIndex(p => p.id === id);
    const swapWith = idx + dir;
    if (swapWith < 0 || swapWith >= prompts.length) return;
    const a = prompts[idx];
    const b = prompts[swapWith];
    if (a.isLoopCloser || b.isLoopCloser) return;
    await db.prompts.update(a.id, { order: b.order });
    await db.prompts.update(b.id, { order: a.order });
  };

  const addCustom = async () => {
    if (!newText.trim()) {
      setAdding(false);
      return;
    }
    const maxOrder = Math.max(0, ...(prompts || []).map(p => p.order));
    await db.prompts.add({
      id: uuid(),
      session,
      text: newText.trim(),
      source: 'custom',
      enabled: true,
      isLoopCloser: false,
      order: maxOrder + 1
    });
    setAdding(false);
    setNewText('');
  };

  const deletePrompt = async (id) => {
    await db.prompts.delete(id);
    const bag = await db.shuffleBags.get(session);
    if (bag) {
      bag.remainingIds = bag.remainingIds.filter(rid => rid !== id);
      await db.shuffleBags.put(bag);
    }
  };

  const saveEdit = async () => {
    if (!editText.trim()) {
      setEditingId(null);
      return;
    }
    await db.prompts.update(editingId, { text: editText.trim() });
    setEditingId(null);
    setEditText('');
  };

  if (!prompts) return <div className="min-h-screen flex items-center justify-center"><div className="w-2 h-2 rounded-full breathe" style={{ background: 'var(--accent)' }} /></div>;

  return (
    <div className="px-5 pt-safe max-w-md mx-auto fade-up pb-10">
      <button onClick={() => navigate('/settings')} className="btn-ghost rounded-full w-9 h-9 flex items-center justify-center -ml-1 mb-6">
        <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
      </button>
      <h1 className="text-display text-[28px] mb-6 capitalize">{session} Prompts.</h1>
      <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
        {session === 'evening' ? 'The loop-closing prompt is pinned first.' : 'Rotates fairly across everything you enable.'}
      </p>

      <div className="space-y-2">
        {prompts.map((p, i) => (
          <div key={p.id} className="p-4 rounded-2xl" style={{ background: 'var(--surface)', border: '1px solid ' + (p.isLoopCloser ? 'var(--accent-soft)' : 'var(--border-soft)') }}>
            {editingId === p.id ? (
              <div>
                <textarea autoFocus id={`edit-${p.id}`} name={`edit-${p.id}`} value={editText} onChange={e => setEditText(e.target.value)} className="field w-full p-3 rounded-xl text-sm min-h-[80px] mb-2 serif-body" />
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setEditingId(null)} className="btn-ghost px-3 py-1.5 rounded-lg text-xs">Cancel</button>
                  <button onClick={saveEdit} className="btn-primary px-3 py-1.5 rounded-lg text-xs">Save</button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <div className="flex flex-col gap-1 pt-0.5">
                  <button onClick={() => movePrompt(p.id, -1)} disabled={i === 0 || p.isLoopCloser} className="opacity-50 hover:opacity-100 disabled:opacity-15"><ArrowUp className="w-3.5 h-3.5" strokeWidth={1.5} /></button>
                  <button onClick={() => movePrompt(p.id, 1)} disabled={i === prompts.length - 1 || p.isLoopCloser} className="opacity-50 hover:opacity-100 disabled:opacity-15"><ArrowDown className="w-3.5 h-3.5" strokeWidth={1.5} /></button>
                </div>
                <div className="flex-1 min-w-0">
                  {p.isLoopCloser && (
                    <div className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full mb-2" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>
                      <LinkIcon className="w-3 h-3" strokeWidth={1.5} /> Loop-closer
                    </div>
                  )}
                  <p className="text-sm leading-relaxed mb-2 serif-body" style={{ fontSize: '0.97rem', color: 'var(--text)', textDecoration: p.enabled ? 'none' : 'line-through', opacity: p.enabled ? 1 : 0.55 }}>{p.text}</p>
                  <div className="flex items-center gap-3">
                    <button onClick={() => { setEditingId(p.id); setEditText(p.text); }} className="text-xs flex items-center gap-1 opacity-70 hover:opacity-100" style={{ color: 'var(--text-soft)' }}><Edit className="w-3 h-3" strokeWidth={1.5} /> Edit</button>
                    {p.source === 'custom' && <button onClick={() => deletePrompt(p.id)} className="text-xs flex items-center gap-1 opacity-70 hover:opacity-100" style={{ color: 'var(--text-soft)' }}><Trash className="w-3 h-3" strokeWidth={1.5} /> Delete</button>}
                  </div>
                </div>
                <Toggle on={p.enabled} onChange={v => updatePrompt(p.id, { enabled: v })} />
              </div>
            )}
          </div>
        ))}
      </div>

      {adding ? (
        <div className="mt-3 p-4 rounded-2xl" style={{ background: 'var(--surface)', border: '1px dashed var(--accent-soft)' }}>
          <textarea autoFocus id="new-prompt" name="new-prompt" value={newText} onChange={e => setNewText(e.target.value)} placeholder="Write your prompt…" className="field w-full p-3 rounded-xl text-sm min-h-[80px] mb-2 serif-body" />
          <div className="flex gap-2 justify-end">
            <button onClick={() => setAdding(false)} className="btn-ghost px-3 py-1.5 rounded-lg text-xs">Cancel</button>
            <button onClick={addCustom} className="btn-primary px-3 py-1.5 rounded-lg text-xs">Add prompt</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} className="w-full mt-3 p-4 rounded-2xl text-sm flex items-center justify-center gap-2" style={{ background: 'var(--surface)', border: '1px dashed var(--border)', color: 'var(--text-muted)' }}>
          <Plus className="w-4 h-4" strokeWidth={1.5} /> Add your own prompt
        </button>
      )}
    </div>
  );
}