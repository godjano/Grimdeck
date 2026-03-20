export interface PaintingGuide {
  id: string;
  title: string;
  faction: string;
  model: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timeEstimate: string;
  steps: GuideStep[];
  videoUrl?: string;
  creator?: string;
}

export interface GuideStep {
  title: string;
  area: string;
  technique: string;
  paints: { name: string; hex: string }[];
  instructions: string;
  tip?: string;
  videoTimestamp?: string;
}

export const PAINTING_GUIDES: PaintingGuide[] = [
  {
    id: 'sm-ultramarine', title: 'Ultramarines Intercessor', faction: 'Space Marines', model: 'Intercessor',
    difficulty: 'beginner', timeEstimate: '2-3 hours',
    steps: [
      { title: 'Prime', area: 'Whole model', technique: 'Spray/brush prime', paints: [{ name: 'Chaos Black Spray', hex: '#1a1a1a' }],
        instructions: 'Apply a thin, even coat of black primer. Hold the can 20-30cm away and spray in short bursts. Let dry completely (15-20 min).', tip: 'Rotate the model while spraying to avoid pooling.' },
      { title: 'Base Coat Armour', area: 'All armour panels', technique: 'Base coating', paints: [{ name: 'Macragge Blue', hex: '#0d407f' }],
        instructions: 'Apply 2 thin coats of Macragge Blue to all armour panels. Let each coat dry before applying the next. Thin with water (roughly 1:1) for smooth coverage.', tip: 'Two thin coats always beats one thick coat.' },
      { title: 'Base Coat Gold Trim', area: 'Aquila, trim, details', technique: 'Base coating', paints: [{ name: 'Retributor Armour', hex: '#c39e5a' }],
        instructions: 'Carefully paint all gold areas — the chest aquila, shoulder trim, and any decorative elements. Use a smaller brush for precision.' },
      { title: 'Base Coat Gun', area: 'Bolt rifle casing', technique: 'Base coating', paints: [{ name: 'Abaddon Black', hex: '#231f20' }],
        instructions: 'Paint the bolt rifle casing black. Be neat around where it meets the hands.' },
      { title: 'Base Coat Metallics', area: 'Gun barrel, vents, joints', technique: 'Base coating', paints: [{ name: 'Leadbelcher', hex: '#888d91' }],
        instructions: 'Paint all metal areas — gun barrel, exhaust vents, belt buckle, and any visible joint mechanisms.' },
      { title: 'Shade Armour', area: 'All blue armour', technique: 'Wash/shade', paints: [{ name: 'Nuln Oil', hex: '#14100e' }],
        instructions: 'Apply Nuln Oil wash over all the blue armour. Let it flow into the recesses naturally. Don\'t pool it on flat surfaces — wick away excess with a dry brush.', tip: 'This is the magic step. The shade defines all the detail.' },
      { title: 'Shade Gold', area: 'All gold areas', technique: 'Wash/shade', paints: [{ name: 'Reikland Fleshshade', hex: '#ca6c4d' }],
        instructions: 'Apply Reikland Fleshshade over all gold areas. This warms up the gold and adds depth.' },
      { title: 'Layer Armour', area: 'Raised armour areas', technique: 'Layering', paints: [{ name: 'Calgar Blue', hex: '#4272b8' }],
        instructions: 'Apply Calgar Blue to the raised areas of the armour, leaving the darker shade in the recesses. This is your first highlight.', tip: 'Leave the Macragge Blue showing in the mid-tones between the shade and highlight.' },
      { title: 'Edge Highlight', area: 'All armour edges', technique: 'Edge highlighting', paints: [{ name: 'Fenrisian Grey', hex: '#6d94b3' }],
        instructions: 'Using the side of your brush, carefully paint thin lines along every armour edge. This makes the model pop. Take your time.', tip: 'Brace your painting hand against your other hand for stability.' },
      { title: 'Eyes & Lenses', area: 'Eye lenses', technique: 'Detail work', paints: [{ name: 'Mephiston Red', hex: '#9a1115' }, { name: 'Evil Sunz Scarlet', hex: '#c01411' }],
        instructions: 'Paint the eye lenses with Mephiston Red, then add a small dot of Evil Sunz Scarlet in the corner for a lens reflection effect.' },
      { title: 'Base', area: 'Base', technique: 'Basing', paints: [{ name: 'Stirland Mud', hex: '#5a4828' }, { name: 'Zandri Dust', hex: '#9e915c' }],
        instructions: 'Apply Stirland Mud texture paint to the base. Once dry, drybrush with Zandri Dust. Add static grass or tufts if desired.' },
    ],
  },
  {
    id: 'dg-plague-marine', title: 'Death Guard Plague Marine', faction: 'Death Guard', model: 'Plague Marine',
    difficulty: 'beginner', timeEstimate: '2-3 hours',
    steps: [
      { title: 'Prime', area: 'Whole model', technique: 'Spray prime', paints: [{ name: 'Death Guard Green Spray', hex: '#6d6e48' }],
        instructions: 'Spray prime with Death Guard Green. This saves a lot of time as it covers the majority of the model.' },
      { title: 'Trim & Details', area: 'Trim, horns, tentacles', technique: 'Base coating', paints: [{ name: 'Balthasar Gold', hex: '#a47552' }],
        instructions: 'Paint all the corroded trim and decorative elements with Balthasar Gold.' },
      { title: 'Fleshy Bits', area: 'Tentacles, exposed flesh', technique: 'Base coating', paints: [{ name: 'Bugmans Glow', hex: '#834f44' }, { name: 'Kislev Flesh', hex: '#d6a875' }],
        instructions: 'Base the fleshy tentacles and exposed skin with Bugmans Glow, then layer with Kislev Flesh on raised areas.' },
      { title: 'Shade Everything', area: 'Whole model', technique: 'Wash/shade', paints: [{ name: 'Agrax Earthshade', hex: '#5a3601' }],
        instructions: 'Wash the entire model with Agrax Earthshade. This ties everything together and adds grime. Be generous — Death Guard should look dirty.', tip: 'Let it pool in the crevices for extra grimy effect.' },
      { title: 'Recess Shade', area: 'Deepest recesses', technique: 'Wash/shade', paints: [{ name: 'Nuln Oil', hex: '#14100e' }],
        instructions: 'Apply Nuln Oil into the deepest recesses, joints, and around rivets for extra depth.' },
      { title: 'Highlight Armour', area: 'Armour edges', technique: 'Edge highlighting', paints: [{ name: 'Ogryn Camo', hex: '#9da94b' }],
        instructions: 'Edge highlight the armour with Ogryn Camo. Don\'t be too neat — Death Guard armour is battered.' },
      { title: 'Rust & Corrosion', area: 'Random patches', technique: 'Stippling', paints: [{ name: 'Typhus Corrosion', hex: '#3a3020' }, { name: 'Ryza Rust', hex: '#e87020' }],
        instructions: 'Stipple Typhus Corrosion randomly on the armour for texture. Once dry, lightly drybrush Ryza Rust over it.', tip: 'Less is more — focus on edges and lower areas where rust would collect.' },
      { title: 'Slime & Gore', area: 'Wounds, vents', technique: 'Technical paint', paints: [{ name: "Nurgle's Rot", hex: '#9aaa1a' }],
        instructions: 'Apply Nurgle\'s Rot technical paint to any open wounds, vents, and where slime would ooze. Build up in layers for a thick, glossy effect.' },
      { title: 'Base', area: 'Base', technique: 'Basing', paints: [{ name: 'Stirland Battlemire', hex: '#4a3820' }, { name: "Nurgle's Rot", hex: '#9aaa1a' }],
        instructions: 'Apply Stirland Battlemire to the base. Add pools of Nurgle\'s Rot for toxic puddles.' },
    ],
  },
  {
    id: 'necron-warrior', title: 'Necron Warrior (Quick)', faction: 'Necrons', model: 'Necron Warrior',
    difficulty: 'beginner', timeEstimate: '45 min',
    steps: [
      { title: 'Prime', area: 'Whole model', technique: 'Spray prime', paints: [{ name: 'Leadbelcher Spray', hex: '#888d91' }],
        instructions: 'Spray prime with Leadbelcher. The entire model is metallic so this does 80% of the work.' },
      { title: 'Wash', area: 'Whole model', technique: 'Wash/shade', paints: [{ name: 'Nuln Oil', hex: '#14100e' }],
        instructions: 'Wash the entire model with Nuln Oil. This defines all the mechanical detail instantly.', tip: 'This two-step method (metallic spray + wash) is the fastest way to paint Necrons.' },
      { title: 'Drybrush', area: 'Raised edges', technique: 'Drybrushing', paints: [{ name: 'Necron Compound', hex: '#b4b8b0' }],
        instructions: 'Lightly drybrush Necron Compound over the whole model. This catches all the raised edges and makes the metal gleam.' },
      { title: 'Energy Glow', area: 'Eyes, weapon coils, orbs', technique: 'Layering', paints: [{ name: 'Tesseract Glow', hex: '#40e040' }],
        instructions: 'Apply Tesseract Glow to all the energy elements — eyes, gauss weapon coils, chest orb. Build up for intensity.' },
      { title: 'Base', area: 'Base', technique: 'Basing', paints: [{ name: 'Astrogranite', hex: '#6a6a6a' }],
        instructions: 'Apply Astrogranite texture paint. Drybrush with a light grey. Add Nihilakh Oxide to rocks for a tomb world feel.' },
    ],
  },
  {
    id: 'ork-boy', title: 'Ork Boy (Battle Ready)', faction: 'Orks', model: 'Ork Boy',
    difficulty: 'beginner', timeEstimate: '1-2 hours',
    steps: [
      { title: 'Prime', area: 'Whole model', technique: 'Spray prime', paints: [{ name: 'Chaos Black Spray', hex: '#1a1a1a' }],
        instructions: 'Black prime. Orks have lots of different materials so black is a good neutral start.' },
      { title: 'Skin', area: 'All exposed skin', technique: 'Base coating', paints: [{ name: 'Warpstone Glow', hex: '#1e7331' }],
        instructions: 'Base coat all the skin with Warpstone Glow. Orks have a LOT of skin so this takes the longest.' },
      { title: 'Shade Skin', area: 'Skin', technique: 'Wash/shade', paints: [{ name: 'Biel-Tan Green', hex: '#1ba169' }],
        instructions: 'Wash all skin with Biel-Tan Green. This adds depth to the muscles and face.' },
      { title: 'Highlight Skin', area: 'Raised skin areas', technique: 'Layering', paints: [{ name: 'Moot Green', hex: '#3daf44' }],
        instructions: 'Layer Moot Green on the raised areas — knuckles, nose, brow, muscles.' },
      { title: 'Clothing', area: 'Trousers, straps', technique: 'Base coating', paints: [{ name: 'Mournfang Brown', hex: '#640909' }],
        instructions: 'Paint all leather and cloth areas with Mournfang Brown.' },
      { title: 'Metal', area: 'Weapons, armour plates', technique: 'Base coating', paints: [{ name: 'Leadbelcher', hex: '#888d91' }],
        instructions: 'Paint all metal areas — choppa blade, armour plates, belt buckle, gun.' },
      { title: 'Shade Everything', area: 'Cloth and metal', technique: 'Wash/shade', paints: [{ name: 'Agrax Earthshade', hex: '#5a3601' }],
        instructions: 'Wash all the non-skin areas with Agrax Earthshade. Makes everything look worn and grimy.' },
      { title: 'Teeth & Eyes', area: 'Face details', technique: 'Detail work', paints: [{ name: 'Ushabti Bone', hex: '#bbbb7f' }, { name: 'Yriel Yellow', hex: '#ffda00' }],
        instructions: 'Paint teeth with Ushabti Bone. Dot the eyes with Yriel Yellow — red for meaner Orks!' },
      { title: 'Base', area: 'Base', technique: 'Basing', paints: [{ name: 'Stirland Mud', hex: '#5a4828' }],
        instructions: 'Stirland Mud texture, drybrush light brown. Add tufts of dead grass.' },
    ],
  },
  {
    id: 'tyranid-termagant', title: 'Tyranid Termagant (Speed Paint)', faction: 'Tyranids', model: 'Termagant',
    difficulty: 'beginner', timeEstimate: '30 min',
    steps: [
      { title: 'Prime', area: 'Whole model', technique: 'Spray prime', paints: [{ name: 'Wraithbone Spray', hex: '#dbd1b2' }],
        instructions: 'Spray with Wraithbone. Light primer is essential for contrast/speed paints.' },
      { title: 'Skin', area: 'Body, limbs', technique: 'Contrast paint', paints: [{ name: 'Skeleton Horde', hex: '#c4a96a' }],
        instructions: 'Apply one thick coat of Skeleton Horde contrast over all the skin. Let it flow into recesses naturally. Don\'t go back over it.', tip: 'Contrast paints do the shading for you — one coat and done.' },
      { title: 'Carapace', area: 'Back plates, head', technique: 'Contrast paint', paints: [{ name: 'Leviadon Blue', hex: '#002d59' }],
        instructions: 'Apply Leviadon Blue to all carapace plates. One coat, let it pool in recesses.' },
      { title: 'Claws & Weapons', area: 'Talons, teeth, gun', technique: 'Contrast paint', paints: [{ name: 'Wyldwood', hex: '#4b3a2e' }],
        instructions: 'Paint all claws, teeth, and the fleshborer with Wyldwood contrast.' },
      { title: 'Base', area: 'Base', technique: 'Basing', paints: [{ name: 'Astrogranite', hex: '#6a6a6a' }],
        instructions: 'Quick texture paint on the base. Done! This method lets you paint a full unit of 10 in under an hour.' },
    ],
  },
];

export const ADVANCED_GUIDES: PaintingGuide[] = [
  {
    id: 'nmm-gold', title: 'NMM Gold (Non-Metallic Metal)', faction: 'Any', model: 'Any Character',
    difficulty: 'advanced', timeEstimate: '4-6 hours',
    steps: [
      { title: 'Base Shadow', area: 'All gold areas', technique: 'Base coating', paints: [{ name: 'Rhinox Hide', hex: '#462f30' }],
        instructions: 'Start with a dark brown base. NMM works by painting the illusion of reflections using regular paints instead of metallics.' },
      { title: 'Mid-tone', area: 'Gold areas', technique: 'Layering', paints: [{ name: 'Mournfang Brown', hex: '#640909' }, { name: 'XV-88', hex: '#72491e' }],
        instructions: 'Layer Mournfang Brown leaving Rhinox Hide in the deepest recesses. Then layer XV-88 on the upper portions. Think about where light would hit.' },
      { title: 'Bright Gold Tone', area: 'Upper surfaces', technique: 'Layering', paints: [{ name: 'Averland Sunset', hex: '#fdb825' }],
        instructions: 'Apply Averland Sunset to the areas catching the most light. Keep your transitions smooth — this is where NMM lives or dies.', tip: 'Imagine a light source above and to the left. Every surface facing that direction gets brighter.' },
      { title: 'Highlight', area: 'Sharpest edges, focal points', technique: 'Edge highlighting', paints: [{ name: 'Yriel Yellow', hex: '#ffda00' }],
        instructions: 'Sharp highlights of Yriel Yellow on the very edges and the brightest reflection points.' },
      { title: 'Max Highlight', area: 'Tiny reflection dots', technique: 'Dot highlight', paints: [{ name: 'Pallid Wych Flesh', hex: '#cdcebe' }],
        instructions: 'Tiny dots of near-white on the absolute brightest points. This sells the metallic illusion.', tip: 'Less is more. One or two dots per surface maximum.' },
      { title: 'Glaze Transitions', area: 'Between tones', technique: 'Glazing', paints: [{ name: 'Casandora Yellow', hex: '#f4b400' }],
        instructions: 'Thin Casandora Yellow heavily (5:1 water) and glaze over the transitions to smooth them out. Multiple thin glazes are better than one thick one.', tip: 'Glazing is the secret technique that separates good NMM from great NMM.' },
    ],
  },
  {
    id: 'osl-plasma', title: 'OSL Plasma Glow Effect', faction: 'Any', model: 'Any with Plasma Weapon',
    difficulty: 'advanced', timeEstimate: '2-3 hours',
    steps: [
      { title: 'Paint Model Normally', area: 'Whole model', technique: 'Standard painting', paints: [{ name: 'Your base colours', hex: '#555555' }],
        instructions: 'Paint the entire model to completion first. OSL is applied last as it overlays everything.' },
      { title: 'Plan Light Source', area: 'Plasma coils', technique: 'Planning', paints: [{ name: 'Caledor Sky', hex: '#366699' }],
        instructions: 'Identify where the plasma glow would fall. It radiates outward from the coils — hitting the hands, arm, chest, and face of the wielder. Mark these areas mentally.' },
      { title: 'Base Glow', area: 'Plasma coils', technique: 'Base coating', paints: [{ name: 'White Scar', hex: '#ffffff' }],
        instructions: 'Paint the plasma coils pure white. This is the light source — it needs to be the brightest point.' },
      { title: 'Inner Glow', area: 'Coils + immediate surroundings', technique: 'Glazing', paints: [{ name: 'Baharroth Blue', hex: '#58c1cd' }],
        instructions: 'Glaze Baharroth Blue over the coils and the surfaces immediately adjacent (within 5mm). Very thin — build up gradually.' },
      { title: 'Mid Glow', area: 'Surfaces 5-15mm from source', technique: 'Glazing', paints: [{ name: 'Lothern Blue', hex: '#2c9bcc' }],
        instructions: 'Glaze Lothern Blue on surfaces further from the source. The colour should be less intense the further from the coils.', tip: 'OSL follows the inverse square law — intensity drops rapidly with distance.' },
      { title: 'Outer Glow', area: 'Furthest affected surfaces', technique: 'Glazing', paints: [{ name: 'Caledor Sky', hex: '#366699' }],
        instructions: 'Very subtle glaze of Caledor Sky on the outermost affected areas. This should be barely visible.' },
      { title: 'Refine', area: 'Transitions', technique: 'Glazing', paints: [{ name: 'Lahmian Medium', hex: '#e0e0e0' }],
        instructions: 'Use Lahmian Medium to smooth any harsh transitions. The glow should fade naturally, not have hard edges.' },
    ],
  },
  {
    id: 'wet-blend-cloak', title: 'Wet Blending a Cloak', faction: 'Any', model: 'Any Cloaked Model',
    difficulty: 'intermediate', timeEstimate: '1-2 hours',
    steps: [
      { title: 'Prepare Palette', area: 'N/A', technique: 'Preparation', paints: [{ name: 'Kantor Blue', hex: '#02134e' }, { name: 'Caledor Sky', hex: '#366699' }, { name: 'Lothern Blue', hex: '#2c9bcc' }],
        instructions: 'Put all three colours on your wet palette. You need them ready because wet blending requires working quickly while paint is still wet.', tip: 'A wet palette is essential for this technique. DIY: tupperware + wet paper towel + baking paper.' },
      { title: 'Apply Dark Base', area: 'Lower cloak', technique: 'Wet blending', paints: [{ name: 'Kantor Blue', hex: '#02134e' }],
        instructions: 'Apply Kantor Blue to the lower portion of the cloak. Work quickly — don\'t let it dry.' },
      { title: 'Apply Mid-tone', area: 'Middle cloak', technique: 'Wet blending', paints: [{ name: 'Caledor Sky', hex: '#366699' }],
        instructions: 'While the dark base is still wet, apply Caledor Sky to the middle area. Where the two colours meet, use a clean damp brush to blend them together with gentle strokes.' },
      { title: 'Apply Highlight', area: 'Upper cloak', technique: 'Wet blending', paints: [{ name: 'Lothern Blue', hex: '#2c9bcc' }],
        instructions: 'Apply Lothern Blue to the upper areas and blend into the mid-tone. Work the transition zone with a clean brush.', tip: 'If it dries before you finish, let it dry completely and glaze over the transition to smooth it.' },
      { title: 'Refine Folds', area: 'Cloak folds', technique: 'Layering', paints: [{ name: 'Kantor Blue', hex: '#02134e' }, { name: 'Fenrisian Grey', hex: '#6d94b3' }],
        instructions: 'Once dry, deepen the folds with thin Kantor Blue and highlight the raised fold edges with Fenrisian Grey.' },
    ],
  },
  {
    id: 'zenithal-contrast', title: 'Zenithal + Contrast Speed Method', faction: 'Any', model: 'Any Infantry',
    difficulty: 'intermediate', timeEstimate: '1 hour',
    steps: [
      { title: 'Black Prime', area: 'Whole model', technique: 'Spray prime', paints: [{ name: 'Chaos Black Spray', hex: '#1a1a1a' }],
        instructions: 'Spray the entire model black from all angles. Full coverage.' },
      { title: 'Zenithal White', area: 'From above', technique: 'Spray prime', paints: [{ name: 'Corax White Spray', hex: '#ffffff' }],
        instructions: 'Spray white from directly above at a 45° angle. This creates a natural pre-highlight — areas that would catch light are white, shadows stay black.', tip: 'This is called zenithal priming. It creates a value sketch that contrast paints will follow.' },
      { title: 'Contrast Armour', area: 'Armour panels', technique: 'Contrast paint', paints: [{ name: 'Blood Angels Red', hex: '#c11519' }],
        instructions: 'Apply contrast paint over the zenithal. The paint will be intense over white areas and dark over black areas — instant shading and highlighting in one coat.' },
      { title: 'Contrast Details', area: 'Other areas', technique: 'Contrast paint', paints: [{ name: 'Wyldwood', hex: '#4b3a2e' }, { name: 'Basilicanum Grey', hex: '#989897' }],
        instructions: 'Use different contrast paints for different materials — Wyldwood for leather, Basilicanum Grey for cloth, etc.' },
      { title: 'Metallic Details', area: 'Weapons, trim', technique: 'Base coating', paints: [{ name: 'Leadbelcher', hex: '#888d91' }],
        instructions: 'Paint metallics normally — contrast paints don\'t work well for metals. Wash with Nuln Oil after.' },
      { title: 'Edge Highlight', area: 'Key edges only', technique: 'Edge highlighting', paints: [{ name: 'Evil Sunz Scarlet', hex: '#c01411' }],
        instructions: 'Quick edge highlights on the most prominent edges only. This elevates the contrast method from tabletop to display quality.' },
    ],
  },
  {
    id: 'batch-guardsmen', title: 'Batch Painting 10 Guardsmen', faction: 'Astra Militarum', model: 'Cadian Shock Troops',
    difficulty: 'intermediate', timeEstimate: '3-4 hours for 10',
    steps: [
      { title: 'Prime All', area: 'All 10 models', technique: 'Spray prime', paints: [{ name: 'Wraithbone Spray', hex: '#dbd1b2' }],
        instructions: 'Line up all 10 on a stick or holder. Spray Wraithbone. Assembly line from here — do each step on ALL models before moving to the next.' },
      { title: 'Fatigues', area: 'Trousers, sleeves', technique: 'Contrast paint', paints: [{ name: 'Militarum Green', hex: '#7a7d45' }],
        instructions: 'Contrast paint all the cloth areas on every model. Don\'t worry about being neat — speed is the goal.' },
      { title: 'Armour', area: 'Flak armour', technique: 'Contrast paint', paints: [{ name: 'Basilicanum Grey', hex: '#989897' }],
        instructions: 'Contrast paint all armour plates on every model.' },
      { title: 'Skin', area: 'Faces, hands', technique: 'Contrast paint', paints: [{ name: 'Guilliman Flesh', hex: '#d1a570' }],
        instructions: 'Contrast paint all exposed skin. One coat, let it do the work.' },
      { title: 'Guns', area: 'Lasguns', technique: 'Base coating', paints: [{ name: 'Abaddon Black', hex: '#231f20' }],
        instructions: 'Paint all gun casings black across every model.' },
      { title: 'Metal', area: 'Gun barrels, buckles', technique: 'Base coating', paints: [{ name: 'Leadbelcher', hex: '#888d91' }],
        instructions: 'All metal parts on every model.' },
      { title: 'Bases', area: 'All bases', technique: 'Basing', paints: [{ name: 'Stirland Mud', hex: '#5a4828' }],
        instructions: 'Texture paint all bases. Done! 10 battle-ready guardsmen.', tip: 'This assembly line method is 3x faster than painting one model at a time.' },
    ],
  },
  {
    id: 'freehand-banner', title: 'Freehand Chapter Symbol', faction: 'Any', model: 'Any with Banner/Shoulder',
    difficulty: 'advanced', timeEstimate: '1-2 hours',
    steps: [
      { title: 'Prepare Surface', area: 'Shoulder pad or banner', technique: 'Base coating', paints: [{ name: 'Abaddon Black', hex: '#231f20' }],
        instructions: 'Ensure the surface is smooth and fully base coated. Any texture will make freehand harder.' },
      { title: 'Sketch with Pencil', area: 'Target surface', technique: 'Planning', paints: [{ name: 'Corax White', hex: '#ffffff' }],
        instructions: 'Very lightly sketch the design with a sharp pencil or very thin white paint. Just the basic shape outline.', tip: 'Start with simple shapes — circles, triangles, crosses. Build complexity over time.' },
      { title: 'Block In Shape', area: 'Design area', technique: 'Freehand', paints: [{ name: 'Corax White', hex: '#ffffff' }],
        instructions: 'Fill in the basic shape with thin white paint. Multiple thin layers. Use the tip of your smallest brush.' },
      { title: 'Refine Edges', area: 'Design edges', technique: 'Freehand', paints: [{ name: 'Abaddon Black', hex: '#231f20' }],
        instructions: 'Clean up the edges by painting the background colour around the design. This is how you sharpen the shape — paint the negative space.' },
      { title: 'Add Detail', area: 'Inside design', technique: 'Freehand', paints: [{ name: 'Yriel Yellow', hex: '#ffda00' }],
        instructions: 'Add colour and internal details. Work from large shapes to small details.', tip: 'Brace your hands together. Rest your elbows on the table. Breathe out while painting fine lines.' },
    ],
  },
];

export const MORE_GUIDES: PaintingGuide[] = [
  {
    id: 'sm-black-templar', title: 'Black Templars Marine', faction: 'Space Marines', model: 'Intercessor',
    difficulty: 'intermediate', timeEstimate: '2-3 hours',
    steps: [
      { title: 'Prime', area: 'Whole model', technique: 'Spray prime', paints: [{ name: 'Chaos Black Spray', hex: '#1a1a1a' }], instructions: 'Black spray prime.' },
      { title: 'Highlight 1', area: 'Armour edges', technique: 'Edge highlighting', paints: [{ name: 'Dark Reaper', hex: '#3b5150' }], instructions: 'Edge highlight all armour with Dark Reaper.' },
      { title: 'Highlight 2', area: 'Sharp edges', technique: 'Edge highlighting', paints: [{ name: 'Fenrisian Grey', hex: '#6d94b3' }], instructions: 'Fine highlight on prominent edges.' },
      { title: 'Shoulder', area: 'Right shoulder', technique: 'Base coating', paints: [{ name: 'Corax White', hex: '#ffffff' }], instructions: 'Paint right shoulder white. 3-4 thin coats.', tip: 'Use Grey Seer first as intermediate step.' },
      { title: 'Tabard', area: 'Cloth', technique: 'Base coating', paints: [{ name: 'Zandri Dust', hex: '#9e915c' }, { name: 'Seraphim Sepia', hex: '#d7824a' }], instructions: 'Base Zandri Dust, shade Seraphim Sepia.' },
      { title: 'Cross', area: 'Shoulder pad', technique: 'Freehand', paints: [{ name: 'Abaddon Black', hex: '#231f20' }], instructions: 'Paint Maltese cross on white shoulder. Start with + shape, widen ends.' },
      { title: 'Details', area: 'Eyes, metals', technique: 'Detail work', paints: [{ name: 'Mephiston Red', hex: '#9a1115' }, { name: 'Leadbelcher', hex: '#888d91' }], instructions: 'Red eyes, silver gun, gold trim.' },
    ],
  },
  {
    id: 'tau-ochre', title: 'Tau Fire Warrior (Ochre)', faction: 'Tau Empire', model: 'Fire Warrior',
    difficulty: 'beginner', timeEstimate: '1.5 hours',
    steps: [
      { title: 'Prime', area: 'Whole model', technique: 'Spray prime', paints: [{ name: 'Wraithbone Spray', hex: '#dbd1b2' }], instructions: 'Light primer for light armour.' },
      { title: 'Armour', area: 'Armour plates', technique: 'Base coating', paints: [{ name: 'XV-88', hex: '#72491e' }], instructions: 'Two thin coats on all armour.' },
      { title: 'Shade', area: 'Armour', technique: 'Wash/shade', paints: [{ name: 'Agrax Earthshade', hex: '#5a3601' }], instructions: 'Wash all armour.' },
      { title: 'Highlight', area: 'Edges', technique: 'Edge highlighting', paints: [{ name: 'Tau Light Ochre', hex: '#bf6e1d' }], instructions: 'Edge highlight armour.' },
      { title: 'Undersuit', area: 'Bodysuit', technique: 'Base coating', paints: [{ name: 'Mechanicus Standard Grey', hex: '#3d4b4d' }], instructions: 'Dark grey undersuit.' },
      { title: 'Lens', area: 'Helmet', technique: 'Detail work', paints: [{ name: 'Mephiston Red', hex: '#9a1115' }], instructions: 'Red lens with white dot.' },
    ],
  },
  {
    id: 'aeldari-ulthwe', title: 'Aeldari Guardian (Ulthwé)', faction: 'Aeldari', model: 'Guardian',
    difficulty: 'intermediate', timeEstimate: '2 hours',
    steps: [
      { title: 'Prime', area: 'Whole model', technique: 'Spray prime', paints: [{ name: 'Chaos Black Spray', hex: '#1a1a1a' }], instructions: 'Black prime for Ulthwé.' },
      { title: 'Highlight', area: 'Armour edges', technique: 'Edge highlighting', paints: [{ name: 'Dark Reaper', hex: '#3b5150' }, { name: 'Thunderhawk Blue', hex: '#417074' }], instructions: 'Dark Reaper first pass, Thunderhawk Blue on sharpest edges.' },
      { title: 'Bone', area: 'Helmet, gun', technique: 'Base coating', paints: [{ name: 'Zandri Dust', hex: '#9e915c' }, { name: 'Ushabti Bone', hex: '#bbbb7f' }], instructions: 'Zandri Dust base, Seraphim Sepia shade, Ushabti Bone layer.' },
      { title: 'Gems', area: 'Spirit stones', technique: 'Detail work', paints: [{ name: 'Mephiston Red', hex: '#9a1115' }, { name: 'White Scar', hex: '#ffffff' }], instructions: 'Red base, highlight one side, white dot opposite corner.', tip: 'White dot opposite to highlight creates gem illusion.' },
    ],
  },
  {
    id: 'vehicle-weathering', title: 'Vehicle Weathering Masterclass', faction: 'Any', model: 'Any Vehicle',
    difficulty: 'advanced', timeEstimate: '2-3 hours',
    steps: [
      { title: 'Sponge Chips', area: 'Edges, corners', technique: 'Sponge weathering', paints: [{ name: 'Rhinox Hide', hex: '#462f30' }], instructions: 'Sponge dab on edges where paint would chip.' },
      { title: 'Metal Chips', area: 'Inside chips', technique: 'Detail work', paints: [{ name: 'Leadbelcher', hex: '#888d91' }], instructions: 'Small silver dots inside ~30% of brown chips.' },
      { title: 'Streaking', area: 'Vertical surfaces', technique: 'Glazing', paints: [{ name: 'Agrax Earthshade', hex: '#5a3601' }], instructions: 'Thin vertical streaks down from rivets and vents.' },
      { title: 'Dust', area: 'Lower hull', technique: 'Drybrushing', paints: [{ name: 'Zandri Dust', hex: '#9e915c' }], instructions: 'Heavy drybrush on lower third, tracks, wheel arches.' },
      { title: 'Rust', area: 'Exhaust, damage', technique: 'Stippling', paints: [{ name: 'Typhus Corrosion', hex: '#3a3020' }, { name: 'Ryza Rust', hex: '#e87020' }], instructions: 'Stipple corrosion, drybrush rust over it.' },
      { title: 'Oil', area: 'Engine, joints', technique: 'Glazing', paints: [{ name: 'Nuln Oil', hex: '#14100e' }], instructions: 'Concentrated Nuln Oil around mechanical areas.', tip: 'Gloss varnish dot on oil stains for realism.' },
    ],
  },
  {
    id: 'custodes-gold', title: 'Adeptus Custodes Warrior', faction: 'Adeptus Custodes', model: 'Custodian Guard',
    difficulty: 'intermediate', timeEstimate: '2-3 hours',
    steps: [
      { title: 'Prime', area: 'Whole model', technique: 'Spray prime', paints: [{ name: 'Retributor Armour Spray', hex: '#c39e5a' }], instructions: 'Gold spray prime — covers 90% of the model.' },
      { title: 'Shade', area: 'All gold', technique: 'Wash/shade', paints: [{ name: 'Reikland Fleshshade', hex: '#ca6c4d' }], instructions: 'Wash entire model with Reikland Fleshshade.' },
      { title: 'Layer', area: 'Raised gold', technique: 'Layering', paints: [{ name: 'Auric Armour Gold', hex: '#c7a23c' }], instructions: 'Layer raised areas, leaving shade in recesses.' },
      { title: 'Highlight', area: 'Edges', technique: 'Edge highlighting', paints: [{ name: 'Stormhost Silver', hex: '#bbc6c9' }], instructions: 'Silver edge highlight on sharpest edges.' },
      { title: 'Red Plume', area: 'Helmet plume', technique: 'Base coating', paints: [{ name: 'Khorne Red', hex: '#6a0001' }, { name: 'Nuln Oil', hex: '#14100e' }, { name: 'Mephiston Red', hex: '#9a1115' }], instructions: 'Khorne Red base, Nuln Oil shade, Mephiston Red layer.' },
      { title: 'Gems', area: 'Gemstones', technique: 'Detail work', paints: [{ name: 'Caledor Sky', hex: '#366699' }, { name: 'White Scar', hex: '#ffffff' }], instructions: 'Blue gems with white reflection dot.' },
    ],
  },
];
