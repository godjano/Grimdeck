export interface Weapon {
  name: string;
  type: 'ranged' | 'melee';
  attacks: number;
  skill: number; // hit on X+
  normalDmg: number;
  critDmg: number;
  range?: number; // inches, melee = 1
  special?: string[];
}

export interface KTOperative {
  id: string;
  name: string;
  faction: string;
  role: 'leader' | 'fighter' | 'gunner' | 'heavy' | 'scout' | 'specialist';
  movement: number; // inches
  apl: number;
  groupAct: number;
  defense: number;
  save: number; // save on X+
  wounds: number;
  weapons: Weapon[];
  abilities: string[];
  aiType: 'aggressive' | 'tactical' | 'defensive';
}

const sm = (name: string, role: KTOperative['role'], weapons: Weapon[], ai: KTOperative['aiType'] = 'tactical', extra: Partial<KTOperative> = {}): KTOperative => ({
  id: '', faction: 'Space Marines', name, role, movement: 6, apl: 3, groupAct: 1, defense: 3, save: 3, wounds: 13, weapons, abilities: ['Bolter Discipline'], aiType: ai, ...extra,
});

const guard = (name: string, role: KTOperative['role'], weapons: Weapon[], ai: KTOperative['aiType'] = 'tactical', extra: Partial<KTOperative> = {}): KTOperative => ({
  id: '', faction: 'Astra Militarum', name, role, movement: 6, apl: 2, groupAct: 2, defense: 3, save: 5, wounds: 7, weapons, abilities: ['Voice of Command'], aiType: ai, ...extra,
});

const ork = (name: string, role: KTOperative['role'], weapons: Weapon[], ai: KTOperative['aiType'] = 'aggressive', extra: Partial<KTOperative> = {}): KTOperative => ({
  id: '', faction: 'Orks', name, role, movement: 6, apl: 2, groupAct: 2, defense: 3, save: 5, wounds: 10, weapons, abilities: ['Waaagh!'], aiType: ai, ...extra,
});

const necron = (name: string, role: KTOperative['role'], weapons: Weapon[], ai: KTOperative['aiType'] = 'defensive', extra: Partial<KTOperative> = {}): KTOperative => ({
  id: '', faction: 'Necrons', name, role, movement: 5, apl: 2, groupAct: 2, defense: 3, save: 3, wounds: 10, weapons, abilities: ['Reanimation'], aiType: ai, ...extra,
});

const csm = (name: string, role: KTOperative['role'], weapons: Weapon[], ai: KTOperative['aiType'] = 'aggressive', extra: Partial<KTOperative> = {}): KTOperative => ({
  id: '', faction: 'Chaos Space Marines', name, role, movement: 6, apl: 3, groupAct: 1, defense: 3, save: 3, wounds: 12, weapons, abilities: ['Malicious Volleys'], aiType: ai, ...extra,
});

const tyranid = (name: string, role: KTOperative['role'], weapons: Weapon[], ai: KTOperative['aiType'] = 'aggressive', extra: Partial<KTOperative> = {}): KTOperative => ({
  id: '', faction: 'Tyranids', name, role, movement: 6, apl: 2, groupAct: 2, defense: 3, save: 5, wounds: 8, weapons, abilities: ['Instinctive'], aiType: ai, ...extra,
});

// Shared weapons
const boltRifle: Weapon = { name: 'Bolt Rifle', type: 'ranged', attacks: 4, skill: 3, normalDmg: 3, critDmg: 4, range: 18, special: ['AP1'] };
const boltPistol: Weapon = { name: 'Bolt Pistol', type: 'ranged', attacks: 4, skill: 3, normalDmg: 3, critDmg: 4, range: 6 };
const combatKnife: Weapon = { name: 'Combat Knife', type: 'melee', attacks: 4, skill: 3, normalDmg: 3, critDmg: 4 };
const fists: Weapon = { name: 'Fists', type: 'melee', attacks: 3, skill: 4, normalDmg: 2, critDmg: 3 };
const lasgun: Weapon = { name: 'Lasgun', type: 'ranged', attacks: 4, skill: 4, normalDmg: 2, critDmg: 3, range: 18 };
const slugga: Weapon = { name: 'Slugga', type: 'ranged', attacks: 4, skill: 5, normalDmg: 3, critDmg: 4, range: 6 };
const choppa: Weapon = { name: 'Choppa', type: 'melee', attacks: 4, skill: 3, normalDmg: 4, critDmg: 5 };
const gaussFlayer: Weapon = { name: 'Gauss Flayer', type: 'ranged', attacks: 4, skill: 3, normalDmg: 3, critDmg: 4, range: 18, special: ['AP1'] };
const bayonet: Weapon = { name: 'Bayonet', type: 'melee', attacks: 3, skill: 4, normalDmg: 2, critDmg: 3 };

export const FACTION_ROSTERS: Record<string, KTOperative[]> = {
  'Space Marines': [
    sm('Intercessor Sergeant', 'leader', [boltRifle, { name: 'Power Weapon', type: 'melee', attacks: 4, skill: 3, normalDmg: 4, critDmg: 6, special: ['Lethal 5+'] }], 'tactical', { wounds: 14 }),
    sm('Intercessor Gunner', 'gunner', [{ name: 'Grenade Launcher', type: 'ranged', attacks: 4, skill: 3, normalDmg: 4, critDmg: 5, range: 12, special: ['Blast 2'] }, combatKnife]),
    sm('Intercessor Warrior', 'fighter', [boltRifle, combatKnife]),
    sm('Intercessor Warrior', 'fighter', [boltRifle, combatKnife]),
    sm('Intercessor Warrior', 'fighter', [boltRifle, combatKnife]),
  ],
  'Astra Militarum': [
    guard('Sergeant', 'leader', [boltPistol, { name: 'Power Sword', type: 'melee', attacks: 4, skill: 3, normalDmg: 4, critDmg: 5 }], 'tactical', { wounds: 9, apl: 3 }),
    guard('Sniper', 'gunner', [{ name: 'Long-las', type: 'ranged', attacks: 4, skill: 3, normalDmg: 3, critDmg: 4, range: 24, special: ['Silent', 'AP1'] }, bayonet], 'tactical'),
    guard('Gunner', 'heavy', [{ name: 'Plasma Gun', type: 'ranged', attacks: 4, skill: 4, normalDmg: 5, critDmg: 6, range: 18, special: ['AP2', 'Hot'] }, bayonet], 'defensive'),
    guard('Medic', 'specialist', [lasgun, bayonet], 'defensive'),
    guard('Trooper', 'fighter', [lasgun, bayonet]),
    guard('Trooper', 'fighter', [lasgun, bayonet]),
    guard('Trooper', 'fighter', [lasgun, bayonet]),
    guard('Trooper', 'fighter', [lasgun, bayonet]),
  ],
  'Orks': [
    ork('Boss Nob', 'leader', [slugga, { name: 'Power Klaw', type: 'melee', attacks: 4, skill: 4, normalDmg: 5, critDmg: 7, special: ['Brutal'] }], 'aggressive', { wounds: 14, apl: 3 }),
    ork('Kommando Snipa', 'gunner', [{ name: 'Snipa Rifle', type: 'ranged', attacks: 4, skill: 4, normalDmg: 3, critDmg: 4, range: 18, special: ['Silent', 'AP1'] }, choppa], 'tactical'),
    ork('Kommando Breacha', 'heavy', [{ name: 'Breacha Ram', type: 'melee', attacks: 5, skill: 3, normalDmg: 4, critDmg: 5, special: ['Stun'] }, slugga], 'aggressive'),
    ork('Kommando Boy', 'fighter', [slugga, choppa]),
    ork('Kommando Boy', 'fighter', [slugga, choppa]),
    ork('Kommando Boy', 'fighter', [slugga, choppa]),
    ork('Kommando Grot', 'scout', [{ name: 'Grot Blasta', type: 'ranged', attacks: 3, skill: 5, normalDmg: 2, critDmg: 3, range: 6 }, fists], 'tactical', { wounds: 5, movement: 6 }),
  ],
  'Necrons': [
    necron('Immortal Despotek', 'leader', [{ name: 'Gauss Blaster', type: 'ranged', attacks: 4, skill: 2, normalDmg: 4, critDmg: 5, range: 18, special: ['AP1'] }, fists], 'tactical', { wounds: 13, apl: 3 }),
    necron('Immortal', 'gunner', [{ name: 'Gauss Blaster', type: 'ranged', attacks: 4, skill: 3, normalDmg: 4, critDmg: 5, range: 18, special: ['AP1'] }, fists], 'tactical', { wounds: 12 }),
    necron('Warrior', 'fighter', [gaussFlayer, fists]),
    necron('Warrior', 'fighter', [gaussFlayer, fists]),
    necron('Warrior', 'fighter', [gaussFlayer, fists]),
    necron('Warrior', 'fighter', [gaussFlayer, fists]),
    necron('Deathmark', 'scout', [{ name: 'Synaptic Disintegrator', type: 'ranged', attacks: 4, skill: 2, normalDmg: 3, critDmg: 4, range: 24, special: ['Silent', 'MW2'] }, fists], 'tactical', { wounds: 10 }),
  ],
  'Chaos Space Marines': [
    csm('Aspiring Champion', 'leader', [boltPistol, { name: 'Daemon Blade', type: 'melee', attacks: 5, skill: 2, normalDmg: 5, critDmg: 7, special: ['Lethal 5+', 'Brutal'] }], 'aggressive', { wounds: 14 }),
    csm('Gunner', 'gunner', [{ name: 'Plasma Gun', type: 'ranged', attacks: 4, skill: 3, normalDmg: 5, critDmg: 6, range: 18, special: ['AP2', 'Hot'] }, combatKnife], 'tactical'),
    csm('Heavy Gunner', 'heavy', [{ name: 'Heavy Bolter', type: 'ranged', attacks: 5, skill: 3, normalDmg: 4, critDmg: 5, range: 24, special: ['Heavy', 'Fusillade'] }, combatKnife], 'defensive'),
    csm('Legionary', 'fighter', [{ name: 'Boltgun', type: 'ranged', attacks: 4, skill: 3, normalDmg: 3, critDmg: 4, range: 18 }, combatKnife]),
    csm('Legionary', 'fighter', [{ name: 'Boltgun', type: 'ranged', attacks: 4, skill: 3, normalDmg: 3, critDmg: 4, range: 18 }, combatKnife]),
  ],
  'Tyranids': [
    tyranid('Tyranid Warrior', 'leader', [{ name: 'Deathspitter', type: 'ranged', attacks: 4, skill: 3, normalDmg: 4, critDmg: 5, range: 12 }, { name: 'Scything Talons', type: 'melee', attacks: 4, skill: 3, normalDmg: 4, critDmg: 6, special: ['Reap 1'] }], 'aggressive', { wounds: 14, apl: 3, save: 4 }),
    tyranid('Genestealer', 'fighter', [{ name: 'Rending Claws', type: 'melee', attacks: 5, skill: 2, normalDmg: 4, critDmg: 6, special: ['Rending'] }], 'aggressive', { movement: 8, wounds: 8, save: 6 }),
    tyranid('Genestealer', 'fighter', [{ name: 'Rending Claws', type: 'melee', attacks: 5, skill: 2, normalDmg: 4, critDmg: 6, special: ['Rending'] }], 'aggressive', { movement: 8, wounds: 8, save: 6 }),
    tyranid('Hormagaunt', 'scout', [{ name: 'Scything Talons', type: 'melee', attacks: 4, skill: 3, normalDmg: 3, critDmg: 5 }], 'aggressive', { movement: 8, groupAct: 2 }),
    tyranid('Hormagaunt', 'scout', [{ name: 'Scything Talons', type: 'melee', attacks: 4, skill: 3, normalDmg: 3, critDmg: 5 }], 'aggressive', { movement: 8, groupAct: 2 }),
    tyranid('Hormagaunt', 'scout', [{ name: 'Scything Talons', type: 'melee', attacks: 4, skill: 3, normalDmg: 3, critDmg: 5 }], 'aggressive', { movement: 8, groupAct: 2 }),
    tyranid('Termagant', 'fighter', [{ name: 'Fleshborer', type: 'ranged', attacks: 4, skill: 4, normalDmg: 2, critDmg: 3, range: 12 }, fists], 'tactical'),
    tyranid('Termagant', 'fighter', [{ name: 'Fleshborer', type: 'ranged', attacks: 4, skill: 4, normalDmg: 2, critDmg: 3, range: 12 }, fists], 'tactical'),
  ],
};

export function getRoster(faction: string): KTOperative[] {
  const base = FACTION_ROSTERS[faction] || FACTION_ROSTERS['Space Marines'];
  return base.map((op, i) => ({ ...op, id: `op_${i}` }));
}
