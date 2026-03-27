import type { KTOperative, Weapon } from './killteam-data';
import type { GameMap } from './map-generator';

export interface OpState {
  op: KTOperative;
  team: 'player' | 'enemy';
  currentWounds: number;
  activated: boolean;
  apLeft: number;
  status: 'ready' | 'activated' | 'incapacitated';
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
}

export function rollD6(): number { return Math.floor(Math.random() * 6) + 1; }
export function rollDice(count: number): number[] { return Array.from({ length: count }, rollD6); }

export function createGameState(playerOps: KTOperative[], enemyOps: KTOperative[], map: GameMap): GameState {
  const operatives: OpState[] = [];

  // Place player operatives in deployment zone
  let py = 2;
  for (const op of playerOps) {
    operatives.push({ op, team: 'player', currentWounds: op.wounds, activated: false, apLeft: op.apl, status: 'ready', x: 2, y: Math.min(py, map.rows - 2) });
    py += 3;
  }

  // Place enemy operatives in enemy deployment zone
  let ey = 2;
  for (const op of enemyOps) {
    operatives.push({ op, team: 'enemy', currentWounds: op.wounds, activated: false, apLeft: op.apl, status: 'ready', x: map.cols - 3, y: Math.min(ey, map.rows - 2) });
    ey += 3;
  }

  return {
    turningPoint: 1, maxTurningPoints: 4,
    phase: 'setup', initiative: 'player', activeTeam: 'player',
    operatives, log: ['⚔️ Kill Team mission begins. Set up your board using the map above.'],
    map, objectiveControl: { 1: 'none', 2: 'none', 3: 'none', 4: 'none' },
    playerScore: 0, enemyScore: 0,
  };
}

export function rollInitiative(state: GameState): GameState {
  const pRoll = rollD6();
  const eRoll = rollD6();
  const winner = pRoll >= eRoll ? 'player' : 'enemy';
  const log = [...state.log, `🎲 Initiative: You rolled ${pRoll}, Enemy rolled ${eRoll}. ${winner === 'player' ? 'You have' : 'Enemy has'} initiative.`];

  // Reset activations
  const operatives = state.operatives.map(o => o.status !== 'incapacitated' ? { ...o, activated: false, apLeft: o.op.apl, status: 'ready' as const } : o);

  return { ...state, initiative: winner, activeTeam: winner, phase: 'firefight', log, operatives };
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

  // Switch active team — only after the currently-acting operative is done
  // An operative is "mid-activation" if they've used at least 1 AP this activation but aren't done yet
  // We detect this by: apLeft < apl (used some AP) AND activated === false
  const currentTeamOps = alive.filter(o => o.team === state.activeTeam);
  const midActivation = currentTeamOps.some(o => !o.activated && o.apLeft > 0 && o.apLeft < o.op.apl);
  if (midActivation) return state; // someone is mid-turn, don't switch

  // All current team's operatives are either fully activated or haven't started yet
  // Check if current team just finished an activation (someone was marked activated this call)
  const currentDone = currentTeamOps.every(o => o.activated);
  if (currentDone) return state; // will be caught by allActivated check above on next call
  
  const nextTeam = state.activeTeam === 'player' ? 'enemy' : 'player';
  const nextHasReady = alive.some(o => o.team === nextTeam && !o.activated);
  if (!nextHasReady) return state;
  return { ...state, activeTeam: nextTeam };
}
