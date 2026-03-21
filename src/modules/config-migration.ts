import type { HspatConfig, Floor, AreaSensor, PointSensor, ValuableTile, PerimeterTile } from '../types.js';
import { DEFAULT_GRID_COLS, DEFAULT_GRID_ROWS } from '../constants.js';

/**
 * Migrate a legacy single-floor HspatConfig to the multi-floor format.
 *
 * - If `floors` is already present the config is returned as-is (idempotent).
 * - Sensors whose `floor_id` is unset are stamped with the root floor's id.
 * - The original config object is never mutated.
 */
export function migrateToMultiFloor(config: HspatConfig): HspatConfig {
  if (config.floors && config.floors.length > 0) {
    // Already multi-floor — only backfill floor_id on sensors that lack one
    return backfillFloorIds(config);
  }

  const floorId = 'floor-0';

  const area_sensors: AreaSensor[] = (config.area_sensors ?? []).map(s => ({
    ...s,
    floor_id: s.floor_id ?? floorId,
  }));

  const point_sensors: PointSensor[] = (config.point_sensors ?? []).map(s => ({
    ...s,
    floor_id: s.floor_id ?? floorId,
  }));

  const valuables: ValuableTile[] = (config.valuables ?? []).map(v => ({
    ...v,
    floor_id: v.floor_id ?? floorId,
  }));

  const perimeter: PerimeterTile[] = (config.perimeter ?? []).map(p => ({
    ...p,
    floor_id: p.floor_id ?? floorId,
  }));

  const floor: Floor = {
    id: floorId,
    name: 'Ground Floor',
    grid_cols: config.grid_cols ?? DEFAULT_GRID_COLS,
    grid_rows: config.grid_rows ?? DEFAULT_GRID_ROWS,
    grid_rle: config.grid_rle ?? '',
    floorplan_url: config.floorplan_url,
    area_sensors,
    point_sensors,
    valuables,
    perimeter,
    stair_tiles: [],
    svg_shapes: [],
  };

  return {
    ...config,
    floors: [floor],
    active_floor_id: floorId,
    // Keep legacy flat fields intact for backward compatibility with HA YAML
    area_sensors,
    point_sensors,
    valuables,
    perimeter,
  };
}

/** Stamp floor_id onto sensors that are missing it, without adding new floors. */
function backfillFloorIds(config: HspatConfig): HspatConfig {
  if (!config.floors) return config;
  const firstFloorId = config.floors[0]?.id ?? 'floor-0';

  const floors: Floor[] = config.floors.map(floor => ({
    ...floor,
    area_sensors: floor.area_sensors.map(s => ({
      ...s,
      floor_id: s.floor_id ?? floor.id,
    })),
    point_sensors: floor.point_sensors.map(s => ({
      ...s,
      floor_id: s.floor_id ?? floor.id,
    })),
    valuables: floor.valuables.map(v => ({
      ...v,
      floor_id: v.floor_id ?? floor.id,
    })),
    perimeter: floor.perimeter.map(p => ({
      ...p,
      floor_id: p.floor_id ?? floor.id,
    })),
  }));

  return {
    ...config,
    floors,
    active_floor_id: config.active_floor_id ?? firstFloorId,
  };
}
