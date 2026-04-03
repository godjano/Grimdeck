import { db } from '../db';

// Parse BattleScribe .ros/.rosz XML roster files
export async function importBattleScribe(file: File): Promise<{ count: number; faction: string }> {
  const text = await file.text();

  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'text/xml');

  // Try BattleScribe format
  const roster = doc.querySelector('roster');
  const rosterName = roster?.getAttribute('name') || 'Imported Army';
  const gameSystem = roster?.getAttribute('gameSystemName') || 'Warhammer 40K';

  // Find all selections (units)
  const selections = doc.querySelectorAll('selection[type="model"], selection[type="unit"], selection[type="upgrade"]');
  let count = 0;
  let faction = 'Unknown';

  // Try to get faction from force
  const force = doc.querySelector('force');
  if (force) {
    faction = force.getAttribute('catalogueName')?.replace(/- .*/, '').trim() || faction;
  }

  for (const sel of selections) {
    const type = sel.getAttribute('type');
    if (type === 'upgrade') continue; // skip upgrades, only import units/models

    const name = sel.getAttribute('name') || 'Unknown Unit';
    const qty = parseInt(sel.getAttribute('number') || '1');

    // Get points from costs
    let points = 0;
    const costs = sel.querySelectorAll('cost');
    for (const cost of costs) {
      if (cost.getAttribute('name') === 'pts') {
        points = Math.round(parseFloat(cost.getAttribute('value') || '0'));
      }
    }

    // Get unit type from categories
    let unitType = 'Infantry';
    let forceOrg = 'Other';
    const categories = sel.querySelectorAll('category');
    for (const cat of categories) {
      const catName = cat.getAttribute('name') || '';
      if (catName.includes('HQ') || catName.includes('Character')) { forceOrg = 'HQ'; unitType = 'Character'; }
      else if (catName.includes('Troops') || catName.includes('Battleline')) { forceOrg = 'Troops'; unitType = 'Battleline'; }
      else if (catName.includes('Elite')) forceOrg = 'Elites';
      else if (catName.includes('Fast')) forceOrg = 'Fast Attack';
      else if (catName.includes('Heavy')) forceOrg = 'Heavy Support';
      else if (catName.includes('Transport')) { forceOrg = 'Dedicated Transport'; unitType = 'Transport'; }
      else if (catName.includes('Lord of War')) forceOrg = 'Lord of War';
      else if (catName.includes('Flyer')) { forceOrg = 'Flyer'; unitType = 'Vehicle'; }
    }

    await db.models.add({
      name, faction, unitType, quantity: qty, status: 'unbuilt',
      notes: `Imported from ${rosterName}`, photoUrl: '', createdAt: Date.now(),
      manufacturer: 'Games Workshop', gameSystem: gameSystem.includes('40') ? 'Warhammer 40K' : gameSystem,
      countsAs: '', pricePaid: 0, wishlist: false, points, forceOrg,
    });
    count++;
  }

  // If no selections found, try a simpler parse (plain text army list)
  if (count === 0) {
    const lines = text.split('\n').filter(l => l.trim() && !l.startsWith('#') && !l.startsWith('//'));
    for (const line of lines) {
      const match = line.match(/^(.+?)(?:\s*[x×]\s*(\d+))?\s*(?:(\d+)\s*pts?)?\s*$/i);
      if (match) {
        await db.models.add({
          name: match[1].trim(), faction, unitType: 'Infantry', quantity: parseInt(match[2] || '1'),
          status: 'unbuilt', notes: 'Imported from text list', photoUrl: '', createdAt: Date.now(),
          manufacturer: 'Games Workshop', gameSystem: 'Warhammer 40K',
          countsAs: '', pricePaid: 0, wishlist: false, points: parseInt(match[3] || '0'), forceOrg: 'Other',
        });
        count++;
      }
    }
  }

  return { count, faction };
}
