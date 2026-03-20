import Dexie, { type Table } from 'dexie';
import type { MiniatureModel, Paint, ModelPaintLink, PaintingLog } from '../types';
import type { Campaign, Operative, MissionResult } from '../types/campaign';

class AppDB extends Dexie {
  models!: Table<MiniatureModel, number>;
  paints!: Table<Paint, number>;
  modelPaintLinks!: Table<ModelPaintLink, number>;
  campaigns!: Table<Campaign, number>;
  operatives!: Table<Operative, number>;
  missionResults!: Table<MissionResult, number>;
  paintingLogs!: Table<PaintingLog, number>;

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
    this.version(3).stores({
      models: '++id, name, faction, status, createdAt, manufacturer, gameSystem, wishlist, forceOrg',
      paints: '++id, name, brand, type, owned',
      modelPaintLinks: '++id, modelId, paintId',
      campaigns: '++id, status, createdAt',
      operatives: '++id, campaignId, status',
      missionResults: '++id, campaignId, nodeId',
    }).upgrade(tx => {
      return tx.table('models').toCollection().modify(model => {
        if (!model.manufacturer) model.manufacturer = 'Games Workshop';
        if (!model.gameSystem) model.gameSystem = 'Warhammer 40K';
        if (!model.countsAs) model.countsAs = '';
        if (model.pricePaid === undefined) model.pricePaid = 0;
        if (model.wishlist === undefined) model.wishlist = false;
        if (model.points === undefined) model.points = 0;
        if (!model.forceOrg) model.forceOrg = 'Other';
      });
    });
    this.version(4).stores({
      models: '++id, name, faction, status, createdAt, manufacturer, gameSystem, wishlist, forceOrg',
      paints: '++id, name, brand, type, owned',
      modelPaintLinks: '++id, modelId, paintId',
      campaigns: '++id, status, createdAt',
      operatives: '++id, campaignId, status',
      missionResults: '++id, campaignId, nodeId',
      paintingLogs: '++id, modelId, timestamp',
    });
  }
}

export const db = new AppDB();
