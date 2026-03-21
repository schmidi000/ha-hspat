/**
 * Compute a CSS rgba colour for a normalised heatmap value t ∈ [0, 1].
 * Interpolates from yellow (low) to dark red (high).
 * Fixed alpha of 0.55 for overlay readability.
 */
export function heatColour(t: number): string {
  const clamped = Math.max(0, Math.min(1, t));

  // Yellow: (255, 255, 0) → Orange: (255, 128, 0) → Dark red: (139, 0, 0)
  let r: number, g: number, b: number;

  if (clamped <= 0.5) {
    // Yellow → Orange
    const s = clamped / 0.5;
    r = 255;
    g = Math.round(255 - s * (255 - 128));
    b = 0;
  } else {
    // Orange → Dark red
    const s = (clamped - 0.5) / 0.5;
    r = Math.round(255 - s * (255 - 139));
    g = Math.round(128 - s * 128);
    b = 0;
  }

  return `rgba(${r},${g},${b},0.55)`;
}

/**
 * Generate neutral, non-alarmist insight strings from coverage and heatmap data.
 * Detects blind spots: high-traffic tiles that are not covered by any sensor.
 *
 * Returns an empty array when no heatmap data is available.
 */
export function generateInsights(
  coverageTiles: Set<string>,
  heatmap: Map<string, number>,
): string[] {
  if (heatmap.size === 0) return [];

  const insights: string[] = [
    'Simulated Intrusion Path heatmap is displayed on the map above.',
  ];

  const maxCount = Math.max(...heatmap.values());
  const threshold = maxCount * 0.5;

  // High-traffic tiles that lie outside sensor coverage
  const blindSpots = [...heatmap.entries()]
    .filter(([key, count]) => count >= threshold && !coverageTiles.has(key))
    .map(([key]) => key);

  if (blindSpots.length > 0) {
    insights.push(
      `${blindSpots.length} high-traffic area${blindSpots.length === 1 ? '' : 's'} ` +
      `appear unmonitored — consider reviewing sensor placement in these zones.`,
    );
  }

  return insights;
}
