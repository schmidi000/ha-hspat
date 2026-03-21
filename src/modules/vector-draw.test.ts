import { describe, it, expect } from 'vitest';
import {
  normToTile,
  rasterizeLine,
  rasterizeRect,
  rasterizeShape,
} from './vector-draw.js';
import { TileType } from '../types.js';
import type { SvgShape } from '../types.js';

// ─── normToTile ───────────────────────────────────────────────────────────────

describe('normToTile', () => {
  it('maps origin to (0, 0)', () => {
    expect(normToTile([0, 0], 10, 10)).toEqual([0, 0]);
  });

  it('maps (1, 1) to bottom-right tile', () => {
    expect(normToTile([1, 1], 10, 10)).toEqual([9, 9]);
  });

  it('maps (0.5, 0.5) to center', () => {
    expect(normToTile([0.5, 0.5], 10, 10)).toEqual([5, 5]);
  });

  it('clamps out-of-range values to grid bounds', () => {
    expect(normToTile([-0.1, 1.5], 10, 10)).toEqual([0, 9]);
  });
});

// ─── rasterizeLine ────────────────────────────────────────────────────────────

describe('rasterizeLine', () => {
  it('produces a horizontal line', () => {
    const tiles = rasterizeLine(0, 0, 3, 0, 1);
    const xs = tiles.map(t => t.x);
    const ys = tiles.map(t => t.y);
    expect(xs).toContain(0);
    expect(xs).toContain(1);
    expect(xs).toContain(2);
    expect(xs).toContain(3);
    expect(ys.every(y => y === 0)).toBe(true);
  });

  it('produces a vertical line', () => {
    const tiles = rasterizeLine(2, 0, 2, 4, 1);
    expect(tiles.some(t => t.x === 2 && t.y === 0)).toBe(true);
    expect(tiles.some(t => t.x === 2 && t.y === 4)).toBe(true);
    expect(tiles.every(t => t.x === 2)).toBe(true);
  });

  it('includes both endpoints for a diagonal', () => {
    const tiles = rasterizeLine(0, 0, 3, 3, 1);
    expect(tiles.some(t => t.x === 0 && t.y === 0)).toBe(true);
    expect(tiles.some(t => t.x === 3 && t.y === 3)).toBe(true);
  });

  it('returns no duplicate tiles', () => {
    const tiles = rasterizeLine(0, 0, 5, 0, 1);
    const keys = tiles.map(t => `${t.x},${t.y}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('thickness=2 produces more tiles than thickness=1', () => {
    const thin = rasterizeLine(0, 0, 5, 5, 1);
    const thick = rasterizeLine(0, 0, 5, 5, 2);
    expect(thick.length).toBeGreaterThan(thin.length);
  });

  it('single-point line returns the tile itself', () => {
    const tiles = rasterizeLine(3, 3, 3, 3, 1);
    expect(tiles).toHaveLength(1);
    expect(tiles[0]).toEqual({ x: 3, y: 3 });
  });
});

// ─── rasterizeRect ────────────────────────────────────────────────────────────

describe('rasterizeRect', () => {
  it('outlines a 3×3 rect with 8 perimeter tiles', () => {
    // rect from (0,0) to (2,2): top/bottom rows + left/right cols
    const tiles = rasterizeRect(0, 0, 2, 2, false);
    expect(tiles.length).toBe(8);
  });

  it('fills a 3×3 rect with 9 tiles', () => {
    const tiles = rasterizeRect(0, 0, 2, 2, true);
    expect(tiles.length).toBe(9);
  });

  it('works when second corner precedes first corner', () => {
    const a = rasterizeRect(0, 0, 3, 3, false);
    const b = rasterizeRect(3, 3, 0, 0, false);
    const keysA = new Set(a.map(t => `${t.x},${t.y}`));
    const keysB = new Set(b.map(t => `${t.x},${t.y}`));
    expect(keysA).toEqual(keysB);
  });

  it('returns no duplicate tiles', () => {
    const tiles = rasterizeRect(1, 1, 5, 4, false);
    const keys = tiles.map(t => `${t.x},${t.y}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('1×1 rect (single tile) returns exactly one tile filled or outlined', () => {
    expect(rasterizeRect(2, 2, 2, 2, false)).toHaveLength(1);
    expect(rasterizeRect(2, 2, 2, 2, true)).toHaveLength(1);
  });
});

// ─── rasterizeShape ──────────────────────────────────────────────────────────

describe('rasterizeShape', () => {
  const cols = 20;
  const rows = 20;

  it('rasterizes a line shape using normalised coords', () => {
    const shape: SvgShape = {
      id: 's1',
      type: 'line',
      tile_type: TileType.Wall,
      points: [[0, 0], [0.5, 0]], // horizontal half-row
      thickness: 1,
    };
    const tiles = rasterizeShape(shape, cols, rows);
    // Should produce tiles spanning x=0 to x≈10
    expect(tiles.length).toBeGreaterThan(5);
    expect(tiles.every(t => t.y === 0)).toBe(true);
  });

  it('rasterizes a rect shape', () => {
    const shape: SvgShape = {
      id: 's2',
      type: 'rect',
      tile_type: TileType.Wall,
      points: [[0, 0], [0.5, 0.5]],
      thickness: 1,
    };
    const tiles = rasterizeShape(shape, cols, rows);
    expect(tiles.length).toBeGreaterThan(0);
  });

  it('rasterizes a polyline through multiple points', () => {
    const shape: SvgShape = {
      id: 's3',
      type: 'polyline',
      tile_type: TileType.Wall,
      points: [[0, 0], [0.5, 0], [0.5, 0.5]],
      thickness: 1,
    };
    const tiles = rasterizeShape(shape, cols, rows);
    expect(tiles.length).toBeGreaterThan(0);
  });

  it('rasterizes a polygon (closed polyline)', () => {
    const shape: SvgShape = {
      id: 's4',
      type: 'polygon',
      tile_type: TileType.Wall,
      points: [[0, 0], [0.5, 0], [0.5, 0.5], [0, 0.5]],
      thickness: 1,
    };
    const tiles = rasterizeShape(shape, cols, rows);
    expect(tiles.length).toBeGreaterThan(0);
  });

  it('returns no duplicate tiles', () => {
    const shape: SvgShape = {
      id: 's5',
      type: 'rect',
      tile_type: TileType.Wall,
      points: [[0, 0], [0.5, 0.5]],
      thickness: 1,
    };
    const tiles = rasterizeShape(shape, cols, rows);
    const keys = tiles.map(t => `${t.x},${t.y}`);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
