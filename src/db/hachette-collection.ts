// Hachette Combat Patrol collection - Issues 1-72
// Models combined where they span multiple issues (e.g. Part 1 + Part 2 = 1 model)

import { db } from './index';

interface HachetteModel {
  issues: string;
  faction: string;
  name: string;
  quantity: number;
}

const HACHETTE_MODELS: HachetteModel[] = [
  // Space Marines
  { issues: '1', faction: 'Space Marines', name: 'Terminator Captain', quantity: 1 },
  { issues: '3,5', faction: 'Space Marines', name: 'Infernus Marines', quantity: 5 },
  { issues: '5', faction: 'Space Marines', name: 'Infernus Sergeant', quantity: 1 },
  { issues: '10', faction: 'Space Marines', name: 'Terminator Librarian', quantity: 1 },
  { issues: '12-13', faction: 'Space Marines', name: 'Terminators', quantity: 5 },
  { issues: '20', faction: 'Space Marines', name: 'Chaplain on Bike', quantity: 1 },

  // Tyranids
  { issues: '1', faction: 'Tyranids', name: 'Winged Tyranid Prime', quantity: 1 },
  { issues: '2', faction: 'Tyranids', name: 'Von Ryan Leapers', quantity: 3 },
  { issues: '6', faction: 'Tyranids', name: 'Barbgaunts', quantity: 5 },
  { issues: '7-8', faction: 'Tyranids', name: 'Termagants (batch 1)', quantity: 20 },
  { issues: '15', faction: 'Tyranids', name: 'Psychophage', quantity: 1 },
  { issues: '17-18', faction: 'Tyranids', name: 'Termagants (batch 2)', quantity: 20 },
  { issues: '19', faction: 'Tyranids', name: 'Parasite of Mortrex', quantity: 1 },

  // Aeldari
  { issues: '21', faction: 'Aeldari', name: 'Farseer', quantity: 1 },
  { issues: '23-24', faction: 'Aeldari', name: 'Guardian Defenders', quantity: 10 },
  { issues: '26', faction: 'Aeldari', name: 'Wraithlord', quantity: 1 },
  { issues: '27-29', faction: 'Aeldari', name: 'Windriders', quantity: 3 },
  { issues: '39', faction: 'Aeldari', name: 'Wraithguard', quantity: 5 },

  // Chaos Space Marines
  { issues: '31', faction: 'Chaos Space Marines', name: 'Dark Apostle', quantity: 1 },
  { issues: '33-34', faction: 'Chaos Space Marines', name: 'Legionaries', quantity: 10 },
  { issues: '35-36', faction: 'Chaos Space Marines', name: 'Havocs', quantity: 10 },
  { issues: '37-38', faction: 'Chaos Space Marines', name: 'Helbrute', quantity: 1 },
  { issues: '40', faction: 'Chaos Space Marines', name: 'Terminators', quantity: 5 },

  // Orks
  { issues: '41', faction: 'Orks', name: 'Warboss', quantity: 1 },
  { issues: '43,45', faction: 'Orks', name: 'Boyz', quantity: 20 },
  { issues: '47-48', faction: 'Orks', name: 'Deffkoptas', quantity: 3 },
  { issues: '49-50', faction: 'Orks', name: 'Deff Dread', quantity: 1 },
  { issues: '59', faction: 'Orks', name: 'Beastsnagga Boyz', quantity: 10 },

  // Leagues of Votann
  { issues: '52', faction: 'Leagues of Votann', name: 'Kahl', quantity: 1 },
  { issues: '53-54', faction: 'Leagues of Votann', name: 'Hearthkyn Warriors', quantity: 10 },
  { issues: '55-56', faction: 'Leagues of Votann', name: 'Hernkyn Pioneers', quantity: 3 },
  { issues: '57-58', faction: 'Leagues of Votann', name: 'Cthonian Beserks', quantity: 5 },
  { issues: '60', faction: 'Leagues of Votann', name: 'Einhyr Hearthguard', quantity: 5 },

  // Genestealer Cults
  { issues: '61', faction: 'Genestealer Cults', name: 'Magus', quantity: 1 },
  { issues: '63', faction: 'Genestealer Cults', name: 'Acolyte Hybrids', quantity: 5 },
  { issues: '64-65,67-68', faction: 'Genestealer Cults', name: 'Neophyte Hybrids', quantity: 40 },
  { issues: '66', faction: 'Genestealer Cults', name: 'Aberrants', quantity: 5 },
  { issues: '69-70', faction: 'Genestealer Cults', name: 'Goliath Rockgrinder', quantity: 1 },

  // Astra Militarum
  { issues: '71', faction: 'Astra Militarum', name: 'Cadian Command Squad', quantity: 5 },
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
      notes: `Hachette Combat Patrol Issues ${m.issues}`,
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
