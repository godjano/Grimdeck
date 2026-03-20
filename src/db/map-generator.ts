// Kill Team board: 22x30 grid (each cell ≈ 1 inch)
export type CellType = 'empty' | 'heavy' | 'light' | 'vantage' | 'objective' | 'deploy_p' | 'deploy_e';

export interface TerrainPiece { x: number; y: number; w: number; h: number; type: 'heavy' | 'light' | 'vantage'; label: string; }
export interface MapObjective { x: number; y: number; id: number; }
export interface GameMap {
  grid: CellType[][];
  terrain: TerrainPiece[];
  objectives: MapObjective[];
  rows: number;
  cols: number;
}

const ROWS = 22;
const COLS = 30;

function rand(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function placeTerrain(grid: CellType[][], t: TerrainPiece) {
  for (let y = t.y; y < t.y + t.h && y < ROWS; y++)
    for (let x = t.x; x < t.x + t.w && x < COLS; x++)
      if (grid[y][x] === 'empty') grid[y][x] = t.type;
}

const TERRAIN_TEMPLATES: { label: string; type: TerrainPiece['type']; w: number; h: number }[] = [
  { label: 'Ruins', type: 'heavy', w: 4, h: 3 },
  { label: 'Wall', type: 'heavy', w: 5, h: 1 },
  { label: 'Building', type: 'heavy', w: 3, h: 3 },
  { label: 'Barricade', type: 'light', w: 3, h: 1 },
  { label: 'Crates', type: 'light', w: 2, h: 2 },
  { label: 'Pipes', type: 'light', w: 4, h: 1 },
  { label: 'Tower', type: 'vantage', w: 2, h: 2 },
  { label: 'Platform', type: 'vantage', w: 3, h: 2 },
];

export function generateMap(): GameMap {
  const grid: CellType[][] = Array.from({ length: ROWS }, () => Array(COLS).fill('empty'));
  const terrain: TerrainPiece[] = [];

  // Deployment zones: left 6 cols = player, right 6 cols = enemy
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < 4; x++) grid[y][x] = 'deploy_p';
    for (let x = COLS - 4; x < COLS; x++) grid[y][x] = 'deploy_e';
  }

  // Place 8-10 terrain pieces in the middle area
  const count = rand(8, 10);
  for (let i = 0; i < count; i++) {
    const tmpl = TERRAIN_TEMPLATES[rand(0, TERRAIN_TEMPLATES.length - 1)];
    let placed = false;
    for (let attempt = 0; attempt < 30 && !placed; attempt++) {
      const x = rand(5, COLS - 5 - tmpl.w);
      const y = rand(1, ROWS - 1 - tmpl.h);
      // Check area is clear
      let clear = true;
      for (let dy = -1; dy <= tmpl.h && clear; dy++)
        for (let dx = -1; dx <= tmpl.w && clear; dx++) {
          const cy = y + dy, cx = x + dx;
          if (cy >= 0 && cy < ROWS && cx >= 0 && cx < COLS && grid[cy][cx] !== 'empty' && grid[cy][cx] !== 'deploy_p' && grid[cy][cx] !== 'deploy_e')
            clear = false;
        }
      if (clear) {
        const piece = { ...tmpl, x, y };
        terrain.push(piece);
        placeTerrain(grid, piece);
        placed = true;
      }
    }
  }

  // Place 4 objectives in a diamond pattern
  const objectives: MapObjective[] = [
    { x: Math.floor(COLS / 2) - 4, y: Math.floor(ROWS / 2), id: 1 },
    { x: Math.floor(COLS / 2) + 4, y: Math.floor(ROWS / 2), id: 2 },
    { x: Math.floor(COLS / 2), y: Math.floor(ROWS / 4), id: 3 },
    { x: Math.floor(COLS / 2), y: Math.floor(ROWS * 3 / 4), id: 4 },
  ];
  for (const obj of objectives) {
    if (obj.y >= 0 && obj.y < ROWS && obj.x >= 0 && obj.x < COLS)
      grid[obj.y][obj.x] = 'objective';
  }

  return { grid, terrain, objectives, rows: ROWS, cols: COLS };
}

export const CELL_LEGEND: Record<CellType, { symbol: string; color: string; label: string }> = {
  empty: { symbol: '·', color: '#1a1a1a', label: 'Open ground' },
  heavy: { symbol: '█', color: '#5d4037', label: 'Heavy cover (blocks LOS & gives cover)' },
  light: { symbol: '░', color: '#37474f', label: 'Light cover (gives cover, no LOS block)' },
  vantage: { symbol: '▲', color: '#4a148c', label: 'Vantage point (elevated, gives cover)' },
  objective: { symbol: '◎', color: '#ffd600', label: 'Objective marker' },
  deploy_p: { symbol: '·', color: '#0d2b0d', label: 'Your deployment zone' },
  deploy_e: { symbol: '·', color: '#2b0d0d', label: 'Enemy deployment zone' },
};
