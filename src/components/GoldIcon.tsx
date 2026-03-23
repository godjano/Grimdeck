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
};

export default function GoldIcon({ name, size = 20 }: { name: keyof typeof ICONS | string; size?: number }) {
  const file = ICONS[name];
  if (!file) return null;
  return <img src={`${b}decor/${file}`} alt="" width={size} height={size} style={{ objectFit: 'contain' }} />;
}
