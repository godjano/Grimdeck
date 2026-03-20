import type { OpState, GameState } from './killteam-game';
import { rollDice, resolveShoot, resolveFight, applyDamage, checkTurnEnd } from './killteam-game';

function distance(a: OpState, b: OpState): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function nearestEnemy(op: OpState, state: GameState): OpState | null {
  const enemies = state.operatives.filter(o => o.team !== op.team && o.status !== 'incapacitated');
  if (enemies.length === 0) return null;
  return enemies.reduce((best, e) => distance(op, e) < distance(op, best) ? e : best);
}

function nearestObjective(op: OpState, state: GameState): { x: number; y: number } | null {
  const uncontrolled = state.map.objectives.filter(o => state.objectiveControl[o.id] !== op.team);
  if (uncontrolled.length === 0) return null;
  return uncontrolled.reduce((best, o) => {
    const d = Math.abs(op.x - o.x) + Math.abs(op.y - o.y);
    const bd = Math.abs(op.x - best.x) + Math.abs(op.y - best.y);
    return d < bd ? o : best;
  });
}

function moveToward(op: OpState, tx: number, ty: number, dist: number, _state: GameState): { x: number; y: number } {
  const dx = tx - op.x;
  const dy = ty - op.y;
  const total = Math.abs(dx) + Math.abs(dy);
  if (total <= dist) return { x: tx, y: ty };
  const ratio = dist / total;
  return { x: Math.round(op.x + dx * ratio), y: Math.round(op.y + dy * ratio) };
}

export function aiActivation(state: GameState): GameState {
  // Find next unactivated enemy operative
  const opIdx = state.operatives.findIndex(o => o.team === 'enemy' && o.status === 'ready' && !o.activated);
  if (opIdx === -1) return checkTurnEnd(state);

  let s = { ...state, operatives: [...state.operatives] };
  const op = { ...s.operatives[opIdx] };
  const log: string[] = [];

  log.push(`\n🤖 AI ACTIVATION: ${op.op.name} (${op.op.role})`);

  const enemy = nearestEnemy(op, s);
  const dist = enemy ? distance(op, enemy) : 999;
  const rangedWeapon = op.op.weapons.find(w => w.type === 'ranged');
  const meleeWeapon = op.op.weapons.find(w => w.type === 'melee') || op.op.weapons[0];
  let apUsed = 0;

  if (op.op.aiType === 'aggressive') {
    // Move toward nearest enemy, then fight/shoot
    if (enemy && dist > 1) {
      const move = moveToward(op, enemy.x, enemy.y, op.op.movement, s);
      log.push(`→ MOVE: Moves ${op.op.movement}" toward ${enemy.op.name} (to approx ${move.x},${move.y})`);
      op.x = move.x; op.y = move.y;
      apUsed++;
    }
    if (enemy && distance(op, enemy) <= 1 && meleeWeapon) {
      // Fight
      const atkRolls = rollDice(meleeWeapon.attacks);
      const defWeapon = enemy.op.weapons.find(w => w.type === 'melee') || enemy.op.weapons[0];
      const defRolls = rollDice(defWeapon.attacks);
      const result = resolveFight(op, enemy, meleeWeapon, defWeapon, atkRolls, defRolls);
      log.push(`→ FIGHT: Charges ${enemy.op.name}!`);
      log.push(`  ${result.log}`);
      const eIdx = s.operatives.indexOf(enemy);
      if (eIdx >= 0) s = applyDamage(s, eIdx, result.atkDmg);
      s = applyDamage(s, opIdx, result.defDmg);
      apUsed += 2;
    } else if (enemy && rangedWeapon && (rangedWeapon.range || 12) >= distance(op, enemy)) {
      const rolls = rollDice(rangedWeapon.attacks);
      const result = resolveShoot(op, enemy, rangedWeapon, rolls);
      log.push(`→ SHOOT: Fires ${rangedWeapon.name} at ${enemy.op.name}`);
      log.push(`  ${result.log}`);
      const eIdx = s.operatives.indexOf(enemy);
      if (eIdx >= 0) s = applyDamage(s, eIdx, result.totalDmg);
      apUsed++;
    }
    // Use remaining AP to move closer or dash
    if (apUsed < op.op.apl && enemy && distance(op, enemy) > 1) {
      const move = moveToward(op, enemy.x, enemy.y, op.op.movement, s);
      log.push(`→ DASH: Dashes toward ${enemy.op.name}`);
      op.x = move.x; op.y = move.y;
    }
  } else if (op.op.aiType === 'tactical') {
    // Move to cover/objective, then shoot
    const obj = nearestObjective(op, s);
    if (obj && Math.abs(op.x - obj.x) + Math.abs(op.y - obj.y) > 2) {
      const move = moveToward(op, obj.x, obj.y, op.op.movement, s);
      log.push(`→ MOVE: Advances toward Objective (to approx ${move.x},${move.y})`);
      op.x = move.x; op.y = move.y;
      apUsed++;
    }
    if (enemy && rangedWeapon && (rangedWeapon.range || 12) >= distance(op, enemy)) {
      const rolls = rollDice(rangedWeapon.attacks);
      const result = resolveShoot(op, enemy, rangedWeapon, rolls);
      log.push(`→ SHOOT: Fires ${rangedWeapon.name} at ${enemy.op.name}`);
      log.push(`  ${result.log}`);
      const eIdx = s.operatives.indexOf(enemy);
      if (eIdx >= 0) s = applyDamage(s, eIdx, result.totalDmg);
      apUsed++;
    }
    if (apUsed < op.op.apl && enemy && rangedWeapon) {
      const rolls = rollDice(rangedWeapon.attacks);
      const result = resolveShoot(op, enemy, rangedWeapon, rolls);
      log.push(`→ SHOOT again: ${result.log}`);
      const eIdx = s.operatives.indexOf(enemy);
      if (eIdx >= 0) s = applyDamage(s, eIdx, result.totalDmg);
    }
  } else {
    // Defensive: hold position, shoot, overwatch
    if (enemy && rangedWeapon) {
      const rolls = rollDice(rangedWeapon.attacks);
      const result = resolveShoot(op, enemy, rangedWeapon, rolls);
      log.push(`→ SHOOT: Fires ${rangedWeapon.name} at ${enemy.op.name} from cover`);
      log.push(`  ${result.log}`);
      const eIdx = s.operatives.indexOf(enemy);
      if (eIdx >= 0) s = applyDamage(s, eIdx, result.totalDmg);
    }
    log.push(`→ OVERWATCH: Sets up overwatch, covering approach lanes`);
  }

  // Mark activated
  op.activated = true;
  op.status = op.currentWounds > 0 ? 'activated' as any : 'incapacitated';
  op.apLeft = 0;
  s.operatives[opIdx] = op;
  s.log = [...s.log, ...log];

  return checkTurnEnd(s);
}
