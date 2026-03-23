import type { StairTile, Floor } from '../types.js';

/**
 * Generates a display label for a stair tile shown in dropdowns and lists.
 */
export function stairLabel(stair: StairTile, floor: Floor): string {
  if (stair.name) return `${stair.name} (${floor.name})`;
  return `Stair at (${stair.tile_x}, ${stair.tile_y}) on ${floor.name}`;
}

/**
 * Build the reciprocal StairTile so that a stair connection is bi-directional.
 * Given stair A on floor `fromFloorId` pointing to floor B at (tx, ty),
 * returns a StairTile suitable for insertion into floor B's `stair_tiles`.
 */
export function buildReciprocalStair(source: StairTile, fromFloorId: string): StairTile {
  if (source.target_tile_x === undefined || source.target_tile_y === undefined) {
    throw new Error('buildReciprocalStair: source stair has no target coordinates');
  }
  return {
    tile_x: source.target_tile_x,
    tile_y: source.target_tile_y,
    name: source.name,
    target_floor_id: fromFloorId,
    target_tile_x: source.tile_x,
    target_tile_y: source.tile_y,
    traversal_cost: source.traversal_cost,
  };
}

/**
 * Upsert a stair tile into a floor's stair_tiles array.
 * Matches by tile position. Returns the updated array (immutable).
 */
export function upsertStairTile(tiles: StairTile[], stair: StairTile): StairTile[] {
  const idx = tiles.findIndex(s => s.tile_x === stair.tile_x && s.tile_y === stair.tile_y);
  return idx >= 0
    ? tiles.map((s, i) => (i === idx ? stair : s))
    : [...tiles, stair];
}
