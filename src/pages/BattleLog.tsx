import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import PageBanner from '../components/PageBanner';
import GoldIcon from '../components/GoldIcon';

export default function BattleLogPage() {
  const logs = useLiveQuery(() => db.battleLogs.orderBy('date').reverse().toArray()) ?? [];
  const [show, setShow] = useState(false);
  const [opp, setOpp] = useState('');
  const [myF, setMyF] = useState('');
  const [oppF, setOppF] = useState('');
  const [pts, setPts] = useState(2000);
  const [result, setResult] = useState<'win' | 'loss' | 'draw'>('win');
  const [sys, setSys] = useState('Warhammer 40K');
  const [notes, setNotes] = useState('');

  const wins = logs.filter(l => l.result === 'win').length;
  const losses = logs.filter(l => l.result === 'loss').length;
  const draws = logs.filter(l => l.result === 'draw').length;

  const add = async () => {
    await db.battleLogs.add({ date: Date.now(), opponent: opp, myFaction: myF, oppFaction: oppF, points: pts, result, gameSystem: sys, notes });
    setShow(false); setOpp(''); setNotes('');
  };

  return (
    <div>
      <PageBanner title="Battle Log" subtitle="Track your games" icon="campaigns" />
      <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        <div className="goal-ring" style={{ flex: 1, minWidth: 120 }}>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: '1.8rem', fontFamily: "'Cinzel', serif", color: 'var(--gold)' }}>{logs.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Games</div>
          </div>
        </div>
        <div className="goal-ring" style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flex: 1 }}>
            <div style={{ textAlign: 'center' }}><div style={{ fontSize: '1.4rem', color: '#2ecc71', fontWeight: 700 }}>{wins}</div><div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Wins</div></div>
            <div style={{ textAlign: 'center' }}><div style={{ fontSize: '1.4rem', color: '#c0392b', fontWeight: 700 }}>{losses}</div><div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Losses</div></div>
            <div style={{ textAlign: 'center' }}><div style={{ fontSize: '1.4rem', color: 'var(--text-dim)', fontWeight: 700 }}>{draws}</div><div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Draws</div></div>
          </div>
        </div>
      </div>

      <button className="btn btn-primary" onClick={() => setShow(!show)} style={{ marginBottom: 16 }}>{show ? 'Cancel' : '+ Log Game'}</button>

      {show && (
        <div className="settings-section" style={{ marginBottom: 20 }}>
          <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <input placeholder="Opponent name" value={opp} onChange={e => setOpp(e.target.value)} />
            <select value={sys} onChange={e => setSys(e.target.value)}><option>Warhammer 40K</option><option>Kill Team</option><option>Age of Sigmar</option><option>Horus Heresy</option></select>
            <input placeholder="My faction" value={myF} onChange={e => setMyF(e.target.value)} />
            <input placeholder="Opponent faction" value={oppF} onChange={e => setOppF(e.target.value)} />
            <input type="number" placeholder="Points" value={pts} onChange={e => setPts(Number(e.target.value))} />
            <select value={result} onChange={e => setResult(e.target.value as any)}><option value="win">Win</option><option value="loss">Loss</option><option value="draw">Draw</option></select>
          </div>
          <textarea placeholder="Notes (mission, key moments...)" value={notes} onChange={e => setNotes(e.target.value)} rows={2} style={{ width: '100%', marginTop: 10 }} />
          <button className="btn btn-primary" onClick={add} style={{ marginTop: 10 }} disabled={!myF}>Save Game</button>
        </div>
      )}

      {logs.length === 0 ? (
        <div className="md-empty-tab" style={{ marginTop: 40 }}><GoldIcon name="campaigns" size={32} /><p>No games logged yet</p></div>
      ) : (
        <div>
          {logs.map(l => (
            <div key={l.id} className="card" style={{ cursor: 'default' }}>
              <div style={{ width: 40, textAlign: 'center' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: l.result === 'win' ? '#2ecc71' : l.result === 'loss' ? '#c0392b' : 'var(--text-dim)' }}>
                  {l.result === 'win' ? 'W' : l.result === 'loss' ? 'L' : 'D'}
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{l.myFaction} vs {l.oppFaction}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>{l.opponent ? `vs ${l.opponent} · ` : ''}{l.points}pts · {l.gameSystem} · {new Date(l.date).toLocaleDateString()}</div>
                {l.notes && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>{l.notes}</div>}
              </div>
              <button className="btn-icon-sm" onClick={() => db.battleLogs.delete(l.id!)}>×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
