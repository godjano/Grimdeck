export interface CreatorRecipe {
  name: string;
  creator: string;
  creatorChannel: string;
  faction: string;
  model: string;
  videoUrl: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  paints: { name: string; hex: string; step: string }[];
}

export const CREATORS = [
  { name: 'Squidmar', channel: 'https://youtube.com/@squidmar', specialty: 'Entertainment & advanced techniques' },
  { name: 'Ninjon', channel: 'https://youtube.com/@ninjon', specialty: 'Creative & artistic approaches' },
  { name: 'Duncan Rhodes', channel: 'https://youtube.com/@duncanrhodes', specialty: 'Two thin coats! Classic GW techniques' },
  { name: 'Darren Latham', channel: 'https://youtube.com/@darrenlatham', specialty: 'Ex-GW Eavy Metal, masterclass level' },
  { name: 'Trovarion', channel: 'https://youtube.com/@trovarion', specialty: 'Display quality, competition painting' },
  { name: 'Miniac', channel: 'https://youtube.com/@miniac', specialty: 'Theory, techniques, improvement' },
  { name: 'Juan Hidalgo', channel: 'https://youtube.com/@juanhidalgo', specialty: 'Speed painting, army painting' },
  { name: 'Artis Opus', channel: 'https://youtube.com/@artisopus', specialty: 'Drybrush techniques' },
  { name: 'Sonic Sledgehammer', channel: 'https://youtube.com/@sonicsledgehammer', specialty: 'Speed painting, contrast paints' },
  { name: 'Zumikito', channel: 'https://youtube.com/@zumikito', specialty: 'Quick tutorials, batch painting' },
  { name: 'Midwinter Minis', channel: 'https://youtube.com/@midwinterminis', specialty: 'Speed painting, army building' },
  { name: 'Pete The Wargamer', channel: 'https://youtube.com/@petethewargamer', specialty: 'Terrain, conversions, painting' },
  { name: 'Warhipster', channel: 'https://youtube.com/@warhipster', specialty: 'Tutorials, reviews, hobby tips' },
  { name: 'Cult of Paint', channel: 'https://youtube.com/@cultofpaint', specialty: 'Advanced techniques, masterclass' },
  { name: 'Vince Venturella', channel: 'https://youtube.com/@vinceventurella', specialty: 'Hobby Cheating series, 500+ tutorials' },
];

export const CREATOR_RECIPES: CreatorRecipe[] = [
  // ─── Duncan Rhodes Style ───
  { name: 'Classic Ultramarine', creator: 'Duncan Rhodes', creatorChannel: 'https://youtube.com/@duncanrhodes',
    faction: 'Space Marines', model: 'Intercessor', videoUrl: 'https://youtube.com/results?search_query=duncan+rhodes+ultramarine+intercessor', difficulty: 'beginner',
    paints: [
      { name: 'Macragge Blue', hex: '#0d407f', step: 'Base coat (two thin coats!)' },
      { name: 'Nuln Oil', hex: '#14100e', step: 'Shade all over' },
      { name: 'Calgar Blue', hex: '#4272b8', step: 'Layer raised areas' },
      { name: 'Fenrisian Grey', hex: '#6d94b3', step: 'Edge highlight' },
    ] },

  // ─── Squidmar Style ───
  { name: 'Speed Painted Ork', creator: 'Squidmar', creatorChannel: 'https://youtube.com/@squidmar',
    faction: 'Orks', model: 'Ork Boy', videoUrl: 'https://youtube.com/results?search_query=squidmar+ork+speed+paint', difficulty: 'beginner',
    paints: [
      { name: 'Wraithbone', hex: '#dbd1b2', step: 'Spray prime' },
      { name: 'Ork Flesh', hex: '#3e7a35', step: 'Contrast on skin' },
      { name: 'Snakebite Leather', hex: '#9c6b08', step: 'Contrast on cloth' },
      { name: 'Black Templar', hex: '#1c1e22', step: 'Contrast on metal/gun' },
      { name: 'Leadbelcher', hex: '#888d91', step: 'Drybrush metals' },
    ] },

  // ─── Midwinter Minis Style ───
  { name: 'Battle Ready Necrons (10 min)', creator: 'Midwinter Minis', creatorChannel: 'https://youtube.com/@midwinterminis',
    faction: 'Necrons', model: 'Necron Warrior', videoUrl: 'https://youtube.com/results?search_query=midwinter+minis+necron+speed+paint', difficulty: 'beginner',
    paints: [
      { name: 'Leadbelcher', hex: '#888d91', step: 'Spray prime' },
      { name: 'Nuln Oil', hex: '#14100e', step: 'Wash everything' },
      { name: 'Necron Compound', hex: '#b4b8b0', step: 'Drybrush' },
      { name: 'Tesseract Glow', hex: '#40e040', step: 'Eyes and energy' },
    ] },

  // ─── Sonic Sledgehammer Style ───
  { name: 'Contrast Death Guard', creator: 'Sonic Sledgehammer', creatorChannel: 'https://youtube.com/@sonicsledgehammer',
    faction: 'Death Guard', model: 'Plague Marine', videoUrl: 'https://youtube.com/results?search_query=sonic+sledgehammer+death+guard+contrast', difficulty: 'beginner',
    paints: [
      { name: 'Wraithbone', hex: '#dbd1b2', step: 'Spray prime' },
      { name: 'Militarum Green', hex: '#7a7d45', step: 'Contrast on armour' },
      { name: 'Gore-Grunta Fur', hex: '#6e3b2a', step: 'Contrast on trim' },
      { name: 'Guilliman Flesh', hex: '#d1a570', step: 'Contrast on skin' },
      { name: "Nurgle's Rot", hex: '#9aaa1a', step: 'Slime effects' },
    ] },

  // ─── Ninjon Style ───
  { name: 'Grimdark Space Marine', creator: 'Ninjon', creatorChannel: 'https://youtube.com/@ninjon',
    faction: 'Space Marines', model: 'Any Marine', videoUrl: 'https://youtube.com/results?search_query=ninjon+grimdark+space+marine', difficulty: 'intermediate',
    paints: [
      { name: 'Mechanicus Standard Grey', hex: '#3d4b4d', step: 'Base coat armour' },
      { name: 'Nuln Oil', hex: '#14100e', step: 'Heavy shade' },
      { name: 'Agrax Earthshade', hex: '#5a3601', step: 'Streaking grime' },
      { name: 'Administratum Grey', hex: '#949b95', step: 'Sponge highlight' },
      { name: 'Leadbelcher', hex: '#888d91', step: 'Sponge chip damage' },
    ] },

  // ─── Miniac Style ───
  { name: 'NMM Steel Armour', creator: 'Miniac', creatorChannel: 'https://youtube.com/@miniac',
    faction: 'Any', model: 'Any Armoured', videoUrl: 'https://youtube.com/results?search_query=miniac+nmm+steel+tutorial', difficulty: 'advanced',
    paints: [
      { name: 'Abaddon Black', hex: '#231f20', step: 'Darkest shadow' },
      { name: 'Dark Reaper', hex: '#3b5150', step: 'Shadow tone' },
      { name: 'Thunderhawk Blue', hex: '#417074', step: 'Mid-tone' },
      { name: 'Fenrisian Grey', hex: '#6d94b3', step: 'Highlight' },
      { name: 'Ulthuan Grey', hex: '#c4ddd2', step: 'Bright highlight' },
      { name: 'White Scar', hex: '#ffffff', step: 'Reflection dots' },
    ] },

  // ─── Vince Venturella Style ───
  { name: 'Hobby Cheating Tyranids', creator: 'Vince Venturella', creatorChannel: 'https://youtube.com/@vinceventurella',
    faction: 'Tyranids', model: 'Termagant', videoUrl: 'https://youtube.com/results?search_query=vince+venturella+tyranid+speed+paint', difficulty: 'beginner',
    paints: [
      { name: 'Wraithbone', hex: '#dbd1b2', step: 'Spray prime' },
      { name: 'Skeleton Horde', hex: '#c4a96a', step: 'Contrast skin' },
      { name: 'Shyish Purple', hex: '#5a3667', step: 'Contrast carapace' },
      { name: 'Wyldwood', hex: '#4b3a2e', step: 'Contrast claws' },
    ] },

  // ─── Trovarion Style ───
  { name: 'Display Quality Face', creator: 'Trovarion', creatorChannel: 'https://youtube.com/@trovarion',
    faction: 'Any', model: 'Any with exposed face', videoUrl: 'https://youtube.com/results?search_query=trovarion+face+painting+miniature', difficulty: 'advanced',
    paints: [
      { name: 'Bugmans Glow', hex: '#834f44', step: 'Base coat' },
      { name: 'Cadian Fleshtone', hex: '#c77958', step: 'Layer' },
      { name: 'Kislev Flesh', hex: '#d6a875', step: 'Highlight' },
      { name: 'Reikland Fleshshade', hex: '#ca6c4d', step: 'Glaze shadows' },
      { name: 'Pallid Wych Flesh', hex: '#cdcebe', step: 'Nose, brow, chin highlight' },
      { name: 'Mephiston Red', hex: '#9a1115', step: 'Thin glaze on lips, nose tip' },
    ] },

  // ─── Juan Hidalgo Style ───
  { name: 'Army Painting Blood Angels', creator: 'Juan Hidalgo', creatorChannel: 'https://youtube.com/@juanhidalgo',
    faction: 'Space Marines', model: 'Any Blood Angel', videoUrl: 'https://youtube.com/results?search_query=juan+hidalgo+blood+angels+speed', difficulty: 'beginner',
    paints: [
      { name: 'Mephiston Red', hex: '#9a1115', step: 'Spray/base coat' },
      { name: 'Agrax Earthshade', hex: '#5a3601', step: 'All-over shade' },
      { name: 'Evil Sunz Scarlet', hex: '#c01411', step: 'Quick layer' },
      { name: 'Retributor Armour', hex: '#c39e5a', step: 'Gold details' },
      { name: 'Abaddon Black', hex: '#231f20', step: 'Gun and joints' },
    ] },

  // ─── Artis Opus Style ───
  { name: 'Drybrush-Only Stormcast', creator: 'Artis Opus', creatorChannel: 'https://youtube.com/@artisopus',
    faction: 'Any', model: 'Any Armoured', videoUrl: 'https://youtube.com/results?search_query=artis+opus+drybrush+only+tutorial', difficulty: 'beginner',
    paints: [
      { name: 'Rhinox Hide', hex: '#462f30', step: 'Base coat' },
      { name: 'Mournfang Brown', hex: '#640909', step: 'Heavy drybrush' },
      { name: 'Retributor Armour', hex: '#c39e5a', step: 'Medium drybrush' },
      { name: 'Liberator Gold', hex: '#c8a244', step: 'Light drybrush' },
      { name: 'Stormhost Silver', hex: '#bbc6c9', step: 'Edge drybrush' },
    ] },

  // ─── Pete The Wargamer Style ───
  { name: 'Quick Astra Militarum', creator: 'Pete The Wargamer', creatorChannel: 'https://youtube.com/@petethewargamer',
    faction: 'Astra Militarum', model: 'Cadian', videoUrl: 'https://youtube.com/results?search_query=pete+wargamer+cadian+speed+paint', difficulty: 'beginner',
    paints: [
      { name: 'Wraithbone', hex: '#dbd1b2', step: 'Spray prime' },
      { name: 'Militarum Green', hex: '#7a7d45', step: 'Contrast fatigues' },
      { name: 'Basilicanum Grey', hex: '#989897', step: 'Contrast armour' },
      { name: 'Guilliman Flesh', hex: '#d1a570', step: 'Contrast skin' },
      { name: 'Leadbelcher', hex: '#888d91', step: 'Gun metal' },
    ] },

  // ─── Cult of Paint Style ───
  { name: 'Blanchitsu Grimdark', creator: 'Cult of Paint', creatorChannel: 'https://youtube.com/@cultofpaint',
    faction: 'Any', model: 'Any', videoUrl: 'https://youtube.com/results?search_query=cult+of+paint+blanchitsu+grimdark', difficulty: 'advanced',
    paints: [
      { name: 'Wraithbone', hex: '#dbd1b2', step: 'Zenithal prime' },
      { name: 'Skeleton Horde', hex: '#c4a96a', step: 'All-over contrast' },
      { name: 'Agrax Earthshade', hex: '#5a3601', step: 'Heavy grime wash' },
      { name: 'Typhus Corrosion', hex: '#3a3020', step: 'Stipple texture' },
      { name: 'Screaming Skull', hex: '#bfca7a', step: 'Drybrush highlights' },
    ] },
];
