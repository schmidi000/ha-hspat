import { describe, it, expect } from 'vitest';
import { migrateToMultiFloor } from './config-migration.js';
import type { HspatConfig, Floor } from '../types.js';
import { TileType } from '../types.js';

function legacyConfig(overrides: Partial<HspatConfig> = {}): HspatConfig {
  return {
    type: 'custom:hspat-card',
    grid_cols: 10,
    grid_rows: 10,
    grid_rle: '100x0',
    area_sensors: [],
    point_sensors: [],
    valuables: [],
    perimeter: [],
    disclaimer_accepted: true,
    ...overrides,
  };
}

describe('migrateToMultiFloor', () => {
  it('returns config unchanged when floors already present', () => {
    const floor: Floor = {
      id: 'floor-0',
      name: 'Ground Floor',
      grid_cols: 5,
      grid_rows: 5,
      grid_rle: '25x0',
      area_sensors: [],
      point_sensors: [],
      valuables: [],
      perimeter: [],
      stair_tiles: [],
    };
    const config = legacyConfig({ floors: [floor] });
    const result = migrateToMultiFloor(config);
    expect(result.floors).toHaveLength(1);
    expect(result.floors![0]!.id).toBe('floor-0');
  });

  it('creates a floors array from legacy flat fields', () => {
    const config = legacyConfig({
      area_sensors: [{
        id: 'as1', entity_id: 'binary_sensor.motion',
        grid_x: 2, grid_y: 3, facing_angle: 0, fov_angle: 110, max_range: 5,
      }],
      point_sensors: [{
        id: 'ps1', entity_id: 'binary_sensor.door',
        tile_x: 1, tile_y: 1, tile_type: TileType.Door,
      }],
      valuables: [{ x: 5, y: 5 }],
      perimeter: [{ x: 0, y: 0 }],
    });
    const result = migrateToMultiFloor(config);
    expect(result.floors).toHaveLength(1);
    const floor = result.floors![0]!;
    expect(floor.grid_cols).toBe(10);
    expect(floor.grid_rows).toBe(10);
    expect(floor.grid_rle).toBe('100x0');
    expect(floor.area_sensors).toHaveLength(1);
    expect(floor.point_sensors).toHaveLength(1);
    expect(floor.valuables).toHaveLength(1);
    expect(floor.perimeter).toHaveLength(1);
    expect(floor.stair_tiles).toEqual([]);
  });

  it('sets the floor name to "Ground Floor"', () => {
    const result = migrateToMultiFloor(legacyConfig());
    expect(result.floors![0]!.name).toBe('Ground Floor');
  });

  it('carries over floorplan_url to the floor when present', () => {
    const config = legacyConfig({ floorplan_url: '/local/plan.svg' });
    const result = migrateToMultiFloor(config);
    expect(result.floors![0]!.floorplan_url).toBe('/local/plan.svg');
  });

  it('sets active_floor_id to the id of the first floor', () => {
    const result = migrateToMultiFloor(legacyConfig());
    expect(result.active_floor_id).toBe(result.floors![0]!.id);
  });

  it('is idempotent — migrating twice yields the same structure', () => {
    const once = migrateToMultiFloor(legacyConfig());
    const twice = migrateToMultiFloor(once);
    expect(twice.floors).toHaveLength(1);
    expect(twice.floors![0]!.id).toBe(once.floors![0]!.id);
  });

  it('does not mutate the original config', () => {
    const original = legacyConfig({ valuables: [{ x: 1, y: 2 }] });
    const before = JSON.stringify(original);
    migrateToMultiFloor(original);
    expect(JSON.stringify(original)).toBe(before);
  });

  it('assigns floor_id to sensors that lack one', () => {
    const config = legacyConfig({
      area_sensors: [{
        id: 'as1', entity_id: 'binary_sensor.motion',
        grid_x: 0, grid_y: 0, facing_angle: 0, fov_angle: 90, max_range: 3,
      }],
    });
    const result = migrateToMultiFloor(config);
    const floorId = result.floors![0]!.id;
    expect(result.floors![0]!.area_sensors[0]!.floor_id).toBe(floorId);
  });
});
