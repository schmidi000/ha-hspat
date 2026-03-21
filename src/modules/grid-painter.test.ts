import { describe, it, expect } from 'vitest';
import { pixelToTile, normalisedHeatmap } from './grid-painter.js';

describe('pixelToTile', () => {
  it('converts top-left pixel to (0, 0)', () => {
    expect(pixelToTile(0, 0, 500, 500, 10, 10)).toEqual({ x: 0, y: 0 });
  });

  it('converts centre pixel correctly', () => {
    // canvas 100×100, grid 10×10 → tile = 10px each
    // Centre of canvas (50, 50) → tile (5, 5)
    expect(pixelToTile(50, 50, 100, 100, 10, 10)).toEqual({ x: 5, y: 5 });
  });

  it('converts bottom-right pixel to last tile', () => {
    // pixel (99, 99) on a 100×100 canvas with 10×10 grid → tile (9, 9)
    expect(pixelToTile(99, 99, 100, 100, 10, 10)).toEqual({ x: 9, y: 9 });
  });

  it('clamps negative pixels to 0', () => {
    expect(pixelToTile(-5, -5, 100, 100, 10, 10)).toEqual({ x: 0, y: 0 });
  });

  it('clamps pixels beyond canvas width/height to last tile', () => {
    expect(pixelToTile(200, 200, 100, 100, 10, 10)).toEqual({ x: 9, y: 9 });
  });

  it('handles non-square canvas and grid', () => {
    // canvas 200×100, grid 20×10
    // pixel (100, 50) → tile (10, 5)
    expect(pixelToTile(100, 50, 200, 100, 20, 10)).toEqual({ x: 10, y: 5 });
  });
});

describe('normalisedHeatmap', () => {
  it('returns empty map for empty heatmap', () => {
    const result = normalisedHeatmap(new Map());
    expect(result.size).toBe(0);
  });

  it('normalises values to [0, 1] range', () => {
    const heatmap = new Map([['0,0', 5], ['1,0', 10], ['2,0', 20]]);
    const result = normalisedHeatmap(heatmap);
    expect(result.get('2,0')).toBe(1);
    expect(result.get('0,0')).toBe(0.25);
    expect(result.get('1,0')).toBe(0.5);
  });

  it('handles single-tile heatmap (max === min)', () => {
    const heatmap = new Map([['0,0', 7]]);
    const result = normalisedHeatmap(heatmap);
    expect(result.get('0,0')).toBe(1);
  });
});
