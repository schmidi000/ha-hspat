import { describe, it, expect } from 'vitest';
import { computeSensorFov, computeAllFov, applyAreaSensorCosts } from './shadowcast.js';
import { TileType } from '../types.js';
import { SENSOR_PENALTY } from '../constants.js';
import type { AreaSensor, SensorSnapshot } from '../types.js';

// 11x11 all-open grid for unobstructed FOV tests
function openGrid(size = 11): number[][] {
  return Array.from({ length: size }, () => new Array(size).fill(TileType.Open));
}

// Sensor at centre of the 11x11 grid (5,5)
const centredSensor = (overrides: Partial<AreaSensor> = {}): AreaSensor => ({
  id: 's1',
  entity_id: 'camera.test',
  grid_x: 5,
  grid_y: 5,
  facing_angle: 0,   // East
  fov_angle: 90,
  max_range: 4,
  ...overrides,
});

describe('computeSensorFov — directional masking', () => {
  it('covers tiles to the East when facing East (0°) with 90° FOV', () => {
    const sensor = centredSensor({ facing_angle: 0, fov_angle: 90 });
    const tiles = computeSensorFov(openGrid(), sensor);
    const keys = new Set(tiles.map(t => `${t.x},${t.y}`));

    // Tiles directly to the right should be covered
    expect(keys.has('6,5')).toBe(true);
    expect(keys.has('7,5')).toBe(true);

    // Tile directly behind should NOT be covered
    expect(keys.has('4,5')).toBe(false);
  });

  it('covers tiles to the West when facing West (180°)', () => {
    const sensor = centredSensor({ facing_angle: 180, fov_angle: 90 });
    const tiles = computeSensorFov(openGrid(), sensor);
    const keys = new Set(tiles.map(t => `${t.x},${t.y}`));

    expect(keys.has('4,5')).toBe(true);
    expect(keys.has('3,5')).toBe(true);
    expect(keys.has('6,5')).toBe(false);
  });

  it('covers tiles to the South when facing South (90°)', () => {
    const sensor = centredSensor({ facing_angle: 90, fov_angle: 90 });
    const tiles = computeSensorFov(openGrid(), sensor);
    const keys = new Set(tiles.map(t => `${t.x},${t.y}`));

    expect(keys.has('5,6')).toBe(true);
    expect(keys.has('5,4')).toBe(false);
  });

  it('covers all nearby tiles with 360° FOV', () => {
    const sensor = centredSensor({ fov_angle: 360, max_range: 2 });
    const tiles = computeSensorFov(openGrid(), sensor);
    const keys = new Set(tiles.map(t => `${t.x},${t.y}`));

    // All cardinal and diagonal neighbors should be covered
    expect(keys.has('6,5')).toBe(true);
    expect(keys.has('4,5')).toBe(true);
    expect(keys.has('5,6')).toBe(true);
    expect(keys.has('5,4')).toBe(true);
  });

  it('does not include tiles beyond max_range', () => {
    const sensor = centredSensor({ facing_angle: 0, fov_angle: 360, max_range: 2 });
    const tiles = computeSensorFov(openGrid(), sensor);
    for (const t of tiles) {
      const dist = Math.max(Math.abs(t.x - 5), Math.abs(t.y - 5));
      expect(dist).toBeLessThanOrEqual(2);
    }
  });

  it('returns no tiles for an empty grid (all walls)', () => {
    const wallGrid = Array.from({ length: 11 }, () => new Array(11).fill(TileType.Wall));
    const sensor = centredSensor();
    const tiles = computeSensorFov(wallGrid, sensor);
    // Only the sensor's own tile can be visible (origin is always included by rot.js)
    expect(tiles.length).toBeLessThanOrEqual(1);
  });
});

describe('computeAllFov', () => {
  const activeSnap: SensorSnapshot = { sensor_id: 's1', health: 'active' };
  const offlineSnap: SensorSnapshot = { sensor_id: 's1', health: 'offline' };

  it('returns coverage tiles for an active sensor', () => {
    const sensor = centredSensor({ facing_angle: 0, fov_angle: 90 });
    const coverage = computeAllFov(openGrid(), [sensor], [activeSnap]);
    expect(coverage.size).toBeGreaterThan(0);
  });

  it('returns empty set for an offline sensor', () => {
    const sensor = centredSensor({ facing_angle: 0, fov_angle: 90 });
    const coverage = computeAllFov(openGrid(), [sensor], [offlineSnap]);
    expect(coverage.size).toBe(0);
  });

  it('returns empty set when no sensors provided', () => {
    const coverage = computeAllFov(openGrid(), [], []);
    expect(coverage.size).toBe(0);
  });

  it('merges coverage from multiple sensors', () => {
    const sensorEast = centredSensor({ id: 's1', facing_angle: 0, fov_angle: 90 });
    const sensorWest = centredSensor({ id: 's2', facing_angle: 180, fov_angle: 90 });
    const snaps: SensorSnapshot[] = [
      { sensor_id: 's1', health: 'active' },
      { sensor_id: 's2', health: 'active' },
    ];
    const coverage = computeAllFov(openGrid(), [sensorEast, sensorWest], snaps);
    // Should cover tiles both east and west
    expect(coverage.has('6,5')).toBe(true);
    expect(coverage.has('4,5')).toBe(true);
  });
});

describe('applyAreaSensorCosts', () => {
  it('adds SENSOR_PENALTY to tiles within active sensor FOV', () => {
    const sensor = centredSensor({ facing_angle: 0, fov_angle: 90, max_range: 1 });
    const grid = openGrid(11);
    const matrix = grid.map(row => row.map(() => 1));
    const snaps: SensorSnapshot[] = [{ sensor_id: 's1', health: 'active' }];

    applyAreaSensorCosts(matrix, grid, [sensor], snaps);

    // Tile directly east should have penalty applied
    expect(matrix[5]![6]).toBe(1 + SENSOR_PENALTY);
  });

  it('does NOT add penalty for offline sensor', () => {
    const sensor = centredSensor({ facing_angle: 0, fov_angle: 360, max_range: 1 });
    const grid = openGrid(11);
    const matrix = grid.map(row => row.map(() => 1));
    const snaps: SensorSnapshot[] = [{ sensor_id: 's1', health: 'offline' }];

    applyAreaSensorCosts(matrix, grid, [sensor], snaps);

    // No tile should have the penalty
    expect(matrix[5]![6]).toBe(1);
  });
});
