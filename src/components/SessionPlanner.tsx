import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';

export default function SessionPlanner() {
  const models = useLiveQuery(() => db.models.toArray()) ?? [];
  const [hours, setHours] = useState(1);
  const [plan, setPlan] = useState<{ name: string; faction: string; task: string; time: string }[] | null>(null);

  const unpainted = models.filter(m => !m.wishlist && ['unbuilt', 'built', 'primed', 'wip'].includes(m.status));

  const generatePlan = () => {
    const tasks: typeof plan = [];
    let remaining = hours * 60; // minutes

    // Prioritize WIP first (finish what you started)
    const wip = unpainted.filter(m => m.status === 'wip');
    const primed = unpainted.filter(m => m.status === 'primed');
    const built = unpainted.filter(m => m.status === 'built');
    const unbuilt = unpainted.filter(m => m.status === 'unbuilt');

    for (const m of wip) {
      if (remaining <= 0) break;
      const time = Math.min(remaining, m.quantity <= 3 ? 45 : 90);
      tasks.push({ name: m.name, faction: m.faction, task: 'Continue painting (highlight + details)', time: `~${time} min` });
      remaining -= time;
    }

    for (const m of primed.slice(0, 2)) {
      if (remaining <= 0) break;
      const time = Math.min(remaining, m.quantity <= 3 ? 30 : 60);
      tasks.push({ name: m.name, faction: m.faction, task: 'Base coat + shade', time: `~${time} min` });
      remaining -= time;
    }

    for (const m of built.slice(0, 2)) {
      if (remaining <= 0) break;
      tasks.push({ name: m.name, faction: m.faction, task: 'Prime', time: '~15 min' });
      remaining -= 15;
    }

    for (const m of unbuilt.slice(0, 3)) {
      if (remaining <= 0) break;
      const time = Math.min(remaining, m.quantity <= 5 ? 20 : 40);
      tasks.push({ name: m.name, faction: m.faction, task: 'Assemble & clean mould lines', time: `~${time} min` });
      remaining -= time;
    }

    if (tasks.length === 0 && unpainted.length > 0) {
      const m = unpainted[0];
      tasks.push({ name: m.name, faction: m.faction, task: 'Work on this!', time: `~${hours * 60} min` });
    }

    setPlan(tasks);
  };

  return (
    <div className="session-planner">
      <h3>⏰ Session Planner</h3>
      <p className="settings-desc">How much time do you have? We'll suggest what to work on.</p>
      <div className="session-time-picker">
        {[0.5, 1, 2, 3].map(h => (
          <button key={h} className={`btn btn-sm ${hours === h ? 'btn-primary' : 'btn-ghost'}`} onClick={() => { setHours(h); setPlan(null); }}>
            {h < 1 ? '30 min' : `${h}h`}
          </button>
        ))}
      </div>
      <button className="btn btn-primary" onClick={generatePlan} disabled={unpainted.length === 0} style={{ marginTop: 10, width: '100%' }}>
        Plan my {hours < 1 ? '30 min' : `${hours} hour`} session
      </button>
      {plan && (
        <div className="session-plan">
          {plan.map((t, i) => (
            <div key={i} className="session-task">
              <span className="session-task-num">{i + 1}</span>
              <div className="session-task-info">
                <div className="session-task-name">{t.name} <span style={{ color: 'var(--text-dim)', fontWeight: 300 }}>({t.faction})</span></div>
                <div className="session-task-desc">{t.task} · {t.time}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
