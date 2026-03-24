const b = import.meta.env.BASE_URL;

const ICONS: Record<string, string> = {
  home: 'icon-compass.png',
  models: 'icon-figurine.png',
  paints: 'icon-palette2.png',
  skull: 'icon-skull2.png',
  progress: 'icon-trophy2.png',
  campaigns: 'icon-swords2.png',
  guides: 'icon-book2.png',
  inspiration: 'icon-eagle-shield.png',
  community: 'icon-eagle-shield.png',
  'eagle-shield': 'icon-eagle-shield.png',
  settings: 'icon-gear2.png',
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
  // Weapon icons
  pistol: 'icon-pistol.png',
  sword2: 'icon-sword2.png',
  'round-shield': 'icon-round-shield.png',
  grenade: 'icon-grenade.png',
  scope: 'icon-scope.png',
  fist: 'icon-fist.png',
};

export default function GoldIcon({ name, size = 20 }: { name: keyof typeof ICONS | string; size?: number }) {
  const file = ICONS[name];
  if (!file) return null;
  return <img src={`${b}decor/${file}`} alt="" width={size} height={size} style={{ objectFit: 'contain' }} />;
}
