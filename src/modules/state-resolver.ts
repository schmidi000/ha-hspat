import { BASE_COST, SENSOR_PENALTY, OPEN_TILE_COST } from '../constants.js';
import { getEntityState } from './ha-snapshot.js';
import type { HspatConfig, SensorSnapshot, HomeAssistant } from '../types.js';

/**
 * Build a traversal cost matrix from the semantic grid, applying live HA entity
 * states and sensor health to produce the runtime cost surface for pathfinding.
 *
 * Area sensor FOV costs are NOT applied here — they are added in shadowcast.ts
 * after the FOV computation.
 */
export function buildCostMatrix(
  grid: number[][],
  hass: HomeAssistant,
  config: HspatConfig,
  snapshots: SensorSnapshot[],
): number[][] {
  // 1. Initialise a new matrix from base tile costs (never mutate the grid)
  const matrix: number[][] = grid.map(row =>
    row.map(tile => BASE_COST[tile] ?? 9999)
  );

  // 2. Apply point sensor dynamic modification
  for (const ps of config.point_sensors) {
    const snap = snapshots.find(s => s.sensor_id === ps.id);
    const isOnline = snap?.health === 'active';
    const rawState = getEntityState(hass, ps.entity_id);

    if (rawState === 'on') {
      // Physically open door/window → treat as open space, no sensor benefit
      matrix[ps.tile_y]![ps.tile_x] = OPEN_TILE_COST;
    } else if (rawState === 'off' && isOnline) {
      // Closed + sensor active → base cost + detection penalty
      matrix[ps.tile_y]![ps.tile_x]! += SENSOR_PENALTY;
    }
    // offline or unknown state → no change from base cost
  }

  return matrix;
}
