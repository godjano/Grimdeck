import GoldIcon from '../components/GoldIcon';
import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';

export default function ArmyList() {
  const models = useLiveQuery(() => db.models.toArray()) ?? [];
  const [faction, setFaction] = useState('');
  const [targetPts, setTargetPts] = useState(2000);
  const factions = [...new Set(models.filter(m => !m.wishlist).map(m => m.faction))].sort();

  const armyModels = models.filter(m => !m.wishlist && (!faction || m.faction === faction));
  const totalPts = armyModels.reduce((s, m) => s + (m.points || 0), 0);
  const diff = totalPts - targetPts;

  const byForceOrg: Record<string, typeof armyModels> = {};
  for (const m of armyModels) { (byForceOrg[m.forceOrg || 'Other'] ??= []).push(m); }

  const hqCount = (byForceOrg['HQ'] || []).length;
  const troopsCount = (byForceOrg['Troops'] || []).length;
  const isLegal = hqCount >= 1 && troopsCount >= 1;

  const copyList = () => {
    const lines = [`Army List: ${faction || 'All Factions'} — ${totalPts}pts\n`];
    for (const [org, units] of Object.entries(byForceOrg).sort()) {
      lines.push(`\n${org}:`);
      for (const m of units) lines.push(`  ${m.name} ×${m.quantity}${m.points ? ` (${m.points}pts)` : ''}`);
    }
    navigator.clipboard.writeText(lines.join('\n'));
  };

  return (
    <div>
      <div className="page-header" style={{ paddingTop: 48 }}>
        <h2><GoldIcon name="scroll" size={22} /> Army List</h2>
        <button className="btn btn-ghost btn-sm" onClick={copyList}><GoldIcon name="scroll" size={14} /> Copy List</button>
      </div>

      <div className="filters">
        <select value={faction} onChange={e => setFaction(e.target.value)} style={{ minWidth: 200 }}>
          <option value="">All factions</option>
          {factions.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>

      <div className="army-summary">
        <div className="army-points">{totalPts}<span className="army-pts-label">pts</span></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Target:</span>
          {[500, 1000, 1500, 2000].map(p => (
            <button key={p} className={`btn btn-sm ${targetPts === p ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTargetPts(p)} style={{ padding: '3px 10px', fontSize: '0.75rem' }}>{p}</button>
          ))}
        </div>
        {totalPts > 0 && <div style={{ fontSize: '0.85rem', fontWeight: 600, color: diff > 0 ? '#c0392b' : diff === 0 ? '#2ecc71' : 'var(--gold)', marginBottom: 8 }}>
          {diff > 0 ? `${diff}pts over limit` : diff === 0 ? 'Exactly on target!' : `${Math.abs(diff)}pts remaining`}
        </div>}
        <div className="army-checks">
          <span className={isLegal ? 'army-check-pass' : 'army-check-fail'}>{hqCount >= 1 ? '✓' : '✕'} HQ ({hqCount})</span>
          <span className={troopsCount >= 1 ? 'army-check-pass' : 'army-check-fail'}>{troopsCount >= 1 ? '✓' : '✕'} Troops ({troopsCount})</span>
          <span className="army-check-info">{armyModels.length} units</span>
        </div>
      </div>

      {Object.entries(byForceOrg).sort().map(([org, units]) => (
        <div key={org} style={{ marginBottom: 16 }}>
          <div className="army-org-header">{org} <span className="army-org-pts">{units.reduce((s, m) => s + (m.points || 0), 0)}pts</span></div>
          {units.map(m => (
            <div key={m.id} className="card">
              <div className="card-body">
                <div className="card-title">{m.name} {m.quantity > 1 && <span className="qty-badge">×{m.quantity}</span>}</div>
                <div className="card-sub">{m.unitType}{m.points ? ` · ${m.points}pts` : ''}</div>
              </div>
              <span className={`status status-${m.status}`}>{m.status}</span>
            </div>
          ))}
        </div>
      ))}

      {armyModels.length === 0 && (
        <div className="empty"><span className="empty-icon"><GoldIcon name="scroll" size={40} /></span><p className="empty-text">No models{faction ? ` for ${faction}` : ''}. Add some from the Models page.</p></div>
      )}
    </div>
  );
}
