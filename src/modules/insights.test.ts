import { describe, it, expect } from 'vitest';
import { heatColour, generateInsights } from './insights.js';

describe('heatColour', () => {
  it('returns a CSS rgba string', () => {
    const colour = heatColour(0.5);
    expect(colour).toMatch(/^rgba\(/);
  });

  it('t=0 → yellow (255, 255, 0)', () => {
    const colour = heatColour(0);
    expect(colour).toBe('rgba(255,255,0,0.55)');
  });

  it('t=1 → dark red (139, 0, 0)', () => {
    const colour = heatColour(1);
    expect(colour).toBe('rgba(139,0,0,0.55)');
  });

  it('t=0.5 → intermediate colour', () => {
    const colour = heatColour(0.5);
    // Should not be yellow or dark red
    expect(colour).not.toBe('rgba(255,255,0,0.55)');
    expect(colour).not.toBe('rgba(139,0,0,0.55)');
  });

  it('clamps t below 0 to 0', () => {
    expect(heatColour(-1)).toBe(heatColour(0));
  });

  it('clamps t above 1 to 1', () => {
    expect(heatColour(2)).toBe(heatColour(1));
  });
});

describe('generateInsights', () => {
  const activeCoverage = new Set(['1,1', '2,1', '3,1']);
  const heatmap = new Map([
    ['1,1', 5],
    ['2,1', 10],
    ['4,1', 20], // high-traffic tile NOT in coverage → blind spot
    ['5,1', 15], // high-traffic tile NOT in coverage → blind spot
  ]);

  it('returns an array of insight strings', () => {
    const insights = generateInsights(activeCoverage, heatmap);
    expect(Array.isArray(insights)).toBe(true);
  });

  it('includes simulated intrusion path message', () => {
    const insights = generateInsights(activeCoverage, heatmap);
    const joined = insights.join(' ');
    expect(joined.toLowerCase()).toContain('simulated intrusion path');
  });

  it('identifies blind spots (high-traffic tiles outside coverage)', () => {
    const insights = generateInsights(activeCoverage, heatmap);
    const joined = insights.join(' ');
    // Should mention areas of concern or gaps
    expect(joined.toLowerCase()).toMatch(/gap|uncovered|blind|concern|unmonitored/);
  });

  it('returns no blind-spot message when all high-traffic tiles are covered', () => {
    const fullCoverage = new Set(['1,1', '2,1', '3,1', '4,1', '5,1']);
    const insights = generateInsights(fullCoverage, heatmap);
    const joined = insights.join(' ');
    expect(joined.toLowerCase()).not.toMatch(/gap|uncovered|blind|concern|unmonitored/);
  });

  it('returns empty array for empty heatmap', () => {
    const insights = generateInsights(new Set(), new Map());
    expect(insights).toHaveLength(0);
  });
});
