import type { KTOperative } from './killteam-data';
import { FACTION_ROSTERS } from './killteam-data';

export interface TeamRule {
  faction: string;
  totalOperatives: number;
  leaderSlots: number; // how many leaders to pick
  leaderOptions: string[]; // operative names eligible as leader
  regularSlots: number; // how many non-leaders
  regularOptions: string[]; // operative names eligible
  uniqueOnly: string[]; // these can only be included once
  duplicatesAllowed: string[]; // these can be included multiple times
  maxOfType?: Record<string, number>; // e.g. max 1 GRAVIS
  notes: string;
}

export const TEAM_RULES: Record<string, TeamRule> = {
  'Space Marines': {
    faction: 'Space Marines', totalOperatives: 6, leaderSlots: 1, regularSlots: 5,
    leaderOptions: ['Intercessor Sergeant'],
    regularOptions: ['Assault Intercessor Grenadier', 'Intercessor Gunner', 'Eliminator Sniper', 'Heavy Intercessor Gunner', 'Intercessor Warrior'],
    uniqueOnly: ['Assault Intercessor Grenadier', 'Intercessor Gunner', 'Eliminator Sniper', 'Heavy Intercessor Gunner'],
    duplicatesAllowed: ['Intercessor Warrior'],
    notes: 'Select 1 leader + 5 operatives. Only Warriors can be duplicated.',
  },
  'Death Guard': {
    faction: 'Death Guard', totalOperatives: 6, leaderSlots: 1, regularSlots: 5,
    leaderOptions: ['Plague Marine Champion'],
    regularOptions: ['Plague Marine Fighter', 'Plague Marine Heavy Gunner', 'Plague Marine Icon Bearer', 'Malignant Plaguecaster', 'Plague Marine Warrior', 'Plague Marine Bombardier'],
    uniqueOnly: ['Plague Marine Fighter', 'Plague Marine Heavy Gunner', 'Plague Marine Icon Bearer', 'Malignant Plaguecaster', 'Plague Marine Bombardier'],
    duplicatesAllowed: ['Plague Marine Warrior'],
    notes: 'Select 1 Champion + 5 operatives. Each unique operative once only.',
  },
  'Deathwatch': {
    faction: 'Deathwatch', totalOperatives: 5, leaderSlots: 0, regularSlots: 5,
    leaderOptions: [],
    regularOptions: ['Watch Sergeant', 'Blademaster Veteran', 'Demolisher Veteran', 'Gunner Veteran', 'Aegis Veteran'],
    uniqueOnly: ['Watch Sergeant', 'Blademaster Veteran', 'Demolisher Veteran', 'Gunner Veteran', 'Aegis Veteran'],
    duplicatesAllowed: [],
    notes: 'Select 5 operatives. Each only once. Max 1 GRAVIS operative.',
  },
  'Necrons': {
    faction: 'Necrons', totalOperatives: 8, leaderSlots: 1, regularSlots: 7,
    leaderOptions: ['Chronomancer'],
    regularOptions: ['Plasmacyte Accelerator', 'Deathmark', 'Immortal Despotek', 'Immortal Guardian', 'Immortal Guardian'],
    uniqueOnly: ['Plasmacyte Accelerator', 'Immortal Despotek'],
    duplicatesAllowed: ['Deathmark', 'Immortal Guardian'],
    notes: 'Select 1 Cryptek + 1 Accelerator + 1 Reanimator + 5 operatives. Deathmarks and Guardians can duplicate.',
  },
  'Wolf Scouts': {
    faction: 'Wolf Scouts', totalOperatives: 6, leaderSlots: 0, regularSlots: 6,
    leaderOptions: [],
    regularOptions: ['Pack Leader', 'Fenrisian Wolf', 'Fangbearer', 'Gunner', 'Hunter'],
    uniqueOnly: ['Pack Leader', 'Fenrisian Wolf', 'Fangbearer', 'Gunner'],
    duplicatesAllowed: ['Hunter'],
    notes: '1 Fenrisian Wolf + 5 operatives. Only Hunters can duplicate.',
  },
  'Sanctifiers': {
    faction: 'Sanctifiers', totalOperatives: 6, leaderSlots: 1, regularSlots: 5,
    leaderOptions: ['Confessor'],
    regularOptions: ['Death Cult Assassin', 'Persecutor', 'Preacher', 'Reliquant', 'Missionary'],
    uniqueOnly: ['Death Cult Assassin', 'Persecutor', 'Preacher', 'Reliquant', 'Missionary'],
    duplicatesAllowed: [],
    notes: '1 Confessor + 5 operatives. Each only once.',
  },
};

export function validateTeam(faction: string, selected: KTOperative[]): { valid: boolean; errors: string[] } {
  const rule = TEAM_RULES[faction];
  if (!rule) return { valid: true, errors: [] };

  const errors: string[] = [];
  const nameCounts: Record<string, number> = {};
  selected.forEach(op => { nameCounts[op.name] = (nameCounts[op.name] || 0) + 1; });

  if (selected.length !== rule.totalOperatives) {
    errors.push(`Need exactly ${rule.totalOperatives} operatives (have ${selected.length})`);
  }

  // Check unique constraints
  for (const name of rule.uniqueOnly) {
    if ((nameCounts[name] || 0) > 1) {
      errors.push(`${name} can only be included once`);
    }
  }

  // Check leader
  if (rule.leaderSlots > 0) {
    const leaders = selected.filter(op => rule.leaderOptions.includes(op.name));
    if (leaders.length !== rule.leaderSlots) {
      errors.push(`Need exactly ${rule.leaderSlots} leader (${rule.leaderOptions.join(' or ')})`);
    }
  }

  return { valid: errors.length === 0, errors };
}

export function getAvailableOperatives(faction: string): { leaders: KTOperative[]; regulars: KTOperative[] } {
  const roster = FACTION_ROSTERS[faction] || [];
  const rule = TEAM_RULES[faction];

  if (!rule) return { leaders: roster.filter(op => op.role === 'leader'), regulars: roster.filter(op => op.role !== 'leader') };

  const leaders = roster.filter(op => rule.leaderOptions.includes(op.name));
  const regulars = roster.filter(op => rule.regularOptions.includes(op.name));

  return { leaders, regulars };
}
