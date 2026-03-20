import type { ModelPreset } from './model-presets';

export const KILLTEAM_OPERATIVES: ModelPreset[] = [
  // ─── Death Guard Kill Team ───
  { name: 'Plague Marine Champion', faction: 'Death Guard', unitType: 'Kill Team Leader', defaultQty: 1 },
  { name: 'Malignant Plaguecaster', faction: 'Death Guard', unitType: 'Kill Team Psyker', defaultQty: 1 },
  { name: 'Plague Marine Gunner (Blight Launcher)', faction: 'Death Guard', unitType: 'Kill Team Gunner', defaultQty: 1 },
  { name: 'Plague Marine Gunner (Plasma Gun)', faction: 'Death Guard', unitType: 'Kill Team Gunner', defaultQty: 1 },
  { name: 'Plague Marine Heavy Gunner', faction: 'Death Guard', unitType: 'Kill Team Heavy', defaultQty: 1 },
  { name: 'Plague Marine Icon Bearer', faction: 'Death Guard', unitType: 'Kill Team Specialist', defaultQty: 1 },
  { name: 'Plague Marine Fighter (Cleaver)', faction: 'Death Guard', unitType: 'Kill Team Fighter', defaultQty: 1 },
  { name: 'Plague Marine Fighter (Flail)', faction: 'Death Guard', unitType: 'Kill Team Fighter', defaultQty: 1 },
  { name: 'Plague Marine Warrior', faction: 'Death Guard', unitType: 'Kill Team Trooper', defaultQty: 1 },

  // ─── Legionary Kill Team (CSM) ───
  { name: 'Legionary Aspiring Champion', faction: 'Chaos Space Marines', unitType: 'Kill Team Leader', defaultQty: 1 },
  { name: 'Legionary Balefire Acolyte', faction: 'Chaos Space Marines', unitType: 'Kill Team Psyker', defaultQty: 1 },
  { name: 'Legionary Gunner (Plasma)', faction: 'Chaos Space Marines', unitType: 'Kill Team Gunner', defaultQty: 1 },
  { name: 'Legionary Heavy Gunner (Heavy Bolter)', faction: 'Chaos Space Marines', unitType: 'Kill Team Heavy', defaultQty: 1 },
  { name: 'Legionary Butcher', faction: 'Chaos Space Marines', unitType: 'Kill Team Fighter', defaultQty: 1 },
  { name: 'Legionary Shrivetalon', faction: 'Chaos Space Marines', unitType: 'Kill Team Fighter', defaultQty: 1 },
  { name: 'Legionary Icon Bearer', faction: 'Chaos Space Marines', unitType: 'Kill Team Specialist', defaultQty: 1 },
  { name: 'Legionary Anointed', faction: 'Chaos Space Marines', unitType: 'Kill Team Specialist', defaultQty: 1 },
  { name: 'Legionary Chosen', faction: 'Chaos Space Marines', unitType: 'Kill Team Trooper', defaultQty: 1 },

  // ─── Intercession Squad (Space Marines) ───
  { name: 'Intercessor Sergeant', faction: 'Space Marines', unitType: 'Kill Team Leader', defaultQty: 1 },
  { name: 'Intercessor Grenadier', faction: 'Space Marines', unitType: 'Kill Team Gunner', defaultQty: 1 },
  { name: 'Intercessor Gunner (Bolt Rifle)', faction: 'Space Marines', unitType: 'Kill Team Gunner', defaultQty: 1 },
  { name: 'Intercessor Warrior', faction: 'Space Marines', unitType: 'Kill Team Trooper', defaultQty: 1 },

  // ─── Phobos Strike Team ───
  { name: 'Phobos Sergeant', faction: 'Space Marines', unitType: 'Kill Team Leader', defaultQty: 1 },
  { name: 'Phobos Eliminator Marksman', faction: 'Space Marines', unitType: 'Kill Team Gunner', defaultQty: 1 },
  { name: 'Phobos Helix Adept', faction: 'Space Marines', unitType: 'Kill Team Specialist', defaultQty: 1 },
  { name: 'Phobos Voxbreaker', faction: 'Space Marines', unitType: 'Kill Team Specialist', defaultQty: 1 },
  { name: 'Phobos Minelayer', faction: 'Space Marines', unitType: 'Kill Team Specialist', defaultQty: 1 },
  { name: 'Phobos Warrior', faction: 'Space Marines', unitType: 'Kill Team Trooper', defaultQty: 1 },

  // ─── Scout Squad Kill Team ───
  { name: 'Scout Sergeant', faction: 'Space Marines', unitType: 'Kill Team Leader', defaultQty: 1 },
  { name: 'Scout Sniper', faction: 'Space Marines', unitType: 'Kill Team Gunner', defaultQty: 1 },
  { name: 'Scout Heavy Bolter', faction: 'Space Marines', unitType: 'Kill Team Heavy', defaultQty: 1 },
  { name: 'Scout Missile Launcher', faction: 'Space Marines', unitType: 'Kill Team Heavy', defaultQty: 1 },
  { name: 'Scout Trooper', faction: 'Space Marines', unitType: 'Kill Team Trooper', defaultQty: 1 },

  // ─── Veteran Guardsmen ───
  { name: 'Veteran Sergeant', faction: 'Astra Militarum', unitType: 'Kill Team Leader', defaultQty: 1 },
  { name: 'Veteran Confidant', faction: 'Astra Militarum', unitType: 'Kill Team Specialist', defaultQty: 1 },
  { name: 'Veteran Sniper', faction: 'Astra Militarum', unitType: 'Kill Team Gunner', defaultQty: 1 },
  { name: 'Veteran Gunner (Plasma)', faction: 'Astra Militarum', unitType: 'Kill Team Gunner', defaultQty: 1 },
  { name: 'Veteran Gunner (Melta)', faction: 'Astra Militarum', unitType: 'Kill Team Gunner', defaultQty: 1 },
  { name: 'Veteran Gunner (Flamer)', faction: 'Astra Militarum', unitType: 'Kill Team Gunner', defaultQty: 1 },
  { name: 'Veteran Demolition', faction: 'Astra Militarum', unitType: 'Kill Team Specialist', defaultQty: 1 },
  { name: 'Veteran Medic', faction: 'Astra Militarum', unitType: 'Kill Team Specialist', defaultQty: 1 },
  { name: 'Veteran Comms', faction: 'Astra Militarum', unitType: 'Kill Team Specialist', defaultQty: 1 },
  { name: 'Veteran Hardened', faction: 'Astra Militarum', unitType: 'Kill Team Specialist', defaultQty: 1 },
  { name: 'Veteran Bruiser', faction: 'Astra Militarum', unitType: 'Kill Team Fighter', defaultQty: 1 },
  { name: 'Veteran Trooper', faction: 'Astra Militarum', unitType: 'Kill Team Trooper', defaultQty: 1 },

  // ─── Kommandos ───
  { name: 'Kommando Boss Nob', faction: 'Orks', unitType: 'Kill Team Leader', defaultQty: 1 },
  { name: 'Kommando Snipa Boy', faction: 'Orks', unitType: 'Kill Team Gunner', defaultQty: 1 },
  { name: 'Kommando Rokkit Boy', faction: 'Orks', unitType: 'Kill Team Heavy', defaultQty: 1 },
  { name: 'Kommando Breacha Boy', faction: 'Orks', unitType: 'Kill Team Fighter', defaultQty: 1 },
  { name: 'Kommando Slasha Boy', faction: 'Orks', unitType: 'Kill Team Fighter', defaultQty: 1 },
  { name: 'Kommando Burna Boy', faction: 'Orks', unitType: 'Kill Team Specialist', defaultQty: 1 },
  { name: 'Kommando Comms Boy', faction: 'Orks', unitType: 'Kill Team Specialist', defaultQty: 1 },
  { name: 'Kommando Grot', faction: 'Orks', unitType: 'Kill Team Scout', defaultQty: 1 },
  { name: 'Kommando Boy', faction: 'Orks', unitType: 'Kill Team Trooper', defaultQty: 1 },
  { name: 'Kommando Bomb Squig', faction: 'Orks', unitType: 'Kill Team Specialist', defaultQty: 1 },

  // ─── Pathfinder Kill Team (Tau) ───
  { name: 'Pathfinder Shas\'ui', faction: 'Tau Empire', unitType: 'Kill Team Leader', defaultQty: 1 },
  { name: 'Pathfinder Marksman', faction: 'Tau Empire', unitType: 'Kill Team Gunner', defaultQty: 1 },
  { name: 'Pathfinder Heavy Gunner (Rail Rifle)', faction: 'Tau Empire', unitType: 'Kill Team Heavy', defaultQty: 1 },
  { name: 'Pathfinder Heavy Gunner (Ion Rifle)', faction: 'Tau Empire', unitType: 'Kill Team Heavy', defaultQty: 1 },
  { name: 'Pathfinder Transpectral', faction: 'Tau Empire', unitType: 'Kill Team Specialist', defaultQty: 1 },
  { name: 'Pathfinder Assault Grenadier', faction: 'Tau Empire', unitType: 'Kill Team Specialist', defaultQty: 1 },
  { name: 'Pathfinder Drone Controller', faction: 'Tau Empire', unitType: 'Kill Team Specialist', defaultQty: 1 },
  { name: 'Pathfinder Medic', faction: 'Tau Empire', unitType: 'Kill Team Specialist', defaultQty: 1 },
  { name: 'Pathfinder Warrior', faction: 'Tau Empire', unitType: 'Kill Team Trooper', defaultQty: 1 },
  { name: 'Recon Drone', faction: 'Tau Empire', unitType: 'Kill Team Drone', defaultQty: 1 },
  { name: 'Gun Drone', faction: 'Tau Empire', unitType: 'Kill Team Drone', defaultQty: 1 },
  { name: 'Shield Drone', faction: 'Tau Empire', unitType: 'Kill Team Drone', defaultQty: 1 },

  // ─── Hierotek Circle (Necrons) ───
  { name: 'Chronomancer (Hierotek)', faction: 'Necrons', unitType: 'Kill Team Leader', defaultQty: 1 },
  { name: 'Plasmacyte', faction: 'Necrons', unitType: 'Kill Team Specialist', defaultQty: 1 },
  { name: 'Deathmark Operative', faction: 'Necrons', unitType: 'Kill Team Gunner', defaultQty: 1 },
  { name: 'Immortal Despotek', faction: 'Necrons', unitType: 'Kill Team Fighter', defaultQty: 1 },
  { name: 'Apprentek', faction: 'Necrons', unitType: 'Kill Team Specialist', defaultQty: 1 },

  // ─── Corsair Voidscarred (Aeldari) ───
  { name: 'Voidscarred Felarch', faction: 'Aeldari', unitType: 'Kill Team Leader', defaultQty: 1 },
  { name: 'Voidscarred Shade Runner', faction: 'Aeldari', unitType: 'Kill Team Fighter', defaultQty: 1 },
  { name: 'Voidscarred Way Seeker', faction: 'Aeldari', unitType: 'Kill Team Psyker', defaultQty: 1 },
  { name: 'Voidscarred Gunner (Blaster)', faction: 'Aeldari', unitType: 'Kill Team Gunner', defaultQty: 1 },
  { name: 'Voidscarred Gunner (Shuriken)', faction: 'Aeldari', unitType: 'Kill Team Gunner', defaultQty: 1 },
  { name: 'Voidscarred Kurnathi', faction: 'Aeldari', unitType: 'Kill Team Fighter', defaultQty: 1 },
  { name: 'Voidscarred Starstorm', faction: 'Aeldari', unitType: 'Kill Team Heavy', defaultQty: 1 },
  { name: 'Voidscarred Soul Weaver', faction: 'Aeldari', unitType: 'Kill Team Specialist', defaultQty: 1 },
  { name: 'Voidscarred Fate Dealer', faction: 'Aeldari', unitType: 'Kill Team Gunner', defaultQty: 1 },
  { name: 'Voidscarred Warrior', faction: 'Aeldari', unitType: 'Kill Team Trooper', defaultQty: 1 },

  // ─── Novitiates (Adepta Sororitas) ───
  { name: 'Novitiate Superior', faction: 'Adepta Sororitas', unitType: 'Kill Team Leader', defaultQty: 1 },
  { name: 'Novitiate Penitent', faction: 'Adepta Sororitas', unitType: 'Kill Team Fighter', defaultQty: 1 },
  { name: 'Novitiate Pronatus', faction: 'Adepta Sororitas', unitType: 'Kill Team Specialist', defaultQty: 1 },
  { name: 'Novitiate Hospitaller', faction: 'Adepta Sororitas', unitType: 'Kill Team Specialist', defaultQty: 1 },
  { name: 'Novitiate Dialogus', faction: 'Adepta Sororitas', unitType: 'Kill Team Specialist', defaultQty: 1 },
  { name: 'Novitiate Condemnor', faction: 'Adepta Sororitas', unitType: 'Kill Team Gunner', defaultQty: 1 },
  { name: 'Novitiate Purgatus (Flamer)', faction: 'Adepta Sororitas', unitType: 'Kill Team Gunner', defaultQty: 1 },
  { name: 'Novitiate Militant', faction: 'Adepta Sororitas', unitType: 'Kill Team Trooper', defaultQty: 1 },

  // ─── Hunter Clade (Ad Mech) ───
  { name: 'Hunter Clade Ranger Alpha', faction: 'Adeptus Mechanicus', unitType: 'Kill Team Leader', defaultQty: 1 },
  { name: 'Hunter Clade Ranger Gunner (Arc Rifle)', faction: 'Adeptus Mechanicus', unitType: 'Kill Team Gunner', defaultQty: 1 },
  { name: 'Hunter Clade Ranger Gunner (Plasma)', faction: 'Adeptus Mechanicus', unitType: 'Kill Team Gunner', defaultQty: 1 },
  { name: 'Hunter Clade Vanguard Gunner (Arc)', faction: 'Adeptus Mechanicus', unitType: 'Kill Team Gunner', defaultQty: 1 },
  { name: 'Hunter Clade Diktat', faction: 'Adeptus Mechanicus', unitType: 'Kill Team Specialist', defaultQty: 1 },
  { name: 'Hunter Clade Surveyor', faction: 'Adeptus Mechanicus', unitType: 'Kill Team Specialist', defaultQty: 1 },
  { name: 'Hunter Clade Ruststalker Princeps', faction: 'Adeptus Mechanicus', unitType: 'Kill Team Fighter', defaultQty: 1 },
  { name: 'Hunter Clade Infiltrator Princeps', faction: 'Adeptus Mechanicus', unitType: 'Kill Team Fighter', defaultQty: 1 },
  { name: 'Hunter Clade Ranger', faction: 'Adeptus Mechanicus', unitType: 'Kill Team Trooper', defaultQty: 1 },
  { name: 'Hunter Clade Vanguard', faction: 'Adeptus Mechanicus', unitType: 'Kill Team Trooper', defaultQty: 1 },

  // ─── Wyrmblade (GSC) ───
  { name: 'Wyrmblade Locus', faction: 'Genestealer Cults', unitType: 'Kill Team Leader', defaultQty: 1 },
  { name: 'Wyrmblade Kelermorph', faction: 'Genestealer Cults', unitType: 'Kill Team Gunner', defaultQty: 1 },
  { name: 'Wyrmblade Sanctus (Sniper)', faction: 'Genestealer Cults', unitType: 'Kill Team Gunner', defaultQty: 1 },
  { name: 'Wyrmblade Neophyte Leader', faction: 'Genestealer Cults', unitType: 'Kill Team Specialist', defaultQty: 1 },
  { name: 'Wyrmblade Neophyte Gunner', faction: 'Genestealer Cults', unitType: 'Kill Team Gunner', defaultQty: 1 },
  { name: 'Wyrmblade Neophyte Heavy (Mining Laser)', faction: 'Genestealer Cults', unitType: 'Kill Team Heavy', defaultQty: 1 },
  { name: 'Wyrmblade Neophyte Webber', faction: 'Genestealer Cults', unitType: 'Kill Team Specialist', defaultQty: 1 },
  { name: 'Wyrmblade Neophyte', faction: 'Genestealer Cults', unitType: 'Kill Team Trooper', defaultQty: 1 },

  // ─── Warp Coven (Thousand Sons) ───
  { name: 'Warp Coven Sorcerer', faction: 'Thousand Sons', unitType: 'Kill Team Leader', defaultQty: 1 },
  { name: 'Warp Coven Sorcerer (Warpflame)', faction: 'Thousand Sons', unitType: 'Kill Team Psyker', defaultQty: 1 },
  { name: 'Warp Coven Rubric Gunner (Soulreaper)', faction: 'Thousand Sons', unitType: 'Kill Team Heavy', defaultQty: 1 },
  { name: 'Warp Coven Rubric Icon Bearer', faction: 'Thousand Sons', unitType: 'Kill Team Specialist', defaultQty: 1 },
  { name: 'Warp Coven Rubric Warrior', faction: 'Thousand Sons', unitType: 'Kill Team Trooper', defaultQty: 1 },
  { name: 'Warp Coven Tzaangor Champion', faction: 'Thousand Sons', unitType: 'Kill Team Fighter', defaultQty: 1 },
  { name: 'Warp Coven Tzaangor Fighter', faction: 'Thousand Sons', unitType: 'Kill Team Fighter', defaultQty: 1 },

  // ─── Hand of the Archon (Drukhari) ───
  { name: 'Hand of the Archon Archon', faction: 'Drukhari', unitType: 'Kill Team Leader', defaultQty: 1 },
  { name: 'Hand of the Archon Sslyth', faction: 'Drukhari', unitType: 'Kill Team Fighter', defaultQty: 1 },
  { name: 'Hand of the Archon Ur-Ghul', faction: 'Drukhari', unitType: 'Kill Team Fighter', defaultQty: 1 },
  { name: 'Hand of the Archon Medusae', faction: 'Drukhari', unitType: 'Kill Team Specialist', defaultQty: 1 },
  { name: 'Hand of the Archon Lhamaean', faction: 'Drukhari', unitType: 'Kill Team Specialist', defaultQty: 1 },

  // ─── Nemesis Claw (Night Lords CSM) ───
  { name: 'Nemesis Claw Talon', faction: 'Chaos Space Marines', unitType: 'Kill Team Leader', defaultQty: 1 },
  { name: 'Nemesis Claw Ventrilokar', faction: 'Chaos Space Marines', unitType: 'Kill Team Specialist', defaultQty: 1 },
  { name: 'Nemesis Claw Skinthief', faction: 'Chaos Space Marines', unitType: 'Kill Team Fighter', defaultQty: 1 },
  { name: 'Nemesis Claw Fearmonger', faction: 'Chaos Space Marines', unitType: 'Kill Team Specialist', defaultQty: 1 },
  { name: 'Nemesis Claw Nightblade', faction: 'Chaos Space Marines', unitType: 'Kill Team Fighter', defaultQty: 1 },
];
