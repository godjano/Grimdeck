import Dexie, { type Table } from 'dexie';
import type { MiniatureModel, Paint, ModelPaintLink } from '../types';
import type { Campaign, Operative, MissionResult } from '../types/campaign';

class AppDB extends Dexie {
  models!: Table<MiniatureModel, number>;
  paints!: Table<Paint, number>;
  modelPaintLinks!: Table<ModelPaintLink, number>;
  campaigns!: Table<Campaign, number>;
  operatives!: Table<Operative, number>;
  missionResults!: Table<MissionResult, number>;

  constructor() {
    super('WarhammerCompanion');
    this.version(2).stores({
      models: '++id, name, faction, status, createdAt',
      paints: '++id, name, brand, type, owned',
      modelPaintLinks: '++id, modelId, paintId',
      campaigns: '++id, status, createdAt',
      operatives: '++id, campaignId, status',
      missionResults: '++id, campaignId, nodeId',
    });
  }
}

export const db = new AppDB();
