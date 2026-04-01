import type { KTOperative, Weapon } from './killteam-data';
import type { GameMap } from './map-generator';

export type Order = 'engage' | 'conceal';

export interface OpState {
  op: KTOperative;
  team: 'player' | 'enemy';
  currentWounds: number;
  activated: boolean;
  apLeft: number;
  status: 'ready' | 'activated' | 'incapacitated';
  order: Order;
  onGuard: boolean;
  hasCounteracted: boolean;
  movedThisActivation: boolean;
  actionsUsed: string[];  // track which actions were performed
  x: number;
  y: number;
}

export interface GameState {
  turningPoint: number;
  maxTurningPoints: number;
  phase: 'setup' | 'initiative' | 'strategy' | 'firefight' | 'end';
  initiative: 'player' | 'enemy';
  activeTeam: 'player' | 'enemy';
  operatives: OpState[];
  log: string[];
  map: GameMap;
  objectiveControl: Record<number, 'player' | 'enemy' | 'none'>;
  playerScore: number;
  enemyScore: number;
  playerCP: number;
  enemyCP: number;
}

export function rollD6(): number { return Math.floor(Math.random() * 6) + 1; }
export function rollDice(count: number): number[] { return Array.from({ length: count }, rollD6); }

export function createGameState(playerOps: KTOperative[], enemyOps: KTOperative[], map: GameMap): GameState {
  const operatives: OpState[] = [];
  let py = 2;
  for (const op of playerOps) {
    operatives.push({ op, team: 'player', currentWounds: op.wounds, activated: false, apLeft: op.apl, status: 'ready', order: 'engage', onGuard: false, hasCounteracted: false, movedThisActivation: false, actionsUsed: [], x: 2, y: Math.min(py, map.rows - 2) });
    py += 3;
  }
  let ey = 2;
  for (const op of enemyOps) {
    operatives.push({ op, team: 'enemy', currentWounds: op.wounds, activated: false, apLeft: op.apl, status: 'ready', order: 'engage', onGuard: false, hasCounteracted: false, movedThisActivation: false, actionsUsed: [], x: map.cols - 3, y: Math.min(ey, map.rows - 2) });
    ey += 3;
  }
  return {
    turningPoint: 1, maxTurningPoints: 4,
    phase: 'setup', initiative: 'player', activeTeam: 'player',
    operatives, log: ['⚔️ Kill Team mission begins. Set up your board using the map above.'],
    map, objectiveControl: { 1: 'none', 2: 'none', 3: 'none', 4: 'none' },
    playerScore: 0, enemyScore: 0, playerCP: 2, enemyCP: 2,
  };
}

export function rollInitiative(state: GameState): GameState {
  const pRoll = rollD6();
  const eRoll = rollD6();
  const winner = pRoll >= eRoll ? 'player' : 'enemy';
  const log = [...state.log, `🎲 Initiative: You rolled ${pRoll}, Enemy rolled ${eRoll}. ${winner === 'player' ? 'You have' : 'Enemy has'} initiative.`];

  const operatives = state.operatives.map(o => o.status !== 'incapacitated' ? {
    ...o, activated: false, apLeft: o.op.apl, status: 'ready' as const,
    onGuard: false, hasCounteracted: false, movedThisActivation: false, actionsUsed: [],
  } : o);

  return { ...state, initiative: winner, activeTeam: winner, phase: 'firefight', log, operatives,
    playerCP: Math.min(state.playerCP + 1, 4), enemyCP: Math.min(state.enemyCP + 1, 4) };
}

export function resolveShoot(attacker: OpState, defender: OpState, weapon: Weapon, attackRolls: number[]): { hits: number; crits: number; normalDmg: number; critDmg: number; totalDmg: number; defSaves: number[]; log: string } {
  // Check Heavy weapon rule: can't shoot if moved this activation
  const isHeavy = weapon.special?.includes('Heavy');

  const hits = attackRolls.filter(r => r >= weapon.skill && r < 6).length;
  const crits = attackRolls.filter(r => r === 6).length;

  // Defense rolls
  const defRolls = rollDice(defender.op.defense);
  const normalSaves = defRolls.filter(r => r >= defender.op.save && r < 6).length;
  const critSaves = defRolls.filter(r => r === 6).length;

  // Cover: if defender is near light terrain, retain one normal save as crit
  // (simplified: we don't track exact terrain LOS, so skip for now)

  // Resolve: crit saves cancel crit hits first, then normal saves cancel normal hits
  let critHitsLeft = crits;
  let normalHitsLeft = hits;
  let critSavesLeft = critSaves;
  let normalSavesLeft = normalSaves;

  // Crit saves cancel crit hits
  const critsCancelled = Math.min(critHitsLeft, critSavesLeft);
  critHitsLeft -= critsCancelled;
  critSavesLeft -= critsCancelled;

  // Remaining crit saves cancel normal hits
  const normCancelledByCrit = Math.min(normalHitsLeft, critSavesLeft);
  normalHitsLeft -= normCancelledByCrit;

  // Normal saves cancel normal hits
  const normCancelled = Math.min(normalHitsLeft, normalSavesLeft);
  normalHitsLeft -= normCancelled;

  // Remaining normal saves cancel crit hits (normal save can't cancel crit in real rules, but simplified)
  // Actually in real KT: normal saves CAN cancel crit hits. Fix:
  const critCancelledByNorm = Math.min(critHitsLeft, normalSavesLeft - normCancelled);
  critHitsLeft -= critCancelledByNorm;

  const dmg = critHitsLeft * weapon.critDmg + normalHitsLeft * weapon.normalDmg;

  // Apply weapon special rules
  let finalDmg = dmg;
  if (weapon.special?.some(s => s.startsWith('Piercing'))) {
    // Piercing X: attacker can discard X normal saves (already simplified above)
  }

  const log = `${attacker.op.name} fires ${weapon.name}${isHeavy ? ' (Heavy)' : ''} → [${attackRolls.join(',')}] = ${hits} hits, ${crits} crits. Defense [${defRolls.join(',')}] = ${normalSaves} saves, ${critSaves} crit saves. ${finalDmg} damage dealt.`;

  return { hits, crits, normalDmg: normalHitsLeft * weapon.normalDmg, critDmg: critHitsLeft * weapon.critDmg, totalDmg: finalDmg, defSaves: defRolls, log };
}

export function resolveFight(attacker: OpState, defender: OpState, atkWeapon: Weapon, defWeapon: Weapon, atkRolls: number[], defRolls: number[]): { atkDmg: number; defDmg: number; log: string } {
  // Attacker successes
  const atkNorm = atkRolls.filter(r => r >= atkWeapon.skill && r < 6).length;
  const atkCrits = atkRolls.filter(r => r === 6).length;
  // Defender successes
  const defNorm = defRolls.filter(r => r >= defWeapon.skill && r < 6).length;
  const defCrits = defRolls.filter(r => r === 6).length;

  // Fight resolution: alternating, attacker first
  // Each player resolves one die at a time: use a crit to deal crit dmg OR cancel enemy crit
  // Use a normal to deal normal dmg OR cancel enemy normal
  // Strategy: cancel enemy crits first, then deal damage

  let aCrits = atkCrits, aNorm = atkNorm;
  let dCrits = defCrits, dNorm = defNorm;
  let atkDmg = 0, defDmg = 0;

  // Attacker: use crits to cancel defender crits first
  const cancelCrits = Math.min(aCrits, dCrits);
  aCrits -= cancelCrits; dCrits -= cancelCrits;

  // Defender: use remaining crits to cancel attacker crits
  const cancelCrits2 = Math.min(dCrits, aCrits);
  dCrits -= cancelCrits2; aCrits -= cancelCrits2;

  // Attacker: use normals to cancel defender normals
  const cancelNorm = Math.min(aNorm, dNorm);
  aNorm -= cancelNorm; dNorm -= cancelNorm;

  // Remaining successes deal damage
  atkDmg = aCrits * atkWeapon.critDmg + aNorm * atkWeapon.normalDmg;
  defDmg = dCrits * defWeapon.critDmg + dNorm * defWeapon.normalDmg;

  const log = `⚔️ FIGHT: ${attacker.op.name} [${atkRolls.join(',')}] (${atkNorm + atkCrits + cancelCrits} hits, ${atkCrits + cancelCrits} crits) vs ${defender.op.name} [${defRolls.join(',')}] (${defNorm + defCrits + cancelCrits} hits, ${defCrits + cancelCrits} crits). Deals ${atkDmg} dmg, takes ${defDmg} dmg.`;
  return { atkDmg, defDmg, log };
}

export function applyDamage(state: GameState, targetIdx: number, damage: number): GameState {
  if (damage <= 0) return state;
  const ops = [...state.operatives];
  const target = { ...ops[targetIdx] };
  target.currentWounds = Math.max(0, target.currentWounds - damage);
  const log = [...state.log];
  if (target.currentWounds <= 0) {
    target.status = 'incapacitated';
    log.push(`☠️ ${target.op.name} is incapacitated!`);
  }
  ops[targetIdx] = target;
  return { ...state, operatives: ops, log };
}

export function checkTurnEnd(state: GameState): GameState {
  const alive = state.operatives.filter(o => o.status !== 'incapacitated');
  const allActivated = alive.every(o => o.activated);

  if (allActivated) {
    // Score objectives
    let pScore = state.playerScore;
    let eScore = state.enemyScore;
    const objCtrl = { ...state.objectiveControl };

    for (const obj of state.map.objectives) {
      const nearby = state.operatives.filter(o => o.status !== 'incapacitated' && Math.abs(o.x - obj.x) <= 2 && Math.abs(o.y - obj.y) <= 2);
      const pCount = nearby.filter(o => o.team === 'player').reduce((s, o) => s + o.op.apl, 0);
      const eCount = nearby.filter(o => o.team === 'enemy').reduce((s, o) => s + o.op.apl, 0);
      objCtrl[obj.id] = pCount > eCount ? 'player' : eCount > pCount ? 'enemy' : 'none';
      if (objCtrl[obj.id] === 'player') pScore++;
      if (objCtrl[obj.id] === 'enemy') eScore++;
    }

    if (state.turningPoint >= state.maxTurningPoints) {
      return { ...state, phase: 'end', playerScore: pScore, enemyScore: eScore, objectiveControl: objCtrl,
        log: [...state.log, `\n📊 GAME OVER! Final Score: You ${pScore} - ${eScore} Enemy. ${pScore > eScore ? '🏆 VICTORY!' : pScore < eScore ? '💀 DEFEAT!' : '🤝 DRAW!'}`] };
    }

    return { ...state, turningPoint: state.turningPoint + 1, phase: 'initiative', playerScore: pScore, enemyScore: eScore, objectiveControl: objCtrl,
      log: [...state.log, `\n--- Turning Point ${state.turningPoint} complete. Score: You ${pScore} - ${eScore} Enemy ---\n`] };
  }

  // Switch active team — alternating activation
  // Only stay on current team if someone is MID-activation (used some AP but not done)
  const currentTeamAlive = alive.filter(o => o.team === state.activeTeam);
  const midActivation = currentTeamAlive.some(o => !o.activated && o.apLeft > 0 && o.apLeft < o.op.apl);
  if (midActivation) return state;

  // Otherwise, switch to the other team if they have unactivated operatives
  const nextTeam = state.activeTeam === 'player' ? 'enemy' : 'player';
  const nextTeamAlive = alive.filter(o => o.team === nextTeam);
  const nextHasReady = nextTeamAlive.some(o => !o.activated);
  const currentHasReady = currentTeamAlive.some(o => !o.activated);

  if (nextHasReady) return { ...state, activeTeam: nextTeam };
  if (currentHasReady) return state; // other team is done, stay on current
  return state; // both done — will be caught by allActivated above
}

// ─── CONCEALMENT ───
export function canTarget(attacker: OpState, defender: OpState): { valid: boolean; reason?: string } {
  if (defender.status === 'incapacitated') return { valid: false, reason: 'Incapacitated' };
  if (defender.order === 'conceal') {
    // Concealed operatives can only be targeted within 6" or from Vantage
    const dist = Math.abs(attacker.x - defender.x) + Math.abs(attacker.y - defender.y);
    if (dist > 6) return { valid: false, reason: 'Concealed (too far)' };
  }
  // Can't shoot while within 1" of enemy
  return { valid: true };
}

// ─── STRATAGEMS ───
export interface Stratagem {
  id: string;
  name: string;
  cost: number;
  phase: 'strategy' | 'firefight';
  desc: string;
  icon: string;
}

export const STRATAGEMS: Stratagem[] = [
  { id: 'command_reroll', name: 'Command Re-roll', cost: 1, phase: 'firefight', desc: 'Re-roll one of your attack or defense dice.', icon: '🎲' },
  { id: 'tactical_reposition', name: 'Tactical Reposition', cost: 1, phase: 'strategy', desc: 'One friendly operative with Conceal order can make a free Dash move.', icon: '🏃' },
  { id: 'overwatch', name: 'Overwatch', cost: 1, phase: 'firefight', desc: 'After an enemy moves, one of your operatives on Guard can shoot at -1 to hit.', icon: '🎯' },
  { id: 'inspiring_leader', name: 'Inspiring Leader', cost: 1, phase: 'strategy', desc: 'Your leader gives +1 APL to one nearby operative this turning point.', icon: '👑' },
  { id: 'smoke_grenades', name: 'Smoke Grenades', cost: 1, phase: 'firefight', desc: 'Place smoke within 6" of an operative. Enemies shooting through it are -1 to hit.', icon: '💨' },
];

export function useStratagem(state: GameState, team: 'player' | 'enemy', stratagemId: string): GameState {
  const strat = STRATAGEMS.find(s => s.id === stratagemId);
  if (!strat) return state;
  const cpKey = team === 'player' ? 'playerCP' : 'enemyCP';
  if (state[cpKey] < strat.cost) return state;

  let s = { ...state, [cpKey]: state[cpKey] - strat.cost };
  const log = [...s.log];

  switch (stratagemId) {
    case 'command_reroll':
      log.push(`🎲 ${team === 'player' ? 'You use' : 'Enemy uses'} Command Re-roll (1CP)`);
      break;
    case 'tactical_reposition': {
      const concealed = s.operatives.filter(o => o.team === team && o.order === 'conceal' && o.status !== 'incapacitated');
      if (concealed.length > 0) {
        log.push(`🏃 ${team === 'player' ? 'You use' : 'Enemy uses'} Tactical Reposition — ${concealed[0].op.name} can Dash for free`);
      }
      break;
    }
    case 'inspiring_leader': {
      const leader = s.operatives.find(o => o.team === team && o.op.role === 'leader' && o.status !== 'incapacitated');
      if (leader) {
        const nearby = s.operatives.filter(o => o.team === team && o !== leader && o.status !== 'incapacitated' && Math.abs(o.x - leader.x) + Math.abs(o.y - leader.y) <= 6);
        if (nearby.length > 0) {
          const ops = [...s.operatives];
          const idx = ops.indexOf(nearby[0]);
          ops[idx] = { ...ops[idx], apLeft: ops[idx].apLeft + 1 };
          s = { ...s, operatives: ops };
          log.push(`👑 ${team === 'player' ? 'You use' : 'Enemy uses'} Inspiring Leader — ${nearby[0].op.name} gains +1 APL`);
        }
      }
      break;
    }
    default:
      log.push(`${strat.icon} ${team === 'player' ? 'You use' : 'Enemy uses'} ${strat.name} (${strat.cost}CP)`);
  }

  return { ...s, log };
}
