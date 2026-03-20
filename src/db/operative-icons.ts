// Unique icons per role and faction
const ROLE_ICONS: Record<string, string> = {
  leader: '★', fighter: '●', gunner: '◆', heavy: '■', scout: '▸', specialist: '✚',
};

const FACTION_LETTERS: Record<string, string> = {
  'Space Marines': 'SM', 'Astra Militarum': 'IG', 'Orks': 'OR', 'Necrons': 'NC',
  'Chaos Space Marines': 'CS', 'Tyranids': 'TY', 'Adepta Sororitas': 'AS',
  'Adeptus Mechanicus': 'AM', 'Adeptus Custodes': 'AC', 'Grey Knights': 'GK',
  'Death Guard': 'DG', 'Thousand Sons': 'TS', 'World Eaters': 'WE',
  'Tau Empire': 'TA', 'Aeldari': 'AE', 'Drukhari': 'DK',
};

export function getOpIcon(role: string): string {
  return ROLE_ICONS[role] || '●';
}

export function getOpLabel(faction: string): string {
  return FACTION_LETTERS[faction] || '??';
}

export function getOpColor(team: 'player' | 'enemy', role: string): string {
  if (team === 'player') {
    switch (role) {
      case 'leader': return '#4caf50';
      case 'gunner': return '#66bb6a';
      case 'heavy': return '#81c784';
      case 'scout': return '#a5d6a7';
      case 'specialist': return '#2e7d32';
      default: return '#388e3c';
    }
  } else {
    switch (role) {
      case 'leader': return '#f44336';
      case 'gunner': return '#ef5350';
      case 'heavy': return '#e57373';
      case 'scout': return '#ef9a9a';
      case 'specialist': return '#c62828';
      default: return '#d32f2f';
    }
  }
}
