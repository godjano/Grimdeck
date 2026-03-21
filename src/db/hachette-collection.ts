// Hachette Combat Patrol collection - Issues 1-72
// Run this script to add all models to the user's collection

import { db } from './index';

interface HachetteModel {
  issue: number;
  faction: string;
  name: string;
  quantity: number;
}

const HACHETTE_MODELS: HachetteModel[] = [
  // Issue 01 - Introduction
  { issue: 1, faction: 'Space Marines', name: 'Terminator Captain', quantity: 1 },
  { issue: 1, faction: 'Tyranids', name: 'Winged Tyranid Prime', quantity: 1 },
  // Issue 02
  { issue: 2, faction: 'Tyranids', name: 'Von Ryan Leapers', quantity: 3 },
  // Issue 03
  { issue: 3, faction: 'Space Marines', name: 'Infernus Marines', quantity: 5 },
  // Issue 05
  { issue: 5, faction: 'Space Marines', name: 'Infernus Sergeant', quantity: 1 },
  // Issue 06
  { issue: 6, faction: 'Tyranids', name: 'Barbgaunts', quantity: 5 },
  // Issue 07
  { issue: 7, faction: 'Tyranids', name: 'Termagants', quantity: 10 },
  { issue: 7, faction: 'Tyranids', name: 'Ripper Swarm', quantity: 2 },
  // Issue 08
  { issue: 8, faction: 'Tyranids', name: 'Termagants', quantity: 10 },
  { issue: 8, faction: 'Tyranids', name: 'Ripper Swarm', quantity: 2 },
  // Issue 10
  { issue: 10, faction: 'Space Marines', name: 'Terminator Librarian', quantity: 1 },
  // Issue 12
  { issue: 12, faction: 'Space Marines', name: 'Terminators', quantity: 5 },
  // Issue 13 (part 2 already counted in 12)
  // Issue 15
  { issue: 15, faction: 'Tyranids', name: 'Psychophage', quantity: 1 },
  // Issue 17
  { issue: 17, faction: 'Tyranids', name: 'Termagants', quantity: 10 },
  { issue: 17, faction: 'Tyranids', name: 'Ripper Swarm', quantity: 2 },
  // Issue 18
  { issue: 18, faction: 'Tyranids', name: 'Termagants', quantity: 10 },
  { issue: 18, faction: 'Tyranids', name: 'Ripper Swarm', quantity: 2 },
  // Issue 19
  { issue: 19, faction: 'Tyranids', name: 'Parasite of Mortrex', quantity: 1 },
  // Issue 20
  { issue: 20, faction: 'Space Marines', name: 'Chaplain on Bike', quantity: 1 },
  // Issue 21
  { issue: 21, faction: 'Aeldari', name: 'Farseer', quantity: 1 },
  // Issue 23
  { issue: 23, faction: 'Aeldari', name: 'Guardian Defenders', quantity: 5 },
  // Issue 24
  { issue: 24, faction: 'Aeldari', name: 'Guardian Defenders', quantity: 5 },
  // Issue 26
  { issue: 26, faction: 'Aeldari', name: 'Wraithlord', quantity: 1 },
  // Issue 27
  { issue: 27, faction: 'Aeldari', name: 'Windriders', quantity: 1 },
  // Issue 28
  { issue: 28, faction: 'Aeldari', name: 'Windriders', quantity: 1 },
  // Issue 29
  { issue: 29, faction: 'Aeldari', name: 'Windriders', quantity: 1 },
  // Issue 31
  { issue: 31, faction: 'Chaos Space Marines', name: 'Dark Apostle', quantity: 1 },
  // Issue 33
  { issue: 33, faction: 'Chaos Space Marines', name: 'Legionaries', quantity: 5 },
  // Issue 34
  { issue: 34, faction: 'Chaos Space Marines', name: 'Legionaries', quantity: 5 },
  // Issue 35
  { issue: 35, faction: 'Chaos Space Marines', name: 'Havocs', quantity: 5 },
  // Issue 36
  { issue: 36, faction: 'Chaos Space Marines', name: 'Havocs', quantity: 5 },
  // Issue 37
  { issue: 37, faction: 'Chaos Space Marines', name: 'Helbrute', quantity: 1 },
  // Issue 38
  { issue: 38, faction: 'Chaos Space Marines', name: 'Helbrute', quantity: 1 },
  // Issue 39
  { issue: 39, faction: 'Aeldari', name: 'Wraithguard', quantity: 5 },
  // Issue 40
  { issue: 40, faction: 'Chaos Space Marines', name: 'Terminators', quantity: 5 },
  // Issue 41
  { issue: 41, faction: 'Orks', name: 'Warboss', quantity: 1 },
  // Issue 43
  { issue: 43, faction: 'Orks', name: 'Boyz', quantity: 10 },
  // Issue 45
  { issue: 45, faction: 'Orks', name: 'Boyz', quantity: 10 },
  // Issue 47
  { issue: 47, faction: 'Orks', name: 'Deffkoptas', quantity: 3 },
  // Issue 48
  { issue: 48, faction: 'Orks', name: 'Deffkoptas', quantity: 3 },
  // Issue 49
  { issue: 49, faction: 'Orks', name: 'Deff Dread', quantity: 1 },
  // Issue 50
  { issue: 50, faction: 'Orks', name: 'Deff Dread', quantity: 1 },
  // Issue 52
  { issue: 52, faction: 'Leagues of Votann', name: 'Kahl', quantity: 1 },
  // Issue 53
  { issue: 53, faction: 'Leagues of Votann', name: 'Hearthkyn Warriors', quantity: 5 },
  // Issue 54
  { issue: 54, faction: 'Leagues of Votann', name: 'Hearthkyn Warriors', quantity: 5 },
  // Issue 55
  { issue: 55, faction: 'Leagues of Votann', name: 'Hernkyn Pioneers', quantity: 3 },
  // Issue 56
  { issue: 56, faction: 'Leagues of Votann', name: 'Hernkyn Pioneers', quantity: 3 },
  // Issue 57
  { issue: 57, faction: 'Leagues of Votann', name: 'Cthonian Beserks', quantity: 5 },
  // Issue 58
  { issue: 58, faction: 'Leagues of Votann', name: 'Cthonian Beserks', quantity: 5 },
  // Issue 59
  { issue: 59, faction: 'Orks', name: 'Beastsnagga Boyz', quantity: 10 },
  // Issue 60
  { issue: 60, faction: 'Leagues of Votann', name: 'Einhyr Hearthguard', quantity: 5 },
  // Issue 61
  { issue: 61, faction: 'Genestealer Cults', name: 'Magus', quantity: 1 },
  // Issue 63
  { issue: 63, faction: 'Genestealer Cults', name: 'Acolyte Hybrids', quantity: 5 },
  // Issue 64
  { issue: 64, faction: 'Genestealer Cults', name: 'Neophyte Hybrids', quantity: 10 },
  // Issue 65
  { issue: 65, faction: 'Genestealer Cults', name: 'Neophyte Hybrids', quantity: 10 },
  // Issue 66
  { issue: 66, faction: 'Genestealer Cults', name: 'Aberrants', quantity: 5 },
  // Issue 67
  { issue: 67, faction: 'Genestealer Cults', name: 'Neophyte Hybrids', quantity: 10 },
  // Issue 68
  { issue: 68, faction: 'Genestealer Cults', name: 'Neophyte Hybrids', quantity: 10 },
  // Issue 69
  { issue: 69, faction: 'Genestealer Cults', name: 'Goliath Rockgrinder', quantity: 1 },
  // Issue 70
  { issue: 70, faction: 'Genestealer Cults', name: 'Goliath Rockgrinder', quantity: 1 },
  // Issue 71
  { issue: 71, faction: 'Astra Militarum', name: 'Cadian Command Squad', quantity: 5 },
];

export async function addHachetteCollection() {
  let count = 0;
  for (const m of HACHETTE_MODELS) {
    await db.models.add({
      name: m.name,
      faction: m.faction,
      unitType: '',
      quantity: m.quantity,
      status: 'unbuilt',
      notes: `Hachette Combat Patrol Issue ${m.issue}`,
      photoUrl: '',
      createdAt: Date.now(),
      manufacturer: 'Games Workshop (Hachette)',
      gameSystem: 'Warhammer 40K',
      countsAs: '',
      pricePaid: 0,
      wishlist: false,
      points: 0,
      forceOrg: 'Other',
    });
    count++;
  }
  return count;
}

export { HACHETTE_MODELS };
