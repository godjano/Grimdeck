import type { PaintPreset } from './paints-citadel-base';
import type { ModelPreset } from './model-presets';

// Army Painter Speed Paint 1.0 (original range)
export const SPEED_PAINT_V1: PaintPreset[] = [
  { name: 'Absolution Green SP1', brand: 'Army Painter', range: 'Speedpaint 1.0', type: 'contrast', hex: '#004828' },
  { name: 'Blood Red SP1', brand: 'Army Painter', range: 'Speedpaint 1.0', type: 'contrast', hex: '#a01010' },
  { name: 'Broadsword Silver SP1', brand: 'Army Painter', range: 'Speedpaint 1.0', type: 'contrast', hex: '#a0a8b0' },
  { name: 'Crusader Skin SP1', brand: 'Army Painter', range: 'Speedpaint 1.0', type: 'contrast', hex: '#d0a070' },
  { name: 'Dark Wood SP1', brand: 'Army Painter', range: 'Speedpaint 1.0', type: 'contrast', hex: '#3a2010' },
  { name: 'Gravelord Grey SP1', brand: 'Army Painter', range: 'Speedpaint 1.0', type: 'contrast', hex: '#606868' },
  { name: 'Holy White SP1', brand: 'Army Painter', range: 'Speedpaint 1.0', type: 'contrast', hex: '#e8e8e8' },
  { name: 'Lawful Blue SP1', brand: 'Army Painter', range: 'Speedpaint 1.0', type: 'contrast', hex: '#2050a0' },
  { name: 'Malignant Green SP1', brand: 'Army Painter', range: 'Speedpaint 1.0', type: 'contrast', hex: '#3a8830' },
  { name: 'Orc Skin SP1', brand: 'Army Painter', range: 'Speedpaint 1.0', type: 'contrast', hex: '#4a7830' },
  { name: 'Pallid Bone SP1', brand: 'Army Painter', range: 'Speedpaint 1.0', type: 'contrast', hex: '#dbc8a0' },
  { name: 'Royal Cloak SP1', brand: 'Army Painter', range: 'Speedpaint 1.0', type: 'contrast', hex: '#5a1878' },
  { name: 'Runic Grey SP1', brand: 'Army Painter', range: 'Speedpaint 1.0', type: 'contrast', hex: '#909090' },
  { name: 'Slaughter Red SP1', brand: 'Army Painter', range: 'Speedpaint 1.0', type: 'contrast', hex: '#a01010' },
  { name: 'Speed Metal SP1', brand: 'Army Painter', range: 'Speedpaint 1.0', type: 'contrast', hex: '#c0c0c0' },
  { name: 'The Dungeons SP1', brand: 'Army Painter', range: 'Speedpaint 1.0', type: 'contrast', hex: '#1a1a1a' },
  { name: 'Zealot Yellow SP1', brand: 'Army Painter', range: 'Speedpaint 1.0', type: 'contrast', hex: '#f0c010' },
  { name: 'Medium Armor SP1', brand: 'Army Painter', range: 'Speedpaint 1.0', type: 'contrast', hex: '#c8a830' },
];

// Primarch models (Forge World + plastic)
export const PRIMARCH_MODELS: ModelPreset[] = [
  // Loyalist Primarchs
  { name: 'Roboute Guilliman', faction: 'Ultramarines', unitType: 'Character', defaultQty: 1, points: 350, forceOrg: 'Lord of War' },
  { name: 'Lion El\'Jonson', faction: 'Dark Angels', unitType: 'Character', defaultQty: 1, points: 380, forceOrg: 'Lord of War' },
  // Traitor Primarchs
  { name: 'Mortarion', faction: 'Death Guard', unitType: 'Character', defaultQty: 1, points: 370, forceOrg: 'Lord of War' },
  { name: 'Magnus the Red', faction: 'Thousand Sons', unitType: 'Character', defaultQty: 1, points: 380, forceOrg: 'Lord of War' },
  { name: 'Angron', faction: 'World Eaters', unitType: 'Character', defaultQty: 1, points: 415, forceOrg: 'Lord of War' },
  // Horus Heresy Primarchs (Forge World resin)
  { name: 'Horus Lupercal', faction: 'Sons of Horus', unitType: 'Character', defaultQty: 1, points: 0, forceOrg: 'Lord of War' },
  { name: 'Fulgrim', faction: "Emperor's Children", unitType: 'Character', defaultQty: 1, points: 0, forceOrg: 'Lord of War' },
  { name: 'Perturabo', faction: 'Iron Warriors', unitType: 'Character', defaultQty: 1, points: 0, forceOrg: 'Lord of War' },
  { name: 'Konrad Curze', faction: 'Night Lords', unitType: 'Character', defaultQty: 1, points: 0, forceOrg: 'Lord of War' },
  { name: 'Lorgar', faction: 'Word Bearers', unitType: 'Character', defaultQty: 1, points: 0, forceOrg: 'Lord of War' },
  { name: 'Alpharius', faction: 'Alpha Legion', unitType: 'Character', defaultQty: 1, points: 0, forceOrg: 'Lord of War' },
  { name: 'Leman Russ (Primarch)', faction: 'Space Wolves', unitType: 'Character', defaultQty: 1, points: 0, forceOrg: 'Lord of War' },
  { name: 'Jaghatai Khan', faction: 'White Scars', unitType: 'Character', defaultQty: 1, points: 0, forceOrg: 'Lord of War' },
  { name: 'Rogal Dorn', faction: 'Imperial Fists', unitType: 'Character', defaultQty: 1, points: 0, forceOrg: 'Lord of War' },
  { name: 'Sanguinius', faction: 'Blood Angels', unitType: 'Character', defaultQty: 1, points: 0, forceOrg: 'Lord of War' },
  { name: 'Ferrus Manus', faction: 'Iron Hands', unitType: 'Character', defaultQty: 1, points: 0, forceOrg: 'Lord of War' },
  { name: 'Vulkan (Primarch)', faction: 'Salamanders', unitType: 'Character', defaultQty: 1, points: 0, forceOrg: 'Lord of War' },
  { name: 'Corvus Corax', faction: 'Raven Guard', unitType: 'Character', defaultQty: 1, points: 0, forceOrg: 'Lord of War' },
  // The Emperor
  { name: 'The Emperor of Mankind', faction: 'Imperium', unitType: 'Character', defaultQty: 1, points: 0, forceOrg: 'Lord of War' },
  // The Lost Primarchs
  { name: 'The Forgotten (II)', faction: 'II Legion', unitType: 'Character', defaultQty: 1, points: 0, forceOrg: 'Lord of War' },
  { name: 'The Purged (XI)', faction: 'XI Legion', unitType: 'Character', defaultQty: 1, points: 0, forceOrg: 'Lord of War' },
];
