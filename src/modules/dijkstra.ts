import { NOISE_FACTOR } from '../constants.js';
import type { FloorPoint, StairConnection } from '../types.js';

export interface GridPoint { x: number; y: number; }

/**
 * Weighted Dijkstra pathfinding on a 2-D cost matrix.
 *
 * Tiles with cost >= 9999 are treated as impassable walls.
 * Returns the full path (inclusive of spawn and target), or null if no path exists.
 *
 * @param noiseFactor - fractional ±noise added to each edge cost (0 = deterministic)
 */
export function weightedDijkstra(
  matrix: number[][],
  from: GridPoint,
  to: GridPoint,
  noiseFactor = 0,
): GridPoint[] | null {
  if (from.x === to.x && from.y === to.y) return [{ x: from.x, y: from.y }];

  const rows = matrix.length;
  const cols = matrix[0]?.length ?? 0;

  const key = (x: number, y: number) => `${x},${y}`;
  const WALL_COST = 9999;

  // dist[y][x] — shortest accumulated cost found so far
  const dist: number[][] = Array.from({ length: rows }, () =>
    new Array(cols).fill(Infinity)
  );
  const prev: Map<string, GridPoint> = new Map();

  // Simple binary-heap priority queue via sorted array (acceptable for grid sizes ≤ ~50×50)
  // Each entry: [cost, x, y]
  type Entry = [number, number, number];
  const queue: Entry[] = [];

  const enqueue = (cost: number, x: number, y: number) => {
    queue.push([cost, x, y]);
    // Insertion sort — efficient for small grids and incremental insertions
    let i = queue.length - 1;
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      // Use as min-heap approximation via splice — simpler: just sort on push (budget grid sizes)
      break;
    }
    queue.sort((a, b) => a[0] - b[0]);
  };

  dist[from.y]![from.x] = 0;
  enqueue(0, from.x, from.y);

  const DIRS = [
    [0, -1], [0, 1], [-1, 0], [1, 0],
    [-1, -1], [1, -1], [-1, 1], [1, 1],
  ];

  while (queue.length > 0) {
    const [cost, cx, cy] = queue.shift()!;

    if (cx === to.x && cy === to.y) {
      // Reconstruct path
      const path: GridPoint[] = [];
      let cur: GridPoint | undefined = { x: cx, y: cy };
      while (cur !== undefined) {
        path.unshift(cur);
        cur = prev.get(key(cur.x, cur.y));
      }
      return path;
    }

    if (cost > dist[cy]![cx]!) continue; // stale entry

    for (const [dx, dy] of DIRS) {
      const nx = cx + dx;
      const ny = cy + dy;
      if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;

      const tileCost = matrix[ny]![nx]!;
      if (tileCost >= WALL_COST) continue; // impassable

      // Apply ±noise to the edge weight
      const noise = noiseFactor > 0
        ? 1 + (Math.random() * 2 - 1) * noiseFactor
        : 1;
      const newCost = cost + tileCost * noise;

      if (newCost < dist[ny]![nx]!) {
        dist[ny]![nx] = newCost;
        prev.set(key(nx, ny), { x: cx, y: cy });
        enqueue(newCost, nx, ny);
      }
    }
  }

  return null; // no path found
}

// ─── Multi-floor pathfinding ──────────────────────────────────────────────────

/**
 * Dijkstra across multiple floors connected by stair edges.
 *
 * Each node is keyed as `"floorId:x,y"`.
 * Stair connections are treated as directed edges; add a reciprocal entry
 * in the caller for bi-directional travel.
 *
 * @param matrices   Map of floor_id → 2-D cost matrix (same semantics as weightedDijkstra)
 * @param stairs     Directed stair connections between floors
 * @param from       Starting FloorPoint
 * @param to         Target FloorPoint
 * @param noiseFactor Optional noise applied to edge weights (default 0 = deterministic)
 */
export function multiFloorDijkstra(
  matrices: Record<string, number[][]>,
  stairs: StairConnection[],
  from: FloorPoint,
  to: FloorPoint,
  noiseFactor = 0,
): FloorPoint[] | null {
  if (from.floor_id === to.floor_id && from.x === to.x && from.y === to.y) {
    return [{ floor_id: from.floor_id, x: from.x, y: from.y }];
  }

  const WALL_COST = 9999;
  const key = (fp: FloorPoint) => `${fp.floor_id}:${fp.x},${fp.y}`;
  const toKey = key(to);

  const dist = new Map<string, number>();
  const prev = new Map<string, FloorPoint>();
  type Entry = [number, FloorPoint];
  const queue: Entry[] = [];

  const enqueue = (cost: number, node: FloorPoint) => {
    queue.push([cost, node]);
    queue.sort((a, b) => a[0] - b[0]);
  };

  const fromKey = key(from);
  dist.set(fromKey, 0);
  enqueue(0, from);

  const DIRS = [[0,-1],[0,1],[-1,0],[1,0],[-1,-1],[1,-1],[-1,1],[1,1]];

  while (queue.length > 0) {
    const [cost, cur] = queue.shift()!;
    const ck = key(cur);

    if (ck === toKey) {
      // Reconstruct path
      const path: FloorPoint[] = [];
      let node: FloorPoint | undefined = cur;
      while (node !== undefined) {
        path.unshift(node);
        node = prev.get(key(node));
      }
      return path;
    }

    if (cost > (dist.get(ck) ?? Infinity)) continue;

    const matrix = matrices[cur.floor_id];
    if (!matrix) continue;
    const rows = matrix.length;
    const cols = matrix[0]?.length ?? 0;

    // Intra-floor neighbours
    for (const [dx, dy] of DIRS) {
      const nx = cur.x + dx;
      const ny = cur.y + dy;
      if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
      const tileCost = matrix[ny]![nx]!;
      if (tileCost >= WALL_COST) continue;
      const noise = noiseFactor > 0 ? 1 + (Math.random() * 2 - 1) * noiseFactor : 1;
      const newCost = cost + tileCost * noise;
      const nb: FloorPoint = { floor_id: cur.floor_id, x: nx, y: ny };
      const nk = key(nb);
      if (newCost < (dist.get(nk) ?? Infinity)) {
        dist.set(nk, newCost);
        prev.set(nk, cur);
        enqueue(newCost, nb);
      }
    }

    // Cross-floor stair edges originating from this tile
    for (const s of stairs) {
      if (s.from_floor !== cur.floor_id || s.from_x !== cur.x || s.from_y !== cur.y) continue;
      const noise = noiseFactor > 0 ? 1 + (Math.random() * 2 - 1) * noiseFactor : 1;
      const newCost = cost + s.cost * noise;
      const nb: FloorPoint = { floor_id: s.to_floor, x: s.to_x, y: s.to_y };
      const nk = key(nb);
      if (newCost < (dist.get(nk) ?? Infinity)) {
        dist.set(nk, newCost);
        prev.set(nk, cur);
        enqueue(newCost, nb);
      }
    }
  }

  return null;
}

/**
 * Multi-floor Monte Carlo heatmap: samples random cross-floor pairs
 * and accumulates tile visit counts keyed as `"floorId:x,y"`.
 */
export function multiFloorMonteCarloHeatmap(
  matrices: Record<string, number[][]>,
  stairs: StairConnection[],
  perimeter: FloorPoint[],
  valuables: FloorPoint[],
  iterations: number,
): Map<string, number> {
  const heatmap = new Map<string, number>();
  if (perimeter.length === 0 || valuables.length === 0) return heatmap;

  for (let i = 0; i < iterations; i++) {
    const spawn = perimeter[Math.floor(Math.random() * perimeter.length)]!;
    const target = valuables[Math.floor(Math.random() * valuables.length)]!;
    const path = multiFloorDijkstra(matrices, stairs, spawn, target, NOISE_FACTOR);
    if (path === null) continue;
    for (const node of path) {
      const k = `${node.floor_id}:${node.x},${node.y}`;
      heatmap.set(k, (heatmap.get(k) ?? 0) + 1);
    }
  }

  return heatmap;
}

/**
 * Run Monte Carlo simulation: sample random perimeter→valuable pairs,
 * run weighted Dijkstra with noise, accumulate tile visit counts.
 *
 * Returns a Map<"x,y", count>.
 */
export function monteCarloHeatmap(
  matrix: number[][],
  perimeter: GridPoint[],
  valuables: GridPoint[],
  iterations: number,
): Map<string, number> {
  const heatmap = new Map<string, number>();

  if (perimeter.length === 0 || valuables.length === 0) return heatmap;

  for (let i = 0; i < iterations; i++) {
    const spawn = perimeter[Math.floor(Math.random() * perimeter.length)]!;
    const target = valuables[Math.floor(Math.random() * valuables.length)]!;

    const path = weightedDijkstra(matrix, spawn, target, NOISE_FACTOR);
    if (path === null) continue;

    for (const tile of path) {
      const k = `${tile.x},${tile.y}`;
      heatmap.set(k, (heatmap.get(k) ?? 0) + 1);
    }
  }

  return heatmap;
}
