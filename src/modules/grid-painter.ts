import { TileType } from '../types.js';
import { TILE_COLOURS, COVERAGE_COLOUR } from '../constants.js';
import { heatColour } from './insights.js';
import type { HspatConfig } from '../types.js';

/** ID of the sensor currently being placed on the map (null = none). */
export type PlacingState = { id: string; sensorType: 'area' | 'point' } | null;

export interface TileCoord { x: number; y: number; }

/**
 * Convert a canvas pixel coordinate to a grid tile index.
 * Clamps to valid tile range.
 */
export function pixelToTile(
  pixelX: number,
  pixelY: number,
  canvasWidth: number,
  canvasHeight: number,
  gridCols: number,
  gridRows: number,
): TileCoord {
  const rawX = Math.floor((pixelX / canvasWidth) * gridCols);
  const rawY = Math.floor((pixelY / canvasHeight) * gridRows);
  return {
    x: Math.max(0, Math.min(gridCols - 1, rawX)),
    y: Math.max(0, Math.min(gridRows - 1, rawY)),
  };
}

/**
 * Normalise a raw heatmap (count values) to [0, 1].
 * If only one unique value exists, it is mapped to 1.
 */
export function normalisedHeatmap(
  heatmap: Map<string, number>,
): Map<string, number> {
  if (heatmap.size === 0) return new Map();

  const max = Math.max(...heatmap.values());
  if (max === 0) return new Map([...heatmap].map(([k]) => [k, 0]));

  return new Map([...heatmap].map(([k, v]) => [k, v / max]));
}

/**
 * Paint the full grid canvas:
 *  1. Clear
 *  2. Floorplan image (if available)
 *  3. Non-wall tiles first pass
 *  4. Perimeter / Valuable overlays (skip on wall tiles)
 *  5. Coverage overlay
 *  6. Heatmap overlay
 *  7. Wall tiles second pass (on top)
 *  8. Grid lines (optional)
 *  9. Stair glyphs
 * 10. Sensor markers + hover highlight
 * 11. Placement cursor (when placing a sensor)
 */
export function paintGrid(
  ctx: CanvasRenderingContext2D,
  config: HspatConfig,
  grid: number[][],
  coverageTiles: Set<string>,
  heatmap: Map<string, number>,
  floorplanImg: HTMLImageElement | null,
  placing: PlacingState = null,
  showGrid = true,
  hoverTile: { x: number; y: number } | null = null,
): void {
  const { grid_cols, grid_rows } = config;
  const { width, height } = ctx.canvas;
  const tileW = width / grid_cols;
  const tileH = height / grid_rows;

  ctx.clearRect(0, 0, width, height);

  // 1. Floorplan background
  if (floorplanImg?.complete) {
    ctx.globalAlpha = 0.6;
    ctx.drawImage(floorplanImg, 0, 0, width, height);
    ctx.globalAlpha = 1;
  }

  // 2. Non-wall tiles (first pass)
  for (let row = 0; row < grid_rows; row++) {
    for (let col = 0; col < grid_cols; col++) {
      const tile = grid[row]?.[col] ?? TileType.Wall;
      if (tile === TileType.Wall) continue;
      ctx.fillStyle = TILE_COLOURS[tile as TileType] ?? 'rgba(0,200,0,0.1)';
      ctx.fillRect(col * tileW, row * tileH, tileW, tileH);
    }
  }

  // 3. Perimeter / Valuable config overlays (skip on wall tiles)
  for (const t of config.perimeter ?? []) {
    if ((grid[t.y]?.[t.x] ?? TileType.Wall) === TileType.Wall) continue;
    ctx.fillStyle = TILE_COLOURS[TileType.Perimeter]!;
    ctx.fillRect(t.x * tileW, t.y * tileH, tileW, tileH);
    ctx.strokeStyle = 'rgba(255,0,0,0.8)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(t.x * tileW + 1, t.y * tileH + 1, tileW - 2, tileH - 2);
  }
  for (const t of config.valuables ?? []) {
    if ((grid[t.y]?.[t.x] ?? TileType.Wall) === TileType.Wall) continue;
    ctx.fillStyle = TILE_COLOURS[TileType.Valuable]!;
    ctx.fillRect(t.x * tileW, t.y * tileH, tileW, tileH);
    ctx.strokeStyle = 'rgba(255,180,0,0.9)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(t.x * tileW + 1, t.y * tileH + 1, tileW - 2, tileH - 2);
  }

  // 4. Coverage overlay
  if (coverageTiles.size > 0) {
    ctx.fillStyle = COVERAGE_COLOUR;
    for (const key of coverageTiles) {
      const [xs, ys] = key.split(',');
      const x = parseInt(xs!, 10);
      const y = parseInt(ys!, 10);
      ctx.fillRect(x * tileW, y * tileH, tileW, tileH);
    }
  }

  // 5. Heatmap overlay
  if (heatmap.size > 0) {
    const normed = normalisedHeatmap(heatmap);
    for (const [key, t] of normed) {
      const [xs, ys] = key.split(',');
      const x = parseInt(xs!, 10);
      const y = parseInt(ys!, 10);
      ctx.fillStyle = heatColour(t);
      ctx.fillRect(x * tileW, y * tileH, tileW, tileH);
    }
  }

  // 6. Wall tiles (second pass — drawn on top for full opacity)
  for (let row = 0; row < grid_rows; row++) {
    for (let col = 0; col < grid_cols; col++) {
      const tile = grid[row]?.[col] ?? TileType.Wall;
      if (tile !== TileType.Wall) continue;
      ctx.fillStyle = TILE_COLOURS[TileType.Wall]!;
      ctx.fillRect(col * tileW, row * tileH, tileW, tileH);
    }
  }

  // 7. Grid lines (optional)
  if (showGrid) {
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 0.5;
    for (let col = 0; col <= grid_cols; col++) {
      ctx.beginPath();
      ctx.moveTo(col * tileW, 0);
      ctx.lineTo(col * tileW, height);
      ctx.stroke();
    }
    for (let row = 0; row <= grid_rows; row++) {
      ctx.beginPath();
      ctx.moveTo(0, row * tileH);
      ctx.lineTo(width, row * tileH);
      ctx.stroke();
    }
  }

  // 8. Stair glyphs
  {
    const fontSize = Math.max(8, Math.min(tileW, tileH) * 0.65);
    ctx.save();
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    for (let row = 0; row < grid_rows; row++) {
      for (let col = 0; col < grid_cols; col++) {
        if ((grid[row]?.[col] ?? -1) === TileType.Stair) {
          ctx.fillText('\u2195', (col + 0.5) * tileW, (row + 0.5) * tileH);
        }
      }
    }
    ctx.restore();
  }

  // 9. Sensor markers
  const r = Math.min(tileW, tileH) * 0.38;
  for (const s of config.area_sensors ?? []) {
    if (s.grid_x < 0 || s.grid_y < 0) continue;
    const cx = (s.grid_x + 0.5) * tileW;
    const cy = (s.grid_y + 0.5) * tileH;
    const isHovered = hoverTile?.x === s.grid_x && hoverTile?.y === s.grid_y;
    ctx.fillStyle = placing?.id === s.id ? 'rgba(0,220,255,0.6)' : 'rgba(0,180,255,0.85)';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    if (isHovered) {
      ctx.strokeStyle = 'rgba(255,80,80,0.9)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, r + 4, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  for (const s of config.point_sensors ?? []) {
    if (s.tile_x < 0 || s.tile_y < 0) continue;
    const cx = (s.tile_x + 0.5) * tileW;
    const cy = (s.tile_y + 0.5) * tileH;
    const isHovered = hoverTile?.x === s.tile_x && hoverTile?.y === s.tile_y;
    ctx.fillStyle = placing?.id === s.id ? 'rgba(255,160,0,0.6)' : 'rgba(255,100,0,0.85)';
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    if (isHovered) {
      ctx.strokeStyle = 'rgba(255,80,80,0.9)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.8 + 4, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // 10. Placement cursor hint
  if (placing) {
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${Math.max(12, tileH * 1.2)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Click to place sensor', width / 2, height / 2);
  }
}
