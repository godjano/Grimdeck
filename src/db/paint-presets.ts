export type { PaintPreset } from './paints-citadel-base';
import { CITADEL_BASE } from './paints-citadel-base';
import { CITADEL_LAYER } from './paints-citadel-layer';
import { CITADEL_SHADE, CITADEL_CONTRAST, CITADEL_DRY, CITADEL_TECHNICAL } from './paints-citadel-other';
import { VALLEJO_GAME, VALLEJO_MODEL } from './paints-vallejo';
import { ARMY_PAINTER, SPEED_PAINTS } from './paints-army-painter';

export const ALL_PAINT_PRESETS = [
  ...CITADEL_BASE,
  ...CITADEL_LAYER,
  ...CITADEL_SHADE,
  ...CITADEL_CONTRAST,
  ...CITADEL_DRY,
  ...CITADEL_TECHNICAL,
  ...VALLEJO_GAME,
  ...VALLEJO_MODEL,
  ...ARMY_PAINTER,
  ...SPEED_PAINTS,
];
