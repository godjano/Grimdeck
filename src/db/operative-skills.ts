// Persistent operative upgrades between campaign missions

export interface OperativeSkill {
  id: string;
  name: string;
  desc: string;
  icon: string;
  effect: string;
  xpCost: number;
}

export const SKILLS: OperativeSkill[] = [
  { id: 'marksman', name: 'Marksman', desc: 'Improved ranged accuracy', icon: '🎯', effect: '+1 to hit with ranged', xpCost: 4 },
  { id: 'duelist', name: 'Duelist', desc: 'Improved melee prowess', icon: '⚔️', effect: '+1 attack in melee', xpCost: 4 },
  { id: 'tough', name: 'Tough', desc: 'Hardened by battle', icon: '🛡️', effect: '+2 wounds', xpCost: 3 },
  { id: 'swift', name: 'Swift', desc: 'Faster movement', icon: '💨', effect: '+1" movement', xpCost: 3 },
  { id: 'lucky', name: 'Lucky', desc: 'Fortune favours the bold', icon: '🍀', effect: 'Reroll one die per activation', xpCost: 5 },
  { id: 'medic', name: 'Field Medic', desc: 'Can stabilise allies', icon: '💊', effect: 'Heal 2 wounds on adjacent ally', xpCost: 4 },
  { id: 'scout', name: 'Scout', desc: 'Advance deployment', icon: '👁️', effect: 'Deploy 3" further forward', xpCost: 3 },
  { id: 'veteran', name: 'Veteran', desc: 'Battle-hardened', icon: '🎖️', effect: '+1 APL', xpCost: 6 },
];

export function getAvailableSkills(currentSkills: string[]): OperativeSkill[] {
  return SKILLS.filter(s => !currentSkills.includes(s.id));
}
