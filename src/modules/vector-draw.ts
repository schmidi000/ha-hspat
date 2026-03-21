/**
 * Vector shape rasterization for the hspat vector draw mode.
 *
 * All public functions operate on integer tile coordinates.
 * Normalised [0, 1] coords are converted via normToTile before rasterization.
 */

import type { SvgShape } from '../types.js';

export interface TileCoord { x: number; y: number; }

// ─── Coordinate helpers ───────────────────────────────────────────────────────

/**
 * Convert a normalised [0, 1] coordinate to a tile index.
 * Clamps to grid bounds so callers never need to guard against out-of-range.
 */
export function normToTile(norm: [number, number], cols: number, rows: number): [number, number] {
  const x = Math.max(0, Math.min(cols - 1, Math.floor(norm[0] * cols)));
  const y = Math.max(0, Math.min(rows - 1, Math.floor(norm[1] * rows)));
  return [x, y];
}

// ─── Bresenham line ───────────────────────────────────────────────────────────

/**
 * Rasterize a line from tile (x0, y0) to (x1, y1) using Bresenham's algorithm.
 * thickness ≥ 1 expands the line perpendicular to its direction.
 * Returns a deduplicated list of tile coordinates.
 */
export function rasterizeLine(
  x0: number, y0: number,
  x1: number, y1: number,
  thickness: number,
): TileCoord[] {
  const spine = bresenham(x0, y0, x1, y1);
  if (thickness <= 1) return dedup(spine);

  const r = Math.floor((thickness - 1) / 2);
  const extra = Math.ceil((thickness - 1) / 2);
  const result: TileCoord[] = [];

  for (const { x, y } of spine) {
    for (let dy = -r; dy <= extra; dy++) {
      for (let dx = -r; dx <= extra; dx++) {
        result.push({ x: x + dx, y: y + dy });
      }
    }
  }
  return dedup(result);
}

function bresenham(x0: number, y0: number, x1: number, y1: number): TileCoord[] {
  const tiles: TileCoord[] = [];
  let dx = Math.abs(x1 - x0);
  let dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;
  let cx = x0;
  let cy = y0;

  for (;;) {
    tiles.push({ x: cx, y: cy });
    if (cx === x1 && cy === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; cx += sx; }
    if (e2 < dx)  { err += dx; cy += sy; }
  }
  return tiles;
}

// ─── Rectangle ───────────────────────────────────────────────────────────────

/**
 * Rasterize a rectangle defined by two corner tiles.
 * filled=false → outline only; filled=true → all interior tiles included.
 * The two corners may be provided in any order.
 */
export function rasterizeRect(
  x0: number, y0: number,
  x1: number, y1: number,
  filled: boolean,
): TileCoord[] {
  const minX = Math.min(x0, x1);
  const maxX = Math.max(x0, x1);
  const minY = Math.min(y0, y1);
  const maxY = Math.max(y0, y1);

  const tiles: TileCoord[] = [];
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      if (filled || x === minX || x === maxX || y === minY || y === maxY) {
        tiles.push({ x, y });
      }
    }
  }
  return tiles; // already unique by construction
}

// ─── Shape dispatcher ─────────────────────────────────────────────────────────

/**
 * Convert an SvgShape (with normalised coords) into a list of tile coordinates.
 * Returns a deduplicated array.
 */
export function rasterizeShape(shape: SvgShape, cols: number, rows: number): TileCoord[] {
  const pts = shape.points.map(p => normToTile(p, cols, rows));

  switch (shape.type) {
    case 'line': {
      if (pts.length < 2) return pts.length === 1 ? [{ x: pts[0]![0], y: pts[0]![1] }] : [];
      const [p0, p1] = [pts[0]!, pts[1]!];
      return rasterizeLine(p0[0], p0[1], p1[0], p1[1], shape.thickness);
    }

    case 'rect': {
      if (pts.length < 2) return [];
      const [p0, p1] = [pts[0]!, pts[1]!];
      return rasterizeRect(p0[0], p0[1], p1[0], p1[1], false);
    }

    case 'polyline': {
      if (pts.length < 2) return [];
      const tiles: TileCoord[] = [];
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i]!;
        const b = pts[i + 1]!;
        tiles.push(...rasterizeLine(a[0], a[1], b[0], b[1], shape.thickness));
      }
      return dedup(tiles);
    }

    case 'polygon': {
      if (pts.length < 2) return [];
      const tiles: TileCoord[] = [];
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i]!;
        const b = pts[(i + 1) % pts.length]!;
        tiles.push(...rasterizeLine(a[0], a[1], b[0], b[1], shape.thickness));
      }
      return dedup(tiles);
    }

    default:
      return [];
  }
}

// ─── Internal utility ─────────────────────────────────────────────────────────

function dedup(tiles: TileCoord[]): TileCoord[] {
  const seen = new Set<string>();
  return tiles.filter(({ x, y }) => {
    const k = `${x},${y}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}
