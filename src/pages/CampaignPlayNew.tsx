import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { getMission, fillNarrative, CAMPAIGN_MISSIONS } from '../db/campaign-engine';
import GamePlay from './GamePlay';

type Mode = 'campaign' | 'playing';

export default function CampaignPlay() {
  const { id } = useParams();
  const nav = useNavigate();
  const campaignId = Number(id);
  const [mode, setMode] = useState<Mode>('campaign');

  const campaign = useLiveQuery(() => db.campaigns.get(campaignId), [campaignId]);
  const operatives = useLiveQuery(() => db.operatives.where('campaignId').equals(campaignId).toArray(), [campaignId]);
  const results = useLiveQuery(() => db.missionResults.where('campaignId').equals(campaignId).toArray(), [campaignId]);

  if (!campaign || !operatives || !results) return <div className="empty">Loading...</div>;

  if (mode === 'playing' && campaign.status === 'active') {
    const mission = getMission(campaign.currentNodeId);
    return (
      <GamePlay
        playerFaction={campaign.playerFaction}
        enemyFaction={campaign.enemyFaction}
        onGameEnd={async (result, pCasualties, eCasualties) => {
          const outcome = result === 'draw' ? 'loss' : result;
          const narrative = fillNarrative(
            outcome === 'win' ? (mission?.winNarrative || 'Victory!') : (mission?.lossNarrative || 'Defeat.'),
            campaign.playerFaction, campaign.enemyFaction
          );

          await db.missionResults.add({
            campaignId, nodeId: campaign.currentNodeId, outcome,
            playerCasualties: pCasualties, enemyCasualties: eCasualties,
            narrativeText: narrative, completedAt: Date.now(),
          });

          // Apply to campaign operatives
          const alive = operatives.filter(o => o.status !== 'dead');
          for (let i = 0; i < pCasualties && i < alive.length; i++) {
            const roll = Math.random();
            if (roll < 0.25) {
              await db.operatives.update(alive[i].id!, { status: 'dead' });
            } else {
              await db.operatives.update(alive[i].id!, { status: 'injured' });
            }
          }
          for (const op of alive.slice(pCasualties)) {
            await db.operatives.update(op.id!, { xp: op.xp + (outcome === 'win' ? 2 : 1), status: 'ready' });
          }

          const nextId = outcome === 'win' ? mission?.winNext : mission?.lossNext;
          const newWins = campaign.wins + (outcome === 'win' ? 1 : 0);
          const newLosses = campaign.losses + (outcome !== 'win' ? 1 : 0);

          if (!nextId) {
            await db.campaigns.update(campaignId, { status: outcome === 'win' ? 'won' : 'lost', wins: newWins, losses: newLosses, turn: campaign.turn + 1 });
          } else {
            await db.campaigns.update(campaignId, { currentNodeId: nextId, turn: campaign.turn + 1, wins: newWins, losses: newLosses });
          }

          setMode('campaign');
        }}
      />
    );
  }

  // Campaign overview
  const mission = getMission(campaign.currentNodeId);
  const fill = (t: string) => fillNarrative(t, campaign.playerFaction, campaign.enemyFaction);
  const completedIds = new Set(results.map(r => r.nodeId));

  if (campaign.status !== 'active') {
    return (
      <div>
        <div className="page-header"><h2>{campaign.name}</h2></div>
        <div className="rank-card">
          <div className="rank-icon">{campaign.status === 'won' ? '🏆' : campaign.status === 'lost' ? '💀' : '🏳️'}</div>
          <div className="rank-info">
            <div className="rank-title">{campaign.status === 'won' ? 'Victory!' : campaign.status === 'lost' ? 'Defeat' : 'Abandoned'}</div>
            <div className="rank-desc">{campaign.playerFaction} vs {campaign.enemyFaction} · {campaign.wins}W / {campaign.losses}L</div>
          </div>
        </div>
        <h3 className="section-title">📜 Mission Log</h3>
        {results.sort((a, b) => a.completedAt - b.completedAt).map(r => {
          const m = getMission(r.nodeId);
          return (
            <div className="card" key={r.id}>
              <div className="card-body">
                <div className="card-title">{m?.title || r.nodeId}</div>
                <div className="card-sub">{r.narrativeText.slice(0, 150)}...</div>
              </div>
              <span className={`status ${r.outcome === 'win' ? 'status-painted' : 'status-unbuilt'}`}>{r.outcome}</span>
            </div>
          );
        })}
        <button className="btn btn-ghost" style={{ marginTop: 16 }} onClick={() => nav('/campaigns')}>← Back</button>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h2>{campaign.name}</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <span className="status status-wip">Turn {campaign.turn}</span>
          <span className="status status-painted">{campaign.wins}W</span>
          <span className="status status-unbuilt">{campaign.losses}L</span>
        </div>
      </div>

      {/* Campaign Map */}
      <div className="campaign-map">
        {CAMPAIGN_MISSIONS.map(m => {
          const isCurrent = m.id === campaign.currentNodeId;
          const isDone = completedIds.has(m.id);
          const result = results.find(r => r.nodeId === m.id);
          return (
            <div key={m.id} className={`map-node ${isCurrent ? 'current' : isDone ? 'done' : 'locked'} type-${m.type}`}>
              <div className="map-node-act">Act {m.act}</div>
              <div className="map-node-title">{isCurrent || isDone ? m.title : '???'}</div>
              {isDone && result && <div className={`map-node-result ${result.outcome}`}>{result.outcome}</div>}
              {isCurrent && <div className="map-node-current">◆ CURRENT</div>}
            </div>
          );
        })}
      </div>

      {/* Current Mission Briefing */}
      {mission && (
        <div className="mission-panel">
          <div className="mission-header">
            <span className={`mission-type type-${mission.type}`}>{mission.type}</span>
            <span className="mission-diff">{'⚡'.repeat(mission.difficulty)}</span>
          </div>
          <h3 className="mission-title">{mission.title}</h3>
          <p className="mission-briefing">{fill(mission.briefing)}</p>
          <div className="mission-objective"><strong>Objective:</strong> {mission.objectiveText}</div>
          <button className="btn btn-primary" onClick={() => setMode('playing')}>⚔️ Launch Game on Board →</button>
        </div>
      )}

      {/* Roster */}
      <h3 className="section-title">👥 Your Kill Team</h3>
      {operatives.filter(o => o.status !== 'dead').map(op => (
        <div className="card" key={op.id}>
          <div className="card-body">
            <div className="card-title">{op.name} <span className="qty-badge">{op.role}</span></div>
            <div className="card-sub">XP: {op.xp} · Kills: {op.kills} · {op.status}</div>
          </div>
          <span className={`status ${op.status === 'ready' ? 'status-painted' : 'status-wip'}`}>{op.status}</span>
        </div>
      ))}
      {operatives.filter(o => o.status === 'dead').length > 0 && (
        <>
          <h4 style={{ color: 'var(--danger)', marginTop: 12, fontSize: '0.85rem' }}>☠ Fallen</h4>
          {operatives.filter(o => o.status === 'dead').map(op => (
            <div className="card" key={op.id} style={{ opacity: 0.4 }}>
              <div className="card-body">
                <div className="card-title">{op.name}</div>
                <div className="card-sub">{op.role} · {op.kills} kills · Rest in peace</div>
              </div>
            </div>
          ))}
        </>
      )}

      <button className="btn btn-danger btn-sm" style={{ marginTop: 24 }} onClick={async () => {
        await db.campaigns.update(campaignId, { status: 'abandoned' });
        nav('/campaigns');
      }}>Abandon Campaign</button>
    </div>
  );
}
