import * as ROT from 'rot-js';
import { TileType } from '../types.js';
import { SENSOR_PENALTY } from '../constants.js';
import type { AreaSensor, SensorSnapshot } from '../types.js';

export interface FovTile { x: number; y: number; }

/**
 * Compute directional FOV for a single area sensor.
 *
 * Uses rot.js PreciseShadowcasting for 360° sweep, then applies a post-processing
 * directional mask to restrict to the sensor's configured cone.
 *
 * Angle convention: 0° = East (right), 90° = South (down) — matches Math.atan2
 * with canvas y-axis increasing downward.
 */
export function computeSensorFov(
  grid: number[][],
  sensor: AreaSensor,
): FovTile[] {
  const visibleTiles: FovTile[] = [];

  const lightPasses = (x: number, y: number): boolean => {
    const tile = grid[y]?.[x] ?? TileType.Wall;
    return tile === TileType.Open || tile === TileType.Window;
  };

  const fov = new ROT.FOV.PreciseShadowcasting(lightPasses);

  fov.compute(
    sensor.grid_x,
    sensor.grid_y,
    sensor.max_range,
    (x: number, y: number, _r: number, _visibility: number) => {
      // Post-processing directional mask
      const dx = x - sensor.grid_x;
      const dy = y - sensor.grid_y;

      // Skip sensor's own tile — it's always "visible" but not part of FOV cone
      if (dx === 0 && dy === 0) return;

      const angleDeg = (Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360;
      const facing = (sensor.facing_angle + 360) % 360;
      const half = sensor.fov_angle / 2;

      // Modular angular distance — handles wraparound at 0°/360°
      let diff = Math.abs(angleDeg - facing);
      if (diff > 180) diff = 360 - diff;

      if (diff <= half) {
        visibleTiles.push({ x, y });
      }
    },
  );

  return visibleTiles;
}

/**
 * Compute the union of FOV tiles for all active area sensors.
 * Returns a Set of "x,y" string keys.
 */
export function computeAllFov(
  grid: number[][],
  sensors: AreaSensor[],
  snapshots: SensorSnapshot[],
): Set<string> {
  const coverage = new Set<string>();

  for (const sensor of sensors) {
    const snap = snapshots.find(s => s.sensor_id === sensor.id);
    if (snap?.health !== 'active') continue;

    for (const tile of computeSensorFov(grid, sensor)) {
      coverage.add(`${tile.x},${tile.y}`);
    }
  }

  return coverage;
}

/**
 * Apply area sensor traversal cost penalties to the cost matrix in-place.
 * Must be called AFTER buildCostMatrix (Phase 6) and AFTER computeAllFov.
 */
export function applyAreaSensorCosts(
  matrix: number[][],
  grid: number[][],
  sensors: AreaSensor[],
  snapshots: SensorSnapshot[],
): void {
  for (const sensor of sensors) {
    const snap = snapshots.find(s => s.sensor_id === sensor.id);
    if (snap?.health !== 'active') continue;

    for (const tile of computeSensorFov(grid, sensor)) {
      matrix[tile.y]![tile.x]! += SENSOR_PENALTY;
    }
  }
}
