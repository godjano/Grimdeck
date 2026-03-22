import type { ModelPreset } from './model-presets';

export const LATEST_MODELS: ModelPreset[] = [
  // ─── Tyranids (filling gaps) ───
  { name: 'Winged Hive Tyrant', faction: 'Tyranids', unitType: 'Character', defaultQty: 1, points: 235, forceOrg: 'HQ' },
  { name: 'Broodlord', faction: 'Tyranids', unitType: 'Character', defaultQty: 1, points: 100, forceOrg: 'HQ' },
  { name: 'Tyranid Prime', faction: 'Tyranids', unitType: 'Character', defaultQty: 1, points: 80, forceOrg: 'HQ' },
  { name: 'Tervigon', faction: 'Tyranids', unitType: 'Monster', defaultQty: 1, points: 200, forceOrg: 'Troops' },
  { name: 'Tyrannofex', faction: 'Tyranids', unitType: 'Monster', defaultQty: 1, points: 190, forceOrg: 'Heavy Support' },
  { name: 'Mawloc', faction: 'Tyranids', unitType: 'Monster', defaultQty: 1, points: 145, forceOrg: 'Heavy Support' },
  { name: 'Trygon', faction: 'Tyranids', unitType: 'Monster', defaultQty: 1, points: 180, forceOrg: 'Heavy Support' },
  { name: 'Hive Guard', faction: 'Tyranids', unitType: 'Infantry', defaultQty: 3, points: 100, forceOrg: 'Heavy Support' },
  { name: 'Tyrant Guard', faction: 'Tyranids', unitType: 'Infantry', defaultQty: 3, points: 95, forceOrg: 'Elites' },
  { name: 'Pyrovores', faction: 'Tyranids', unitType: 'Infantry', defaultQty: 3, points: 100, forceOrg: 'Elites' },
  { name: 'Biovores', faction: 'Tyranids', unitType: 'Infantry', defaultQty: 1, points: 40, forceOrg: 'Heavy Support' },
  { name: 'Haruspex', faction: 'Tyranids', unitType: 'Monster', defaultQty: 1, points: 125, forceOrg: 'Heavy Support' },

  // ─── Chaos Daemons (filling gaps) ───
  { name: 'Herald of Khorne', faction: 'Chaos Daemons', unitType: 'Character', defaultQty: 1, points: 55, forceOrg: 'HQ' },
  { name: 'Herald of Tzeentch', faction: 'Chaos Daemons', unitType: 'Character', defaultQty: 1, points: 55, forceOrg: 'HQ' },
  { name: 'Herald of Nurgle', faction: 'Chaos Daemons', unitType: 'Character', defaultQty: 1, points: 55, forceOrg: 'HQ' },
  { name: 'Herald of Slaanesh', faction: 'Chaos Daemons', unitType: 'Character', defaultQty: 1, points: 55, forceOrg: 'HQ' },
  { name: 'Horticulous Slimux', faction: 'Chaos Daemons', unitType: 'Character', defaultQty: 1, points: 100, forceOrg: 'HQ' },
  { name: 'Changecaster', faction: 'Chaos Daemons', unitType: 'Character', defaultQty: 1, points: 65, forceOrg: 'HQ' },
  { name: 'Blue Horrors', faction: 'Chaos Daemons', unitType: 'Troops', defaultQty: 10, points: 60, forceOrg: 'Troops' },
  { name: 'Furies', faction: 'Chaos Daemons', unitType: 'Fast Attack', defaultQty: 5, points: 50, forceOrg: 'Fast Attack' },

  // ─── Drukhari (filling gaps) ───
  { name: 'Beastmaster', faction: 'Drukhari', unitType: 'Character', defaultQty: 1, points: 55, forceOrg: 'Fast Attack' },
  { name: 'Khymerae', faction: 'Drukhari', unitType: 'Beasts', defaultQty: 2, points: 40, forceOrg: 'Fast Attack' },
  { name: 'Clawed Fiend', faction: 'Drukhari', unitType: 'Beasts', defaultQty: 1, points: 35, forceOrg: 'Fast Attack' },
  { name: 'Urien Rakarth', faction: 'Drukhari', unitType: 'Character', defaultQty: 1, points: 85, forceOrg: 'HQ' },
  { name: 'Sslyth', faction: 'Drukhari', unitType: 'Infantry', defaultQty: 1, points: 25, forceOrg: 'Elites' },
  { name: 'Ur-Ghul', faction: 'Drukhari', unitType: 'Infantry', defaultQty: 1, points: 20, forceOrg: 'Elites' },
  { name: 'Lhamaean', faction: 'Drukhari', unitType: 'Infantry', defaultQty: 1, points: 25, forceOrg: 'Elites' },
  { name: 'Medusae', faction: 'Drukhari', unitType: 'Infantry', defaultQty: 1, points: 25, forceOrg: 'Elites' },

  // ─── Thousand Sons (filling gaps) ───
  { name: 'Scarab Occult Sorcerer', faction: 'Thousand Sons', unitType: 'Character', defaultQty: 1, points: 95, forceOrg: 'Elites' },
  { name: 'Chaos Spawn', faction: 'Thousand Sons', unitType: 'Beasts', defaultQty: 2, points: 70, forceOrg: 'Elites' },
  { name: 'Heldrake', faction: 'Thousand Sons', unitType: 'Vehicle', defaultQty: 1, points: 195, forceOrg: 'Flyer' },
  { name: 'Defiler', faction: 'Thousand Sons', unitType: 'Vehicle', defaultQty: 1, points: 190, forceOrg: 'Heavy Support' },

  // ─── World Eaters (filling gaps) ───
  { name: 'World Eaters Chaos Spawn', faction: 'World Eaters', unitType: 'Beasts', defaultQty: 2, points: 70, forceOrg: 'Elites' },
  { name: 'World Eaters Forgefiend', faction: 'World Eaters', unitType: 'Vehicle', defaultQty: 1, points: 145, forceOrg: 'Heavy Support' },
  { name: 'World Eaters Maulerfiend', faction: 'World Eaters', unitType: 'Vehicle', defaultQty: 1, points: 140, forceOrg: 'Heavy Support' },

  // ─── Leagues of Votann (filling gaps) ───
  { name: 'Brôkhyr Thunderkyn', faction: 'Leagues of Votann', unitType: 'Infantry', defaultQty: 3, points: 95, forceOrg: 'Heavy Support' },
  { name: 'Hekaton Land Fortress', faction: 'Leagues of Votann', unitType: 'Vehicle', defaultQty: 1, points: 230, forceOrg: 'Heavy Support' },
  { name: 'Grimnyr', faction: 'Leagues of Votann', unitType: 'Character', defaultQty: 1, points: 65, forceOrg: 'HQ' },

  // ─── Chaos Knights (filling gaps) ───
  { name: 'Knight Tyrant', faction: 'Chaos Knights', unitType: 'Titanic', defaultQty: 1, points: 430, forceOrg: 'Lord of War' },
  { name: 'War Dog Brigand', faction: 'Chaos Knights', unitType: 'Vehicle', defaultQty: 1, points: 170, forceOrg: 'Fast Attack' },
  { name: 'War Dog Huntsman', faction: 'Chaos Knights', unitType: 'Vehicle', defaultQty: 1, points: 150, forceOrg: 'Fast Attack' },
];
