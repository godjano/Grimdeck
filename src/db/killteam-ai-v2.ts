import type { OpState, GameState } from './killteam-game';
import { rollDice, resolveShoot, resolveFight, applyDamage, checkTurnEnd } from './killteam-game';

export type AIDifficulty = 'easy' | 'normal' | 'hard';

interface AIConfig {
  name: string;
  desc: string;
  icon: string;
  // How many dice the AI rerolls (0 = none, 1 = one failed die, 2 = two)
  rerolls: number;
  // Does AI prioritize objectives?
  playsObjectives: boolean;
  // Does AI use cover?
  seeksCover: boolean;
  // Does AI focus fire wounded targets?
  focusFire: boolean;
  // Bonus wounds on leader
  leaderBonus: number;
}

export const AI_CONFIGS: Record<AIDifficulty, AIConfig> = {
  easy: { name: 'Recruit', desc: 'AI makes random choices. Good for learning.', icon: '🟢', rerolls: 0, playsObjectives: false, seeksCover: false, focusFire: false, leaderBonus: 0 },
  normal: { name: 'Veteran', desc: 'AI plays tactically. A fair challenge.', icon: '🟠', rerolls: 1, playsObjectives: true, seeksCover: true, focusFire: false, leaderBonus: 0 },
  hard: { name: 'Nemesis', desc: 'AI plays optimally. Punishing and relentless.', icon: '🔴', rerolls: 2, playsObjectives: true, seeksCover: true, focusFire: true, leaderBonus: 3 },
};

function distance(a: OpState, b: OpState): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function getEnemies(op: OpState, state: GameState): OpState[] {
  return state.operatives.filter(o => o.team !== op.team && o.status !== 'incapacitated');
}

function selectTarget(op: OpState, state: GameState, config: AIConfig): OpState | null {
  const enemies = getEnemies(op, state);
  if (enemies.length === 0) return null;

  if (config.focusFire) {
    // Prioritize wounded targets, then closest
    const wounded = enemies.filter(e => e.currentWounds < e.op.wounds);
    if (wounded.length > 0) return wounded.reduce((a, b) => distance(op, a) < distance(op, b) ? a : b);
  }

  // Normal: closest enemy
  return enemies.reduce((a, b) => distance(op, a) < distance(op, b) ? a : b);
}

function selectObjective(op: OpState, state: GameState): { x: number; y: number } | null {
  const uncontrolled = state.map.objectives.filter(o => state.objectiveControl[o.id] !== op.team);
  if (uncontrolled.length === 0) return null;
  return uncontrolled.reduce((best, o) => {
    const d = Math.abs(op.x - o.x) + Math.abs(op.y - o.y);
    const bd = Math.abs(op.x - best.x) + Math.abs(op.y - best.y);
    return d < bd ? o : best;
  });
}

function moveToward(op: OpState, tx: number, ty: number, dist: number): { x: number; y: number } {
  const dx = tx - op.x;
  const dy = ty - op.y;
  const total = Math.abs(dx) + Math.abs(dy);
  if (total <= dist) return { x: tx, y: ty };
  const ratio = dist / total;
  return { x: Math.round(op.x + dx * ratio), y: Math.round(op.y + dy * ratio) };
}

function applyRerolls(rolls: number[], skill: number, rerolls: number): number[] {
  if (rerolls <= 0) return rolls;
  const result = [...rolls];
  let rerollsLeft = rerolls;
  for (let i = 0; i < result.length && rerollsLeft > 0; i++) {
    if (result[i] < skill) {
      result[i] = Math.floor(Math.random() * 6) + 1;
      rerollsLeft--;
    }
  }
  return result;
}

export function aiActivationV2(state: GameState, difficulty: AIDifficulty): GameState {
  const config = AI_CONFIGS[difficulty];
  const opIdx = state.operatives.findIndex(o => o.team === 'enemy' && o.status === 'ready' && !o.activated);
  if (opIdx === -1) return checkTurnEnd(state);

  let s = { ...state, operatives: [...state.operatives] };
  const op = { ...s.operatives[opIdx] };
  const log: string[] = [];

  log.push(`\n🤖 AI [${config.icon} ${config.name}]: ${op.op.name} (${op.op.role})`);

  const target = selectTarget(op, s, config);
  const dist = target ? distance(op, target) : 999;
  const rangedWeapon = op.op.weapons.find(w => w.type === 'ranged');
  const meleeWeapon = op.op.weapons.find(w => w.type === 'melee') || op.op.weapons[0];
  let apUsed = 0;

  // Decision tree based on operative type and difficulty
  const shouldMelee = op.op.aiType === 'aggressive' || (op.op.aiType === 'tactical' && dist <= 3 && meleeWeapon);
  const shouldObjective = config.playsObjectives && op.op.aiType !== 'aggressive';

  if (shouldMelee && target) {
    // Move toward target
    if (dist > 1) {
      const move = moveToward(op, target.x, target.y, op.op.movement);
      log.push(`→ CHARGE: Moves ${op.op.movement}" toward ${target.op.name}`);
      op.x = move.x; op.y = move.y;
      apUsed++;
    }
    // Fight if in range
    if (distance(op, target) <= 1 && meleeWeapon) {
      let atkRolls = rollDice(meleeWeapon.attacks);
      atkRolls = applyRerolls(atkRolls, meleeWeapon.skill, config.rerolls);
      const defWeapon = target.op.weapons.find(w => w.type === 'melee') || target.op.weapons[0];
      const defRolls = rollDice(defWeapon.attacks);
      const result = resolveFight(op, target, meleeWeapon, defWeapon, atkRolls, defRolls);
      log.push(`→ FIGHT: ${result.log}`);
      const eIdx = s.operatives.indexOf(target);
      if (eIdx >= 0) s = applyDamage(s, eIdx, result.atkDmg);
      s = applyDamage(s, opIdx, result.defDmg);
      apUsed += 2;
    } else if (rangedWeapon && target) {
      // Shoot if can't reach melee — check range
      const shootDist = distance(op, target);
      if (!rangedWeapon.range || shootDist <= rangedWeapon.range) {
        let rolls = rollDice(rangedWeapon.attacks);
        rolls = applyRerolls(rolls, rangedWeapon.skill, config.rerolls);
        const result = resolveShoot(op, target, rangedWeapon, rolls);
        log.push(`→ SHOOT: ${result.log}`);
        const eIdx = s.operatives.indexOf(target);
        if (eIdx >= 0) s = applyDamage(s, eIdx, result.totalDmg);
      } else {
        // Move closer if out of range
        const move = moveToward(op, target.x, target.y, op.op.movement);
        log.push(`→ MOVE: Advances toward ${target.op.name} (out of range)`);
        op.x = move.x; op.y = move.y;
      }
      apUsed++;
    }
  } else if (shouldObjective) {
    // Move toward objective
    const obj = selectObjective(op, s);
    if (obj && Math.abs(op.x - obj.x) + Math.abs(op.y - obj.y) > 2) {
      const move = moveToward(op, obj.x, obj.y, op.op.movement);
      log.push(`→ MOVE: Advances toward objective (${move.x},${move.y})`);
      op.x = move.x; op.y = move.y;
      apUsed++;
    }
    // Shoot if possible
    if (target && rangedWeapon && (!rangedWeapon.range || distance(op, target) <= rangedWeapon.range)) {
      let rolls = rollDice(rangedWeapon.attacks);
      rolls = applyRerolls(rolls, rangedWeapon.skill, config.rerolls);
      const result = resolveShoot(op, target, rangedWeapon, rolls);
      log.push(`→ SHOOT: ${result.log}`);
      const eIdx = s.operatives.indexOf(target);
      if (eIdx >= 0) s = applyDamage(s, eIdx, result.totalDmg);
      apUsed++;
    }
    // Second shot on hard
    if (apUsed < op.op.apl && target && rangedWeapon && (!rangedWeapon.range || distance(op, target) <= rangedWeapon.range) && difficulty === 'hard') {
      let rolls = rollDice(rangedWeapon.attacks);
      rolls = applyRerolls(rolls, rangedWeapon.skill, config.rerolls);
      const result = resolveShoot(op, target, rangedWeapon, rolls);
      log.push(`→ SHOOT again: ${result.log}`);
      const eIdx = s.operatives.indexOf(target);
      if (eIdx >= 0) s = applyDamage(s, eIdx, result.totalDmg);
    }
  } else {
    // Defensive / default
    if (target && rangedWeapon && (!rangedWeapon.range || distance(op, target) <= rangedWeapon.range)) {
      let rolls = rollDice(rangedWeapon.attacks);
      rolls = applyRerolls(rolls, rangedWeapon.skill, config.rerolls);
      const result = resolveShoot(op, target, rangedWeapon, rolls);
      log.push(`→ SHOOT: ${result.log}`);
      const eIdx = s.operatives.indexOf(target);
      if (eIdx >= 0) s = applyDamage(s, eIdx, result.totalDmg);
    }
    log.push(`→ OVERWATCH: Holding position`);
  }

  op.activated = true;
  op.status = op.currentWounds > 0 ? 'activated' as any : 'incapacitated';
  op.apLeft = 0;
  s.operatives[opIdx] = op;
  s.log = [...s.log, ...log];

  return checkTurnEnd(s);
}
