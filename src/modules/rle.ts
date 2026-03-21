/**
 * Run-Length Encoding for the 2D grid array.
 * Format: "<count>x<value>,<count>x<value>,..."
 * Example: [0,0,0,3] → "3x0,1x3"
 */

export function encodeRLE(flat: number[]): string {
  if (flat.length === 0) return '';

  const runs: string[] = [];
  let current = flat[0]!;
  let count = 1;

  for (let i = 1; i < flat.length; i++) {
    if (flat[i] === current) {
      count++;
    } else {
      runs.push(`${count}x${current}`);
      current = flat[i]!;
      count = 1;
    }
  }
  runs.push(`${count}x${current}`);

  return runs.join(',');
}

export function decodeRLE(encoded: string): number[] {
  if (encoded === '') return [];

  const result: number[] = [];
  const parts = encoded.split(',');

  for (const part of parts) {
    const sep = part.indexOf('x');
    const count = parseInt(part.slice(0, sep), 10);
    const value = parseInt(part.slice(sep + 1), 10);
    for (let i = 0; i < count; i++) {
      result.push(value);
    }
  }

  return result;
}

export function flatten(grid: number[][]): number[] {
  const result: number[] = [];
  for (const row of grid) {
    for (const cell of row) {
      result.push(cell);
    }
  }
  return result;
}

export function unflatten(flat: number[], cols: number): number[][] {
  if (flat.length === 0) return [];
  const rows: number[][] = [];
  for (let i = 0; i < flat.length; i += cols) {
    rows.push(flat.slice(i, i + cols));
  }
  return rows;
}
