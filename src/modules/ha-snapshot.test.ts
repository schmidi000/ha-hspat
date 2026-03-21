import { describe, it, expect } from 'vitest';
import { takeSnapshot, getEntityState } from './ha-snapshot.js';
import type { AreaSensor, PointSensor, HomeAssistant } from '../types.js';
import { TileType } from '../types.js';

function makeHass(states: Record<string, string>): HomeAssistant {
  return {
    states: Object.fromEntries(
      Object.entries(states).map(([id, state]) => [id, { state, attributes: {} }])
    ),
  };
}

const baseArea: AreaSensor = {
  id: 'area-1',
  entity_id: 'camera.front',
  grid_x: 5,
  grid_y: 5,
  facing_angle: 0,
  fov_angle: 90,
  max_range: 10,
};

const basePoint: PointSensor = {
  id: 'point-1',
  entity_id: 'binary_sensor.front_door',
  tile_x: 3,
  tile_y: 3,
  tile_type: TileType.Door,
};

describe('getEntityState', () => {
  it('returns the state string for a known entity', () => {
    const hass = makeHass({ 'binary_sensor.front_door': 'off' });
    expect(getEntityState(hass, 'binary_sensor.front_door')).toBe('off');
  });

  it('returns "unknown" for a missing entity', () => {
    const hass = makeHass({});
    expect(getEntityState(hass, 'sensor.missing')).toBe('unknown');
  });
});

describe('takeSnapshot — area sensor health', () => {
  it('marks sensor active when state is "on"', () => {
    const hass = makeHass({ 'camera.front': 'on' });
    const [snap] = takeSnapshot(hass, [baseArea], []);
    expect(snap!.health).toBe('active');
    expect(snap!.reason).toBeUndefined();
  });

  it('marks sensor active when state is "off"', () => {
    const hass = makeHass({ 'camera.front': 'off' });
    const [snap] = takeSnapshot(hass, [baseArea], []);
    expect(snap!.health).toBe('active');
  });

  it('marks sensor offline when state is "unavailable"', () => {
    const hass = makeHass({ 'camera.front': 'unavailable' });
    const [snap] = takeSnapshot(hass, [baseArea], []);
    expect(snap!.health).toBe('offline');
    expect(snap!.reason).toBe('unavailable');
  });

  it('marks sensor offline when state is "unknown"', () => {
    const hass = makeHass({ 'camera.front': 'unknown' });
    const [snap] = takeSnapshot(hass, [baseArea], []);
    expect(snap!.health).toBe('offline');
    expect(snap!.reason).toBe('unknown');
  });

  it('marks sensor offline when entity is missing from hass', () => {
    const hass = makeHass({});
    const [snap] = takeSnapshot(hass, [baseArea], []);
    expect(snap!.health).toBe('offline');
  });
});

describe('takeSnapshot — battery health', () => {
  const sensorWithBatt: AreaSensor = { ...baseArea, battery_entity_id: 'sensor.cam_battery' };

  it('marks sensor active when battery is above threshold', () => {
    const hass = makeHass({ 'camera.front': 'on', 'sensor.cam_battery': '50' });
    const [snap] = takeSnapshot(hass, [sensorWithBatt], []);
    expect(snap!.health).toBe('active');
  });

  it('marks sensor offline when battery is below 5%', () => {
    const hass = makeHass({ 'camera.front': 'on', 'sensor.cam_battery': '4' });
    const [snap] = takeSnapshot(hass, [sensorWithBatt], []);
    expect(snap!.health).toBe('offline');
    expect(snap!.reason).toContain('battery');
  });

  it('marks sensor offline when battery is exactly 0%', () => {
    const hass = makeHass({ 'camera.front': 'on', 'sensor.cam_battery': '0' });
    const [snap] = takeSnapshot(hass, [sensorWithBatt], []);
    expect(snap!.health).toBe('offline');
  });

  it('marks sensor active when battery is exactly 5%', () => {
    const hass = makeHass({ 'camera.front': 'on', 'sensor.cam_battery': '5' });
    const [snap] = takeSnapshot(hass, [sensorWithBatt], []);
    expect(snap!.health).toBe('active');
  });

  it('marks sensor offline when battery entity is "unavailable"', () => {
    const hass = makeHass({ 'camera.front': 'on', 'sensor.cam_battery': 'unavailable' });
    const [snap] = takeSnapshot(hass, [sensorWithBatt], []);
    expect(snap!.health).toBe('offline');
    expect(snap!.reason).toBe('battery unavailable');
  });

  it('marks sensor offline when battery entity is "unknown"', () => {
    const hass = makeHass({ 'camera.front': 'on', 'sensor.cam_battery': 'unknown' });
    const [snap] = takeSnapshot(hass, [sensorWithBatt], []);
    expect(snap!.health).toBe('offline');
    expect(snap!.reason).toBe('battery unknown');
  });
});

describe('takeSnapshot — point sensors', () => {
  it('handles point sensors the same as area sensors for health', () => {
    const hass = makeHass({ 'binary_sensor.front_door': 'off' });
    const [snap] = takeSnapshot(hass, [], [basePoint]);
    expect(snap!.health).toBe('active');
    expect(snap!.sensor_id).toBe('point-1');
  });

  it('marks point sensor offline when unavailable', () => {
    const hass = makeHass({ 'binary_sensor.front_door': 'unavailable' });
    const [snap] = takeSnapshot(hass, [], [basePoint]);
    expect(snap!.health).toBe('offline');
  });
});

describe('takeSnapshot — sensor IDs', () => {
  it('returns sensor_id matching the sensor id field', () => {
    const hass = makeHass({ 'camera.front': 'on' });
    const [snap] = takeSnapshot(hass, [baseArea], []);
    expect(snap!.sensor_id).toBe('area-1');
  });

  it('processes both area and point sensors in order', () => {
    const hass = makeHass({ 'camera.front': 'on', 'binary_sensor.front_door': 'off' });
    const snaps = takeSnapshot(hass, [baseArea], [basePoint]);
    expect(snaps).toHaveLength(2);
    expect(snaps[0]!.sensor_id).toBe('area-1');
    expect(snaps[1]!.sensor_id).toBe('point-1');
  });
});
