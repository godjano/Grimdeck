export interface Campaign {
  id?: number;
  name: string;
  playerFaction: string;
  enemyFaction: string;
  currentNodeId: string;
  status: 'active' | 'won' | 'lost' | 'abandoned';
  turn: number;
  wins: number;
  losses: number;
  createdAt: number;
}

export interface Operative {
  id?: number;
  campaignId: number;
  name: string;
  role: string;
  xp: number;
  wounds: number;
  maxWounds: number;
  status: 'ready' | 'injured' | 'dead';
  kills: number;
}

export interface MissionResult {
  id?: number;
  campaignId: number;
  nodeId: string;
  outcome: 'win' | 'loss' | 'draw';
  playerCasualties: number;
  enemyCasualties: number;
  mvpOperativeId?: number;
  narrativeText: string;
  completedAt: number;
}
