import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { generateRoster } from '../db/campaign-engine';

const FACTIONS = ['Space Marines','Astra Militarum','Adepta Sororitas','Adeptus Mechanicus','Adeptus Custodes','Grey Knights',
  'Chaos Space Marines','Death Guard','Thousand Sons','World Eaters','Chaos Daemons',
  'Orks','Tau Empire','Tyranids','Necrons','Aeldari','Drukhari','Genestealer Cults','Leagues of Votann'];

export default function Campaigns() {
  const [showCreate, setShowCreate] = useState(false);
  const campaigns = useLiveQuery(() => db.campaigns.orderBy('createdAt').reverse().toArray()) ?? [];
  const nav = useNavigate();

  return (
    <div>
      <div className="page-header">
        <h2>⚔️ Solo Campaigns</h2>
        <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)}>
          {showCreate ? '✕ Cancel' : '+ New Campaign'}
        </button>
      </div>

      {showCreate && <CreateCampaign onDone={() => setShowCreate(false)} />}

      {campaigns.length === 0 ? (
        <div className="empty">
          <span className="empty-icon">⚔️</span>
          <p className="empty-text">No campaigns yet. Start your first narrative campaign!</p>
        </div>
      ) : (
        campaigns.map(c => (
          <div className="card" key={c.id} style={{ cursor: 'pointer' }} onClick={() => nav(`/campaign/${c.id}`)}>
            <div className="card-body">
              <div className="card-title">{c.name}</div>
              <div className="card-sub">
                {c.playerFaction} vs {c.enemyFaction} · Turn {c.turn} · {c.wins}W / {c.losses}L
              </div>
            </div>
            <span className={`status status-${c.status === 'active' ? 'wip' : c.status === 'won' ? 'painted' : 'unbuilt'}`}>
              {c.status}
            </span>
          </div>
        ))
      )}
    </div>
  );
}

function CreateCampaign({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState('');
  const [playerFaction, setPlayerFaction] = useState('Space Marines');
  const [enemyFaction, setEnemyFaction] = useState('Orks');
  const nav = useNavigate();

  const start = async () => {
    if (!name.trim()) return;
    const id = await db.campaigns.add({
      name: name.trim(), playerFaction, enemyFaction,
      currentNodeId: 'a1_m1', status: 'active', turn: 1,
      wins: 0, losses: 0, createdAt: Date.now(),
    });
    const roster = generateRoster(playerFaction);
    for (const op of roster) {
      await db.operatives.add({ ...op, campaignId: id as number });
    }
    onDone();
    nav(`/campaign/${id}`);
  };

  return (
    <div className="form-overlay">
      <div className="form-title">New Campaign</div>
      <div className="form-grid">
        <div className="field full-width">
          <label>Campaign Name *</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Operation Crimson Dawn" />
        </div>
        <div className="field">
          <label>Your Faction</label>
          <select value={playerFaction} onChange={e => setPlayerFaction(e.target.value)}>
            {FACTIONS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Enemy Faction</label>
          <select value={enemyFaction} onChange={e => setEnemyFaction(e.target.value)}>
            {FACTIONS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div className="field full-width form-actions" style={{ justifyContent: 'flex-end', flexDirection: 'row' }}>
          <button className="btn btn-ghost" onClick={onDone}>Cancel</button>
          <button className="btn btn-primary" onClick={start} disabled={!name.trim()}>Begin Campaign</button>
        </div>
      </div>
    </div>
  );
}
