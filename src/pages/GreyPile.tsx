import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { db } from '../db';
import type { ModelStatus } from '../types';

const GREY_STATUSES: ModelStatus[] = ['unbuilt', 'built', 'primed'];

export default function GreyPile() {
  const models = useLiveQuery(() => db.models.toArray()) ?? [];
  const nav = useNavigate();
  const greyModels = models.filter(m => GREY_STATUSES.includes(m.status));
  const totalGrey = greyModels.reduce((s, m) => s + m.quantity, 0);
  const byStatus = GREY_STATUSES.map(s => ({
    status: s,
    models: greyModels.filter(m => m.status === s),
    count: greyModels.filter(m => m.status === s).reduce((sum, m) => sum + m.quantity, 0),
  }));

  const updateStatus = async (id: number, status: ModelStatus) => {
    await db.models.update(id, { status });
  };

  return (
    <div>
      <div className="page-header">
        <h2>🪦 The Pile of Grey</h2>
      </div>

      {totalGrey === 0 ? (
        <div className="empty">
          <span className="empty-icon">🏆</span>
          <p className="empty-text">Your pile is empty! You absolute legend.</p>
        </div>
      ) : (
        <>
          <div className="shame-banner">
            <div className="shame-number">{totalGrey}</div>
            <div className="shame-label">unpainted minis staring at you with judgement</div>
          </div>

          {byStatus.map(group => group.models.length > 0 && (
            <div key={group.status}>
              <div className="group-header">
                <span className={`status status-${group.status}`}>{group.status}</span>
                <span className="group-count">{group.count} minis</span>
              </div>
              {group.models.map(m => (
                <div className="card" key={m.id}>
                  <div className="card-body">
                    <div className="card-title">{m.name} {m.quantity > 1 && <span className="qty-badge">×{m.quantity}</span>}</div>
                    <div className="card-sub">{m.faction}{m.unitType ? ` · ${m.unitType}` : ''}</div>
                  </div>
                  <div className="promote-buttons">
                    {m.status === 'unbuilt' && (
                      <button className="btn btn-sm btn-ghost" onClick={() => updateStatus(m.id!, 'built')}>✂️ Built</button>
                    )}
                    {(m.status === 'unbuilt' || m.status === 'built') && (
                      <button className="btn btn-sm btn-ghost" onClick={() => updateStatus(m.id!, 'primed')}>🫧 Primed</button>
                    )}
                    <button className="btn btn-sm btn-ghost" onClick={() => updateStatus(m.id!, 'wip')}>🎨 Paint</button>
                    <button className="btn btn-sm btn-ghost" onClick={() => nav(`/model/${m.id}`)}>→</button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
