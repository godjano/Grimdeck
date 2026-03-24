export type { PaintPreset } from './paints-citadel-base';
import { CITADEL_BASE } from './paints-citadel-base';
import { CITADEL_LAYER } from './paints-citadel-layer';
import { CITADEL_SHADE, CITADEL_CONTRAST, CITADEL_DRY, CITADEL_TECHNICAL } from './paints-citadel-other';
import { VALLEJO_GAME, VALLEJO_MODEL } from './paints-vallejo';
import { ARMY_PAINTER, SPEED_PAINTS } from './paints-army-painter';
import { CITADEL_AIR, PROACRYL, SCALE75 } from './paints-extra';
import { CITADEL_SPRAY, VALLEJO_METAL, AK_INTERACTIVE } from './paints-more';
import { VALLEJO_XPRESS, CITADEL_MISSING } from './paints-latest';
import { SPEED_PAINT_V1 } from './primarchs-and-sp1';
import { SPEED_PAINT_MISSING } from './paints-speedpaint-extra';

import { KIMERA, TURBO_DORK, GREEN_STUFF_WORLD, PRO_ACRYL_EXP } from './paints-new-ranges';

export const ALL_PAINT_PRESETS = [
  ...CITADEL_BASE,
  ...CITADEL_LAYER,
  ...CITADEL_SHADE,
  ...CITADEL_CONTRAST,
  ...CITADEL_DRY,
  ...CITADEL_TECHNICAL,
  ...CITADEL_AIR,
  ...CITADEL_SPRAY,
  ...CITADEL_MISSING,
  ...VALLEJO_GAME,
  ...VALLEJO_MODEL,
  ...VALLEJO_METAL,
  ...VALLEJO_XPRESS,
  ...ARMY_PAINTER,
  ...SPEED_PAINTS,
  ...SPEED_PAINT_V1,
  ...SPEED_PAINT_MISSING,
  ...PROACRYL,
  ...SCALE75,
  ...AK_INTERACTIVE,
  ...KIMERA,
  ...TURBO_DORK,
  ...GREEN_STUFF_WORLD,
  ...PRO_ACRYL_EXP,
];
