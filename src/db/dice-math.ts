// Dice probability calculations for Kill Team

export function hitProbability(skill: number): number {
  return (7 - skill) / 6; // e.g. 3+ = 4/6 = 66.7%
}

export function expectedHits(attacks: number, skill: number): number {
  return attacks * hitProbability(skill);
}

export function expectedDamage(attacks: number, skill: number, normalDmg: number, critDmg: number): number {
  const hitChance = hitProbability(skill);
  const critChance = 1 / 6;
  const normalHitChance = hitChance - critChance;
  return attacks * (normalHitChance * normalDmg + critChance * critDmg);
}

export function killProbability(attacks: number, skill: number, normalDmg: number, critDmg: number, targetWounds: number, targetDef: number, targetSave: number): string {
  // Simplified: expected damage vs wounds
  const expDmg = expectedDamage(attacks, skill, normalDmg, critDmg);
  const saveRate = (7 - targetSave) / 6;
  const unsavedDmg = expDmg * (1 - saveRate * (targetDef / attacks));
  const ratio = unsavedDmg / targetWounds;
  if (ratio > 1.5) return 'Very Likely';
  if (ratio > 1) return 'Likely';
  if (ratio > 0.6) return 'Possible';
  if (ratio > 0.3) return 'Unlikely';
  return 'Very Unlikely';
}

export function formatProbability(skill: number): string {
  return `${Math.round(hitProbability(skill) * 100)}%`;
}
