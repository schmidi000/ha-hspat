import { TileType } from './types.js';

// ─── Traversal Costs ─────────────────────────────────────────────────────────

export const BASE_COST: Record<number, number> = {
  [TileType.Open]:   1,
  [TileType.Window]: 10,
  [TileType.Door]:   30,
  [TileType.Wall]:   9999, // impassable
  [TileType.Stair]:  1,    // base cost for stair tile itself; cross-floor penalty applied separately
};

export const SENSOR_PENALTY   = 100;
export const OPEN_TILE_COST   = 1;
export const NOISE_FACTOR     = 0.15;  // ±15% per Monte Carlo iteration
export const SIMULATION_ITERS = 150;
export const LOW_BATTERY_PCT  = 5;
/** Flat cost added when traversing a stair connection between floors. */
export const STAIR_COST       = 50;

// ─── Tile Colours (Canvas RGBA) ───────────────────────────────────────────────

export const TILE_COLOURS: Record<number, string> = {
  [TileType.Open]:      'rgba(0, 200, 0, 0.1)',
  [TileType.Window]:    'rgba(0, 100, 255, 0.4)',
  [TileType.Door]:      'rgba(255, 165, 0, 0.5)',
  [TileType.Wall]:      'rgba(50, 50, 50, 1.0)',
  [TileType.Perimeter]: 'rgba(255, 0, 0, 0.3)',
  [TileType.Valuable]:  'rgba(255, 215, 0, 0.5)',
  [TileType.Stair]:     'rgba(139, 92, 246, 0.75)', // purple
};

export const COVERAGE_COLOUR = 'rgba(0, 255, 120, 0.3)';

// ─── Grid Defaults ────────────────────────────────────────────────────────────

export const DEFAULT_GRID_COLS = 50;
export const DEFAULT_GRID_ROWS = 50;
export const DEFAULT_SHOW_GRID = true;
