import type { ModelPreset } from './model-presets';

export const MORE_40K: ModelPreset[] = [
  // ─── Named Characters ───
  { name: 'Lion El\'Jonson', faction: 'Space Marines', unitType: 'Character', defaultQty: 1, points: 380, forceOrg: 'Lord of War' },
  { name: 'Bjorn the Fell-Handed', faction: 'Space Marines', unitType: 'Character', defaultQty: 1, points: 180, forceOrg: 'Elites' },
  { name: 'Logan Grimnar', faction: 'Space Marines', unitType: 'Character', defaultQty: 1, points: 145, forceOrg: 'HQ' },
  { name: 'Sammael', faction: 'Space Marines', unitType: 'Character', defaultQty: 1, points: 140, forceOrg: 'HQ' },
  { name: 'Belial', faction: 'Space Marines', unitType: 'Character', defaultQty: 1, points: 100, forceOrg: 'HQ' },
  { name: 'Lemartes', faction: 'Space Marines', unitType: 'Character', defaultQty: 1, points: 80, forceOrg: 'HQ' },
  { name: 'Mephiston', faction: 'Space Marines', unitType: 'Character', defaultQty: 1, points: 120, forceOrg: 'HQ' },
  { name: 'Tycho', faction: 'Space Marines', unitType: 'Character', defaultQty: 1, points: 75, forceOrg: 'HQ' },
  { name: 'Vulkan He\'stan', faction: 'Space Marines', unitType: 'Character', defaultQty: 1, points: 100, forceOrg: 'HQ' },
  { name: 'Shrike', faction: 'Space Marines', unitType: 'Character', defaultQty: 1, points: 100, forceOrg: 'HQ' },
  { name: 'Pedro Kantor', faction: 'Space Marines', unitType: 'Character', defaultQty: 1, points: 100, forceOrg: 'HQ' },
  { name: 'Tigurius', faction: 'Space Marines', unitType: 'Character', defaultQty: 1, points: 85, forceOrg: 'HQ' },

  // ─── More SM units ───
  { name: 'Centurion Assault Squad', faction: 'Space Marines', unitType: 'Infantry', defaultQty: 3, points: 150, forceOrg: 'Elites' },
  { name: 'Relic Terminators', faction: 'Space Marines', unitType: 'Infantry', defaultQty: 5, points: 200, forceOrg: 'Elites' },
  { name: 'Company Veterans', faction: 'Space Marines', unitType: 'Infantry', defaultQty: 5, points: 80, forceOrg: 'Elites' },
  { name: 'Stalker', faction: 'Space Marines', unitType: 'Vehicle', defaultQty: 1, points: 120, forceOrg: 'Heavy Support' },
  { name: 'Hunter', faction: 'Space Marines', unitType: 'Vehicle', defaultQty: 1, points: 120, forceOrg: 'Heavy Support' },
  { name: 'Thunderfire Cannon', faction: 'Space Marines', unitType: 'Vehicle', defaultQty: 1, points: 90, forceOrg: 'Heavy Support' },
  { name: 'Land Speeder Typhoon', faction: 'Space Marines', unitType: 'Vehicle', defaultQty: 1, points: 80, forceOrg: 'Fast Attack' },
  { name: 'Stormtalon Gunship', faction: 'Space Marines', unitType: 'Vehicle', defaultQty: 1, points: 165, forceOrg: 'Flyer' },

  // ─── More Guard ───
  { name: 'Nork Deddog', faction: 'Astra Militarum', unitType: 'Character', defaultQty: 1, points: 60, forceOrg: 'Elites' },
  { name: 'Sly Marbo', faction: 'Astra Militarum', unitType: 'Character', defaultQty: 1, points: 55, forceOrg: 'Elites' },
  { name: 'Creed', faction: 'Astra Militarum', unitType: 'Character', defaultQty: 1, points: 65, forceOrg: 'HQ' },
  { name: 'Catachan Command Squad', faction: 'Astra Militarum', unitType: 'Character', defaultQty: 5, points: 60, forceOrg: 'HQ' },
  { name: 'Militarum Tempestus Command', faction: 'Astra Militarum', unitType: 'Character', defaultQty: 5, points: 70, forceOrg: 'HQ' },
  { name: 'Banewolf', faction: 'Astra Militarum', unitType: 'Vehicle', defaultQty: 1, points: 100, forceOrg: 'Fast Attack' },
  { name: 'Devil Dog', faction: 'Astra Militarum', unitType: 'Vehicle', defaultQty: 1, points: 110, forceOrg: 'Fast Attack' },
  { name: 'Shadowsword', faction: 'Astra Militarum', unitType: 'Vehicle', defaultQty: 1, points: 440, forceOrg: 'Lord of War' },
  { name: 'Stormlord', faction: 'Astra Militarum', unitType: 'Vehicle', defaultQty: 1, points: 400, forceOrg: 'Lord of War' },

  // ─── More Tyranids ───
  { name: 'Norn Emissary', faction: 'Tyranids', unitType: 'Monster', defaultQty: 1, points: 290, forceOrg: 'Heavy Support' },
  { name: 'Norn Assimilator', faction: 'Tyranids', unitType: 'Monster', defaultQty: 1, points: 290, forceOrg: 'Heavy Support' },
  { name: 'Hierophant', faction: 'Tyranids', unitType: 'Monster', defaultQty: 1, points: 800, forceOrg: 'Lord of War' },
  { name: 'Dimachaeron', faction: 'Tyranids', unitType: 'Monster', defaultQty: 1, points: 250, forceOrg: 'Heavy Support' },
  { name: 'Toxicrene', faction: 'Tyranids', unitType: 'Monster', defaultQty: 1, points: 200, forceOrg: 'Heavy Support' },
  { name: 'Mucolid Spore', faction: 'Tyranids', unitType: 'Infantry', defaultQty: 1, points: 30, forceOrg: 'Fast Attack' },
  { name: 'Spore Mines', faction: 'Tyranids', unitType: 'Swarm', defaultQty: 3, points: 30, forceOrg: 'Fast Attack' },

  // ─── More Necrons ───
  { name: 'Void Dragon', faction: 'Necrons', unitType: 'Character', defaultQty: 1, points: 270, forceOrg: 'Elites' },
  { name: 'Nightbringer', faction: 'Necrons', unitType: 'Character', defaultQty: 1, points: 270, forceOrg: 'Elites' },
  { name: 'Deceiver', faction: 'Necrons', unitType: 'Character', defaultQty: 1, points: 270, forceOrg: 'Elites' },
  { name: 'Tesseract Vault', faction: 'Necrons', unitType: 'Vehicle', defaultQty: 1, points: 400, forceOrg: 'Lord of War' },
  { name: 'Obelisk', faction: 'Necrons', unitType: 'Vehicle', defaultQty: 1, points: 300, forceOrg: 'Lord of War' },
  { name: 'Seraptek Heavy Construct', faction: 'Necrons', unitType: 'Vehicle', defaultQty: 1, points: 450, forceOrg: 'Lord of War' },

  // ─── More Orks ───
  { name: 'Stompa', faction: 'Orks', unitType: 'Vehicle', defaultQty: 1, points: 700, forceOrg: 'Lord of War' },
  { name: 'Mega Dread', faction: 'Orks', unitType: 'Vehicle', defaultQty: 1, points: 200, forceOrg: 'Heavy Support' },
  { name: 'Mozrog Skragbad', faction: 'Orks', unitType: 'Character', defaultQty: 1, points: 170, forceOrg: 'HQ' },
  { name: 'Zodgrod Wortsnagga', faction: 'Orks', unitType: 'Character', defaultQty: 1, points: 70, forceOrg: 'HQ' },
  { name: 'Painboy', faction: 'Orks', unitType: 'Character', defaultQty: 1, points: 70, forceOrg: 'Elites' },
  { name: 'Mek', faction: 'Orks', unitType: 'Character', defaultQty: 1, points: 45, forceOrg: 'HQ' },

  // ─── More Tau ───
  { name: 'Farsight', faction: 'Tau Empire', unitType: 'Character', defaultQty: 1, points: 120, forceOrg: 'HQ' },
  { name: 'Longstrike', faction: 'Tau Empire', unitType: 'Character', defaultQty: 1, points: 160, forceOrg: 'Heavy Support' },
  { name: 'Aun\'Va', faction: 'Tau Empire', unitType: 'Character', defaultQty: 1, points: 60, forceOrg: 'HQ' },
  { name: 'Aun\'Shi', faction: 'Tau Empire', unitType: 'Character', defaultQty: 1, points: 55, forceOrg: 'HQ' },
  { name: 'Tidewall Shieldline', faction: 'Tau Empire', unitType: 'Fortification', defaultQty: 1, points: 80, forceOrg: 'Fortification' },

  // ─── More Aeldari ───
  { name: 'Asurmen', faction: 'Aeldari', unitType: 'Character', defaultQty: 1, points: 110, forceOrg: 'HQ' },
  { name: 'Illic Nightspear', faction: 'Aeldari', unitType: 'Character', defaultQty: 1, points: 70, forceOrg: 'HQ' },
  { name: 'Prince Yriel', faction: 'Aeldari', unitType: 'Character', defaultQty: 1, points: 80, forceOrg: 'HQ' },
  { name: 'Phantom Titan', faction: 'Aeldari', unitType: 'Vehicle', defaultQty: 1, points: 2000, forceOrg: 'Lord of War' },
  { name: 'Revenant Titan', faction: 'Aeldari', unitType: 'Vehicle', defaultQty: 1, points: 1200, forceOrg: 'Lord of War' },
  { name: 'Cobra', faction: 'Aeldari', unitType: 'Vehicle', defaultQty: 1, points: 400, forceOrg: 'Lord of War' },

  // ─── Terrain / Scenery ───
  { name: 'Sector Imperialis Ruins', faction: 'Terrain', unitType: 'Terrain', defaultQty: 1, points: 0, forceOrg: 'Other' },
  { name: 'Sector Mechanicus', faction: 'Terrain', unitType: 'Terrain', defaultQty: 1, points: 0, forceOrg: 'Other' },
  { name: 'Battlezone Fronteris', faction: 'Terrain', unitType: 'Terrain', defaultQty: 1, points: 0, forceOrg: 'Other' },
  { name: 'Kill Team Killzone', faction: 'Terrain', unitType: 'Terrain', defaultQty: 1, points: 0, forceOrg: 'Other' },
  { name: 'Aegis Defence Line', faction: 'Terrain', unitType: 'Fortification', defaultQty: 1, points: 80, forceOrg: 'Fortification' },
  { name: 'Imperial Bastion', faction: 'Terrain', unitType: 'Fortification', defaultQty: 1, points: 180, forceOrg: 'Fortification' },
  { name: 'Skyshield Landing Pad', faction: 'Terrain', unitType: 'Fortification', defaultQty: 1, points: 120, forceOrg: 'Fortification' },
];
