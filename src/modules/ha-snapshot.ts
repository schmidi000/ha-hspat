import { LOW_BATTERY_PCT } from '../constants.js';
import type { AreaSensor, PointSensor, SensorHealth, SensorSnapshot, HomeAssistant } from '../types.js';

export function getEntityState(hass: HomeAssistant, entity_id: string): string {
  return hass.states[entity_id]?.state ?? 'unknown';
}

export function takeSnapshot(
  hass: HomeAssistant,
  areaSensors: AreaSensor[],
  pointSensors: PointSensor[],
): SensorSnapshot[] {
  const results: SensorSnapshot[] = [];

  const sensors: Array<{ id: string; entity_id: string; battery_entity_id?: string }> = [
    ...areaSensors,
    ...pointSensors,
  ];

  for (const sensor of sensors) {
    const state = getEntityState(hass, sensor.entity_id);
    let health: SensorHealth = 'active';
    let reason: string | undefined;

    if (state === 'unavailable' || state === 'unknown') {
      health = 'offline';
      reason = state;
    } else if (sensor.battery_entity_id) {
      const battState = getEntityState(hass, sensor.battery_entity_id);

      if (battState === 'unavailable' || battState === 'unknown') {
        health = 'offline';
        reason = `battery ${battState}`;
      } else {
        const pct = parseFloat(battState);
        if (!isNaN(pct) && pct < LOW_BATTERY_PCT) {
          health = 'offline';
          reason = `battery ${pct}%`;
        }
      }
    }

    results.push({ sensor_id: sensor.id, health, reason });
  }

  return results;
}
