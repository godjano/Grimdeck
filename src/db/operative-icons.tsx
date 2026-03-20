// Custom SVG tactical icons per role — silhouette style, no IP issues
// Each returns an SVG string sized for the board (16px) or cards (24px)

const svgs: Record<string, string> = {
  leader: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 4.8L20 7.6l-4 3.9.9 5.5L12 14.5 7.1 17l.9-5.5-4-3.9 5.6-.8z"/><path d="M12 17v5M8 22h8" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>`,
  fighter: `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="3"/><path d="M8 10h8l1 6h-2l-.5 6h-5L9 16H7z"/></svg>`,
  gunner: `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="10" cy="5" r="3"/><path d="M6 10h8l1 5h-2l-.5 7h-5L7 15H5z"/><path d="M16 8l5-3M16 8l5 1M16 8h-2" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round"/></svg>`,
  heavy: `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="3"/><path d="M7 10h10l1 5h-2l-.5 7h-7L8 15H6z"/><rect x="4" y="9" width="4" height="6" rx="1"/><rect x="16" y="9" width="4" height="6" rx="1"/></svg>`,
  scout: `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2.5"/><path d="M9 9h6l.5 4h-1.5l-.5 6h-3L10 13H8.5z"/><path d="M12 2v-0" stroke="currentColor" stroke-width="0"/><path d="M6 7l3 2M18 7l-3 2" stroke="currentColor" stroke-width="1.2" fill="none" stroke-linecap="round"/><circle cx="12" cy="5" r="5" fill="none" stroke="currentColor" stroke-width="0.8" stroke-dasharray="2 2"/></svg>`,
  specialist: `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="3"/><path d="M8 10h8l1 5h-2l-.5 7h-5L9 15H7z"/><path d="M12 10v-0"/><rect x="10" y="1" width="4" height="2" rx="0.5" fill="currentColor" opacity="0.6"/><circle cx="12" cy="5" r="4.5" fill="none" stroke="currentColor" stroke-width="0.7"/></svg>`,
};

// Faction-themed background patterns for cards
const factionEmoji: Record<string, string> = {
  'Space Marines': '🦅',
  'Astra Militarum': '🎖️',
  'Adepta Sororitas': '🔥',
  'Adeptus Mechanicus': '⚙️',
  'Adeptus Custodes': '👑',
  'Grey Knights': '⚡',
  'Chaos Space Marines': '😈',
  'Death Guard': '☠️',
  'Thousand Sons': '🔮',
  'World Eaters': '🩸',
  'Chaos Daemons': '👹',
  'Orks': '💀',
  'Tau Empire': '🎯',
  'Tyranids': '🐛',
  'Necrons': '💎',
  'Aeldari': '✨',
  'Drukhari': '🗡️',
  'Genestealer Cults': '🧬',
  'Leagues of Votann': '⛏️',
};

export function getRoleSvg(role: string, _size = 24, color = 'currentColor'): string {
  const svg = svgs[role] || svgs.fighter;
  return svg.replace(/currentColor/g, color);
}

export function getFactionEmoji(faction: string): string {
  return factionEmoji[faction] || '⚔️';
}

// For React: render as inline HTML
export function RoleIcon({ role, size = 24, color = 'currentColor' }: { role: string; size?: number; color?: string }) {
  const svg = getRoleSvg(role, size, color);
  return <span style={{ width: size, height: size, display: 'inline-flex' }} dangerouslySetInnerHTML={{ __html: svg }} />;
}

export function BoardToken({ role, size = 18 }: { role: string; team: 'player' | 'enemy'; size?: number }) {
  const color = '#fff';
  const svg = getRoleSvg(role, size, color);
  return (
    <span style={{ width: size, height: size, display: 'inline-flex' }} dangerouslySetInnerHTML={{ __html: svg }} />
  );
}

// Role labels for legend
export const ROLE_INFO: { role: string; label: string; desc: string }[] = [
  { role: 'leader', label: 'Leader', desc: 'Commander — star icon' },
  { role: 'fighter', label: 'Fighter', desc: 'Standard trooper' },
  { role: 'gunner', label: 'Gunner', desc: 'Ranged specialist — rifle' },
  { role: 'heavy', label: 'Heavy', desc: 'Heavy weapons — armoured' },
  { role: 'scout', label: 'Scout', desc: 'Recon — dashed ring' },
  { role: 'specialist', label: 'Specialist', desc: 'Support — halo ring' },
];
