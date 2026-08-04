import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../db';
import { fmtDate, fmtTime } from '../utils/helpers';

export default function PrintJournal() {
  const [entries, setEntries] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const allEntries = await db.entries.orderBy('createdAt').reverse().toArray();
      setEntries(allEntries);
      // Give React a moment to render the hidden div, then open print dialog
      setTimeout(() => window.print(), 400);
    })();
  }, []);

  useEffect(() => {
    const handleAfterPrint = () => navigate('/settings', { replace: true });
    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, [navigate]);

  // Group entries by date
  const grouped = (entries || []).reduce((acc, e) => {
    if (!acc[e.date]) acc[e.date] = [];
    acc[e.date].push(e);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <>
      {/* 1. Mobile Loading Screen (Hidden during print) */}
      <div className="print:hidden min-h-screen flex flex-col items-center justify-center">
        <div className="w-2 h-2 rounded-full breathe mb-4" style={{ background: 'var(--accent)' }} />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Preparing your journal...</p>
      </div>

      {/* 2. Hidden Print View (Only visible during print) */}
      <div className="hidden print:block print-container p-8 bg-white text-black w-full">
        <h1 className="text-3xl font-serif border-b pb-4 mb-8">Manifest &amp; Reflect Journal</h1>
        
        {sortedDates.length === 0 && <p>No entries to display.</p>}

        {sortedDates.map(date => (
          <div key={date} className="mb-8 break-inside-avoid">
            <h2 className="text-xl font-serif font-bold mb-4 text-gray-800">{fmtDate(date)}</h2>
            
            {/* Sort entries within the day: Morning -> Evening -> Freeform */}
            {grouped[date]
              .sort((a, b) => {
                const order = { morning: 1, evening: 2, freeform: 3 };
                return order[a.type] - order[b.type] || a.createdAt - b.createdAt;
              })
              .map(entry => {
                if (entry.type === 'freeform') {
                  return (
                    <div key={entry.id} className="mb-6 pl-4 border-l-2 border-gray-300">
                      <p className="text-xs uppercase tracking-wider text-gray-500 font-sans mb-1">
                        Freeform Note · {fmtTime(entry.createdAt)}
                      </p>
                      <p className="font-serif whitespace-pre-wrap">{entry.freeformText}</p>
                    </div>
                  );
                }

                return (
                  <div key={entry.id} className="mb-6 pl-4 border-l-2 border-gray-300">
                    <p className="text-xs uppercase tracking-wider text-gray-500 font-sans mb-2">
                      {entry.type === 'morning' ? 'Morning Intention' : 'Evening Reflection'} · {fmtTime(entry.createdAt)}
                    </p>
                    {entry.answers.map((a, i) => (
                      <div key={i} className="mb-3">
                        <p className="text-sm italic text-gray-600 font-sans mb-1">{a.promptText}</p>
                        <p className="font-serif whitespace-pre-wrap">{a.response || '—'}</p>
                      </div>
                    ))}
                  </div>
                );
              })}
          </div>
        ))}
      </div>
    </>
  );
}