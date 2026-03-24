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
import { RoleIcon, BoardToken, getFactionEmoji, ROLE_INFO } from '../db/operative-icons.tsx';

interface Props {
  playerFaction: string;
  enemyFaction: string;
  difficulty?: AIDifficulty;
  onGameEnd: (result: 'win' | 'loss' | 'draw', pCasualties: number, eCasualties: number) => void;
}

export default function GamePlay({ playerFaction, enemyFaction, difficulty = 'normal', onGameEnd }: Props) {
  const [game, setGame] = useState<GameState | null>(null);
  const [selectedOp, setSelectedOp] = useState<number | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<number | null>(null);
  const [selectedWeapon, setSelectedWeapon] = useState<Weapon | null>(null);
  const [diceInput, setDiceInput] = useState('');
  const [actionMode, setActionMode] = useState<'none' | 'move' | 'shoot' | 'fight'>('none');
  const [currentEvent, setCurrentEvent] = useState<RandomEvent | null>(null);
  const [tab, setTab] = useState<'board' | 'your' | 'enemy' | 'rules'>('board');
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const pOps = getRoster(playerFaction);
    const eOps = getRoster(enemyFaction);
    const map = generateMap();
    setGame(createGameState(pOps, eOps, map));
  }, [playerFaction, enemyFaction]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [game?.log.length]);

  if (!game) return <div className="empty">Generating battlefield...</div>;

  const playerOps = game.operatives.filter(o => o.team === 'player');
  const enemyOps = game.operatives.filter(o => o.team === 'enemy');
  const activeOp = selectedOp !== null ? game.operatives[selectedOp] : null;

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
    let s = game;
    // AI activates one operative
    s = aiActivationV2(s, difficulty);
    setGame(s);
  };

  const parseDice = (): number[] => diceInput.split(/[,\s]+/).map(Number).filter(n => n >= 1 && n <= 6);

  const doPlayerShoot = () => {
    if (selectedOp === null || selectedTarget === null || !selectedWeapon) return;
    const rolls = parseDice();
    if (rolls.length === 0) return;
    const attacker = game.operatives[selectedOp];
    const defender = game.operatives[selectedTarget];
    const result = resolveShoot(attacker, defender, selectedWeapon, rolls);
    let s = { ...game, log: [...game.log, `\n🎯 YOUR SHOOT: ${result.log}`] };
    s = applyDamage(s, selectedTarget, result.totalDmg);
    // Mark activated, use AP
    const ops = [...s.operatives];
    const op = { ...ops[selectedOp], apLeft: ops[selectedOp].apLeft - 1 };
    if (op.apLeft <= 0) { op.activated = true; op.status = 'activated' as any; }
    ops[selectedOp] = op;
    s = checkTurnEnd({ ...s, operatives: ops });
    setGame(s);
    setDiceInput('');
    setActionMode('none');
    setSelectedTarget(null);
    setSelectedWeapon(null);
  };

  const doPlayerFight = () => {
    if (selectedOp === null || selectedTarget === null || !selectedWeapon) return;
    const atkRolls = parseDice();
    if (atkRolls.length === 0) return;
    const attacker = game.operatives[selectedOp];
    const defender = game.operatives[selectedTarget];
    const defWeapon = defender.op.weapons.find(w => w.type === 'melee') || defender.op.weapons[0];
    const defRolls = rollDice(defWeapon.attacks);
    const result = resolveFight(attacker, defender, selectedWeapon, defWeapon, atkRolls, defRolls);
    let s = { ...game, log: [...game.log, `\n${result.log}`] };
    s = applyDamage(s, selectedTarget, result.atkDmg);
    s = applyDamage(s, selectedOp, result.defDmg);
    const ops = [...s.operatives];
    const op = { ...ops[selectedOp], apLeft: ops[selectedOp].apLeft - 2, activated: true, status: 'activated' as any };
    ops[selectedOp] = op;
    s = checkTurnEnd({ ...s, operatives: ops });
    setGame(s);
    setDiceInput('');
    setActionMode('none');
    setSelectedTarget(null);
    setSelectedWeapon(null);
  };

  const doPlayerMove = () => {
    if (selectedOp === null) return;
    const coords = diceInput.split(/[,\s]+/).map(Number);
    if (coords.length < 2) return;
    const ops = [...game.operatives];
    const op = { ...ops[selectedOp], x: coords[0], y: coords[1], apLeft: ops[selectedOp].apLeft - 1 };
    if (op.apLeft <= 0) { op.activated = true; op.status = 'activated' as any; }
    ops[selectedOp] = op;
    const s = checkTurnEnd({ ...game, operatives: ops, log: [...game.log, `🏃 ${op.op.name} moves to (${coords[0]}, ${coords[1]})`] });
    setGame(s);
    setDiceInput('');
    setActionMode('none');
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
    const pDead = playerOps.filter(o => o.status === 'incapacitated').length;
    const eDead = enemyOps.filter(o => o.status === 'incapacitated').length;
    const result = game.playerScore > game.enemyScore ? 'win' : game.playerScore < game.enemyScore ? 'loss' : 'draw';
    onGameEnd(result, pDead, eDead);
  };

  return (
    <div>
      {/* Header */}
      <div className="game-header">
        <div>TP {game.turningPoint}/{game.maxTurningPoints}</div>
        <div>{AI_CONFIGS[difficulty].icon} {AI_CONFIGS[difficulty].name}</div>
        <div>Score: You {game.playerScore} - {game.enemyScore} Enemy</div>
        <div className={`status status-${game.activeTeam === 'player' ? 'painted' : 'unbuilt'}`}>
          {game.phase === 'setup' ? 'SETUP' : game.phase === 'end' ? 'GAME OVER' : `${game.activeTeam === 'player' ? 'YOUR' : 'ENEMY'} TURN`}
        </div>
      </div>

      {/* Tabs */}
      <div className="game-tabs">
        {(['board', 'your', 'enemy', 'rules'] as const).map(t => (
          <button key={t} className={`game-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'board' ? <><GoldIcon name="scroll" size={14} /> Board</> : t === 'your' ? <><GoldIcon name="shield-check" size={14} /> Your Team</> : t === 'enemy' ? <><GoldIcon name="skull-bones" size={14} /> Enemy</> : <><GoldIcon name="guides" size={14} /> Rules</>}
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
          <div className="board-grid" style={{ gridTemplateColumns: `repeat(${game.map.cols}, 20px)` }}>
            {game.map.grid.map((row, y) => row.map((cell, x) => {
              const pOp = game.operatives.find(o => o.team === 'player' && o.x === x && o.y === y && o.status !== 'incapacitated');
              const eOp = game.operatives.find(o => o.team === 'enemy' && o.x === x && o.y === y && o.status !== 'incapacitated');
              const op = pOp || eOp;
              const cellClass = `cell-${cell}`;

              const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.currentTarget.classList.add('drag-over'); };
              const handleDragLeave = (e: React.DragEvent) => { e.currentTarget.classList.remove('drag-over'); };
              const handleDrop = (e: React.DragEvent) => {
                e.preventDefault();
                e.currentTarget.classList.remove('drag-over');
                if (draggingIdx === null) return;
                const dragOp = game.operatives[draggingIdx];
                if (dragOp.team !== 'player') return;
                if (cell === 'heavy') return; // can't drop on heavy terrain
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
                setDraggingIdx(null);
              };

              return (
                <div
                  key={`${x}-${y}`}
                  className={`board-cell ${cellClass} ${op && selectedOp === game.operatives.indexOf(op) ? 'cell-selected' : ''}`}
                  title={`(${x},${y}) ${op ? `${op.op.name} [${op.op.role}] ${op.currentWounds}/${op.op.wounds}W` : CELL_LEGEND[cell].label}`}
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
                    <span className="cell-obj-marker">◎</span>
                  ) : ''}
                </div>
              );
            }))}
          </div>
          {/* Terrain image overlays */}
          {game.map.terrain.map((t, i) => {
            const b = import.meta.env.BASE_URL;
            const terrainImgs: Record<string, Record<string, string>> = {
              heavy: { Ruins: 'terrain-ruins.jpg', Wall: 'terrain-wall.jpg', Building: 'terrain-building.jpg' },
              light: { Barricade: 'terrain-barricade.jpg', Crates: 'terrain-crates.jpg', Pipes: 'terrain-pipes.jpg' },
              vantage: { Tower: 'terrain-tower.jpg', Platform: 'terrain-platform.jpg' },
            };
            const src = terrainImgs[t.type]?.[t.label];
            if (!src) return null;
            return <img key={i} src={`${b}decor/${src}`} alt={t.label} style={{
              position: 'absolute', left: t.x * 20, top: t.y * 20, width: t.w * 20, height: t.h * 20,
              objectFit: 'cover', borderRadius: 2, opacity: 0.7, pointerEvents: 'none', zIndex: 1,
            }} />;
          })}
          </div>

          <div className="board-legend">
            <span className="legend-item"><span className="legend-swatch" style={{ background: '#0d2b0d' }} />Your deploy zone</span>
            <span className="legend-item"><span className="legend-swatch" style={{ background: '#2b0d0d' }} />Enemy deploy zone</span>
            <span className="legend-item"><span className="legend-swatch" style={{ background: '#4e342e' }} />Heavy cover (blocks LOS)</span>
            <span className="legend-item"><span className="legend-swatch" style={{ background: '#37474f' }} />Light cover</span>
            <span className="legend-item"><span className="legend-swatch" style={{ background: '#4a148c' }} />Vantage point</span>
            <span className="legend-item" style={{ color: 'var(--gold)' }}>◎ Objective</span>
          </div>
          <div className="board-legend">
            <strong style={{ marginRight: 8 }}>Roles:</strong>
            {ROLE_INFO.map(r => (
              <span key={r.role} className="legend-item">
                <span className="legend-swatch" style={{ background: '#388e3c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <RoleIcon role={r.role} size={10} color="#fff" />
                </span>
                {r.label}
              </span>
            ))}
          </div>
          <div className="terrain-list">
            <strong><GoldIcon name="models" size={14} /> Terrain to place on your board:</strong>
            {game.map.terrain.map((t, i) => (
              <span key={i} className="terrain-tag">{t.label} ({t.w}×{t.h}") at col {t.x}, row {t.y}</span>
            ))}
          </div>
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

      {/* Action Log */}
      <div className="action-log" ref={logRef}>
        {game.log.map((l, i) => <div key={i} className="log-line">{l}</div>)}
      </div>

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
          <button className="btn btn-primary" onClick={doAiTurn}>🤖 Enemy Activation →</button>
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
                    <label>Enter new position (x, y):</label>
                    <input value={diceInput} onChange={e => setDiceInput(e.target.value)} placeholder="e.g. 10, 8" />
                    <button className="btn btn-sm btn-primary" onClick={doPlayerMove}>Confirm Move</button>
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
                        <label>Select target (switch to Enemy tab), then enter your {selectedWeapon.attacks} dice rolls:</label>
                        <input value={diceInput} onChange={e => setDiceInput(e.target.value)} placeholder={`e.g. 3, 5, 2, 6`} />
                        <button className="btn btn-sm btn-primary" onClick={doPlayerShoot} disabled={selectedTarget === null}>
                          Resolve Shot {selectedTarget !== null ? `→ ${game.operatives[selectedTarget].op.name}` : '(select target)'}
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
                        <label>Select target (Enemy tab), then enter your {selectedWeapon.attacks} attack dice:</label>
                        <input value={diceInput} onChange={e => setDiceInput(e.target.value)} placeholder={`e.g. 4, 6, 3, 1`} />
                        <button className="btn btn-sm btn-primary" onClick={doPlayerFight} disabled={selectedTarget === null}>
                          Resolve Fight {selectedTarget !== null ? `→ ${game.operatives[selectedTarget].op.name}` : '(select target)'}
                        </button>
                      </>
                    )}
                  </div>
                )}
              </>
            ) : (
              <p style={{ color: 'var(--text-dim)' }}>Select one of your ready operatives from the "Your Team" tab to activate.</p>
            )}
          </div>
        )}

        {game.phase === 'end' && (
          <button className="btn btn-primary" onClick={endGame}>
            {game.playerScore > game.enemyScore ? '<GoldIcon name="victory" size={16} /> Claim Victory' : game.playerScore < game.enemyScore ? '<GoldIcon name="defeat" size={16} /> Accept Defeat' : '<GoldIcon name="handshake" size={16} /> Accept Draw'} →
          </button>
        )}
      </div>
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
        <span className="op-card-role"><RoleIcon role={op.op.role} size={12} color="currentColor" /> {op.op.role}</span>
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
        <span>📍 ({op.x}, {op.y}) {dead ? '💀 INCAPACITATED' : op.activated ? '✓ Activated' : ''}</span>
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
      <h3><GoldIcon name="guides" size={18} /> Kill Team Quick Reference</h3>

      <h4>Turn Sequence</h4>
      <ol>
        <li><strong>Initiative Phase</strong> — Both players roll off. Winner chooses who activates first.</li>
        <li><strong>Firefight Phase</strong> — Players alternate activating one operative each. Each operative has APL (Action Point Limit) to spend on actions.</li>
      </ol>

      <h4>Actions (cost in AP)</h4>
      <ul>
        <li><strong>Move (1AP)</strong> — Move up to M inches. Can't move through enemies or heavy terrain.</li>
        <li><strong>Shoot (1AP)</strong> — Pick a ranged weapon and a visible target. Roll attack dice.</li>
        <li><strong>Fight (2AP)</strong> — Must be within 1" of enemy. Both players roll simultaneously.</li>
        <li><strong>Dash (1AP)</strong> — Move up to M inches (second move).</li>
        <li><strong>Charge (1AP)</strong> — Move up to M, must end within 1" of enemy. Enables Fight.</li>
        <li><strong>Pick Up (1AP)</strong> — Pick up an objective within 1".</li>
      </ul>

      <h4>Shooting Sequence</h4>
      <ol>
        <li><strong>Roll attack dice</strong> — number of dice = weapon's A (Attacks) stat.</li>
        <li><strong>Check hits</strong> — each die ≥ weapon's BS/WS skill = normal hit. Die = 6 = critical hit.</li>
        <li><strong>Defender rolls saves</strong> — rolls DF (Defence) dice. Each ≥ Save stat = one save.</li>
        <li><strong>Resolve damage</strong> — saves cancel hits (crits cancel crits first, then normal). Remaining hits deal damage.</li>
        <li>Normal hits deal normal damage. Critical hits deal crit damage.</li>
      </ol>

      <h4><GoldIcon name="fist2" size={16} /> Fighting Sequence (Melee Combat)</h4>
      <ol>
        <li><strong>Both players roll simultaneously</strong> — attacker rolls their melee weapon's A dice, defender rolls their melee weapon's A dice.</li>
        <li><strong>Check successes</strong> — each die ≥ weapon's WS = success. Die = 6 = critical success.</li>
        <li><strong>Resolve strikes</strong> — starting with the attacker:
          <ul>
            <li>A <strong>critical</strong> can: deal crit damage to the enemy, OR cancel one of the enemy's crits.</li>
            <li>A <strong>normal hit</strong> can: deal normal damage to the enemy, OR cancel one of the enemy's normal hits.</li>
          </ul>
        </li>
        <li><strong>Alternate</strong> — attacker resolves one die, then defender resolves one die, back and forth until all dice are resolved.</li>
        <li><strong>Strategy</strong> — you choose whether to deal damage or cancel enemy hits. Cancel their crits first to survive!</li>
      </ol>
      <div className="rules-example">
        <strong>Example:</strong> Your operative (4A, 3+, 3/5dmg) fights an Ork (4A, 3+, 4/5dmg).<br/>
        You roll: 3, 5, 6, 2 → 2 normal hits + 1 crit.<br/>
        Ork rolls: 4, 3, 6, 1 → 2 normal hits + 1 crit.<br/>
        You go first: Use your crit to cancel the Ork's crit (smart!). Then deal 3 dmg with a normal hit. Then deal 3 dmg with your other normal hit.<br/>
        Ork responds: Deals 4 dmg with a normal hit. Deals 4 dmg with the other normal hit.<br/>
        Result: You dealt 6 damage, Ork dealt 8 damage. Both take wounds.
      </div>

      <h4>Cover</h4>
      <ul>
        <li><strong>Light Cover</strong> — Defender retains one normal save as a crit.</li>
        <li><strong>Heavy Cover</strong> — Blocks line of sight. Can't shoot through it.</li>
        <li><strong>Vantage Point</strong> — Ignores light cover when shooting down.</li>
      </ul>

      <h4>Injury</h4>
      <ul>
        <li>When wounds reach 0, operative is <strong>incapacitated</strong> (removed).</li>
        <li>Excess damage is lost — no overkill carry-over.</li>
      </ul>

      <h4>Scoring</h4>
      <ul>
        <li>At end of each Turning Point, check objective control.</li>
        <li>Operative controls objective if within 2" and has more APL than enemies nearby.</li>
        <li>1 VP per controlled objective per turning point.</li>
      </ul>
    </div>
  );
}
