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
  const hits = attackRolls.filter(r => r >= weapon.skill && r < 6).length;
  const crits = attackRolls.filter(r => r === 6).length;

  // Defense rolls
  const defRolls = rollDice(defender.op.defense);
  const saves = defRolls.filter(r => r >= defender.op.save).length;

  let hitsLeft = hits + crits;
  let dmg = 0;
  // Crits resolved first
  for (let i = 0; i < crits && hitsLeft > 0; i++) {
    if (saves > i) continue; // saved
    dmg += weapon.critDmg;
    hitsLeft--;
  }
  // Normal hits
  const normalHits = Math.max(0, hits - Math.max(0, saves - crits));
  dmg += normalHits * weapon.normalDmg;

  const log = `${attacker.op.name} fires ${weapon.name} → Rolled [${attackRolls.join(',')}] = ${hits} hits, ${crits} crits. Defense [${defRolls.join(',')}] = ${saves} saves. ${dmg} damage dealt.`;

  return { hits, crits, normalDmg: normalHits * weapon.normalDmg, critDmg: crits * weapon.critDmg, totalDmg: dmg, defSaves: defRolls, log };
}

export function resolveFight(attacker: OpState, defender: OpState, atkWeapon: Weapon, defWeapon: Weapon, atkRolls: number[], defRolls: number[]): { atkDmg: number; defDmg: number; log: string } {
  const atkHits = atkRolls.filter(r => r >= atkWeapon.skill).length;
  const atkCrits = atkRolls.filter(r => r === 6).length;
  const defHits = defRolls.filter(r => r >= defWeapon.skill).length;
  const defCrits = defRolls.filter(r => r === 6).length;

  // Simplified: crits cancel crits, then hits cancel hits, remaining deal damage
  const netAtkCrits = Math.max(0, atkCrits - defCrits);
  const netDefCrits = Math.max(0, defCrits - atkCrits);
  const netAtkHits = Math.max(0, (atkHits - atkCrits) - Math.max(0, (defHits - defCrits) - netAtkCrits));
  const netDefHits = Math.max(0, (defHits - defCrits) - Math.max(0, (atkHits - atkCrits) - netDefCrits));

  const atkDmg = netAtkCrits * atkWeapon.critDmg + netAtkHits * atkWeapon.normalDmg;
  const defDmg = netDefCrits * defWeapon.critDmg + netDefHits * defWeapon.normalDmg;

  const log = `⚔️ FIGHT: ${attacker.op.name} [${atkRolls.join(',')}] vs ${defender.op.name} [${defRolls.join(',')}]. ${attacker.op.name} deals ${atkDmg} dmg, takes ${defDmg} dmg.`;
  return { atkDmg, defDmg, log };
}

export function applyDamage(state: GameState, targetIdx: number, damage: number): GameState {
  const ops = [...state.operatives];
  const target = { ...ops[targetIdx] };
  target.currentWounds = Math.max(0, target.currentWounds - damage);
  if (target.currentWounds <= 0) {
    target.status = 'incapacitated';
    state.log.push(`💀 ${target.op.name} is incapacitated!`);
  }
  ops[targetIdx] = target;
  return { ...state, operatives: ops };
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
