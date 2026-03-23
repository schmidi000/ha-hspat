import { describe, it, expect } from 'vitest';
import { stairLabel, buildReciprocalStair, upsertStairTile } from './stair-utils.js';
import type { StairTile, Floor } from '../types.js';
import { TileType } from '../types.js';

function makeFloor(id: string, name: string): Floor {
  return {
    id,
    name,
    grid_cols: 5,
    grid_rows: 5,
    grid_rle: '',
    area_sensors: [],
    point_sensors: [],
    valuables: [],
    perimeter: [],
    stair_tiles: [],
  };
}

describe('stairLabel', () => {
  it('uses name when provided', () => {
    const stair: StairTile = { tile_x: 2, tile_y: 3, name: 'Kitchen stairs' };
    const floor = makeFloor('ground', 'Ground Floor');
    expect(stairLabel(stair, floor)).toBe('Kitchen stairs (Ground Floor)');
  });

  it('falls back to coordinates when name is absent', () => {
    const stair: StairTile = { tile_x: 1, tile_y: 4 };
    const floor = makeFloor('ground', 'Ground Floor');
    expect(stairLabel(stair, floor)).toBe('Stair at (1, 4) on Ground Floor');
  });
});

describe('buildReciprocalStair', () => {
  it('creates a reciprocal that points back to the source', () => {
    const source: StairTile = {
      tile_x: 2,
      tile_y: 3,
      name: 'Main stairs',
      target_floor_id: 'first',
      target_tile_x: 1,
      target_tile_y: 0,
      traversal_cost: 40,
    };
    const reciprocal = buildReciprocalStair(source, 'ground');

    // Reciprocal position is the target of the source
    expect(reciprocal.tile_x).toBe(1);
    expect(reciprocal.tile_y).toBe(0);

    // Reciprocal points back to the source floor and tile
    expect(reciprocal.target_floor_id).toBe('ground');
    expect(reciprocal.target_tile_x).toBe(2);
    expect(reciprocal.target_tile_y).toBe(3);

    // Inherits name and cost
    expect(reciprocal.name).toBe('Main stairs');
    expect(reciprocal.traversal_cost).toBe(40);
  });

  it('copies undefined name without error', () => {
    const source: StairTile = {
      tile_x: 0,
      tile_y: 0,
      target_floor_id: 'upper',
      target_tile_x: 0,
      target_tile_y: 0,
    };
    const reciprocal = buildReciprocalStair(source, 'lower');
    expect(reciprocal.name).toBeUndefined();
  });
});

describe('upsertStairTile', () => {
  const base: StairTile = { tile_x: 1, tile_y: 2, name: 'Old name' };

  it('appends when no existing stair at that position', () => {
    const result = upsertStairTile([], base);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(base);
  });

  it('replaces an existing stair at the same position', () => {
    const updated: StairTile = { tile_x: 1, tile_y: 2, name: 'New name', traversal_cost: 30 };
    const result = upsertStairTile([base], updated);
    expect(result).toHaveLength(1);
    expect(result[0]!.name).toBe('New name');
    expect(result[0]!.traversal_cost).toBe(30);
  });

  it('does not mutate the input array', () => {
    const original = [base];
    const updated: StairTile = { tile_x: 1, tile_y: 2, name: 'Changed' };
    upsertStairTile(original, updated);
    expect(original[0]!.name).toBe('Old name');
  });

  it('preserves unrelated stairs', () => {
    const other: StairTile = { tile_x: 3, tile_y: 3 };
    const result = upsertStairTile([base, other], { tile_x: 1, tile_y: 2, name: 'Updated' });
    expect(result).toHaveLength(2);
    const kept = result.find(s => s.tile_x === 3);
    expect(kept).toBeDefined();
  });
});
