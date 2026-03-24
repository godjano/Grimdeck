const b = import.meta.env.BASE_URL;

const ICONS: Record<string, string> = {
  home: 'icon-star-shield.png',
  models: 'icon-shield.png',
  paints: 'icon-palette.png',
  skull: 'icon-skull.png',
  progress: 'icon-trophy.png',
  campaigns: 'icon-sword.png',
  guides: 'icon-book.png',
  inspiration: 'icon-grimoire.png',
  community: 'icon-shield.png',
  settings: 'icon-gear.png',
  aquila: 'icon-aquila.png',
  medal: 'icon-medal.png',
  'skull-cog': 'icon-skull-cog.png',
  'chaos-skull': 'icon-chaos-skull.png',
  target: 'icon-target.png',
  // Trophy set 1
  brushes: 'icon-brushes.png',
  'paint-pot': 'icon-paint-pot.png',
  bases: 'icon-bases.png',
  lens: 'icon-lens.png',
  tome: 'icon-tome.png',
  chest: 'icon-chest.png',
  'swords-chest': 'icon-swords-chest.png',
  'flame-skull': 'icon-flame-skull.png',
  'winged-hour': 'icon-winged-hour.png',
  // Trophy set 2
  crown: 'icon-crown.png',
  'cog-eye': 'icon-cog-eye.png',
  lightning: 'icon-lightning.png',
  dragon: 'icon-dragon.png',
  'star-shield2': 'icon-star-shield2.png',
  chalice: 'icon-chalice.png',
  hammer: 'icon-hammer.png',
  'chain-skull': 'icon-chain-skull.png',
  sunburst: 'icon-sunburst.png',
};

export default function GoldIcon({ name, size = 20 }: { name: keyof typeof ICONS | string; size?: number }) {
  const file = ICONS[name];
  if (!file) return null;
  return <img src={`${b}decor/${file}`} alt="" width={size} height={size} style={{ objectFit: 'contain' }} />;
}
