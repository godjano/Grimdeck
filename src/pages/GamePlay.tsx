import { useState, useRef, useEffect } from 'react';
import { getRoster } from '../db/killteam-data';
import type { Weapon } from '../db/killteam-data';
import { generateMap, CELL_LEGEND } from '../db/map-generator';
import { createGameState, rollInitiative, resolveShoot, resolveFight, applyDamage, checkTurnEnd, rollDice, type GameState, type OpState } from '../db/killteam-game';
import GoldIcon from '../components/GoldIcon';
import { aiActivationV2, AI_CONFIGS, type AIDifficulty } from '../db/killteam-ai-v2';
import { formatProbability, expectedHits, expectedDamage } from '../db/dice-math';
import { rollRandomEvent, type RandomEvent } from '../db/random-events';
import { getOpColor } from '../db/operative-icons';
import { RoleIcon, BoardToken, getFactionEmoji } from '../db/operative-icons.tsx';

interface Props {
  playerFaction: string;
  enemyFaction: string;
  difficulty?: AIDifficulty;
  saveKey?: string;
  missionTitle?: string;
  missionObjective?: string;
  onGameEnd: (result: 'win' | 'loss' | 'draw', pCasualties: number, eCasualties: number) => void;
}

export default function GamePlay({ playerFaction, enemyFaction, difficulty = 'normal', saveKey, missionTitle, missionObjective, onGameEnd }: Props) {
  const [game, setGameRaw] = useState<GameState | null>(null);

  // Persist game state
  const storageKey = saveKey ? `grimdeck_game_${saveKey}` : null;
  const setGame = (s: GameState | null) => {
    setGameRaw(s);
    if (s && storageKey) try { localStorage.setItem(storageKey, JSON.stringify(s)); } catch {}
  };

  const [selectedOp, setSelectedOp] = useState<number | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<number | null>(null);
  const [selectedWeapon, setSelectedWeapon] = useState<Weapon | null>(null);
  const [actionMode, setActionMode] = useState<'none' | 'move' | 'shoot' | 'fight'>('none');
  const [currentEvent, setCurrentEvent] = useState<RandomEvent | null>(null);
  const [tab, setTab] = useState<'board' | 'your' | 'enemy' | 'rules'>('board');
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const [aiThinking, setAiThinking] = useState(false);
  const [lastDiceRoll, setLastDiceRoll] = useState<number[] | null>(null);
  const [combatFlash, setCombatFlash] = useState<string | null>(null);
  const flash = (msg: string) => { setCombatFlash(msg); setTimeout(() => setCombatFlash(null), 3000); };
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Try to restore saved game
    if (storageKey) {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) { setGameRaw(JSON.parse(saved)); return; }
      } catch {}
    }
    const pOps = getRoster(playerFaction);
    const eOps = getRoster(enemyFaction);
    const map = generateMap();
    setGameRaw(createGameState(pOps, eOps, map));
  }, [playerFaction, enemyFaction]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [game?.log.length]);

  if (!game) return <div className="empty">Generating battlefield...</div>;

  const playerOps = game.operatives.filter(o => o.team === 'player');
  const enemyOps = game.operatives.filter(o => o.team === 'enemy');
  const activeOp = selectedOp !== null ? game.operatives[selectedOp] : null;

  // Flow guide text
  const getFlowGuide = () => {
    if (game.phase === 'setup') return '📋 Review the board, then press Ready to begin';
    if (game.phase === 'end') return '🏁 Game over — check the score';
    if (game.phase === 'initiative') return '🎲 Roll initiative for the next turning point';
    if (aiThinking) return '🤖 Enemy is thinking...';
    if (game.activeTeam === 'enemy') return '🤖 Press Enemy Activation to let the AI act';
    if (selectedOp === null) return '👆 Tap one of your ready operatives to activate them';
    if (actionMode === 'none') return `⚔️ Choose an action for ${activeOp?.op.name}`;
    if (actionMode === 'move') return '🏃 Tap a cell on the board to move there';
    if (actionMode === 'shoot') return selectedWeapon ? (selectedTarget !== null ? '🎯 Press Fire to auto-roll and resolve' : '🎯 Tap an enemy on the board to target them') : '🔫 Pick a weapon below';
    if (actionMode === 'fight') return selectedWeapon ? (selectedTarget !== null ? '⚔️ Press Fight to auto-roll and resolve' : '⚔️ Tap an adjacent enemy to fight') : '🗡️ Pick a melee weapon below';
    return '';
  };

  const startTurn = () => {
    const event = rollRandomEvent();
    setCurrentEvent(event);
    const s = rollInitiative(game);
    if (event.id !== 'none') {
      s.log = [...s.log, `\n⚡ EVENT: ${event.icon} ${event.name} — ${event.apply}`];
    }
    setGame(s);
  };

  const doAiTurn = () => {
    setAiThinking(true);
    setTimeout(() => {
      let s = aiActivationV2(game, difficulty);
      setGame(s);
      setAiThinking(false);
    }, 800);
  };

  // Auto-roll shoot
  const doPlayerShoot = () => {
    if (selectedOp === null || selectedTarget === null || !selectedWeapon) return;
    const rolls = rollDice(selectedWeapon.attacks);
    setLastDiceRoll(rolls);
    const attacker = game.operatives[selectedOp];
    const defender = game.operatives[selectedTarget];
    const result = resolveShoot(attacker, defender, selectedWeapon, rolls);
    let s = { ...game, log: [...game.log, `\n🎯 YOUR SHOOT: ${result.log}`, `   🎲 Rolled: [${rolls.join(', ')}]`] };
    s = applyDamage(s, selectedTarget, result.totalDmg);
    const targetAfter = s.operatives[selectedTarget];
    flash(result.totalDmg > 0 ? `💥 ${defender.op.name} takes ${result.totalDmg} damage!${targetAfter.status === 'incapacitated' ? ' ☠️ INCAPACITATED!' : ` (${targetAfter.currentWounds}W left)`}` : `🛡️ ${defender.op.name} saves all damage!`);
    const ops = [...s.operatives];
    const op = { ...ops[selectedOp], apLeft: ops[selectedOp].apLeft - 1 };
    if (op.apLeft <= 0) { op.activated = true; op.status = 'activated' as any; }
    ops[selectedOp] = op;
    s = checkTurnEnd({ ...s, operatives: ops });
    setGame(s);
    setActionMode('none');
    setSelectedTarget(null);
    setSelectedWeapon(null);
    setTimeout(() => setLastDiceRoll(null), 2000);
  };

  // Auto-roll fight
  const doPlayerFight = () => {
    if (selectedOp === null || selectedTarget === null || !selectedWeapon) return;
    const atkRolls = rollDice(selectedWeapon.attacks);
    setLastDiceRoll(atkRolls);
    const attacker = game.operatives[selectedOp];
    const defender = game.operatives[selectedTarget];
    const defWeapon = defender.op.weapons.find(w => w.type === 'melee') || defender.op.weapons[0];
    const defRolls = rollDice(defWeapon.attacks);
    const result = resolveFight(attacker, defender, selectedWeapon, defWeapon, atkRolls, defRolls);
    let s = { ...game, log: [...game.log, `\n${result.log}`, `   🎲 You: [${atkRolls.join(', ')}] vs Enemy: [${defRolls.join(', ')}]`] };
    s = applyDamage(s, selectedTarget, result.atkDmg);
    s = applyDamage(s, selectedOp, result.defDmg);
    flash(`⚔️ You deal ${result.atkDmg} dmg, take ${result.defDmg} back!`);
    const ops = [...s.operatives];
    const op = { ...ops[selectedOp], apLeft: ops[selectedOp].apLeft - 2, activated: true, status: 'activated' as any };
    ops[selectedOp] = op;
    s = checkTurnEnd({ ...s, operatives: ops });
    setGame(s);
    setActionMode('none');
    setSelectedTarget(null);
    setSelectedWeapon(null);
    setTimeout(() => setLastDiceRoll(null), 2000);
  };

  // Tap-to-move on board
  const handleCellClick = (x: number, y: number, cell: string) => {
    if (actionMode === 'move' && selectedOp !== null && cell !== 'heavy') {
      const ops = [...game.operatives];
      const op = { ...ops[selectedOp], x, y, apLeft: ops[selectedOp].apLeft - 1 };
      if (op.apLeft <= 0) { op.activated = true; op.status = 'activated' as any; }
      ops[selectedOp] = op;
      const s = checkTurnEnd({ ...game, operatives: ops, log: [...game.log, `🏃 ${op.op.name} moves to (${x}, ${y})`] });
      setGame(s);
      setActionMode('none');
      return;
    }
    // Click enemy to target
    const clickedOp = game.operatives.find(o => o.x === x && o.y === y && o.status !== 'incapacitated');
    if (clickedOp) {
      const idx = game.operatives.indexOf(clickedOp);
      if (clickedOp.team === 'player') setSelectedOp(idx);
      else setSelectedTarget(idx);
    }
  };

  const endActivation = () => {
    if (selectedOp === null) return;
    const ops = [...game.operatives];
    ops[selectedOp] = { ...ops[selectedOp], activated: true, apLeft: 0, status: 'activated' as any };
    setGame(checkTurnEnd({ ...game, operatives: ops, log: [...game.log, `✓ ${ops[selectedOp].op.name} ends activation.`] }));
    setSelectedOp(null);
    setActionMode('none');
  };

  const endGame = () => {
    if (storageKey) localStorage.removeItem(storageKey);
    const pDead = playerOps.filter(o => o.status === 'incapacitated').length;
    const eDead = enemyOps.filter(o => o.status === 'incapacitated').length;
    const result = game.playerScore > game.enemyScore ? 'win' : game.playerScore < game.enemyScore ? 'loss' : 'draw';
    onGameEnd(result, pDead, eDead);
  };

  // Movement range highlight
  const moveRange = (actionMode === 'move' && selectedOp !== null && activeOp) ? activeOp.op.movement : 0;
  const inMoveRange = (x: number, y: number) => {
    if (!activeOp || moveRange === 0) return false;
    return Math.abs(x - activeOp.x) + Math.abs(y - activeOp.y) <= moveRange;
  };

  // Compact operative list for sidebar
  const readyPlayerOps = playerOps.filter(o => o.status !== 'incapacitated');
  const readyEnemyOps = enemyOps.filter(o => o.status !== 'incapacitated');

  return (
    <div>
      {/* Header */}
      <div className="game-header">
        <div>TP {game.turningPoint}/{game.maxTurningPoints}</div>
        <div><GoldIcon name={difficulty === 'easy' ? 'shield-check' : difficulty === 'normal' ? 'crosshair' : 'flame-skull'} size={14} /> {AI_CONFIGS[difficulty].name}</div>
        <div>You {game.playerScore} - {game.enemyScore} Enemy</div>
        <div className={`status status-${game.activeTeam === 'player' ? 'painted' : 'unbuilt'}`}>
          {game.phase === 'setup' ? 'SETUP' : game.phase === 'end' ? 'GAME OVER' : `${game.activeTeam === 'player' ? 'YOUR' : 'ENEMY'} TURN`}
        </div>
      </div>

      {/* Flow Guide */}
      <div className="game-flow-guide">{getFlowGuide()}</div>

      {/* Combat Flash */}
      {combatFlash && <div className="combat-flash">{combatFlash}</div>}

      {/* Mission Objective Bar */}
      {missionTitle && (
        <div className="game-mission-bar">
          <div className="game-mission-title"><GoldIcon name="scroll" size={14} /> {missionTitle}</div>
          {missionObjective && <div className="game-mission-obj">🎯 {missionObjective}</div>}
        </div>
      )}

      {/* Dice Roll Display */}
      {lastDiceRoll && (
        <div className="dice-display">
          {lastDiceRoll.map((d, i) => (
            <div key={i} className={`dice-face ${d >= 4 ? 'dice-hit' : ''} ${d === 6 ? 'dice-crit' : ''}`}>{d}</div>
          ))}
        </div>
      )}

      {/* ═══ SPLIT LAYOUT: Board left, Controls right ═══ */}
      <div className="game-split">
        {/* LEFT: Board + Log */}
        <div className="game-left">
          <div className="game-tabs">
            {(['board', 'your', 'enemy', 'rules'] as const).map(t => (
              <button key={t} className={`game-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                {t === 'board' ? 'Board' : t === 'your' ? 'Your Team' : t === 'enemy' ? 'Enemy' : 'Rules'}
              </button>
            ))}
          </div>

      {/* Board Tab */}
      {tab === 'board' && (
        <div className="board-wrapper">
          {/* Operative key */}
          <div className="op-key">
            <strong>Operatives on board:</strong>
            <div className="op-key-list">
              {game.operatives.filter(o => o.status !== 'incapacitated').map((o, _i) => {
                const idx = game.operatives.indexOf(o);
                const color = getOpColor(o.team, o.op.role);
                return (
                  <span key={idx} className={`op-key-item ${selectedOp === idx ? 'selected' : ''}`} onClick={() => setSelectedOp(idx)}>
                    <span className="op-key-icon" style={{ background: color }}><RoleIcon role={o.op.role} size={12} color="#fff" /></span>
                    <span className="op-key-name">{getFactionEmoji(o.op.faction)} {o.op.name}</span>
                    <span className="op-key-hp">{o.currentWounds}W</span>
                  </span>
                );
              })}
            </div>
          </div>

          <div className="board-container" style={{ position: 'relative', width: 'fit-content', margin: '0 auto' }}>
          {/* Column numbers */}
          <div style={{ display: 'flex', marginLeft: 'calc(var(--cell-size, 20px) + 2px)', marginBottom: 2 }}>
            {Array.from({ length: game.map.cols }, (_, i) => (
              <div key={i} style={{ width: 'var(--cell-size, 20px)', textAlign: 'center', fontSize: '0.5rem', color: 'var(--text-dim)', lineHeight: 1 }}>{i % 5 === 0 ? i : ''}</div>
            ))}
          </div>
          <div style={{ display: 'flex' }}>
          {/* Row numbers */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {Array.from({ length: game.map.rows }, (_, i) => (
              <div key={i} style={{ height: 'var(--cell-size, 20px)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 3, fontSize: '0.5rem', color: 'var(--text-dim)', width: 'var(--cell-size, 20px)' }}>{i % 5 === 0 ? i : ''}</div>
            ))}
          </div>
          <div style={{ position: 'relative' }}>
          <div className="board-grid" style={{ gridTemplateColumns: `repeat(${game.map.cols}, var(--cell-size, 20px))` }}>
            {game.map.grid.map((row, y) => row.map((cell, x) => {
              const pOp = game.operatives.find(o => o.team === 'player' && o.x === x && o.y === y && o.status !== 'incapacitated');
              const eOp = game.operatives.find(o => o.team === 'enemy' && o.x === x && o.y === y && o.status !== 'incapacitated');
              const op = pOp || eOp;
              const cellClass = `cell-${cell}`;
              const canMove = actionMode === 'move' && inMoveRange(x, y) && cell !== 'heavy';

              const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.currentTarget.classList.add('drag-over'); };
              const handleDragLeave = (e: React.DragEvent) => { e.currentTarget.classList.remove('drag-over'); };
              const handleDrop = (e: React.DragEvent) => {
                e.preventDefault();
                e.currentTarget.classList.remove('drag-over');
                if (draggingIdx === null) return;
                const dragOp = game.operatives[draggingIdx];
                if (dragOp.team !== 'player') return;
                if (cell === 'heavy') return;
                const ops = [...game.operatives];
                ops[draggingIdx] = { ...ops[draggingIdx], x, y };
                const apCost = dragOp.activated ? 0 : 1;
                if (apCost > 0) {
                  const updated = { ...ops[draggingIdx], apLeft: ops[draggingIdx].apLeft - 1 };
                  if (updated.apLeft <= 0) { updated.activated = true; updated.status = 'activated' as any; }
                  ops[draggingIdx] = updated;
                }
                const s = checkTurnEnd({ ...game, operatives: ops, log: [...game.log, `🏃 ${dragOp.op.name} moves to (${x}, ${y})`] });
                setGame(s);
                setSelectedOp(draggingIdx);
                setDraggingIdx(null);
                setActionMode('none');
              };

              return (
                <div
                  key={`${x}-${y}`}
                  className={`board-cell ${cellClass} ${op && selectedOp === game.operatives.indexOf(op) ? 'cell-selected' : ''} ${canMove ? 'cell-movable' : ''}`}
                  title={`(${x},${y}) ${op ? `${op.op.name} [${op.op.role}] ${op.currentWounds}/${op.op.wounds}W` : CELL_LEGEND[cell].label}`}
                  onClick={() => handleCellClick(x, y, cell)}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {op ? (
                    <div
                      className={`board-op ${op.team}`}
                      style={{ background: getOpColor(op.team, op.op.role) }}
                      draggable={op.team === 'player' && !op.activated && op.status === 'ready'}
                      onDragStart={() => setDraggingIdx(game.operatives.indexOf(op))}
                      onClick={() => {
                        const idx = game.operatives.indexOf(op);
                        op.team === 'player' ? setSelectedOp(idx) : setSelectedTarget(idx);
                      }}
                    >
                      <BoardToken role={op.op.role} team={op.team} size={14} />
                    </div>
                  ) : cell === 'objective' ? (
                    <GoldIcon name="objective" size={16} />
                  ) : ''}
                </div>
              );
            }))}
          </div>
          </div>
          </div>{/* close position:relative */}
          </div>{/* close flex row */}

          <details className="board-legend-details">
            <summary style={{ cursor: 'pointer', fontSize: '0.7rem', color: 'var(--text-dim)', padding: '6px 0' }}>Board Legend & Terrain</summary>
            <div className="board-legend">
              <span className="legend-item"><span style={{ display: 'inline-block', width: 10, height: 10, background: 'rgba(34,197,94,0.15)', borderRadius: 2 }} /> Deploy</span>
              <span className="legend-item"><span style={{ display: 'inline-block', width: 10, height: 10, background: '#3a2e24', borderRadius: 2 }} /> Heavy</span>
              <span className="legend-item"><span style={{ display: 'inline-block', width: 10, height: 10, background: '#242e34', borderRadius: 2 }} /> Light</span>
              <span className="legend-item"><span style={{ display: 'inline-block', width: 10, height: 10, background: '#2a2240', borderRadius: 2 }} /> Vantage</span>
              <span className="legend-item"><GoldIcon name="objective" size={12} /> Obj</span>
            </div>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)', marginTop: 4 }}>
              {game.map.terrain.map((t, i) => <span key={i} style={{ marginRight: 8 }}>{t.label} ({t.x},{t.y})</span>)}
            </div>
          </details>
        </div>
      )}

      {/* Your Team Tab */}
      {tab === 'your' && (
        <div className="op-cards">
          {playerOps.map((o, _i) => {
            const idx = game.operatives.indexOf(o);
            return <OpCard key={idx} op={o} idx={idx} selected={selectedOp === idx} onSelect={() => setSelectedOp(idx)} />;
          })}
        </div>
      )}

      {/* Enemy Tab */}
      {tab === 'enemy' && (
        <div className="op-cards">
          {enemyOps.map((o, _i) => {
            const idx = game.operatives.indexOf(o);
            return <OpCard key={idx} op={o} idx={idx} selected={selectedTarget === idx} onSelect={() => setSelectedTarget(idx)} />;
          })}
        </div>
      )}

      {/* Rules Tab */}
      {tab === 'rules' && <RulesReference />}

          {/* Action Log (compact) */}
          <div className="action-log" ref={logRef} style={{ maxHeight: 150 }}>
            {game.log.slice(-20).map((l, i) => <div key={i} className="log-line">{l}</div>)}
          </div>
        </div>{/* end game-left */}

        {/* RIGHT: Controls + Operative sidebar */}
        <div className="game-right">
          {/* Quick roster */}
          <div className="game-roster-mini">
            <div style={{ fontSize: '0.72rem', color: 'var(--gold)', fontWeight: 600, marginBottom: 6 }}>YOUR TEAM</div>
            {readyPlayerOps.map(o => {
              const idx = game.operatives.indexOf(o);
              return (
                <div key={idx} className={`roster-mini-item ${selectedOp === idx ? 'active' : ''} ${o.activated ? 'done' : ''}`} onClick={() => setSelectedOp(idx)}>
                  <span className="roster-mini-dot" style={{ background: getOpColor('player', o.op.role) }} />
                  <span className="roster-mini-name">{o.op.name}</span>
                  <span className="roster-mini-hp">{o.currentWounds}W</span>
                  <span className="roster-mini-ap">{o.activated ? '✓' : `${o.apLeft}AP`}</span>
                </div>
              );
            })}
            <div style={{ fontSize: '0.72rem', color: '#c0392b', fontWeight: 600, margin: '8px 0 6px' }}>ENEMY</div>
            {readyEnemyOps.map(o => {
              const idx = game.operatives.indexOf(o);
              return (
                <div key={idx} className={`roster-mini-item enemy ${selectedTarget === idx ? 'active' : ''}`} onClick={() => setSelectedTarget(idx)}>
                  <span className="roster-mini-dot" style={{ background: getOpColor('enemy', o.op.role) }} />
                  <span className="roster-mini-name">{o.op.name}</span>
                  <span className="roster-mini-hp">{o.currentWounds}W</span>
                </div>
              );
            })}
          </div>

          {/* Selected operative detail */}
          {activeOp && activeOp.team === 'player' && !activeOp.activated && (
            <div className="game-active-op">
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--gold)' }}>{activeOp.op.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{activeOp.op.role} · {activeOp.currentWounds}/{activeOp.op.wounds}W · {activeOp.apLeft}AP left</div>
              <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                {activeOp.op.weapons.map(w => (
                  <span key={w.name} style={{ fontSize: '0.65rem', background: 'var(--surface2)', padding: '2px 6px', borderRadius: 4, color: 'var(--text-secondary)' }}>
                    {w.type === 'ranged' ? '🔫' : '⚔️'} {w.name}
                  </span>
                ))}
              </div>
            </div>
          )}

      {/* Controls */}
      <div className="game-controls">
        {game.phase === 'setup' && (
          <div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>Set up your board matching the map above. Place terrain, then deploy your operatives in the green zone.</p>
            <button className="btn btn-primary" onClick={startTurn}>Ready — Start Turning Point 1 →</button>
          </div>
        )}

        {game.phase === 'initiative' && (
          <div>
            <div className="turn-recap">
              <div className="turn-recap-title">Turn {game.turningPoint - 1} Recap</div>
              <div className="turn-recap-stats">
                <span>Your team: {game.operatives.filter(o => o.team === 'player' && o.status !== 'incapacitated').length} alive</span>
                <span>Enemy: {game.operatives.filter(o => o.team === 'enemy' && o.status !== 'incapacitated').length} alive</span>
                <span>Score: {game.playerScore} - {game.enemyScore}</span>
              </div>
            </div>
            {currentEvent && currentEvent.id !== 'none' && (
              <div className={`event-card event-${currentEvent.effect}`}>
                <div className="event-icon">{currentEvent.icon}</div>
                <div className="event-info">
                  <div className="event-name">{currentEvent.name}</div>
                  <div className="event-desc">{currentEvent.desc}</div>
                  <div className="event-apply">{currentEvent.apply}</div>
                </div>
              </div>
            )}
            <button className="btn btn-primary" onClick={startTurn}>Roll Initiative for TP {game.turningPoint} →</button>
          </div>
        )}

        {game.phase === 'firefight' && game.activeTeam === 'enemy' && (
          <button className="btn btn-primary" onClick={doAiTurn} disabled={aiThinking}>{aiThinking ? '🤖 Thinking...' : '🤖 Enemy Activation →'}</button>
        )}

        {game.phase === 'firefight' && game.activeTeam === 'player' && (
          <div className="player-actions">
            {selectedOp !== null && activeOp && activeOp.status === 'ready' ? (
              <>
                <div className="action-info">
                  <strong>{activeOp.op.name}</strong> — {activeOp.apLeft} AP left
                </div>
                <div className="action-buttons">
                  <button className={`btn btn-sm ${actionMode === 'move' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActionMode('move')}>🏃 Move (1AP)</button>
                  <button className={`btn btn-sm ${actionMode === 'shoot' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActionMode('shoot')}><GoldIcon name="crosshair" size={14} /> Shoot (1AP)</button>
                  <button className={`btn btn-sm ${actionMode === 'fight' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActionMode('fight')}><GoldIcon name="fist2" size={14} /> Fight (2AP)</button>
                  <button className="btn btn-sm btn-ghost" onClick={endActivation}>✓ End</button>
                </div>

                {actionMode === 'move' && (
                  <div className="action-input">
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>Tap a highlighted cell on the board to move (range: {activeOp.op.movement}")</p>
                  </div>
                )}

                {actionMode === 'shoot' && (
                  <div className="action-input">
                    <label>Select weapon:</label>
                    <div className="action-buttons">
                      {activeOp.op.weapons.filter(w => w.type === 'ranged').map(w => (
                        <button key={w.name} className={`btn btn-sm ${selectedWeapon === w ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setSelectedWeapon(w)}>
                          {w.name} ({w.attacks}A, {w.skill}+, {w.normalDmg}/{w.critDmg}dmg)
                        </button>
                      ))}
                    </div>
                    {selectedWeapon && (
                      <>
                        <div className="dice-helper">
                          🎲 Hit chance: {formatProbability(selectedWeapon.skill)} per die · Expected: {expectedHits(selectedWeapon.attacks, selectedWeapon.skill).toFixed(1)} hits · ~{expectedDamage(selectedWeapon.attacks, selectedWeapon.skill, selectedWeapon.normalDmg, selectedWeapon.critDmg).toFixed(1)} dmg
                        </div>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>{selectedTarget !== null ? `Target: ${game.operatives[selectedTarget].op.name}` : 'Tap an enemy on the board to target'}</p>
                        <button className="btn btn-primary" onClick={doPlayerShoot} disabled={selectedTarget === null}>
                          🎲 Fire! (auto-roll {selectedWeapon.attacks} dice)
                        </button>
                      </>
                    )}
                  </div>
                )}

                {actionMode === 'fight' && (
                  <div className="action-input">
                    <label>Select melee weapon:</label>
                    <div className="action-buttons">
                      {activeOp.op.weapons.filter(w => w.type === 'melee').map(w => (
                        <button key={w.name} className={`btn btn-sm ${selectedWeapon === w ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setSelectedWeapon(w)}>
                          {w.name} ({w.attacks}A, {w.skill}+, {w.normalDmg}/{w.critDmg}dmg)
                        </button>
                      ))}
                    </div>
                    {selectedWeapon && (
                      <>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>{selectedTarget !== null ? `Target: ${game.operatives[selectedTarget].op.name}` : 'Tap an adjacent enemy to fight'}</p>
                        <button className="btn btn-primary" onClick={doPlayerFight} disabled={selectedTarget === null}>
                          ⚔️ Fight! (auto-roll {selectedWeapon.attacks} dice)
                        </button>
                      </>
                    )}
                  </div>
                )}
              </>
            ) : (
              <p style={{ color: 'var(--text-dim)' }}>Tap one of your ready operatives on the board or "Your Team" tab.</p>
            )}
          </div>
        )}

        {game.phase === 'end' && (
          <button className="btn btn-primary" onClick={endGame}>
            {game.playerScore > game.enemyScore ? 'Claim Victory →' : game.playerScore < game.enemyScore ? 'Accept Defeat →' : 'Accept Draw →'}
          </button>
        )}
      </div>
        </div>{/* end game-right */}
      </div>{/* end game-split */}
    </div>
  );
}

function OpCard({ op, selected, onSelect }: { op: OpState; idx: number; selected: boolean; onSelect: () => void }) {
  const dead = op.status === 'incapacitated';
  const hpPct = op.op.wounds > 0 ? (op.currentWounds / op.op.wounds) * 100 : 0;
  const hpClass = hpPct > 60 ? 'hp-high' : hpPct > 30 ? 'hp-mid' : 'hp-low';

  return (
    <div className={`op-card ${op.team === 'player' ? 'team-player' : ''} ${selected ? 'selected' : ''} ${dead ? 'dead' : ''} ${op.activated ? 'activated' : ''}`} onClick={onSelect}>
      <div className="op-card-header">
        <span className="op-card-name">{getFactionEmoji(op.op.faction)} {op.op.name}</span>
        <span className="op-card-role"><GoldIcon name={`role-${op.op.role.toLowerCase().split(' ')[0]}`} size={14} /> {op.op.role}</span>
      </div>
      <div className="op-card-stats">
        <div className="op-stat"><div className="op-stat-label">Move</div><div className="op-stat-val">{op.op.movement}"</div></div>
        <div className="op-stat"><div className="op-stat-label">APL</div><div className="op-stat-val">{op.op.apl}</div></div>
        <div className="op-stat"><div className="op-stat-label">Def</div><div className="op-stat-val">{op.op.defense}</div></div>
        <div className="op-stat"><div className="op-stat-label">Save</div><div className="op-stat-val">{op.op.save}+</div></div>
        <div className="op-stat"><div className="op-stat-label">Wounds</div><div className={`op-stat-val ${hpPct <= 30 ? 'wounds-critical' : ''}`}>{op.currentWounds}/{op.op.wounds}</div></div>
      </div>
      <div className="wounds-bar-wrap">
        <div className="wounds-bar-bg"><div className={`wounds-bar-fill ${hpClass}`} style={{ width: `${hpPct}%` }} /></div>
      </div>
      <div className="op-card-weapons">
        {op.op.weapons.map(w => (
          <div key={w.name} className="weapon-line">
            <span className="weapon-icon">{w.type === 'ranged' ? <GoldIcon name="pistol" size={14} /> : <GoldIcon name="sword2" size={14} />}</span>
            <div className="weapon-info">
              <span className="weapon-name">{w.name}</span>
              <div className="weapon-stats">
                {w.attacks}A · {w.skill}+ · {w.normalDmg}/{w.critDmg} dmg
                {w.range ? ` · ${w.range}"` : ''}
                {w.special?.map(s => <span key={s} className="weapon-special">{s}</span>)}
              </div>
            </div>
          </div>
        ))}
      </div>
      {op.op.abilities.length > 0 && <div className="op-card-abilities">✦ {op.op.abilities.join(' · ')}</div>}
      <div className="op-card-footer">
        <span><GoldIcon name="crosshair" size={12} /> ({op.x}, {op.y}) {dead ? <><GoldIcon name="skull-bones" size={12} /> INCAPACITATED</> : op.activated ? '✓ Activated' : ''}</span>
        {!dead && (
          <div className="ap-pips">
            {Array.from({ length: op.op.apl }, (_, i) => (
              <div key={i} className={`ap-pip ${i < op.apLeft ? 'filled' : ''}`} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function RulesReference() {
  return (
    <div className="rules-ref">
      <h3><GoldIcon name="guides" size={18} /> Kill Team Quick Reference (Feb '26 Errata)</h3>

      <h4>Turn Sequence</h4>
      <ol>
        <li><strong>Initiative Phase</strong> — Both players roll off. Winner chooses who activates first. The player who had initiative resolves any simultaneous rules first.</li>
        <li><strong>Strategy Phase</strong> — Use strategic ploys (not implemented in solo mode).</li>
        <li><strong>Firefight Phase</strong> — Players alternate activating one operative each. Each operative has APL to spend on actions.</li>
      </ol>

      <h4>Actions (cost in AP)</h4>
      <ul>
        <li><strong>Move (1AP)</strong> — Move up to M inches. Can't move through enemies or Heavy terrain. Accessible terrain costs extra movement.</li>
        <li><strong>Shoot (1AP)</strong> — Pick a ranged weapon and a visible target. Roll attack dice. Cannot shoot if within control range of enemy (1") unless rules allow it.</li>
        <li><strong>Fight (2AP)</strong> — Must be within 1" of enemy. Both players roll simultaneously.</li>
        <li><strong>Dash (1AP)</strong> — Move up to M inches (second move).</li>
        <li><strong>Charge (1AP)</strong> — Move up to M, must end within 1" of enemy. Enables Fight.</li>
        <li><strong>Pick Up (1AP)</strong> — Pick up an objective within 1".</li>
      </ul>

      <h4>Shooting Sequence</h4>
      <ol>
        <li><strong>Select valid target</strong> — must be visible and not obscured by Heavy terrain. Cannot shoot while within 1" of enemy.</li>
        <li><strong>Roll attack dice</strong> — number of dice = weapon's A stat.</li>
        <li><strong>Check hits</strong> — each die ≥ weapon's Hit stat = normal hit. Die = 6 = critical hit.</li>
        <li><strong>Defender rolls saves</strong> — rolls Defence dice. Each ≥ Save stat = normal save. Die = 6 = critical save.</li>
        <li><strong>Resolve saves</strong> — Critical saves cancel critical hits first, then normal hits. Normal saves cancel normal hits, then critical hits.</li>
        <li><strong>Deal damage</strong> — remaining crits deal crit damage, remaining normals deal normal damage. Successes resolve simultaneously.</li>
      </ol>
      <div className="rules-example"><strong>Heavy weapon rule:</strong> Cannot shoot if the operative moved this activation, and cannot move after shooting with a Heavy weapon.</div>
      <div className="rules-example"><strong>Severe weapon rule:</strong> Devastating and Piercing Crits still take effect, but Punishing and Rending don't.</div>

      <h4><GoldIcon name="fist2" size={16} /> Fighting Sequence (Melee)</h4>
      <ol>
        <li><strong>Both roll simultaneously</strong> — attacker and defender each roll their melee weapon's A dice.</li>
        <li><strong>Check successes</strong> — die ≥ weapon's WS = normal success. Die = 6 = critical success.</li>
        <li><strong>Resolve alternating</strong> — attacker resolves one die first, then defender, alternating:
          <ul>
            <li>A <strong>critical</strong> can: deal crit damage OR cancel one enemy critical.</li>
            <li>A <strong>normal</strong> can: deal normal damage OR cancel one enemy normal.</li>
          </ul>
        </li>
        <li><strong>Strategy tip</strong> — cancel enemy crits first to survive, then deal damage with remaining dice.</li>
      </ol>

      <h4>Counteract (Feb '26 Errata)</h4>
      <ul>
        <li>After an enemy activates, you can select an expended friendly operative with Engage order to perform a 1AP action (excluding Guard) for free.</li>
        <li>Each operative can only counteract <strong>once per turning point</strong>.</li>
        <li>Cannot move more than 2" while counteracting. Accessible terrain affects this distance.</li>
      </ul>

      <h4>Cover & Terrain</h4>
      <ul>
        <li><strong>Light Cover</strong> — Defender retains one normal save as a critical save.</li>
        <li><strong>Heavy Cover</strong> — Blocks line of sight. Cannot shoot through it.</li>
        <li><strong>Vantage Point</strong> — Ignores light cover when shooting down. Heavy terrain connected to Vantage terrain is not ignored for obscured.</li>
        <li><strong>Accessible</strong> — Costs extra movement to traverse. Operatives cannot normally move through Accessible terrain during a counteraction.</li>
        <li><strong>Ceiling</strong> — Operatives with 50mm or smaller base can move underneath regardless of height.</li>
        <li><strong>Jumping</strong> — From Vantage terrain higher than 2", can jump up to 4" horizontally, then must drop or climb.</li>
        <li>An operative <strong>cannot be in cover and obscured</strong> from the same terrain feature — defender must choose one.</li>
      </ul>

      <h4>Incapacitation</h4>
      <ul>
        <li>When wounds reach 0, operative is <strong>incapacitated</strong> and removed.</li>
        <li>Some rules allow a free action before removal (max one free action, excluding Place Marker).</li>
        <li>Excess damage is lost.</li>
      </ul>

      <h4>Scoring</h4>
      <ul>
        <li>At end of each Turning Point, check objective control.</li>
        <li>Operative controls objective if within 2" and has more APL than enemies nearby.</li>
        <li>1 VP per controlled objective per turning point.</li>
        <li>If carrying a mission/objective marker, that marker is the same distance as the operative.</li>
      </ul>

      <h4>Key Errata Notes</h4>
      <ul>
        <li>A dice can only be retained/re-rolled <strong>once</strong>.</li>
        <li>Auto-retained dice (e.g. cover, Accurate) cannot be re-rolled and have no numerical result.</li>
        <li>If an operative's stats change during an action, apply after the action completes. Weapon rule changes apply immediately.</li>
        <li>Guard: operative is no longer on guard after counteracting.</li>
      </ul>
    </div>
  );
}
