import { useState } from 'react';

type Tab = 'techniques' | 'recipes' | 'tips';

interface Technique {
  name: string;
  difficulty: string;
  desc: string;
  steps: string[];
  when: string;
}

interface Recipe {
  name: string;
  faction: string;
  area: string;
  paints: { name: string; hex: string; step: string }[];
}

const TECHNIQUES: Technique[] = [
  { name: 'Base Coating', difficulty: '🟢', desc: 'Applying the first solid colour over primer. Foundation of every paint job.',
    steps: ['Thin paint with water (~1:1 ratio)', 'Load brush, wipe excess on palette', 'Apply in smooth strokes following the surface', 'Let dry completely', 'Apply second thin coat for full coverage'],
    when: 'Every model, every time. This is step one.' },
  { name: 'Washing / Shading', difficulty: '🟢', desc: 'Applying thin, dark paint that flows into recesses to create shadows and definition.',
    steps: ['Apply wash liberally over the area', 'Let it flow naturally into recesses', 'Wick away pooling on flat surfaces with a dry brush', 'Let dry completely (10-15 min)', 'Don\'t touch it while drying!'],
    when: 'After base coating. The single biggest improvement to any model.' },
  { name: 'Drybrushing', difficulty: '🟢', desc: 'Loading a brush with paint, wiping most off, then dragging across raised surfaces.',
    steps: ['Load brush with paint', 'Wipe 90% off on paper towel until almost no paint transfers', 'Drag brush lightly across raised edges and textures', 'Build up gradually — you can always add more', 'Use a dedicated drybrush (flat, stiff bristles)'],
    when: 'Great for textured surfaces, fur, chainmail, rocks, quick highlights.' },
  { name: 'Layering', difficulty: '🟠', desc: 'Building up progressively lighter colours on raised areas, leaving darker tones in recesses.',
    steps: ['Start with your base colour', 'Mix or use a lighter shade', 'Apply to raised areas only, leaving base colour showing in recesses', 'Use progressively smaller areas for each lighter layer', 'Keep paint thin — multiple passes are better than one thick one'],
    when: 'When you want smooth colour transitions and defined highlights.' },
  { name: 'Edge Highlighting', difficulty: '🟠', desc: 'Painting thin lines of lighter colour along every edge of armour panels.',
    steps: ['Use the side of your brush, not the tip', 'Load very little paint', 'Drag along the edge in one smooth motion', 'Brace your painting hand against your other hand', 'Fix mistakes by going back with the base colour'],
    when: 'Final step on armour. Makes models look sharp and defined.' },
  { name: 'Wet Blending', difficulty: '🔴', desc: 'Blending two colours together while both are still wet on the model.',
    steps: ['Apply colour A to one area', 'Immediately apply colour B to the adjacent area', 'Where they meet, use a clean damp brush to blend', 'Work quickly before paint dries', 'Use a wet palette to keep paints workable longer'],
    when: 'Cloaks, power swords, large flat surfaces where you want smooth gradients.' },
  { name: 'Glazing', difficulty: '🔴', desc: 'Applying extremely thin, transparent layers of colour to tint or smooth transitions.',
    steps: ['Thin paint heavily (5:1 water to paint or more)', 'It should be almost like coloured water', 'Apply in smooth strokes over the area', 'Let each layer dry before applying the next', 'Build up colour gradually over 3-5 layers'],
    when: 'Smoothing transitions, tinting areas, NMM work, colour correction.' },
  { name: 'Non-Metallic Metal (NMM)', difficulty: '🔴', desc: 'Painting the illusion of metal using regular matte paints instead of metallic paints.',
    steps: ['Study real metal reflections — they have sharp contrast', 'Paint darkest shadow colour first', 'Layer progressively lighter tones', 'Add sharp white highlights at reflection points', 'Glaze to smooth transitions', 'Key: high contrast between dark and light areas'],
    when: 'Competition painting, display pieces. Very time-intensive but stunning results.' },
  { name: 'Object Source Lighting (OSL)', difficulty: '🔴', desc: 'Painting the effect of light emanating from a source on the model (plasma, fire, magic).',
    steps: ['Paint the model normally first', 'Identify the light source and what surfaces it would hit', 'Paint the source itself the brightest (white/near-white)', 'Glaze progressively darker tones radiating outward', 'Light intensity drops with distance (inverse square law)', 'Affected surfaces should be tinted with the light colour'],
    when: 'Plasma weapons, magical effects, fire, glowing eyes. Applied last.' },
  { name: 'Stippling', difficulty: '🟠', desc: 'Dabbing paint on with the tip of the brush to create texture.',
    steps: ['Use an old brush or dedicated stippling brush', 'Load paint, remove most on paper towel', 'Dab vertically onto the surface (don\'t drag)', 'Build up gradually for density', 'Great for creating weathering, rust, or organic textures'],
    when: 'Rust effects, battle damage, organic textures, terrain.' },
  { name: 'Sponge Weathering', difficulty: '🟢', desc: 'Using torn sponge to apply random paint chips and battle damage.',
    steps: ['Tear a small piece of blister pack sponge', 'Dip in dark paint (black or dark brown)', 'Dab off excess on paper towel', 'Lightly dab onto edges and areas that would see wear', 'Follow up with a lighter colour (silver/metal) inside the chips'],
    when: 'Vehicles, armour, anything that should look battle-worn.' },
  { name: 'Contrast / Speed Painting', difficulty: '🟢', desc: 'Using contrast or speed paints over a light primer for one-coat shading and highlighting.',
    steps: ['Prime white or light bone colour', 'Apply one thick coat of contrast paint', 'Let it flow into recesses naturally', 'Do NOT go back over areas already painted', 'One coat does base, shade, and highlight simultaneously'],
    when: 'Batch painting, horde armies, getting models table-ready fast.' },
  { name: 'Zenithal Priming', difficulty: '🟠', desc: 'Two-tone priming that creates a natural light map on the model.',
    steps: ['Spray entire model black', 'Spray white from directly above (45° angle)', 'Areas facing up = white (highlights)', 'Areas facing down = black (shadows)', 'Apply contrast/thin paints over this for instant shading'],
    when: 'Before contrast paints, speed painting, or as a guide for where to place highlights.' },
  { name: 'Feathering', difficulty: '🟠', desc: 'Creating smooth blends by applying thin lines of progressively lighter paint.',
    steps: ['Start with base colour', 'Apply thin lines of the next lighter shade', 'Each line should be thinner and cover less area', 'Leave gaps between lines — they blend visually', 'Works best on large curved surfaces'],
    when: 'Alternative to wet blending. More controlled, works on dried paint.' },
];

const RECIPES: Recipe[] = [
  { name: 'Classic Ultramarine Blue', faction: 'Space Marines', area: 'Armour',
    paints: [{ name: 'Macragge Blue', hex: '#0d407f', step: 'Base coat' }, { name: 'Nuln Oil', hex: '#14100e', step: 'Shade all over' }, { name: 'Calgar Blue', hex: '#4272b8', step: 'Layer raised areas' }, { name: 'Fenrisian Grey', hex: '#6d94b3', step: 'Edge highlight' }] },
  { name: 'Blood Angels Red', faction: 'Space Marines', area: 'Armour',
    paints: [{ name: 'Mephiston Red', hex: '#9a1115', step: 'Base coat' }, { name: 'Agrax Earthshade', hex: '#5a3601', step: 'Shade recesses' }, { name: 'Evil Sunz Scarlet', hex: '#c01411', step: 'Layer' }, { name: 'Wild Rider Red', hex: '#ea2f28', step: 'Edge highlight' }] },
  { name: 'Dark Angels Green', faction: 'Space Marines', area: 'Armour',
    paints: [{ name: 'Caliban Green', hex: '#003d15', step: 'Base coat' }, { name: 'Nuln Oil', hex: '#14100e', step: 'Shade' }, { name: 'Warpstone Glow', hex: '#1e7331', step: 'Layer' }, { name: 'Moot Green', hex: '#3daf44', step: 'Edge highlight' }] },
  { name: 'Death Guard Armour', faction: 'Death Guard', area: 'Armour',
    paints: [{ name: 'Death Guard Green', hex: '#6d6e48', step: 'Base coat' }, { name: 'Agrax Earthshade', hex: '#5a3601', step: 'Shade all over' }, { name: 'Ogryn Camo', hex: '#9da94b', step: 'Highlight edges' }, { name: 'Typhus Corrosion', hex: '#3a3020', step: 'Stipple for grime' }] },
  { name: 'Necron Metal', faction: 'Necrons', area: 'Body',
    paints: [{ name: 'Leadbelcher', hex: '#888d91', step: 'Base coat (or spray)' }, { name: 'Nuln Oil', hex: '#14100e', step: 'Shade all over' }, { name: 'Runefang Steel', hex: '#a5a9ad', step: 'Drybrush edges' }] },
  { name: 'Ork Skin', faction: 'Orks', area: 'Skin',
    paints: [{ name: 'Warpstone Glow', hex: '#1e7331', step: 'Base coat' }, { name: 'Biel-Tan Green', hex: '#1ba169', step: 'Shade' }, { name: 'Moot Green', hex: '#3daf44', step: 'Layer raised areas' }, { name: 'Screaming Skull', hex: '#bfca7a', step: 'Dot highlight on nose/knuckles' }] },
  { name: 'Caucasian Skin', faction: 'Any', area: 'Skin',
    paints: [{ name: 'Bugmans Glow', hex: '#834f44', step: 'Base coat' }, { name: 'Reikland Fleshshade', hex: '#ca6c4d', step: 'Shade' }, { name: 'Cadian Fleshtone', hex: '#c77958', step: 'Layer' }, { name: 'Kislev Flesh', hex: '#d6a875', step: 'Highlight' }] },
  { name: 'Gold Trim', faction: 'Any', area: 'Trim & Details',
    paints: [{ name: 'Retributor Armour', hex: '#c39e5a', step: 'Base coat' }, { name: 'Reikland Fleshshade', hex: '#ca6c4d', step: 'Shade' }, { name: 'Liberator Gold', hex: '#c8a244', step: 'Layer' }, { name: 'Stormhost Silver', hex: '#bbc6c9', step: 'Edge highlight' }] },
  { name: 'Black Armour', faction: 'Any', area: 'Armour',
    paints: [{ name: 'Abaddon Black', hex: '#231f20', step: 'Base coat' }, { name: 'Dark Reaper', hex: '#3b5150', step: 'Edge highlight' }, { name: 'Fenrisian Grey', hex: '#6d94b3', step: 'Fine edge highlight' }] },
  { name: 'White Armour', faction: 'Any', area: 'Armour',
    paints: [{ name: 'Grey Seer', hex: '#a2a5a7', step: 'Base coat' }, { name: 'Apothecary White', hex: '#c5cfd2', step: 'Contrast shade' }, { name: 'Corax White', hex: '#ffffff', step: 'Layer' }] },
  { name: 'Leather / Brown', faction: 'Any', area: 'Leather, pouches',
    paints: [{ name: 'Mournfang Brown', hex: '#640909', step: 'Base coat' }, { name: 'Agrax Earthshade', hex: '#5a3601', step: 'Shade' }, { name: 'Skrag Brown', hex: '#904601', step: 'Highlight' }] },
  { name: 'Bone / Skull', faction: 'Any', area: 'Skulls, bone, parchment',
    paints: [{ name: 'Zandri Dust', hex: '#9e915c', step: 'Base coat' }, { name: 'Seraphim Sepia', hex: '#d7824a', step: 'Shade' }, { name: 'Ushabti Bone', hex: '#bbbb7f', step: 'Layer' }, { name: 'Screaming Skull', hex: '#bfca7a', step: 'Highlight' }] },
  { name: 'Tyranid Carapace (Leviathan)', faction: 'Tyranids', area: 'Carapace',
    paints: [{ name: 'Naggaroth Night', hex: '#3b2b50', step: 'Base coat' }, { name: 'Druchii Violet', hex: '#7a468c', step: 'Shade' }, { name: 'Xereus Purple', hex: '#471f5f', step: 'Layer' }, { name: 'Genestealer Purple', hex: '#7658a5', step: 'Edge highlight' }] },
  { name: 'Plasma Glow (Blue)', faction: 'Any', area: 'Plasma coils',
    paints: [{ name: 'Caledor Sky', hex: '#366699', step: 'Base coat coils' }, { name: 'Lothern Blue', hex: '#2c9bcc', step: 'Layer' }, { name: 'Baharroth Blue', hex: '#58c1cd', step: 'Highlight' }, { name: 'White Scar', hex: '#ffffff', step: 'Dot in deepest recesses' }] },
  { name: 'Rust Effect', faction: 'Any', area: 'Weathering',
    paints: [{ name: 'Typhus Corrosion', hex: '#3a3020', step: 'Stipple on randomly' }, { name: 'Ryza Rust', hex: '#e87020', step: 'Light drybrush over corrosion' }] },
  { name: 'Thousand Sons Blue', faction: 'Thousand Sons', area: 'Armour',
    paints: [{ name: 'Thousand Sons Blue', hex: '#00506f', step: 'Base coat' }, { name: 'Nuln Oil', hex: '#14100e', step: 'Shade' }, { name: 'Ahriman Blue', hex: '#2c9bcc', step: 'Layer' }, { name: 'Baharroth Blue', hex: '#58c1cd', step: 'Edge highlight' }] },
  { name: 'World Eaters White & Red', faction: 'World Eaters', area: 'Armour',
    paints: [{ name: 'Grey Seer', hex: '#a2a5a7', step: 'Base coat armour' }, { name: 'Apothecary White', hex: '#c5cfd2', step: 'Contrast shade' }, { name: 'Mephiston Red', hex: '#9a1115', step: 'Trim & shoulder pads' }, { name: 'Agrax Earthshade', hex: '#5a3601', step: 'Shade red areas' }] },
  { name: 'Tau Sept Ochre', faction: 'Tau Empire', area: 'Armour',
    paints: [{ name: 'XV-88', hex: '#72491e', step: 'Base coat' }, { name: 'Agrax Earthshade', hex: '#5a3601', step: 'Shade' }, { name: 'Tau Light Ochre', hex: '#bf6e1d', step: 'Layer' }, { name: 'Ungor Flesh', hex: '#d6a766', step: 'Edge highlight' }] },
  { name: 'Aeldari Bone (Iyanden)', faction: 'Aeldari', area: 'Armour',
    paints: [{ name: 'Zandri Dust', hex: '#9e915c', step: 'Base coat' }, { name: 'Seraphim Sepia', hex: '#d7824a', step: 'Shade' }, { name: 'Ushabti Bone', hex: '#bbbb7f', step: 'Layer' }, { name: 'Screaming Skull', hex: '#bfca7a', step: 'Edge highlight' }] },
  { name: 'Drukhari Dark Armour', faction: 'Drukhari', area: 'Armour',
    paints: [{ name: 'Incubi Darkness', hex: '#0b474a', step: 'Base coat' }, { name: 'Nuln Oil', hex: '#14100e', step: 'Shade' }, { name: 'Kabalite Green', hex: '#038c67', step: 'Layer' }, { name: 'Sybarite Green', hex: '#17a166', step: 'Edge highlight' }] },
  { name: 'Custodes Gold', faction: 'Adeptus Custodes', area: 'Armour',
    paints: [{ name: 'Retributor Armour', hex: '#c39e5a', step: 'Base coat' }, { name: 'Reikland Fleshshade', hex: '#ca6c4d', step: 'Shade' }, { name: 'Auric Armour Gold', hex: '#c7a23c', step: 'Layer' }, { name: 'Stormhost Silver', hex: '#bbc6c9', step: 'Edge highlight' }] },
  { name: 'Grey Knights Silver', faction: 'Grey Knights', area: 'Armour',
    paints: [{ name: 'Grey Knights Steel', hex: '#6d7c8b', step: 'Base coat' }, { name: 'Nuln Oil', hex: '#14100e', step: 'Shade' }, { name: 'Stormhost Silver', hex: '#bbc6c9', step: 'Drybrush/layer' }] },
  { name: 'Ad Mech Mars Red', faction: 'Adeptus Mechanicus', area: 'Robes',
    paints: [{ name: 'Khorne Red', hex: '#6a0001', step: 'Base coat' }, { name: 'Nuln Oil', hex: '#14100e', step: 'Shade' }, { name: 'Mephiston Red', hex: '#9a1115', step: 'Layer' }, { name: 'Evil Sunz Scarlet', hex: '#c01411', step: 'Edge highlight' }] },
  { name: 'Sisters of Battle Black', faction: 'Adepta Sororitas', area: 'Armour',
    paints: [{ name: 'Abaddon Black', hex: '#231f20', step: 'Base coat' }, { name: 'Thunderhawk Blue', hex: '#417074', step: 'Edge highlight' }, { name: 'Fenrisian Grey', hex: '#6d94b3', step: 'Fine edge highlight' }] },
  { name: 'Genestealer Cult Purple', faction: 'Genestealer Cults', area: 'Skin/Armour',
    paints: [{ name: 'Naggaroth Night', hex: '#3b2b50', step: 'Base coat' }, { name: 'Druchii Violet', hex: '#7a468c', step: 'Shade' }, { name: 'Xereus Purple', hex: '#471f5f', step: 'Layer' }, { name: 'Genestealer Purple', hex: '#7658a5', step: 'Highlight' }] },
  { name: 'Votann Stone Armour', faction: 'Leagues of Votann', area: 'Armour',
    paints: [{ name: 'Mechanicus Standard Grey', hex: '#3d4b4d', step: 'Base coat' }, { name: 'Nuln Oil', hex: '#14100e', step: 'Shade' }, { name: 'Dawnstone', hex: '#70756e', step: 'Layer' }, { name: 'Administratum Grey', hex: '#949b95', step: 'Edge highlight' }] },
  { name: 'Chaos Knight Trim', faction: 'Chaos Knights', area: 'Trim',
    paints: [{ name: 'Warplock Bronze', hex: '#927d7b', step: 'Base coat' }, { name: 'Agrax Earthshade', hex: '#5a3601', step: 'Shade' }, { name: 'Sycorax Bronze', hex: '#a08060', step: 'Drybrush' }] },
  { name: 'Imperial Knight Armour', faction: 'Imperial Knights', area: 'Armour panels',
    paints: [{ name: 'Mephiston Red', hex: '#9a1115', step: 'Base coat panels' }, { name: 'Nuln Oil', hex: '#14100e', step: 'Shade recesses' }, { name: 'Evil Sunz Scarlet', hex: '#c01411', step: 'Layer' }, { name: 'Retributor Armour', hex: '#c39e5a', step: 'Trim' }] },
  { name: 'Dark Skin Tone', faction: 'Any', area: 'Skin',
    paints: [{ name: 'Catachan Fleshtone', hex: '#6a4c2d', step: 'Base coat' }, { name: 'Reikland Fleshshade', hex: '#ca6c4d', step: 'Shade' }, { name: 'Bestigor Flesh', hex: '#d38a57', step: 'Highlight' }] },
  { name: 'Power Sword (Blue)', faction: 'Any', area: 'Power weapons',
    paints: [{ name: 'Kantor Blue', hex: '#02134e', step: 'Base one half dark' }, { name: 'Caledor Sky', hex: '#366699', step: 'Blend mid-tone' }, { name: 'Lothern Blue', hex: '#2c9bcc', step: 'Highlight edge' }, { name: 'White Scar', hex: '#ffffff', step: 'Sharp edge highlight' }] },
  { name: 'Muddy Base', faction: 'Any', area: 'Base',
    paints: [{ name: 'Stirland Mud', hex: '#5a4828', step: 'Apply texture paint' }, { name: 'Agrax Earthshade', hex: '#5a3601', step: 'Shade' }, { name: 'Zandri Dust', hex: '#9e915c', step: 'Drybrush' }, { name: 'Screaming Skull', hex: '#bfca7a', step: 'Light drybrush edges' }] },
  { name: 'Snow Base', faction: 'Any', area: 'Base',
    paints: [{ name: 'Astrogranite', hex: '#6a6a6a', step: 'Texture paint' }, { name: 'Dawnstone', hex: '#70756e', step: 'Drybrush' }, { name: 'Valhallan Blizzard', hex: '#f0f0f0', step: 'Apply snow texture' }] },
  { name: 'Space Wolves Grey', faction: 'Space Marines', area: 'Armour',
    paints: [{ name: 'The Fang', hex: '#405b71', step: 'Base coat' }, { name: 'Nuln Oil', hex: '#14100e', step: 'Shade' }, { name: 'Fenrisian Grey', hex: '#6d94b3', step: 'Layer' }, { name: 'Ulthuan Grey', hex: '#c4ddd2', step: 'Edge highlight' }] },
  { name: 'Iron Hands Black', faction: 'Space Marines', area: 'Armour',
    paints: [{ name: 'Abaddon Black', hex: '#231f20', step: 'Base coat' }, { name: 'Eshin Grey', hex: '#484b51', step: 'Edge highlight' }, { name: 'Dawnstone', hex: '#70756e', step: 'Fine edge highlight' }] },
  { name: 'Salamanders Green', faction: 'Space Marines', area: 'Armour',
    paints: [{ name: 'Warpstone Glow', hex: '#1e7331', step: 'Base coat' }, { name: 'Biel-Tan Green', hex: '#1ba169', step: 'Shade' }, { name: 'Moot Green', hex: '#3daf44', step: 'Edge highlight' }] },
  { name: 'Imperial Fists Yellow', faction: 'Space Marines', area: 'Armour',
    paints: [{ name: 'Averland Sunset', hex: '#fdb825', step: 'Base coat' }, { name: 'Casandora Yellow', hex: '#f4b400', step: 'Shade' }, { name: 'Yriel Yellow', hex: '#ffda00', step: 'Layer' }, { name: 'Flash Gitz Yellow', hex: '#fff300', step: 'Edge highlight' }] },
  { name: 'Deathwatch Silver', faction: 'Space Marines', area: 'Arm',
    paints: [{ name: 'Leadbelcher', hex: '#888d91', step: 'Base coat silver arm' }, { name: 'Nuln Oil', hex: '#14100e', step: 'Shade' }, { name: 'Stormhost Silver', hex: '#bbc6c9', step: 'Highlight' }] },
  { name: 'Chaos Undivided Trim', faction: 'Chaos Space Marines', area: 'Trim',
    paints: [{ name: 'Balthasar Gold', hex: '#a47552', step: 'Base coat trim' }, { name: 'Agrax Earthshade', hex: '#5a3601', step: 'Shade' }, { name: 'Sycorax Bronze', hex: '#a08060', step: 'Drybrush highlight' }] },
  { name: 'Tyranid Skin (Leviathan)', faction: 'Tyranids', area: 'Skin',
    paints: [{ name: 'Rakarth Flesh', hex: '#a29e91', step: 'Base coat' }, { name: 'Reikland Fleshshade', hex: '#ca6c4d', step: 'Shade' }, { name: 'Pallid Wych Flesh', hex: '#cdcebe', step: 'Highlight' }] },
  { name: 'Necron Glow Green', faction: 'Necrons', area: 'Energy/eyes',
    paints: [{ name: 'Warpstone Glow', hex: '#1e7331', step: 'Base coat' }, { name: 'Moot Green', hex: '#3daf44', step: 'Layer' }, { name: 'Tesseract Glow', hex: '#40e040', step: 'Glaze over' }, { name: 'White Scar', hex: '#ffffff', step: 'Dot in centre' }] },
  { name: 'Desert/Mars Base', faction: 'Any', area: 'Base',
    paints: [{ name: 'Martian Ironearth', hex: '#c05030', step: 'Apply texture paint' }, { name: 'Zandri Dust', hex: '#9e915c', step: 'Drybrush' }] },
  { name: 'Urban/Rubble Base', faction: 'Any', area: 'Base',
    paints: [{ name: 'Astrogranite Debris', hex: '#808080', step: 'Texture paint' }, { name: 'Nuln Oil', hex: '#14100e', step: 'Shade' }, { name: 'Dawnstone', hex: '#70756e', step: 'Drybrush' }, { name: 'Administratum Grey', hex: '#949b95', step: 'Light drybrush' }] },
  { name: 'Lava Base', faction: 'Any', area: 'Base',
    paints: [{ name: 'Abaddon Black', hex: '#231f20', step: 'Base coat' }, { name: 'Mephiston Red', hex: '#9a1115', step: 'Paint cracks' }, { name: 'Yriel Yellow', hex: '#ffda00', step: 'Centre of cracks' }, { name: 'Mordant Earth', hex: '#1a1a1a', step: 'Crackle paint on top' }] },
];

const TIPS = [
  { title: 'Two Thin Coats', icon: '🎨', text: 'Always thin your paints. Two thin coats give smoother coverage than one thick coat. Thick paint obscures detail.' },
  { title: 'Wet Palette', icon: '💧', text: 'Use a wet palette to keep paints workable longer. DIY: tupperware + wet paper towel + baking parchment.' },
  { title: 'Brush Care', icon: '🖌️', text: 'Never let paint dry in your brush. Rinse frequently. Use brush soap after each session. Don\'t dip past the ferrule.' },
  { title: 'Good Lighting', icon: '💡', text: 'A daylight lamp (5000-6500K) is the single best investment. You can\'t paint what you can\'t see accurately.' },
  { title: 'Prime Everything', icon: '🫧', text: 'Always prime your models. Paint won\'t stick to bare plastic. Grey primer is the most versatile.' },
  { title: 'Batch Paint', icon: '⚡', text: 'Paint all models in a unit at the same time, one colour at a time. Assembly line method is 3x faster.' },
  { title: 'Shake Your Paints', icon: '🫨', text: 'Shake paint pots for 30+ seconds before use. The pigment settles. A mixing ball helps.' },
  { title: 'Fix Mistakes Immediately', icon: '🔄', text: 'Wet paint wipes off easily. Once dry, paint over with the base colour. Everyone makes mistakes.' },
  { title: 'Contrast Over Zenithal', icon: '🌓', text: 'Black prime → white spray from above → contrast paint = instant shading. Best speed painting method.' },
  { title: 'Edge Highlight Trick', icon: '✨', text: 'Use the side of your brush, not the tip. Drag along the edge. Brace your hands together for stability.' },
  { title: 'Varnish Your Models', icon: '🛡️', text: 'Matte varnish protects your paint job during gaming. Apply after fully painted and based.' },
  { title: 'Done Is Better Than Perfect', icon: '✅', text: 'A painted army on the table beats an unpainted army in a box. Tabletop standard is perfectly fine.' },
];

export default function Inspiration() {
  const [tab, setTab] = useState<Tab>('techniques');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filteredTech = TECHNIQUES.filter(t => !search || t.name.toLowerCase().includes(search.toLowerCase()));
  const filteredRecipes = RECIPES.filter(r => !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.faction.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="page-header" style={{ paddingTop: 48 }}>
        <h2>🎨 Inspiration & Reference</h2>
      </div>

      <div className="game-tabs" style={{ marginBottom: 20 }}>
        <button className={`game-tab ${tab === 'techniques' ? 'active' : ''}`} onClick={() => setTab('techniques')}>🖌️ Techniques ({TECHNIQUES.length})</button>
        <button className={`game-tab ${tab === 'recipes' ? 'active' : ''}`} onClick={() => setTab('recipes')}>🎨 Paint Recipes ({RECIPES.length})</button>
        <button className={`game-tab ${tab === 'tips' ? 'active' : ''}`} onClick={() => setTab('tips')}>💡 Quick Tips ({TIPS.length})</button>
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search techniques, recipes..." className="filter-search" style={{ marginBottom: 20, width: '100%' }} />

      {tab === 'techniques' && filteredTech.map(t => (
        <div key={t.name} className="ref-card" onClick={() => setExpanded(expanded === t.name ? null : t.name)}>
          <div className="ref-card-header">
            <div>
              <span className="ref-diff">{t.difficulty}</span>
              <span className="ref-card-title">{t.name}</span>
            </div>
            <span className="scheme-toggle">{expanded === t.name ? '▲' : '▼'}</span>
          </div>
          <div className="ref-card-desc">{t.desc}</div>
          {expanded === t.name && (
            <div className="ref-card-detail">
              <div className="ref-steps">
                {t.steps.map((s, i) => (
                  <div key={i} className="ref-step"><span className="scheme-step-num">{i + 1}</span><span>{s}</span></div>
                ))}
              </div>
              <div className="ref-when">📌 <strong>When to use:</strong> {t.when}</div>
            </div>
          )}
        </div>
      ))}

      {tab === 'recipes' && filteredRecipes.map(r => (
        <div key={r.name} className="ref-card" onClick={() => setExpanded(expanded === r.name ? null : r.name)}>
          <div className="ref-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex', gap: 2 }}>
                {r.paints.map((p, i) => <div key={i} style={{ width: 20, height: 20, borderRadius: '50%', background: p.hex, border: '1px solid rgba(255,255,255,0.1)' }} />)}
              </div>
              <div>
                <div className="ref-card-title">{r.name}</div>
                <div className="ref-card-desc" style={{ margin: 0 }}>{r.faction} · {r.area}</div>
              </div>
            </div>
            <span className="scheme-toggle">{expanded === r.name ? '▲' : '▼'}</span>
          </div>
          {expanded === r.name && (
            <div className="ref-card-detail">
              {r.paints.map((p, i) => (
                <div key={i} className="recipe-item" style={{ background: 'var(--surface2)', marginBottom: 4 }}>
                  <div className="swatch" style={{ width: 28, height: 28, background: p.hex }} />
                  <div className="recipe-item-info">
                    <div className="recipe-paint-name">{p.name}</div>
                    <div className="recipe-usage">{p.step}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {tab === 'tips' && (
        <div className="tips-grid">
          {TIPS.map(t => (
            <div key={t.title} className="tip-card">
              <div className="tip-icon">{t.icon}</div>
              <div className="tip-title">{t.title}</div>
              <div className="tip-text">{t.text}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
