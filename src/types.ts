// ─── Tile Semantics ───────────────────────────────────────────────────────────
// Grid convention: grid[row][col] = grid[y][x]
// Angles: 0° = East (right), 90° = South (down) — matches Math.atan2 canvas convention

export const enum TileType {
  Open      = 0,
  Window    = 1,
  Door      = 2,
  Wall      = 3,
  // Overlay-only (stored separately, NOT in grid array)
  Perimeter = 4,
  Valuable  = 5,
  // Special cross-floor transition tile
  Stair     = 6,
}

// ─── Sensors ─────────────────────────────────────────────────────────────────

export interface AreaSensor {
  id: string;
  entity_id: string;
  battery_entity_id?: string;
  grid_x: number;       // column index
  grid_y: number;       // row index
  facing_angle: number; // degrees, 0 = East, 90 = South
  fov_angle: number;    // total cone width in degrees (e.g. 110)
  max_range: number;    // in grid tiles
  floor_id?: string;    // which floor this sensor lives on (undefined = root floor)
}

export interface PointSensor {
  id: string;
  entity_id: string;
  battery_entity_id?: string;
  tile_x: number;
  tile_y: number;
  tile_type: TileType.Window | TileType.Door;
  floor_id?: string;    // which floor this sensor lives on (undefined = root floor)
}

// ─── Targets ─────────────────────────────────────────────────────────────────

export interface ValuableTile  { x: number; y: number; floor_id?: string; }
export interface PerimeterTile { x: number; y: number; floor_id?: string; }

// ─── Multi-floor ──────────────────────────────────────────────────────────────

/**
 * Stair tile — links a specific tile on one floor to a specific tile on another floor.
 * The connection is uni-directional in the data model; add a reciprocal entry for
 * bi-directional travel.
 */
export interface StairTile {
  tile_x: number;
  tile_y: number;
  target_floor_id: string;
  target_tile_x: number;
  target_tile_y: number;
  traversal_cost?: number; // defaults to STAIR_COST constant when omitted
}

/**
 * A vector shape drawn on the canvas that is rasterized into the underlying grid.
 * Points are stored in normalised canvas coordinates [0, 1] so they survive canvas resize.
 */
export interface SvgShape {
  id: string;
  type: 'line' | 'rect' | 'polyline' | 'polygon';
  tile_type: TileType;
  /** Normalised [0,1] coords: [[normX, normY], ...] */
  points: Array<[number, number]>;
  /** Line thickness in tiles (only meaningful for 'line' and 'polyline' types) */
  thickness: number;
}

/**
 * A single floor: its own grid, sensors, overlays, floorplan image, stairs and vector shapes.
 */
export interface Floor {
  id: string;
  name: string;
  grid_cols: number;
  grid_rows: number;
  grid_rle: string;
  floorplan_url?: string;
  area_sensors: AreaSensor[];
  point_sensors: PointSensor[];
  valuables: ValuableTile[];
  perimeter: PerimeterTile[];
  stair_tiles: StairTile[];
  svg_shapes?: SvgShape[];
}

// ─── Card Config (persisted to Lovelace YAML) ─────────────────────────────────

export interface HspatConfig {
  type: 'custom:hspat-card';

  // ── Legacy single-floor fields (kept for backwards compatibility) ──────────
  floorplan_url?: string;
  grid_cols: number;
  grid_rows: number;
  grid_rle: string;            // RLE-encoded flat tile array
  area_sensors: AreaSensor[];
  point_sensors: PointSensor[];
  valuables: ValuableTile[];
  perimeter: PerimeterTile[];

  // ── Multi-floor (new) ──────────────────────────────────────────────────────
  floors?: Floor[];
  active_floor_id?: string;

  // ── UI preferences ────────────────────────────────────────────────────────
  /** When false the grid overlay is hidden (floorplan shows through unobstructed). */
  show_grid?: boolean;

  disclaimer_accepted: boolean;
}

// ─── Runtime Audit State ─────────────────────────────────────────────────────

export type SensorHealth = 'active' | 'offline';

export interface SensorSnapshot {
  sensor_id: string;
  health: SensorHealth;
  reason?: string; // e.g. 'battery 3%', 'unavailable'
}

/** Per-floor audit data (coverage + heatmap for one floor). */
export interface FloorAuditData {
  coverage_tiles: Set<string>;  // "x,y" keys
  heatmap: Map<string, number>; // "x,y" → traversal count
}

export interface AuditResult {
  /** Active floor's coverage (kept for single-floor compat and UI rendering). */
  coverage_tiles: Set<string>;          // "x,y" keys
  /** Active floor's heatmap (kept for single-floor compat and UI rendering). */
  heatmap: Map<string, number>;         // "x,y" → traversal count
  /** All-floor results, keyed by floor_id. */
  per_floor: Map<string, FloorAuditData>;
  sensor_snapshots: SensorSnapshot[];
  blind_spots: Array<{ x: number; y: number }>;
  insights: string[];
}

// ─── Worker Messages ─────────────────────────────────────────────────────────

export interface WorkerRequest {
  cost_matrix: number[][];
  perimeter: PerimeterTile[];
  valuables: ValuableTile[];
  iterations: number;
}

export interface WorkerResponse {
  heatmap: Record<string, number>; // "x,y" → count (serialisable over postMessage)
}

/** Multi-floor worker request — floors share stair connections. */
export interface MultiFloorWorkerRequest {
  type: 'multi_floor';
  floors: Record<string, number[][]>;          // floor_id → cost matrix
  stair_connections: StairConnection[];
  perimeter: FloorPoint[];
  valuables: FloorPoint[];
  iterations: number;
}

/** A resolved stair connection (both sides already validated). */
export interface StairConnection {
  from_floor: string;
  from_x: number;
  from_y: number;
  to_floor: string;
  to_x: number;
  to_y: number;
  cost: number;
}

export interface MultiFloorWorkerResponse {
  /** Keyed by "floorId:x,y" → traversal count. */
  heatmap: Record<string, number>;
}

/** Grid point extended with floor identity for multi-floor pathfinding. */
export interface FloorPoint {
  floor_id: string;
  x: number;
  y: number;
}

// ─── Minimal HA type (avoid dependency on custom-card-helpers at runtime) ────

export interface HassEntityState {
  state: string;
  attributes: Record<string, unknown>;
}

export interface HomeAssistant {
  states: Record<string, HassEntityState>;
}
