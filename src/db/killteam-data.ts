import { EXTRA_ROSTERS } from './killteam-data-extra';
import { MORE_ROSTERS } from './killteam-data-more';

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
  id: '', faction: 'Space Marines', name, role, movement: 6, apl: 3, groupAct: 1, defense: 3, save: 3, wounds: 13, weapons, abilities: ['Bolter Discipline: Re-roll one attack die when shooting'], aiType: ai, ...extra,
});

const guard = (name: string, role: KTOperative['role'], weapons: Weapon[], ai: KTOperative['aiType'] = 'tactical', extra: Partial<KTOperative> = {}): KTOperative => ({
  id: '', faction: 'Astra Militarum', name, role, movement: 6, apl: 2, groupAct: 2, defense: 3, save: 5, wounds: 7, weapons, abilities: ['Voice of Command: Leader gives +1 APL to one nearby operative'], aiType: ai, ...extra,
});

const ork = (name: string, role: KTOperative['role'], weapons: Weapon[], ai: KTOperative['aiType'] = 'aggressive', extra: Partial<KTOperative> = {}): KTOperative => ({
  id: '', faction: 'Orks', name, role, movement: 6, apl: 2, groupAct: 2, defense: 3, save: 5, wounds: 10, weapons, abilities: ['Waaagh!: +1 attack in melee when charging'], aiType: ai, ...extra,
});

const csm = (name: string, role: KTOperative['role'], weapons: Weapon[], ai: KTOperative['aiType'] = 'aggressive', extra: Partial<KTOperative> = {}): KTOperative => ({
  id: '', faction: 'Chaos Space Marines', name, role, movement: 6, apl: 3, groupAct: 1, defense: 3, save: 3, wounds: 12, weapons, abilities: ['Malicious Volleys: Re-roll one hit die when shooting within 12"'], aiType: ai, ...extra,
});

const tyranid = (name: string, role: KTOperative['role'], weapons: Weapon[], ai: KTOperative['aiType'] = 'aggressive', extra: Partial<KTOperative> = {}): KTOperative => ({
  id: '', faction: 'Tyranids', name, role, movement: 6, apl: 2, groupAct: 2, defense: 3, save: 5, wounds: 8, weapons, abilities: ['Instinctive: Must charge nearest enemy if within 8"'], aiType: ai, ...extra,
});

// Shared weapons

const boltPistol: Weapon = { name: 'Bolt Pistol', type: 'ranged', attacks: 4, skill: 3, normalDmg: 3, critDmg: 4, range: 6 };
const combatKnife: Weapon = { name: 'Combat Knife', type: 'melee', attacks: 4, skill: 3, normalDmg: 3, critDmg: 4 };
const fists: Weapon = { name: 'Fists', type: 'melee', attacks: 3, skill: 4, normalDmg: 2, critDmg: 3 };
const lasgun: Weapon = { name: 'Lasgun', type: 'ranged', attacks: 4, skill: 4, normalDmg: 2, critDmg: 3, range: 18 };
const slugga: Weapon = { name: 'Slugga', type: 'ranged', attacks: 4, skill: 5, normalDmg: 3, critDmg: 4, range: 6 };
const choppa: Weapon = { name: 'Choppa', type: 'melee', attacks: 4, skill: 3, normalDmg: 4, critDmg: 5 };
const bayonet: Weapon = { name: 'Bayonet', type: 'melee', attacks: 3, skill: 4, normalDmg: 2, critDmg: 3 };

export const FACTION_ROSTERS: Record<string, KTOperative[]> = {
  // ═══ ANGELS OF DEATH (Official Jan '26 datacards) ═══
  'Space Marines': [
    sm('Intercessor Sergeant', 'leader', [
      { name: 'Bolt Rifle', type: 'ranged', attacks: 4, skill: 3, normalDmg: 3, critDmg: 4, special: ['Piercing Crits 1'] },
      { name: 'Power Weapon', type: 'melee', attacks: 4, skill: 3, normalDmg: 4, critDmg: 6, special: ['Lethal 5+'] },
    ], 'tactical', { wounds: 15, abilities: ['Astartes: Can perform two Shoot or two Fight actions per activation', 'Doctrine Warfare: Use Combat Doctrine for 0CP once per battle'] }),
    sm('Assault Intercessor Grenadier', 'gunner', [
      { name: 'Heavy Bolt Pistol', type: 'ranged', attacks: 4, skill: 3, normalDmg: 3, critDmg: 4, range: 8, special: ['Piercing Crits 1'] },
      { name: 'Chainsword', type: 'melee', attacks: 5, skill: 3, normalDmg: 4, critDmg: 5 },
    ], 'aggressive', { wounds: 14, abilities: ['Astartes', 'Grenadier: Can use frag and krak grenades with improved Hit'] }),
    sm('Intercessor Gunner', 'gunner', [
      { name: 'Bolt Rifle', type: 'ranged', attacks: 4, skill: 3, normalDmg: 3, critDmg: 4, special: ['Piercing Crits 1'] },
      { name: 'Auxiliary Grenade Launcher (frag)', type: 'ranged', attacks: 4, skill: 3, normalDmg: 2, critDmg: 4, special: ['Blast 2"'] },
      { name: 'Auxiliary Grenade Launcher (krak)', type: 'ranged', attacks: 4, skill: 3, normalDmg: 4, critDmg: 5, special: ['Piercing 1'] },
      { name: 'Fists', type: 'melee', attacks: 4, skill: 3, normalDmg: 3, critDmg: 4 },
    ], 'tactical', { wounds: 14, abilities: ['Astartes'] }),
    sm('Eliminator Sniper', 'scout', [
      { name: 'Bolt Sniper Rifle (executioner)', type: 'ranged', attacks: 4, skill: 2, normalDmg: 3, critDmg: 4, special: ['Heavy', 'Saturate', 'Silent'] },
      { name: 'Bolt Sniper Rifle (mortis)', type: 'ranged', attacks: 4, skill: 2, normalDmg: 3, critDmg: 3, special: ['Devastating 3', 'Heavy', 'Piercing 1', 'Silent'] },
      { name: 'Fists', type: 'melee', attacks: 4, skill: 3, normalDmg: 3, critDmg: 4 },
    ], 'tactical', { wounds: 12, movement: 7, abilities: ['Astartes', 'Camo Cloak: Stealthy, ignore Saturate when shot', 'Optics (1AP): Enemies cannot be obscured'] }),
    sm('Heavy Intercessor Gunner', 'heavy', [
      { name: 'Heavy Bolter (focused)', type: 'ranged', attacks: 5, skill: 3, normalDmg: 4, critDmg: 5, special: ['Piercing Crits 1'] },
      { name: 'Heavy Bolter (sweeping)', type: 'ranged', attacks: 4, skill: 3, normalDmg: 4, critDmg: 5, special: ['Piercing Crits 1', 'Torrent 1"'] },
      { name: 'Bolt Pistol', type: 'ranged', attacks: 4, skill: 3, normalDmg: 3, critDmg: 4, range: 8 },
      { name: 'Fists', type: 'melee', attacks: 4, skill: 3, normalDmg: 3, critDmg: 4 },
    ], 'defensive', { wounds: 18, movement: 5, defense: 4, abilities: ['Astartes'] }),
    sm('Intercessor Warrior', 'fighter', [
      { name: 'Bolt Rifle', type: 'ranged', attacks: 4, skill: 3, normalDmg: 3, critDmg: 4, special: ['Piercing Crits 1'] },
      { name: 'Fists', type: 'melee', attacks: 4, skill: 3, normalDmg: 3, critDmg: 4 },
    ], 'tactical', { wounds: 14, abilities: ['Astartes'] }),
  ],

  // ═══ PLAGUE MARINES (Official Jan '26 datacards) ═══
  'Death Guard': [
    { id: '', faction: 'Death Guard', name: 'Plague Marine Champion', role: 'leader', movement: 5, apl: 3, groupAct: 1, defense: 3, save: 3, wounds: 15,
      weapons: [
        { name: 'Plasma Pistol (standard)', type: 'ranged', attacks: 4, skill: 3, normalDmg: 3, critDmg: 5, range: 8, special: ['Piercing 1'] },
        { name: 'Plasma Pistol (supercharge)', type: 'ranged', attacks: 4, skill: 3, normalDmg: 4, critDmg: 5, range: 8, special: ['Hot', 'Lethal 5+', 'Piercing 1'] },
        { name: 'Plague Sword', type: 'melee', attacks: 5, skill: 3, normalDmg: 4, critDmg: 5, special: ['Severe', 'Poison', 'Toxic'] },
      ],
      abilities: ['Astartes: Two Shoot or two Fight per activation', 'Disgustingly Resilient: On 4+, reduce damage of 3+ by 1', "Grandfather's Blessing: Regain wounds when poisoned enemies lose wounds nearby"],
      aiType: 'aggressive' },
    { id: '', faction: 'Death Guard', name: 'Malignant Plaguecaster', role: 'specialist', movement: 5, apl: 3, groupAct: 1, defense: 3, save: 3, wounds: 14,
      weapons: [
        { name: 'Entropy', type: 'ranged', attacks: 4, skill: 3, normalDmg: 3, critDmg: 7, range: 7, special: ['Psychic', 'Saturate', 'Severe', 'Poison'] },
        { name: 'Plague Wind', type: 'ranged', attacks: 6, skill: 3, normalDmg: 2, critDmg: 3, special: ['Psychic', 'Saturate', 'Severe', 'Torrent 1"', 'Poison'] },
        { name: 'Corrupted Staff', type: 'melee', attacks: 4, skill: 3, normalDmg: 3, critDmg: 4, special: ['Psychic', 'Severe', 'Shock', 'Stun', 'Poison'] },
      ],
      abilities: ['Astartes', 'Disgustingly Resilient', 'Poisonous Miasma (1AP): Apply Poison token to enemy within 7"', 'Putrescent Vitality (1AP): Heal friendly operative'],
      aiType: 'tactical' },
    { id: '', faction: 'Death Guard', name: 'Plague Marine Fighter', role: 'fighter', movement: 5, apl: 3, groupAct: 1, defense: 3, save: 3, wounds: 14,
      weapons: [
        { name: 'Flail of Corruption', type: 'melee', attacks: 5, skill: 3, normalDmg: 4, critDmg: 5, special: ['Brutal', 'Severe', 'Shock', 'Poison'] },
      ],
      abilities: ['Astartes', 'Disgustingly Resilient', 'Flail (1AP): D3+2 damage to all operatives within 2"'],
      aiType: 'aggressive' },
    { id: '', faction: 'Death Guard', name: 'Plague Marine Heavy Gunner', role: 'heavy', movement: 5, apl: 3, groupAct: 1, defense: 3, save: 3, wounds: 14,
      weapons: [
        { name: 'Plague Spewer', type: 'ranged', attacks: 5, skill: 2, normalDmg: 3, critDmg: 3, range: 7, special: ['Saturate', 'Severe', 'Torrent 2"', 'Poison'] },
        { name: 'Fists', type: 'melee', attacks: 4, skill: 3, normalDmg: 3, critDmg: 4 },
      ],
      abilities: ['Astartes', 'Disgustingly Resilient'],
      aiType: 'tactical' },
    { id: '', faction: 'Death Guard', name: 'Plague Marine Icon Bearer', role: 'specialist', movement: 5, apl: 3, groupAct: 1, defense: 3, save: 3, wounds: 14,
      weapons: [
        { name: 'Bolt Pistol', type: 'ranged', attacks: 4, skill: 3, normalDmg: 3, critDmg: 4, range: 8 },
        { name: 'Plague Knife', type: 'melee', attacks: 5, skill: 3, normalDmg: 3, critDmg: 4, special: ['Severe', 'Poison'] },
      ],
      abilities: ['Astartes', 'Disgustingly Resilient', 'Icon Bearer: +1 APL for objective control', 'Icon of Contagion: Contagion ploy costs 0CP in enemy territory'],
      aiType: 'defensive' },
    { id: '', faction: 'Death Guard', name: 'Plague Marine Warrior', role: 'fighter', movement: 5, apl: 3, groupAct: 1, defense: 3, save: 3, wounds: 14,
      weapons: [
        { name: 'Boltgun', type: 'ranged', attacks: 4, skill: 3, normalDmg: 3, critDmg: 4, special: ['Toxic'] },
        { name: 'Plague Knife', type: 'melee', attacks: 4, skill: 3, normalDmg: 3, critDmg: 4, special: ['Severe', 'Poison'] },
      ],
      abilities: ['Astartes', 'Disgustingly Resilient', 'Repulsive Fortitude: Defence dice of 5+ are critical successes'],
      aiType: 'tactical' },
  ],

  // ═══ DEATHWATCH (Official Jan '26 datacards) ═══
  'Deathwatch': [
    { id: '', faction: 'Deathwatch', name: 'Watch Sergeant', role: 'leader', movement: 6, apl: 3, groupAct: 1, defense: 3, save: 3, wounds: 15,
      weapons: [
        { name: 'Plasma Pistol (standard)', type: 'ranged', attacks: 4, skill: 3, normalDmg: 3, critDmg: 5, range: 8, special: ['Piercing 1'] },
        { name: 'Power Weapon', type: 'melee', attacks: 5, skill: 3, normalDmg: 4, critDmg: 6, special: ['Lethal 5+'] },
      ],
      abilities: ['Veteran Astartes: Two Shoot or two Fight per activation', 'Special Issue Ammunition: Once per TP, add a weapon rule to ranged attacks', 'Strategic Command: Use one strategy and one firefight ploy for 0CP per battle'],
      aiType: 'tactical' },
    { id: '', faction: 'Deathwatch', name: 'Blademaster Veteran', role: 'fighter', movement: 6, apl: 3, groupAct: 1, defense: 3, save: 3, wounds: 15,
      weapons: [
        { name: 'Special Issue Bolt Pistol', type: 'ranged', attacks: 4, skill: 3, normalDmg: 3, critDmg: 4, range: 8, special: ['Piercing 1'] },
        { name: 'Xenophase Blade (duel)', type: 'melee', attacks: 5, skill: 3, normalDmg: 4, critDmg: 6, special: ['Brutal', 'Lethal 5+'] },
        { name: 'Xenophase Blade (phase sweep)', type: 'melee', attacks: 4, skill: 3, normalDmg: 4, critDmg: 6, special: ['Brutal', 'Lethal 5+'] },
      ],
      abilities: ['Veteran Astartes', 'Special Issue Ammunition', 'Adaptive Swordsmanship: Ignore Hit stat changes, resolve one block before normal order'],
      aiType: 'aggressive' },
    { id: '', faction: 'Deathwatch', name: 'Demolisher Veteran', role: 'fighter', movement: 6, apl: 3, groupAct: 1, defense: 3, save: 3, wounds: 15,
      weapons: [
        { name: 'Bolt Pistol', type: 'ranged', attacks: 4, skill: 3, normalDmg: 3, critDmg: 4, range: 8 },
        { name: 'Heavy Thunder Hammer', type: 'melee', attacks: 5, skill: 4, normalDmg: 6, critDmg: 7, special: ['Shock', 'Stun'] },
      ],
      abilities: ['Veteran Astartes', 'Brutal Assault: Hammer gains Brutal when fighting, Ceaseless when charging', 'Aggressive Force: Dmg 3+ inflicts 1 less in melee'],
      aiType: 'aggressive' },
    { id: '', faction: 'Deathwatch', name: 'Gunner Veteran', role: 'gunner', movement: 6, apl: 3, groupAct: 1, defense: 3, save: 3, wounds: 15,
      weapons: [
        { name: 'Bolt Pistol', type: 'ranged', attacks: 4, skill: 3, normalDmg: 3, critDmg: 4, range: 8 },
        { name: 'Heavy Plasma Incinerator (standard)', type: 'ranged', attacks: 5, skill: 3, normalDmg: 4, critDmg: 6, special: ['Piercing 1'] },
        { name: 'Heavy Plasma Incinerator (supercharge)', type: 'ranged', attacks: 5, skill: 3, normalDmg: 5, critDmg: 6, special: ['Hot', 'Lethal 5+', 'Piercing 1'] },
        { name: 'Fists', type: 'melee', attacks: 4, skill: 3, normalDmg: 3, critDmg: 4 },
      ],
      abilities: ['Veteran Astartes', 'Special Issue Ammunition'],
      aiType: 'tactical' },
    { id: '', faction: 'Deathwatch', name: 'Aegis Veteran', role: 'specialist', movement: 6, apl: 3, groupAct: 1, defense: 3, save: 2, wounds: 15,
      weapons: [
        { name: 'Bolt Pistol', type: 'ranged', attacks: 4, skill: 3, normalDmg: 3, critDmg: 4, range: 8 },
        { name: 'Power Maul & Storm Shield', type: 'melee', attacks: 5, skill: 3, normalDmg: 4, critDmg: 6, special: ['Shock', 'Shield'] },
      ],
      abilities: ['Veteran Astartes', 'Storm Shield: Worsen Piercing by 1 when shot', 'Shield: Each block cancels two successes in melee'],
      aiType: 'defensive' },
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

  // ═══ HIEROTEK CIRCLE / NECRONS (Official Feb '26) ═══
  'Necrons': [
    { id: '', faction: 'Necrons', name: 'Chronomancer', role: 'leader', movement: 5, apl: 2, groupAct: 1, defense: 3, save: 3, wounds: 12, weapons: [
      { name: 'Entropic Lance (ranged)', type: 'ranged', attacks: 5, skill: 3, normalDmg: 2, critDmg: 2, special: ['Blast 2"', 'Devastating 1', 'Piercing 2'] },
      { name: 'Entropic Lance (melee)', type: 'melee', attacks: 4, skill: 4, normalDmg: 4, critDmg: 4, special: ['Devastating 1'] },
    ], abilities: ['Reanimation Protocols', 'Interstitial Command (1AP): Free action for ally', 'Timesplinter (1AP): Teleport ally within 5"'], aiType: 'tactical' },
    { id: '', faction: 'Necrons', name: 'Plasmacyte Accelerator', role: 'specialist', movement: 7, apl: 2, groupAct: 1, defense: 2, save: 5, wounds: 5, weapons: [
      { name: 'Spark', type: 'ranged', attacks: 4, skill: 4, normalDmg: 2, critDmg: 3, range: 4, special: ['Piercing 1'] },
      { name: 'Claws', type: 'melee', attacks: 3, skill: 5, normalDmg: 1, critDmg: 2 },
    ], abilities: ['Scuttler: Untargetable on Conceal in cover', 'Accelerate (1AP): +1 APL to Deathmark/Immortal'], aiType: 'tactical' },
    { id: '', faction: 'Necrons', name: 'Deathmark', role: 'scout', movement: 5, apl: 2, groupAct: 1, defense: 3, save: 3, wounds: 10, weapons: [
      { name: 'Synaptic Disintegrator', type: 'ranged', attacks: 4, skill: 2, normalDmg: 4, critDmg: 3, special: ['Devastating 2', 'Heavy', 'Piercing 1', 'Severe'] },
      { name: 'Fists', type: 'melee', attacks: 3, skill: 3, normalDmg: 3, critDmg: 4 },
    ], abilities: ['Reanimation Protocols', 'Deathmarked: Target gains Seek token', 'Multi-dimensional Vision (1AP): No obscured'], aiType: 'tactical' },
    { id: '', faction: 'Necrons', name: 'Immortal Despotek', role: 'fighter', movement: 5, apl: 2, groupAct: 1, defense: 3, save: 3, wounds: 11, weapons: [
      { name: 'Gauss Blaster', type: 'ranged', attacks: 4, skill: 3, normalDmg: 4, critDmg: 5, special: ['Piercing 1'] },
      { name: 'Bayonet', type: 'melee', attacks: 4, skill: 3, normalDmg: 3, critDmg: 4 },
    ], abilities: ['Reanimation Protocols', 'Interstitial Command (1AP)'], aiType: 'tactical' },
    { id: '', faction: 'Necrons', name: 'Immortal Guardian', role: 'fighter', movement: 5, apl: 2, groupAct: 1, defense: 3, save: 3, wounds: 10, weapons: [
      { name: 'Gauss Blaster', type: 'ranged', attacks: 4, skill: 3, normalDmg: 4, critDmg: 5, special: ['Piercing 1'] },
      { name: 'Bayonet', type: 'melee', attacks: 4, skill: 3, normalDmg: 3, critDmg: 4 },
    ], abilities: ['Reanimation Protocols', 'Steadfast: APL 3 for objectives'], aiType: 'defensive' },
    { id: '', faction: 'Necrons', name: 'Immortal Guardian', role: 'fighter', movement: 5, apl: 2, groupAct: 1, defense: 3, save: 3, wounds: 10, weapons: [
      { name: 'Tesla Carbine', type: 'ranged', attacks: 5, skill: 3, normalDmg: 3, critDmg: 3, special: ['Devastating 1'] },
      { name: 'Bayonet', type: 'melee', attacks: 4, skill: 3, normalDmg: 3, critDmg: 4 },
    ], abilities: ['Reanimation Protocols', 'Steadfast: APL 3 for objectives'], aiType: 'defensive' },
  ],

  // ═══ WOLF SCOUTS (Official Feb '26) ═══
  'Wolf Scouts': [
    { id: '', faction: 'Wolf Scouts', name: 'Pack Leader', role: 'leader', movement: 7, apl: 3, groupAct: 1, defense: 3, save: 3, wounds: 14, weapons: [
      { name: 'Plasma Pistol (standard)', type: 'ranged', attacks: 4, skill: 3, normalDmg: 3, critDmg: 5, range: 8, special: ['Piercing 1'] },
      { name: 'Power Weapon', type: 'melee', attacks: 5, skill: 3, normalDmg: 4, critDmg: 6, special: ['Lethal 5+'] },
    ], abilities: ['Hunting Astartes: Two Shoot or Fight', 'Elemental Storm', 'Grizzled Veteran: Free Fight after Charge', 'Lupine Guile: Re-roll initiative'], aiType: 'aggressive' },
    { id: '', faction: 'Wolf Scouts', name: 'Fenrisian Wolf', role: 'scout', movement: 8, apl: 2, groupAct: 1, defense: 3, save: 5, wounds: 10, weapons: [
      { name: 'Fangs', type: 'melee', attacks: 5, skill: 3, normalDmg: 4, critDmg: 5, special: ['Rending'] },
    ], abilities: ['Instinctive Predator: Only Charge/Dash/Fight/Guard', 'Pounce: Free Charge after Dash'], aiType: 'aggressive' },
    { id: '', faction: 'Wolf Scouts', name: 'Fangbearer', role: 'specialist', movement: 7, apl: 3, groupAct: 1, defense: 3, save: 3, wounds: 13, weapons: [
      { name: 'Absolvor Bolt Pistol', type: 'ranged', attacks: 4, skill: 3, normalDmg: 4, critDmg: 5, range: 9, special: ['Piercing Crits 1'] },
      { name: 'Combat Blade', type: 'melee', attacks: 5, skill: 3, normalDmg: 4, critDmg: 5 },
    ], abilities: ['Hunting Astartes', 'Spiritual Chirurgy: Team ignores injured/Shock/Stun', 'Healing Balms (1AP): Heal D3+3'], aiType: 'tactical' },
    { id: '', faction: 'Wolf Scouts', name: 'Gunner', role: 'gunner', movement: 7, apl: 3, groupAct: 1, defense: 3, save: 3, wounds: 13, weapons: [
      { name: 'Plasma Gun (standard)', type: 'ranged', attacks: 4, skill: 3, normalDmg: 4, critDmg: 6, special: ['Piercing 1'] },
      { name: 'Plasma Gun (supercharge)', type: 'ranged', attacks: 4, skill: 3, normalDmg: 5, critDmg: 6, special: ['Hot', 'Lethal 5+', 'Piercing 1'] },
      { name: 'Combat Blade', type: 'melee', attacks: 4, skill: 3, normalDmg: 4, critDmg: 5 },
    ], abilities: ['Hunting Astartes', "Tempest's Fury: In Storm, no Hot on supercharge"], aiType: 'tactical' },
    { id: '', faction: 'Wolf Scouts', name: 'Hunter', role: 'fighter', movement: 7, apl: 3, groupAct: 1, defense: 3, save: 3, wounds: 13, weapons: [
      { name: 'Plasma Pistol (standard)', type: 'ranged', attacks: 4, skill: 3, normalDmg: 3, critDmg: 5, range: 8, special: ['Piercing 1'] },
      { name: 'Combat Blade', type: 'melee', attacks: 5, skill: 3, normalDmg: 4, critDmg: 5 },
    ], abilities: ['Hunting Astartes', 'Fierce Temperament: Severe in Storm'], aiType: 'aggressive' },
  ],

  // ═══ SANCTIFIERS (Official Feb '26) ═══
  'Sanctifiers': [
    { id: '', faction: 'Sanctifiers', name: 'Confessor', role: 'leader', movement: 6, apl: 2, groupAct: 1, defense: 3, save: 5, wounds: 10, weapons: [
      { name: 'Hand Flamer', type: 'ranged', attacks: 4, skill: 3, normalDmg: 3, critDmg: 3, range: 6, special: ['Saturate', 'Torrent 1"', 'Blaze'] },
      { name: 'Chainsword', type: 'melee', attacks: 4, skill: 4, normalDmg: 4, critDmg: 5 },
    ], abilities: ['Sermon: Nearby allies get dmg reduction', 'Commanding Declamation: Cancel enemy action once', 'Fly', 'Incentivise (1AP): +1 APL to ally'], aiType: 'tactical' },
    { id: '', faction: 'Sanctifiers', name: 'Death Cult Assassin', role: 'fighter', movement: 6, apl: 3, groupAct: 1, defense: 2, save: 5, wounds: 8, weapons: [
      { name: 'Throwing Knives', type: 'ranged', attacks: 4, skill: 3, normalDmg: 2, critDmg: 5, range: 6, special: ['Silent'] },
      { name: 'Ritual Blades', type: 'melee', attacks: 4, skill: 2, normalDmg: 4, critDmg: 6 },
    ], abilities: ['Bladed Stance: Block before normal order', 'Trained Assassin (1AP): Change order'], aiType: 'aggressive' },
    { id: '', faction: 'Sanctifiers', name: 'Persecutor', role: 'fighter', movement: 6, apl: 2, groupAct: 1, defense: 2, save: 5, wounds: 7, weapons: [
      { name: 'Hand Flamer', type: 'ranged', attacks: 4, skill: 3, normalDmg: 3, critDmg: 3, range: 6, special: ['Saturate', 'Torrent 1"', 'Blaze'] },
      { name: 'Eviscerator', type: 'melee', attacks: 4, skill: 4, normalDmg: 5, critDmg: 6, special: ['Brutal'] },
    ], abilities: ['Merciless Castigation: Free Fight if neither incapacitated', 'Fanatical Retribution: Strike once even if killed'], aiType: 'aggressive' },
    { id: '', faction: 'Sanctifiers', name: 'Preacher', role: 'specialist', movement: 6, apl: 2, groupAct: 1, defense: 2, save: 5, wounds: 7, weapons: [
      { name: 'Hand Flamer', type: 'ranged', attacks: 4, skill: 2, normalDmg: 3, critDmg: 3, range: 6, special: ['Saturate', 'Torrent 1"', 'Blaze'] },
      { name: 'Chainsword', type: 'melee', attacks: 4, skill: 4, normalDmg: 4, critDmg: 5 },
    ], abilities: ['Defend the Faith: Sermon while on objective'], aiType: 'defensive' },
    { id: '', faction: 'Sanctifiers', name: 'Reliquant', role: 'specialist', movement: 6, apl: 2, groupAct: 1, defense: 2, save: 5, wounds: 7, weapons: [
      { name: 'Hand Flamer', type: 'ranged', attacks: 4, skill: 2, normalDmg: 3, critDmg: 3, range: 6, special: ['Saturate', 'Torrent 1"', 'Blaze'] },
      { name: 'Gun Butt', type: 'melee', attacks: 3, skill: 4, normalDmg: 2, critDmg: 3 },
    ], abilities: ['Cult Icon: +1 APL for objectives', 'Imperial Cult Devotion: Dying ally gets free action'], aiType: 'defensive' },
  ],
};

export function getRoster(faction: string): KTOperative[] {
  const allRosters = { ...FACTION_ROSTERS, ...EXTRA_ROSTERS, ...MORE_ROSTERS };
  const base = allRosters[faction] || FACTION_ROSTERS['Space Marines'];
  return base.map((op, i) => ({ ...op, id: `op_${i}` }));
}

export const ALL_KT_FACTIONS = [...Object.keys(FACTION_ROSTERS), ...Object.keys(EXTRA_ROSTERS), ...Object.keys(MORE_ROSTERS)];
