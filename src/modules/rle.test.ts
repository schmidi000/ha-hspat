import { describe, it, expect } from 'vitest';
import { encodeRLE, decodeRLE, flatten, unflatten } from './rle.js';

describe('encodeRLE', () => {
  it('encodes a run of identical values', () => {
    expect(encodeRLE([0, 0, 0])).toBe('3x0');
  });

  it('encodes 50 consecutive zeros as "50x0"', () => {
    expect(encodeRLE(new Array(50).fill(0))).toBe('50x0');
  });

  it('encodes alternating values', () => {
    expect(encodeRLE([0, 3, 0, 3])).toBe('1x0,1x3,1x0,1x3');
  });

  it('encodes mixed runs', () => {
    expect(encodeRLE([0, 0, 0, 3])).toBe('3x0,1x3');
  });

  it('encodes a single tile', () => {
    expect(encodeRLE([2])).toBe('1x2');
  });

  it('returns empty string for empty array', () => {
    expect(encodeRLE([])).toBe('');
  });

  it('encodes all four tile types', () => {
    // Open=0, Window=1, Door=2, Wall=3
    expect(encodeRLE([0, 1, 2, 3])).toBe('1x0,1x1,1x2,1x3');
  });
});

describe('decodeRLE', () => {
  it('decodes a simple run', () => {
    expect(decodeRLE('3x0')).toEqual([0, 0, 0]);
  });

  it('decodes "50x0" to 50 zeros', () => {
    expect(decodeRLE('50x0')).toEqual(new Array(50).fill(0));
  });

  it('decodes multiple runs', () => {
    expect(decodeRLE('3x0,1x3')).toEqual([0, 0, 0, 3]);
  });

  it('decodes alternating runs', () => {
    expect(decodeRLE('1x0,1x3,1x0,1x3')).toEqual([0, 3, 0, 3]);
  });

  it('decodes a single tile', () => {
    expect(decodeRLE('1x2')).toEqual([2]);
  });

  it('returns empty array for empty string', () => {
    expect(decodeRLE('')).toEqual([]);
  });
});

describe('round-trip encode/decode', () => {
  const cases = [
    { label: 'all zeros (50x50 grid)', data: new Array(2500).fill(0) },
    { label: 'all walls', data: new Array(2500).fill(3) },
    { label: 'mixed tile types', data: [0, 0, 1, 2, 3, 3, 0, 1] },
    { label: 'single element', data: [0] },
    { label: 'empty', data: [] },
  ];

  for (const { label, data } of cases) {
    it(`round-trips: ${label}`, () => {
      expect(decodeRLE(encodeRLE(data))).toEqual(data);
    });
  }
});

describe('flatten', () => {
  it('flattens a 2D array row by row', () => {
    const grid = [[0, 1], [2, 3]];
    expect(flatten(grid)).toEqual([0, 1, 2, 3]);
  });

  it('handles a single row', () => {
    expect(flatten([[0, 0, 3]])).toEqual([0, 0, 3]);
  });

  it('returns empty array for empty grid', () => {
    expect(flatten([])).toEqual([]);
  });
});

describe('unflatten', () => {
  it('unflattens into rows of the given column count', () => {
    expect(unflatten([0, 1, 2, 3], 2)).toEqual([[0, 1], [2, 3]]);
  });

  it('unflatten then flatten round-trips', () => {
    const original = [0, 1, 2, 3, 0, 0];
    expect(flatten(unflatten(original, 2))).toEqual(original);
  });

  it('returns empty array for empty flat array', () => {
    expect(unflatten([], 5)).toEqual([]);
  });
});
