import type { ModelPreset } from './model-presets';

export const COMBAT_PATROLS: ModelPreset[] = [
  // ─── Combat Patrol: Space Marines ───
  { name: 'Captain in Terminator Armour (CP)', faction: 'Space Marines', unitType: 'Character', defaultQty: 1, points: 95, forceOrg: 'HQ' },
  { name: 'Infernus Squad (CP)', faction: 'Space Marines', unitType: 'Battleline', defaultQty: 5, points: 80, forceOrg: 'Troops' },
  { name: 'Terminator Squad (CP)', faction: 'Space Marines', unitType: 'Infantry', defaultQty: 5, points: 200, forceOrg: 'Elites' },
  { name: 'Impulsor (CP)', faction: 'Space Marines', unitType: 'Transport', defaultQty: 1, points: 105, forceOrg: 'Dedicated Transport' },

  // ─── Combat Patrol: Tyranids ───
  { name: 'Winged Tyranid Prime (CP)', faction: 'Tyranids', unitType: 'Character', defaultQty: 1, points: 80, forceOrg: 'HQ' },
  { name: 'Termagants (CP)', faction: 'Tyranids', unitType: 'Battleline', defaultQty: 20, points: 160, forceOrg: 'Troops' },
  { name: 'Von Ryan Leapers (CP)', faction: 'Tyranids', unitType: 'Infantry', defaultQty: 3, points: 75, forceOrg: 'Elites' },
  { name: 'Psychophage (CP)', faction: 'Tyranids', unitType: 'Monster', defaultQty: 1, points: 125, forceOrg: 'Elites' },

  // ─── Combat Patrol: Orks ───
  { name: 'Warboss (CP)', faction: 'Orks', unitType: 'Character', defaultQty: 1, points: 70, forceOrg: 'HQ' },
  { name: 'Boyz (CP)', faction: 'Orks', unitType: 'Battleline', defaultQty: 20, points: 180, forceOrg: 'Troops' },
  { name: 'Deffkoptas (CP)', faction: 'Orks', unitType: 'Vehicle', defaultQty: 3, points: 115, forceOrg: 'Fast Attack' },
  { name: 'Deff Dread (CP)', faction: 'Orks', unitType: 'Walker', defaultQty: 1, points: 150, forceOrg: 'Heavy Support' },

  // ─── Combat Patrol: Necrons ───
  { name: 'Overlord (CP)', faction: 'Necrons', unitType: 'Character', defaultQty: 1, points: 85, forceOrg: 'HQ' },
  { name: 'Necron Warriors (CP)', faction: 'Necrons', unitType: 'Battleline', defaultQty: 10, points: 120, forceOrg: 'Troops' },
  { name: 'Immortals (CP)', faction: 'Necrons', unitType: 'Battleline', defaultQty: 5, points: 75, forceOrg: 'Troops' },
  { name: 'Skorpekh Destroyers (CP)', faction: 'Necrons', unitType: 'Infantry', defaultQty: 3, points: 90, forceOrg: 'Elites' },
  { name: 'Canoptek Scarab Swarms (CP)', faction: 'Necrons', unitType: 'Swarm', defaultQty: 3, points: 40, forceOrg: 'Fast Attack' },
  { name: 'Canoptek Doomstalker (CP)', faction: 'Necrons', unitType: 'Vehicle', defaultQty: 1, points: 135, forceOrg: 'Heavy Support' },

  // ─── Combat Patrol: Death Guard ───
  { name: 'Typhus (CP)', faction: 'Death Guard', unitType: 'Character', defaultQty: 1, points: 100, forceOrg: 'HQ' },
  { name: 'Plague Marines (CP)', faction: 'Death Guard', unitType: 'Battleline', defaultQty: 7, points: 180, forceOrg: 'Troops' },
  { name: 'Poxwalkers (CP)', faction: 'Death Guard', unitType: 'Battleline', defaultQty: 10, points: 50, forceOrg: 'Troops' },
  { name: 'Biologus Putrifier (CP)', faction: 'Death Guard', unitType: 'Character', defaultQty: 1, points: 60, forceOrg: 'Elites' },

  // ─── Combat Patrol: Astra Militarum ───
  { name: 'Cadian Castellan (CP)', faction: 'Astra Militarum', unitType: 'Character', defaultQty: 1, points: 45, forceOrg: 'HQ' },
  { name: 'Cadian Shock Troops (CP)', faction: 'Astra Militarum', unitType: 'Battleline', defaultQty: 20, points: 130, forceOrg: 'Troops' },
  { name: 'Field Ordnance Battery (CP)', faction: 'Astra Militarum', unitType: 'Vehicle', defaultQty: 1, points: 120, forceOrg: 'Heavy Support' },
  { name: 'Sentinel (CP)', faction: 'Astra Militarum', unitType: 'Walker', defaultQty: 1, points: 60, forceOrg: 'Fast Attack' },

  // ─── Combat Patrol: Adeptus Mechanicus ───
  { name: 'Tech-Priest Enginseer (CP)', faction: 'Adeptus Mechanicus', unitType: 'Character', defaultQty: 1, points: 55, forceOrg: 'HQ' },
  { name: 'Skitarii Rangers (CP)', faction: 'Adeptus Mechanicus', unitType: 'Battleline', defaultQty: 10, points: 100, forceOrg: 'Troops' },
  { name: 'Skitarii Vanguard (CP)', faction: 'Adeptus Mechanicus', unitType: 'Battleline', defaultQty: 10, points: 100, forceOrg: 'Troops' },
  { name: 'Onager Dunecrawler (CP)', faction: 'Adeptus Mechanicus', unitType: 'Vehicle', defaultQty: 1, points: 150, forceOrg: 'Heavy Support' },

  // ─── Combat Patrol: Adepta Sororitas ───
  { name: 'Canoness (CP)', faction: 'Adepta Sororitas', unitType: 'Character', defaultQty: 1, points: 50, forceOrg: 'HQ' },
  { name: 'Battle Sisters Squad (CP)', faction: 'Adepta Sororitas', unitType: 'Battleline', defaultQty: 10, points: 110, forceOrg: 'Troops' },
  { name: 'Seraphim (CP)', faction: 'Adepta Sororitas', unitType: 'Jump Infantry', defaultQty: 5, points: 75, forceOrg: 'Fast Attack' },
  { name: 'Penitent Engine (CP)', faction: 'Adepta Sororitas', unitType: 'Vehicle', defaultQty: 1, points: 65, forceOrg: 'Heavy Support' },
  { name: 'Arco-Flagellants (CP)', faction: 'Adepta Sororitas', unitType: 'Infantry', defaultQty: 3, points: 45, forceOrg: 'Elites' },

  // ─── Combat Patrol: Aeldari ───
  { name: 'Farseer (CP)', faction: 'Aeldari', unitType: 'Character', defaultQty: 1, points: 65, forceOrg: 'HQ' },
  { name: 'Guardians (CP)', faction: 'Aeldari', unitType: 'Battleline', defaultQty: 10, points: 110, forceOrg: 'Troops' },
  { name: 'Wraithlord (CP)', faction: 'Aeldari', unitType: 'Monster', defaultQty: 1, points: 130, forceOrg: 'Heavy Support' },
  { name: 'War Walker (CP)', faction: 'Aeldari', unitType: 'Walker', defaultQty: 1, points: 100, forceOrg: 'Heavy Support' },
  { name: 'Windriders (CP)', faction: 'Aeldari', unitType: 'Mounted', defaultQty: 3, points: 80, forceOrg: 'Fast Attack' },

  // ─── Combat Patrol: Tau Empire ───
  { name: 'Cadre Fireblade (CP)', faction: 'Tau Empire', unitType: 'Character', defaultQty: 1, points: 50, forceOrg: 'HQ' },
  { name: 'Fire Warriors (CP)', faction: 'Tau Empire', unitType: 'Battleline', defaultQty: 10, points: 95, forceOrg: 'Troops' },
  { name: 'Crisis Battlesuits (CP)', faction: 'Tau Empire', unitType: 'Battlesuits', defaultQty: 3, points: 200, forceOrg: 'Elites' },
  { name: 'Stealth Battlesuits (CP)', faction: 'Tau Empire', unitType: 'Battlesuits', defaultQty: 3, points: 60, forceOrg: 'Elites' },
  { name: 'Ghostkeel Battlesuit (CP)', faction: 'Tau Empire', unitType: 'Battlesuits', defaultQty: 1, points: 160, forceOrg: 'Elites' },

  // ─── Combat Patrol: Chaos Space Marines ───
  { name: 'Dark Apostle (CP)', faction: 'Chaos Space Marines', unitType: 'Character', defaultQty: 1, points: 70, forceOrg: 'HQ' },
  { name: 'Legionaries (CP)', faction: 'Chaos Space Marines', unitType: 'Battleline', defaultQty: 10, points: 170, forceOrg: 'Troops' },
  { name: 'Havocs (CP)', faction: 'Chaos Space Marines', unitType: 'Infantry', defaultQty: 5, points: 140, forceOrg: 'Heavy Support' },
  { name: 'Helbrute (CP)', faction: 'Chaos Space Marines', unitType: 'Vehicle', defaultQty: 1, points: 155, forceOrg: 'Elites' },

  // ─── Combat Patrol: Thousand Sons ───
  { name: 'Infernal Master (CP)', faction: 'Thousand Sons', unitType: 'Character', defaultQty: 1, points: 75, forceOrg: 'HQ' },
  { name: 'Rubric Marines (CP)', faction: 'Thousand Sons', unitType: 'Battleline', defaultQty: 10, points: 190, forceOrg: 'Troops' },
  { name: 'Tzaangors (CP)', faction: 'Thousand Sons', unitType: 'Battleline', defaultQty: 10, points: 70, forceOrg: 'Troops' },

  // ─── Combat Patrol: World Eaters ───
  { name: 'Lord on Juggernaut (CP)', faction: 'World Eaters', unitType: 'Character', defaultQty: 1, points: 110, forceOrg: 'HQ' },
  { name: 'Berzerkers (CP)', faction: 'World Eaters', unitType: 'Battleline', defaultQty: 10, points: 180, forceOrg: 'Troops' },
  { name: 'Jakhals (CP)', faction: 'World Eaters', unitType: 'Battleline', defaultQty: 10, points: 65, forceOrg: 'Troops' },
  { name: 'Eightbound (CP)', faction: 'World Eaters', unitType: 'Infantry', defaultQty: 3, points: 155, forceOrg: 'Elites' },

  // ─── Combat Patrol: Drukhari ───
  { name: 'Archon (CP)', faction: 'Drukhari', unitType: 'Character', defaultQty: 1, points: 75, forceOrg: 'HQ' },
  { name: 'Kabalite Warriors (CP)', faction: 'Drukhari', unitType: 'Battleline', defaultQty: 10, points: 110, forceOrg: 'Troops' },
  { name: 'Incubi (CP)', faction: 'Drukhari', unitType: 'Infantry', defaultQty: 5, points: 80, forceOrg: 'Elites' },
  { name: 'Raider (CP)', faction: 'Drukhari', unitType: 'Vehicle', defaultQty: 1, points: 80, forceOrg: 'Dedicated Transport' },
  { name: 'Ravager (CP)', faction: 'Drukhari', unitType: 'Vehicle', defaultQty: 1, points: 95, forceOrg: 'Heavy Support' },

  // ─── Combat Patrol: Genestealer Cults ───
  { name: 'Patriarch (CP)', faction: 'Genestealer Cults', unitType: 'Character', defaultQty: 1, points: 80, forceOrg: 'HQ' },
  { name: 'Neophyte Hybrids (CP)', faction: 'Genestealer Cults', unitType: 'Battleline', defaultQty: 10, points: 80, forceOrg: 'Troops' },
  { name: 'Acolyte Hybrids (CP)', faction: 'Genestealer Cults', unitType: 'Battleline', defaultQty: 5, points: 75, forceOrg: 'Troops' },
  { name: 'Aberrants (CP)', faction: 'Genestealer Cults', unitType: 'Infantry', defaultQty: 5, points: 100, forceOrg: 'Elites' },

  // ─── Combat Patrol: Leagues of Votann ───
  { name: 'Kahl (CP)', faction: 'Leagues of Votann', unitType: 'Character', defaultQty: 1, points: 75, forceOrg: 'HQ' },
  { name: 'Hearthkyn Warriors (CP)', faction: 'Leagues of Votann', unitType: 'Battleline', defaultQty: 10, points: 130, forceOrg: 'Troops' },
  { name: 'Hernkyn Pioneers (CP)', faction: 'Leagues of Votann', unitType: 'Mounted', defaultQty: 3, points: 105, forceOrg: 'Fast Attack' },
  { name: 'Sagitaur (CP)', faction: 'Leagues of Votann', unitType: 'Vehicle', defaultQty: 1, points: 120, forceOrg: 'Dedicated Transport' },

  // ─── Combat Patrol: Adeptus Custodes ───
  { name: 'Shield-Captain (CP)', faction: 'Adeptus Custodes', unitType: 'Character', defaultQty: 1, points: 100, forceOrg: 'HQ' },
  { name: 'Custodian Guard (CP)', faction: 'Adeptus Custodes', unitType: 'Battleline', defaultQty: 5, points: 225, forceOrg: 'Troops' },
  { name: 'Vertus Praetors (CP)', faction: 'Adeptus Custodes', unitType: 'Mounted', defaultQty: 3, points: 150, forceOrg: 'Fast Attack' },
  { name: 'Prosecutors (CP)', faction: 'Adeptus Custodes', unitType: 'Battleline', defaultQty: 5, points: 40, forceOrg: 'Troops' },

  // ─── Combat Patrol: Grey Knights ───
  { name: 'Librarian (CP)', faction: 'Grey Knights', unitType: 'Character', defaultQty: 1, points: 75, forceOrg: 'HQ' },
  { name: 'Strike Squad (CP)', faction: 'Grey Knights', unitType: 'Battleline', defaultQty: 5, points: 120, forceOrg: 'Troops' },
  { name: 'Terminators (CP)', faction: 'Grey Knights', unitType: 'Infantry', defaultQty: 5, points: 210, forceOrg: 'Elites' },
  { name: 'Nemesis Dreadknight (CP)', faction: 'Grey Knights', unitType: 'Vehicle', defaultQty: 1, points: 195, forceOrg: 'Heavy Support' },
];
