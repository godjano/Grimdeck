import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { getRoster, ALL_KT_FACTIONS } from '../db/killteam-data';
import { FACTION_ART } from '../db/faction-art';

const KT_FACTIONS = ALL_KT_FACTIONS;
const OTHER_FACTIONS = ['Adepta Sororitas','Adeptus Custodes','Grey Knights','Thousand Sons','World Eaters','Chaos Daemons','Aeldari','Drukhari','Genestealer Cults','Leagues of Votann']
  .filter(f => !KT_FACTIONS.includes(f));

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
            {FACTION_ART[c.playerFaction] && <img src={FACTION_ART[c.playerFaction]} alt="" className="card-photo" />}
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
  const [playerFaction, setPlayerFaction] = useState(KT_FACTIONS[0] || 'Space Marines');
  const [enemyFaction, setEnemyFaction] = useState(() => {
    // Random enemy that's different from player
    const options = KT_FACTIONS.filter(f => f !== (KT_FACTIONS[0] || 'Space Marines'));
    return options[Math.floor(Math.random() * options.length)] || 'Orks';
  });
  const nav = useNavigate();

  const start = async () => {
    if (!name.trim()) return;
    const id = await db.campaigns.add({
      name: name.trim(), playerFaction, enemyFaction,
      currentNodeId: 'a1_m1', status: 'active', turn: 1,
      wins: 0, losses: 0, createdAt: Date.now(),
    });
    const ktRoster = getRoster(playerFaction);
    for (const op of ktRoster) {
      await db.operatives.add({
        campaignId: id as number,
        name: op.name,
        role: op.role,
        xp: 0,
        wounds: 0,
        maxWounds: op.wounds,
        status: 'ready',
        kills: 0,
      });
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
          {FACTION_ART[playerFaction] && <img src={FACTION_ART[playerFaction]} alt={playerFaction} className="faction-preview" />}
          <select value={playerFaction} onChange={e => setPlayerFaction(e.target.value)}>
            <optgroup label="Kill Team Rosters (full datacards)">
              {KT_FACTIONS.map(f => <option key={f} value={f}>{f}</option>)}
            </optgroup>
            <optgroup label="Other Factions (generic stats)">
              {OTHER_FACTIONS.map(f => <option key={f} value={f}>{f}</option>)}
            </optgroup>
          </select>
        </div>
        <div className="field">
          <label>Enemy Faction</label>
          {FACTION_ART[enemyFaction] && <img src={FACTION_ART[enemyFaction]} alt={enemyFaction} className="faction-preview" />}
          <select value={enemyFaction} onChange={e => setEnemyFaction(e.target.value)}>
            <optgroup label="Kill Team Rosters (full datacards)">
              {KT_FACTIONS.map(f => <option key={f} value={f}>{f}</option>)}
            </optgroup>
            <optgroup label="Other Factions (generic stats)">
              {OTHER_FACTIONS.map(f => <option key={f} value={f}>{f}</option>)}
            </optgroup>
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
