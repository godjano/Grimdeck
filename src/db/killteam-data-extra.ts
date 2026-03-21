import type { KTOperative } from './killteam-data';

// Additional factions from official datacards — key operatives with core stats
// Full weapon loadouts can be expanded as datacards are processed

const op = (faction: string, name: string, role: KTOperative['role'], m: number, apl: number, sv: number, w: number, weapons: KTOperative['weapons'], abilities: string[], ai: KTOperative['aiType'] = 'tactical'): KTOperative => ({
  id: '', faction, name, role, movement: m, apl, groupAct: 1, defense: 3, save: sv, wounds: w, weapons, abilities, aiType: ai,
});

const r = (name: string, atk: number, skill: number, nd: number, cd: number, special?: string[]): KTOperative['weapons'][0] => ({ name, type: 'ranged', attacks: atk, skill, normalDmg: nd, critDmg: cd, special });
const mel = (name: string, atk: number, skill: number, nd: number, cd: number, special?: string[]): KTOperative['weapons'][0] => ({ name, type: 'melee', attacks: atk, skill, normalDmg: nd, critDmg: cd, special });

export const EXTRA_ROSTERS: Record<string, KTOperative[]> = {
  'Pathfinders': [
    op('Pathfinders', "Shas'ui", 'leader', 6, 2, 5, 8, [r('Pulse Carbine', 4, 4, 4, 5), mel('Gun Butt', 3, 5, 2, 3)], ['Markerlights: Tag enemies for +1 hit', 'Art of War: Free Dash or Markerlight']),
    op('Pathfinders', 'Assault Grenadier', 'gunner', 6, 2, 5, 7, [r('Fusion Grenade', 4, 3, 4, 3, ['Devastating 2', 'Piercing 2', 'Limited 1']), r('Pulse Carbine', 4, 4, 4, 5)], ['Markerlights', 'Grenadier: Use frag/krak with improved Hit']),
    op('Pathfinders', 'Weapons Expert', 'heavy', 6, 2, 5, 7, [r('Rail Rifle', 4, 4, 4, 4, ['Devastating 2', 'Lethal 5+', 'Piercing 1']), mel('Gun Butt', 3, 5, 2, 3)], ['Markerlights']),
    op('Pathfinders', "Shas'la", 'fighter', 6, 2, 5, 7, [r('Pulse Carbine', 4, 4, 4, 5), mel('Gun Butt', 3, 5, 2, 3)], ['Markerlights', 'Group Activation', 'Fearless on the Frontline']),
    op('Pathfinders', 'MV1 Gun Drone', 'specialist', 6, 2, 4, 7, [r('Twin Pulse Carbine', 4, 4, 4, 5, ['Ceaseless'])], ['Drone: Limited actions']),
  ],

  'Scout Squad': [
    op('Scout Squad', 'Sergeant', 'leader', 6, 2, 4, 11, [r('Boltgun', 4, 3, 3, 4), mel('Chainsword', 4, 3, 4, 5)], ['Forward Scouting: Deploy traps and reposition', 'Astartes Scouts']),
    op('Scout Squad', 'Heavy Gunner', 'heavy', 6, 2, 4, 10, [r('Heavy Bolter (focused)', 5, 3, 4, 5, ['Heavy', 'Piercing Crits 1']), r('Bolt Pistol', 4, 3, 3, 4, ['Range 8"'])], ['Astartes Scouts']),
    op('Scout Squad', 'Sniper', 'scout', 6, 2, 4, 10, [r('Sniper Rifle (stationary)', 4, 2, 3, 3, ['Devastating 3', 'Heavy', 'Silent']), mel('Fists', 3, 3, 3, 4)], ['Camo Cloak', 'Optics (1AP): No obscured']),
    op('Scout Squad', 'Tracker', 'specialist', 6, 2, 4, 10, [r('Boltgun', 4, 3, 3, 4), mel('Fists', 3, 3, 3, 4)], ['Track Enemy (1AP): Target gains Seek Light', 'Auspex Scan (1AP)']),
    op('Scout Squad', 'Warrior', 'fighter', 6, 2, 4, 10, [r('Boltgun', 4, 3, 3, 4), mel('Fists', 3, 3, 3, 4)], ['Astartes Scouts']),
    op('Scout Squad', 'Warrior', 'fighter', 6, 2, 4, 10, [r('Astartes Shotgun', 4, 3, 3, 3, ['Range 6"']), mel('Fists', 3, 3, 3, 4)], ['Astartes Scouts']),
  ],

  'Nemesis Claw': [
    op('Nemesis Claw', 'Visionary', 'leader', 6, 3, 3, 15, [r('Bolt Pistol', 4, 3, 3, 4, ['Range 8"']), mel('Power Weapon', 5, 3, 4, 6, ['Lethal 5+'])], ['Astartes', 'In Midnight Clad: Obscured beyond 8"', 'Prescience: Psychic foresight points'], 'tactical'),
    op('Nemesis Claw', 'Heavy Gunner', 'heavy', 6, 3, 3, 14, [r('Heavy Bolter (focused)', 5, 3, 4, 5, ['Heavy', 'Piercing Crits 1']), r('Bolt Pistol', 4, 3, 3, 4, ['Range 8"'])], ['Astartes', 'In Midnight Clad']),
    op('Nemesis Claw', 'Skinthief', 'fighter', 6, 3, 3, 14, [r('Bolt Pistol', 4, 3, 3, 4, ['Range 8"']), mel('Nostraman Chainglaive', 5, 3, 4, 6, ['Rending'])], ['Astartes', 'Flay Them Alive: Incapacitate to debuff nearby enemy'], 'aggressive'),
    op('Nemesis Claw', 'Warrior', 'fighter', 6, 3, 3, 14, [r('Boltgun', 4, 3, 3, 4), mel('Chainsword', 5, 3, 4, 5)], ['Astartes', 'Cruel Tormenter: Lethal 5+ vs injured/weak enemies'], 'aggressive'),
    op('Nemesis Claw', 'Warrior', 'fighter', 6, 3, 3, 14, [r('Bolt Pistol', 4, 3, 3, 4, ['Range 8"']), mel('Chainsword', 5, 3, 4, 5)], ['Astartes', 'Cruel Tormenter'], 'aggressive'),
  ],

  'Mandrakes': [
    op('Mandrakes', 'Nightfiend', 'leader', 7, 2, 5, 9, [r('Baleblast', 4, 3, 3, 4, ['Soulstrike']), mel('Huskblade', 4, 3, 5, 6, ['Brutal', 'Lethal 5+'])], ['Shadow Passage: Teleport through shadows', 'Soul Harvest: Gain points from kills'], 'aggressive'),
    op('Mandrakes', 'Abyssal', 'specialist', 7, 2, 5, 8, [r('Balesurge (blast)', 5, 3, 3, 4, ['Blast 2"', 'Soulstrike']), mel('Glimmersteel Blade', 4, 3, 4, 5, ['Lethal 5+'])], ['Balefire: Buff ranged vs marked targets'], 'tactical'),
    op('Mandrakes', 'Warrior', 'fighter', 7, 2, 5, 8, [r('Baleblast', 4, 3, 3, 4, ['Soulstrike']), mel('Glimmersteel Blade', 4, 3, 4, 5, ['Lethal 5+'])], ['Shadow Warrior: +1 crit dmg in shadow'], 'aggressive'),
    op('Mandrakes', 'Warrior', 'fighter', 7, 2, 5, 8, [r('Baleblast', 4, 3, 3, 4, ['Soulstrike']), mel('Glimmersteel Blade', 4, 3, 4, 5, ['Lethal 5+'])], ['Shadow Warrior'], 'aggressive'),
    op('Mandrakes', 'Warrior', 'fighter', 7, 2, 5, 8, [r('Baleblast', 4, 3, 3, 4, ['Soulstrike']), mel('Glimmersteel Blade', 4, 3, 4, 5, ['Lethal 5+'])], ['Shadow Warrior'], 'aggressive'),
  ],

  'Murderwing': [
    op('Murderwing', 'Chaos Lord', 'leader', 6, 3, 3, 15, [r('Plasma Pistol (standard)', 4, 3, 3, 5, ['Range 8"', 'Piercing 1']), mel('Power Weapon', 5, 3, 4, 6, ['Lethal 5+'])], ['Astartes', 'Jump Pack: Fly during moves', 'Path to Damnation: Risk/reward Boons'], 'aggressive'),
    op('Murderwing', 'Raptor', 'fighter', 6, 3, 3, 14, [r('Bolt Pistol', 4, 3, 3, 4, ['Range 8"']), mel('Chainsword', 5, 3, 4, 5)], ['Astartes', 'Jump Pack', 'Thrill of Flight: Remove debuffs on boost'], 'aggressive'),
    op('Murderwing', 'Warp Talon', 'fighter', 6, 3, 3, 14, [mel('Lightning Claws', 5, 3, 4, 5, ['Ceaseless', 'Lethal 5+', 'Rending'])], ['Astartes', 'Jump Pack', 'Slice the Veil: Deploy from warp turn 2'], 'aggressive'),
    op('Murderwing', 'Raptor', 'fighter', 6, 3, 3, 14, [r('Plasma Pistol (standard)', 4, 3, 3, 5, ['Range 8"', 'Piercing 1']), mel('Chainsword', 5, 3, 4, 5)], ['Astartes', 'Jump Pack'], 'aggressive'),
    op('Murderwing', 'Raptor', 'fighter', 6, 3, 3, 14, [r('Bolt Pistol', 4, 3, 3, 4, ['Range 8"']), mel('Chainsword', 5, 3, 4, 5)], ['Astartes', 'Jump Pack'], 'aggressive'),
  ],

  'Death Korps': [
    op('Death Korps', 'Watchmaster', 'leader', 6, 2, 5, 8, [r('Bolt Pistol', 4, 4, 3, 4, ['Range 8"']), mel('Power Weapon', 4, 4, 4, 6, ['Lethal 5+'])], ['Guardsmen Orders: Issue tactical orders to team', 'Bring it Down!: Target gains Punishing']),
    op('Death Korps', 'Gunner (Plasma)', 'gunner', 6, 2, 5, 7, [r('Plasma Gun (standard)', 4, 4, 4, 6, ['Piercing 1']), mel('Bayonet', 3, 4, 2, 3)], ['Guardsmen Orders']),
    op('Death Korps', 'Sniper', 'scout', 6, 2, 5, 7, [r('Long-las (stationary)', 4, 2, 3, 3, ['Devastating 3', 'Heavy']), mel('Bayonet', 3, 4, 2, 3)], ['Guardsmen Orders']),
    op('Death Korps', 'Trooper', 'fighter', 6, 2, 5, 7, [r('Lasgun', 4, 4, 2, 3), mel('Bayonet', 3, 4, 2, 3)], ['Group Activation', 'Guardsmen Orders']),
    op('Death Korps', 'Trooper', 'fighter', 6, 2, 5, 7, [r('Lasgun', 4, 4, 2, 3), mel('Bayonet', 3, 4, 2, 3)], ['Group Activation']),
    op('Death Korps', 'Trooper', 'fighter', 6, 2, 5, 7, [r('Lasgun', 4, 4, 2, 3), mel('Bayonet', 3, 4, 2, 3)], ['Group Activation']),
    op('Death Korps', 'Trooper', 'fighter', 6, 2, 5, 7, [r('Lasgun', 4, 4, 2, 3), mel('Bayonet', 3, 4, 2, 3)], ['Group Activation']),
  ],

  'Exaction Squad': [
    op('Exaction Squad', 'Proctor-Exactant', 'leader', 6, 2, 4, 9, [r('Combat Shotgun (close)', 4, 3, 4, 4, ['Range 6"']), mel('Dominator Maul', 4, 3, 5, 5, ['Shock'])], ['Marked for Justice: Target gains Punishing', 'Ruthless Efficiency']),
    op('Exaction Squad', 'Castigator', 'fighter', 6, 2, 4, 8, [r('Combat Shotgun (close)', 4, 3, 4, 4, ['Range 6"']), mel('Excruciator Maul', 4, 3, 5, 5, ['Rending', 'Shock'])], ['Engendered Focus: Ignore stat changes', "Castigator's Arrest: Prevent Fall Back"], 'aggressive'),
    op('Exaction Squad', 'Subductor', 'specialist', 6, 2, 3, 8, [r('Shotpistol', 4, 4, 3, 3, ['Range 8"']), mel('Shock Maul & Shield', 4, 4, 4, 4, ['Shock'])], ['Stubborn Subjugator: Ignore Hit changes'], 'defensive'),
    op('Exaction Squad', 'Vigilant', 'fighter', 6, 2, 4, 8, [r('Combat Shotgun (close)', 4, 3, 4, 4, ['Range 6"']), mel('Repression Baton', 3, 4, 2, 3)], ['Close Quarters Vigilance: Shoot in engagement']),
    op('Exaction Squad', 'Subductor', 'specialist', 6, 2, 3, 8, [r('Shotpistol', 4, 4, 3, 3, ['Range 8"']), mel('Shock Maul & Shield', 4, 4, 4, 4, ['Shock'])], ['Stubborn Subjugator'], 'defensive'),
  ],

  'Farstalker Kinband': [
    op('Farstalker Kinband', 'Kill-Broker', 'leader', 6, 2, 5, 9, [r('Kroot Rifle', 4, 3, 3, 4), mel('Ritual Blade', 4, 3, 3, 5)], ['Farstalker: Change orders of 3 operatives', 'Master Tracker']),
    op('Farstalker Kinband', 'Cut-Skin', 'fighter', 6, 2, 5, 8, [mel("Cut-skin's Blades", 4, 3, 3, 5, ['Ceaseless', 'Lethal 5+'])], ['Vicious Duellist: Dmg on opponent fails', 'Savage Assault: Free Fight'], 'aggressive'),
    op('Farstalker Kinband', 'Stalker', 'scout', 6, 2, 5, 8, [r('Kroot Scattergun', 4, 3, 3, 3, ['Range 6"']), mel("Stalker's Blade", 4, 3, 3, 5, ['Balanced', 'Rending'])], ['Stalker: Charge on Conceal', 'Stealth Attack (2AP): Charge + Fight combo'], 'aggressive'),
    op('Farstalker Kinband', 'Hound', 'fighter', 6, 2, 5, 8, [mel('Ripping Fangs', 4, 3, 3, 4, ['Rending'])], ['Beast: Limited actions', 'Bad-tempered: Force enemies to fight it'], 'aggressive'),
    op('Farstalker Kinband', 'Warrior', 'fighter', 6, 2, 5, 8, [r('Kroot Rifle', 4, 4, 3, 4), mel('Blade', 3, 3, 3, 5)], ['Ready for Anything: Use faction equipment for free']),
    op('Farstalker Kinband', 'Warrior', 'fighter', 6, 2, 5, 8, [r('Kroot Scattergun', 4, 3, 3, 3, ['Range 6"']), mel('Blade', 3, 3, 3, 5)], ['Ready for Anything']),
  ],

  'Hearthkyn Salvagers': [
    op('Hearthkyn Salvagers', 'Theyn', 'leader', 5, 2, 3, 9, [r('Bolt Revolver', 4, 4, 3, 5, ['Range 8"']), mel('Plasma Weapon', 4, 3, 4, 6, ['Lethal 5+'])], ['Grudge: Enemies that kill your team get marked', 'Eye of the Ancestors: Mark enemies']),
    op('Hearthkyn Salvagers', 'Gunner (HYLas)', 'heavy', 5, 2, 3, 8, [r('HYLas Rotary Cannon (focused)', 5, 4, 4, 5, ['Ceaseless', 'Heavy', 'Saturate']), mel('Fists', 3, 4, 2, 3)], ['Grudge']),
    op('Hearthkyn Salvagers', 'Jump Pack Warrior', 'fighter', 5, 2, 3, 8, [r('Autoch-pattern Bolt Pistol', 4, 4, 3, 4, ['Range 8"', 'Accurate 1']), mel('Plasma Weapon', 4, 3, 4, 6, ['Lethal 5+'])], ['Grudge', 'Jump Pack: Fly during moves'], 'aggressive'),
    op('Hearthkyn Salvagers', 'Warrior', 'fighter', 5, 2, 3, 8, [r('Autoch-pattern Bolter', 4, 4, 3, 4, ['Accurate 1']), mel('Fists', 3, 4, 2, 3)], ['Grudge', 'Secure Salvage: -1 dmg on objectives'], 'defensive'),
    op('Hearthkyn Salvagers', 'Warrior', 'fighter', 5, 2, 3, 8, [r('Ion Blaster', 4, 4, 3, 4, ['Piercing Crits 1']), mel('Fists', 3, 4, 2, 3)], ['Grudge', 'Secure Salvage'], 'defensive'),
  ],

  'Hunter Clade': [
    op('Hunter Clade', 'Sicarian Infiltrator Princeps', 'leader', 6, 2, 4, 11, [r('Flechette Blaster', 5, 3, 2, 2, ['Range 8"', 'Saturate', 'Silent']), mel('Power Weapon', 4, 3, 4, 6, ['Lethal 5+'])], ['Doctrina Imperatives: Swap buffs each turn', 'Canticle of Shroudpsalm: Nearby Infiltrators untargetable']),
    op('Hunter Clade', 'Skitarii Ranger Gunner', 'gunner', 6, 2, 4, 7, [r('Plasma Caliver (standard)', 4, 3, 4, 6, ['Piercing 1']), mel('Gun Butt', 3, 4, 2, 3)], ['Doctrina Imperatives', 'Targeting Protocol: Lethal 5+ when stationary']),
    op('Hunter Clade', 'Sicarian Ruststalker Warrior', 'fighter', 6, 2, 4, 10, [mel('Transonic Blades', 5, 3, 4, 6, ['Rending'])], ['Doctrina Imperatives', 'Wasteland Stalker: Extra cover save'], 'aggressive'),
    op('Hunter Clade', 'Skitarii Ranger Warrior', 'fighter', 6, 2, 4, 7, [r('Galvanic Rifle', 4, 3, 3, 4, ['Heavy', 'Piercing Crits 1']), mel('Gun Butt', 3, 4, 2, 3)], ['Doctrina Imperatives', 'Targeting Protocol']),
    op('Hunter Clade', 'Skitarii Vanguard Warrior', 'fighter', 6, 2, 4, 7, [r('Radium Carbine', 4, 3, 2, 4, ['Rending']), mel('Gun Butt', 3, 4, 2, 3)], ['Doctrina Imperatives', 'Rad-Saturation: Worsen enemy Hit within 2"']),
  ],

  'Imperial Navy Breachers': [
    op('Imperial Navy Breachers', 'Sergeant-at-Arms', 'leader', 6, 2, 4, 9, [r('Navis Shotgun (close)', 4, 3, 3, 3, ['Range 6"']), mel('Power Weapon', 4, 3, 4, 6, ['Lethal 5+'])], ['Void Armour: Re-roll defence vs Blast/Torrent', 'Breach and Clear: Activate two operatives']),
    op('Imperial Navy Breachers', 'Gunner (Plasma)', 'gunner', 6, 2, 4, 9, [r('Plasma Gun (standard)', 4, 4, 4, 6, ['Piercing 1']), mel('Gun Butt', 3, 4, 2, 3)], ['Void Armour']),
    op('Imperial Navy Breachers', 'Axejack', 'fighter', 6, 2, 4, 8, [r('Autopistol', 4, 4, 2, 3, ['Range 8"']), mel('Power Weapon', 4, 3, 4, 6, ['Lethal 5+'])], ['Void Armour', 'Emboldened: -1 dmg after Charge'], 'aggressive'),
    op('Imperial Navy Breachers', 'Armsman', 'fighter', 6, 2, 4, 8, [r('Navis Shotgun (close)', 4, 3, 3, 3, ['Range 6"']), mel('Navis Hatchet', 3, 4, 3, 4)], ['Void Armour']),
    op('Imperial Navy Breachers', 'Armsman', 'fighter', 6, 2, 4, 8, [r('Navis Shotgun (close)', 4, 3, 3, 3, ['Range 6"']), mel('Navis Hatchet', 3, 4, 3, 4)], ['Void Armour']),
  ],

  'XV26 Stealth Battlesuits': [
    op('XV26 Stealth Battlesuits', "Shas'vre", 'leader', 6, 3, 3, 13, [r('Burst Cannon (focused)', 5, 4, 3, 4, ['Ceaseless']), r('Fusion Blaster (short)', 4, 4, 6, 3, ['Range 6"', 'Devastating 4', 'Piercing 2']), mel('Fists', 3, 4, 3, 4)], ['Stealth Fields: Invisible beyond 3" on Conceal', 'Kauyon: Accurate improves as allies fall', 'For the Greater Good']),
    op('XV26 Stealth Battlesuits', 'Infiltrator', 'fighter', 6, 3, 3, 12, [r('Burst Cannon (focused)', 5, 4, 3, 4, ['Ceaseless']), mel('Fists', 3, 4, 3, 4)], ['Stealth Fields', 'Covert Protocols: Counteract on Conceal']),
    op('XV26 Stealth Battlesuits', 'Infiltrator', 'fighter', 6, 3, 3, 12, [r('Fusion Blaster (short)', 4, 4, 6, 3, ['Range 6"', 'Devastating 4', 'Piercing 2']), mel('Fists', 3, 4, 3, 4)], ['Stealth Fields', 'Covert Protocols']),
    op('XV26 Stealth Battlesuits', 'MV75 Marker Drone', 'specialist', 6, 2, 4, 7, [mel('Ram', 3, 5, 2, 3)], ['Drone', 'High-intensity Markerlight: Double markerlight tokens']),
    op('XV26 Stealth Battlesuits', 'MV15 Gun Drone', 'specialist', 6, 2, 4, 7, [r('Twin Pulse Carbine', 4, 4, 4, 5, ['Ceaseless']), mel('Ram', 3, 5, 2, 3)], ['Drone']),
  ],

  'Celestian Insidiants': [
    op('Celestian Insidiants', 'Superior', 'leader', 6, 3, 3, 10, [r('Inferno Pistol', 4, 3, 4, 2, ['Range 6"', 'Devastating 3', 'Piercing 2']), mel('Null Mace', 4, 3, 4, 4, ['Shock'])], ['Weapons of the Witch Hunters: Anti-Psychic', 'Spiritual Mentor (1AP): Make ally Inspiring']),
    op('Celestian Insidiants', 'Abjuror', 'specialist', 6, 2, 2, 11, [mel('Blessed Broadsword', 4, 3, 4, 6, ['Lethal 5+', 'Brutal'])], ['Holy Defender: Intercept shots targeting allies', 'Zealous Ultimatum: Challenge enemy to duel'], 'defensive'),
    op('Celestian Insidiants', 'Cremator', 'gunner', 6, 2, 3, 9, [r('Hand Flamer (standard)', 4, 2, 3, 3, ['Range 6"', 'Saturate', 'Torrent 1"']), mel('Null Mace', 4, 3, 4, 4, ['Shock'])], ['Inspirational Pyre: Inspire ally on flamer hit']),
    op('Celestian Insidiants', 'Warrior', 'fighter', 6, 2, 3, 9, [r('Bolt Pistol', 4, 3, 3, 4, ['Range 8"']), r('Condemnor Stakethrower', 4, 3, 2, 2, ['Devastating 1', 'Piercing Crits 1', 'Silent']), mel('Null Mace', 4, 3, 4, 4, ['Shock'])], ['Inspired Strikes: +1 crit dmg when Inspiring']),
    op('Celestian Insidiants', 'Warrior', 'fighter', 6, 2, 3, 9, [r('Bolt Pistol', 4, 3, 3, 4, ['Range 8"']), mel('Null Mace', 4, 3, 4, 4, ['Shock'])], ['Inspired Strikes']),
  ],
};
