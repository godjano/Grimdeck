import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../db';
import GoldIcon from '../GoldIcon';
import type { MiniatureModel } from '../../types';

interface ActiveWorkbenchProps {
  wipModels: MiniatureModel[];
  onUpdateStatus: (id: number, status: any) => void;
}

export default function ActiveWorkbench({ wipModels, onUpdateStatus }: ActiveWorkbenchProps) {
  const nav = useNavigate();
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(() => Number(localStorage.getItem('grimdeck_bench_timer') || '0'));
  const ref = useRef<number | null>(null);

  useEffect(() => {
    if (running) {
      ref.current = window.setInterval(() => {
        setSeconds(s => {
          const n = s + 1;
          localStorage.setItem('grimdeck_bench_timer', String(n));
          return n;
        });
      }, 1000);
    } else if (ref.current) clearInterval(ref.current);
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [running]);

  const fmt = (s: number) => `${Math.floor(s / 3600)}:${Math.floor((s % 3600) / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const resetTimer = () => { setSeconds(0); setRunning(false); localStorage.setItem('grimdeck_bench_timer', '0'); };

  const logSession = async (model: MiniatureModel) => {
    if (seconds < 30) return;
    await db.paintingLogs.add({
      modelId: model.id!,
      text: `Workbench session: ${fmt(seconds)}`,
      timestamp: Date.now(),
      photoUrl: '',
    });
    resetTimer();
  };

  // Calculate total session time today

  return (
    <div className="workbench">
      <div className="workbench-header">
        <div className="workbench-header-left">
          <h3 className="workbench-title">
            <GoldIcon name="paints" size={20} />
            Active Workbench
          </h3>
          <span className="workbench-count">{wipModels.length} model{wipModels.length !== 1 ? 's' : ''} in progress</span>
        </div>
        <div className="workbench-timer-area">
          <div className={`workbench-timer ${running ? 'workbench-timer-running' : ''}`}>
            <GoldIcon name="winged-hour" size={14} />
            <span className="workbench-timer-display">{fmt(seconds)}</span>
          </div>
          <div className="workbench-timer-btns">
            <button className={`btn btn-sm ${running ? 'btn-danger' : 'btn-primary'}`} onClick={() => setRunning(!running)}>
              {running ? '⏸' : '▶'}
            </button>
            {seconds > 30 && !running && <button className="btn btn-sm btn-ghost" onClick={resetTimer}>↺</button>}
          </div>
        </div>
      </div>

      {wipModels.length === 0 ? (
        <div className="workbench-empty">
          <GoldIcon name="paints" size={32} />
          <p>No models on the workbench. Promote a model from your pile to start painting!</p>
        </div>
      ) : (
        <div className="workbench-grid">
          {wipModels.map((m, idx) => (
            <div key={m.id} className="workbench-card" style={{ animationDelay: `${idx * 0.1}s` }}>
              {/* Card photo */}
              <div className="workbench-card-photo" onClick={() => nav(`/model/${m.id}`)}>
                {m.photoUrl ? (
                  <img src={m.photoUrl} alt={m.name} loading="lazy" />
                ) : (
                  <div className="workbench-card-photo-empty">
                    <GoldIcon name="figurine" size={40} />
                  </div>
                )}
                <div className="workbench-card-photo-overlay">
                  <span>View Details</span>
                </div>
              </div>

              {/* Card body */}
              <div className="workbench-card-body">
                <div className="workbench-card-name">{m.name}</div>
                <div className="workbench-card-meta">
                  {m.faction}
                  {m.unitType ? ` · ${m.unitType}` : ''}
                </div>
                {m.quantity > 1 && <div className="workbench-card-qty">x{m.quantity}</div>}
              </div>

              {/* Actions */}
              <div className="workbench-card-actions">
                <button className="workbench-btn workbench-btn-done" onClick={() => onUpdateStatus(m.id!, 'painted')}>
                  <GoldIcon name="medal" size={14} />
                  Mark Painted
                </button>
                <button className="workbench-btn workbench-btn-log" onClick={() => logSession(m)} disabled={seconds < 30}>
                  <GoldIcon name="scroll" size={14} />
                  Log Session
                </button>
                <button className="workbench-btn workbench-btn-based" onClick={() => onUpdateStatus(m.id!, 'based')}>
                  <GoldIcon name="bases" size={14} />
                  Complete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
