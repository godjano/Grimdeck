export type ModelStatus = 'unbuilt' | 'built' | 'primed' | 'wip' | 'painted' | 'based';
export type PaintType = 'base' | 'layer' | 'shade' | 'dry' | 'contrast' | 'technical' | 'spray' | 'air' | 'other';

export interface MiniatureModel {
  id?: number;
  name: string;
  faction: string;
  unitType: string;
  quantity: number;
  status: ModelStatus;
  notes: string;
  photoUrl: string;
  createdAt: number;
  manufacturer: string;
  gameSystem: string;
  countsAs: string;
  pricePaid: number;
  wishlist: boolean;
  points: number;
  forceOrg: string;
}

export const FORCE_ORG = ['HQ', 'Troops', 'Elites', 'Fast Attack', 'Heavy Support', 'Flyer', 'Dedicated Transport', 'Fortification', 'Lord of War', 'Kill Team Operative', 'Other'];

export interface Paint {
  id?: number;
  name: string;
  brand: string;
  range: string;
  type: PaintType;
  hexColor: string;
  owned: boolean;
  quantity: number;
  notes: string;
}

export interface ModelPaintLink {
  id?: number;
  modelId: number;
  paintId: number;
  usageNote: string;
}

export interface PaintingLog {
  id?: number;
  modelId: number;
  text: string;
  timestamp: number;
  photoUrl: string;
}

export const MODEL_STATUSES: ModelStatus[] = ['unbuilt', 'built', 'primed', 'wip', 'painted', 'based'];
export const PAINT_TYPES: PaintType[] = ['base', 'layer', 'shade', 'dry', 'contrast', 'technical', 'spray', 'air', 'other'];
export const PAINT_BRANDS = ['Citadel', 'Vallejo', 'Army Painter', 'AK Interactive', 'Scale75', 'ProAcryl', 'Other'];
export const MANUFACTURERS = ['Games Workshop', 'Mantic Games', 'Corvus Belli', 'Wyrd Games', 'Steamforged Games', 'Modiphius', 'Creature Caster', 'Artel W', 'Kromlech', 'Wargame Exclusive', 'Wargames Atlantic', 'Reaper Miniatures', 'North Star', '3D Printed', 'Other'];
export const GAME_SYSTEMS = ['Warhammer 40K', 'Kill Team', 'Age of Sigmar', 'Warcry', 'Horus Heresy', 'Infinity', 'Malifaux', 'Kings of War', 'Firefight', 'Deadzone', 'Frostgrave', 'Stargrave', 'Fallout Wasteland Warfare', 'Warmachine', 'Other'];
