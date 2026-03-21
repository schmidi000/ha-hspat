import { describe, it, expect } from 'vitest';
import { buildCostMatrix } from './state-resolver.js';
import { TileType } from '../types.js';
import { BASE_COST, SENSOR_PENALTY, OPEN_TILE_COST } from '../constants.js';
import type { HspatConfig, SensorSnapshot, HomeAssistant } from '../types.js';

function makeHass(states: Record<string, string>): HomeAssistant {
  return {
    states: Object.fromEntries(
      Object.entries(states).map(([id, state]) => [id, { state, attributes: {} }])
    ),
  };
}

function makeConfig(overrides: Partial<HspatConfig> = {}): HspatConfig {
  return {
    type: 'custom:hspat-card',
    grid_cols: 5,
    grid_rows: 5,
    grid_rle: '',
    area_sensors: [],
    point_sensors: [],
    valuables: [],
    perimeter: [],
    disclaimer_accepted: true,
    ...overrides,
  };
}

// 3x3 grid: all Open tiles except [1][1] = Door
const doorGrid: number[][] = [
  [TileType.Open, TileType.Open, TileType.Open],
  [TileType.Open, TileType.Door, TileType.Open],
  [TileType.Open, TileType.Open, TileType.Open],
];

// 3x3 grid: all Open tiles except [1][1] = Window
const windowGrid: number[][] = [
  [TileType.Open, TileType.Open, TileType.Open],
  [TileType.Open, TileType.Window, TileType.Open],
  [TileType.Open, TileType.Open, TileType.Open],
];

describe('buildCostMatrix — base costs', () => {
  it('assigns base cost 1 to Open tiles', () => {
    const grid = [[TileType.Open]];
    const matrix = buildCostMatrix(grid, makeHass({}), makeConfig(), []);
    expect(matrix[0]![0]).toBe(BASE_COST[TileType.Open]);
  });

  it('assigns base cost 9999 to Wall tiles', () => {
    const grid = [[TileType.Wall]];
    const matrix = buildCostMatrix(grid, makeHass({}), makeConfig(), []);
    expect(matrix[0]![0]).toBe(9999);
  });

  it('assigns base cost 30 to Door tiles with no sensor', () => {
    const matrix = buildCostMatrix(doorGrid, makeHass({}), makeConfig(), []);
    expect(matrix[1]![1]).toBe(BASE_COST[TileType.Door]);
  });
});

describe('buildCostMatrix — point sensor: door state "on" (open)', () => {
  it('sets tile cost to OPEN_TILE_COST (1) when contact sensor is "on"', () => {
    const config = makeConfig({
      point_sensors: [{
        id: 'ps1', entity_id: 'binary_sensor.door', tile_x: 1, tile_y: 1,
        tile_type: TileType.Door,
      }],
    });
    const snapshots: SensorSnapshot[] = [{ sensor_id: 'ps1', health: 'active' }];
    const hass = makeHass({ 'binary_sensor.door': 'on' });

    const matrix = buildCostMatrix(doorGrid, hass, config, snapshots);
    expect(matrix[1]![1]).toBe(OPEN_TILE_COST);
  });
});

describe('buildCostMatrix — point sensor: door state "off" (closed)', () => {
  it('adds SENSOR_PENALTY to base cost when sensor is active and state is "off"', () => {
    const config = makeConfig({
      point_sensors: [{
        id: 'ps1', entity_id: 'binary_sensor.door', tile_x: 1, tile_y: 1,
        tile_type: TileType.Door,
      }],
    });
    const snapshots: SensorSnapshot[] = [{ sensor_id: 'ps1', health: 'active' }];
    const hass = makeHass({ 'binary_sensor.door': 'off' });

    const matrix = buildCostMatrix(doorGrid, hass, config, snapshots);
    expect(matrix[1]![1]).toBe(BASE_COST[TileType.Door]! + SENSOR_PENALTY);
  });
});

describe('buildCostMatrix — point sensor: offline sensor', () => {
  it('does NOT add penalty when sensor is offline, state is "off"', () => {
    const config = makeConfig({
      point_sensors: [{
        id: 'ps1', entity_id: 'binary_sensor.door', tile_x: 1, tile_y: 1,
        tile_type: TileType.Door,
      }],
    });
    const snapshots: SensorSnapshot[] = [{ sensor_id: 'ps1', health: 'offline', reason: 'unavailable' }];
    const hass = makeHass({ 'binary_sensor.door': 'off' });

    const matrix = buildCostMatrix(doorGrid, hass, config, snapshots);
    expect(matrix[1]![1]).toBe(BASE_COST[TileType.Door]);
  });
});

describe('buildCostMatrix — window sensor', () => {
  it('sets window tile cost to 1 when contact sensor is "on"', () => {
    const config = makeConfig({
      point_sensors: [{
        id: 'ps1', entity_id: 'binary_sensor.window', tile_x: 1, tile_y: 1,
        tile_type: TileType.Window,
      }],
    });
    const snapshots: SensorSnapshot[] = [{ sensor_id: 'ps1', health: 'active' }];
    const hass = makeHass({ 'binary_sensor.window': 'on' });

    const matrix = buildCostMatrix(windowGrid, hass, config, snapshots);
    expect(matrix[1]![1]).toBe(OPEN_TILE_COST);
  });

  it('adds penalty to window when sensor is active and closed', () => {
    const config = makeConfig({
      point_sensors: [{
        id: 'ps1', entity_id: 'binary_sensor.window', tile_x: 1, tile_y: 1,
        tile_type: TileType.Window,
      }],
    });
    const snapshots: SensorSnapshot[] = [{ sensor_id: 'ps1', health: 'active' }];
    const hass = makeHass({ 'binary_sensor.window': 'off' });

    const matrix = buildCostMatrix(windowGrid, hass, config, snapshots);
    expect(matrix[1]![1]).toBe(BASE_COST[TileType.Window]! + SENSOR_PENALTY);
  });
});

describe('buildCostMatrix — immutability', () => {
  it('does not mutate the original grid', () => {
    const grid = [[TileType.Open, TileType.Door]];
    const original = [[TileType.Open, TileType.Door]];
    buildCostMatrix(grid, makeHass({}), makeConfig(), []);
    expect(grid).toEqual(original);
  });
});
