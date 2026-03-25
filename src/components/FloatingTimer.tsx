import GoldIcon from './GoldIcon';
import { useState, useEffect, useRef } from 'react';
import { db } from '../db';
import { useLiveQuery } from 'dexie-react-hooks';

export default function FloatingTimer() {
  const [open, setOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(() => Number(localStorage.getItem('grimdeck_timer') || '0'));
  const [model, setModel] = useState(localStorage.getItem('grimdeck_timer_model') || '');
  const [saved, setSaved] = useState(false);
  const ref = useRef<number | null>(null);
  const models = useLiveQuery(() => db.models.toArray()) ?? [];

  useEffect(() => {
    if (running) {
      ref.current = window.setInterval(() => {
        setSeconds(s => { const n = s + 1; localStorage.setItem('grimdeck_timer', String(n)); return n; });
      }, 1000);
    } else if (ref.current) clearInterval(ref.current);
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [running]);

  const fmt = (s: number) => `${Math.floor(s / 3600)}:${Math.floor((s % 3600) / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  const reset = () => { setSeconds(0); setRunning(false); localStorage.setItem('grimdeck_timer', '0'); setSaved(false); };

  const saveSession = async () => {
    if (seconds < 10) return;
    const match = models.find(m => m.name.toLowerCase().includes(model.toLowerCase()));
    if (match?.id) {
      await db.paintingLogs.add({ modelId: match.id, text: `⏱ Painting session: ${fmt(seconds)}`, timestamp: Date.now(), photoUrl: '' });
      setSaved(true);
    } else {
      alert('Model not found — type a name from your collection');
    }
  };

  return (
    <>
      <button className="floating-timer-btn" onClick={() => setOpen(!open)} title="Paint Timer">
        <>{running ? <><GoldIcon name="winged-hour" size={14} /> {fmt(seconds)}</> : <GoldIcon name="winged-hour" size={14} />}</>
      </button>
      {open && (
        <div className="floating-timer-panel">
          <div className="floating-timer-display">{fmt(seconds)}</div>
          <input value={model} onChange={e => { setModel(e.target.value); localStorage.setItem('grimdeck_timer_model', e.target.value); }} placeholder="What are you painting?" className="floating-timer-input" list="timer-models" />
          <datalist id="timer-models">{models.map(m => <option key={m.id} value={m.name} />)}</datalist>
          <div className="floating-timer-actions">
            <button className={`btn btn-sm ${running ? 'btn-danger' : 'btn-primary'}`} onClick={() => setRunning(!running)}>{running ? '⏸ Pause' : '▶ Start'}</button>
            {seconds > 10 && !running && <button className="btn btn-sm btn-ghost" onClick={saveSession}>{saved ? '✓ Saved' : 'Log session'}</button>}
            <button className="btn btn-sm btn-ghost" onClick={reset}>Reset</button>
            <button className="btn btn-sm btn-ghost" onClick={() => setOpen(false)}>✕</button>
          </div>
        </div>
      )}
    </>
  );
}
