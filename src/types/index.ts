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
}

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

export const MODEL_STATUSES: ModelStatus[] = ['unbuilt', 'built', 'primed', 'wip', 'painted', 'based'];
export const PAINT_TYPES: PaintType[] = ['base', 'layer', 'shade', 'dry', 'contrast', 'technical', 'spray', 'air', 'other'];
export const PAINT_BRANDS = ['Citadel', 'Vallejo', 'Army Painter', 'AK Interactive', 'Scale75', 'ProAcryl', 'Other'];
