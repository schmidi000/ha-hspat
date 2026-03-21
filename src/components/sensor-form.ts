import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { TileType } from '../types.js';
import type { HspatConfig, AreaSensor, PointSensor } from '../types.js';

@customElement('hspat-sensor-form')
export class SensorForm extends LitElement {
  @property({ attribute: false }) config!: HspatConfig;
  @state() private _tab: 'area' | 'point' = 'area';

  // Area sensor draft
  @state() private _aEntityId = '';
  @state() private _aBatteryId = '';
  @state() private _aFacing = 0;
  @state() private _aFov = 110;
  @state() private _aRange = 6;

  // Point sensor draft
  @state() private _pEntityId = '';
  @state() private _pBatteryId = '';
  @state() private _pTileType: TileType.Door | TileType.Window = TileType.Door;
  @state() private _pX = 0;
  @state() private _pY = 0;

  static styles = css`
    :host { display: block; padding: 12px; }
    .tabs { display: flex; gap: 4px; margin-bottom: 8px; }
    .hint {
      font-size: 0.78rem;
      color: var(--secondary-text-color, #888);
      margin-bottom: 12px;
      line-height: 1.4;
    }
    button {
      padding: 6px 12px;
      border: 1px solid var(--primary-color, #03a9f4);
      border-radius: 4px;
      background: transparent;
      color: var(--primary-color, #03a9f4);
      cursor: pointer;
      font-size: 0.85rem;
    }
    button.active { background: var(--primary-color, #03a9f4); color: #fff; }
    label {
      display: block;
      font-size: 0.85rem;
      margin-bottom: 4px;
      color: var(--primary-text-color);
    }
    input, select {
      width: 100%;
      padding: 6px;
      border: 1px solid var(--divider-color, #ccc);
      border-radius: 4px;
      margin-bottom: 10px;
      box-sizing: border-box;
      font-size: 0.85rem;
    }
    .add-btn {
      width: 100%;
      padding: 8px;
      background: var(--primary-color, #03a9f4);
      color: #fff;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
    }
    .sensor-list { margin-top: 12px; }
    .sensor-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 0;
      border-bottom: 1px solid var(--divider-color, #eee);
      font-size: 0.82rem;
      gap: 6px;
    }
    .sensor-item span { flex: 1; }
    .place-btn {
      background: var(--primary-color, #03a9f4);
      color: #fff;
      border: none;
      border-radius: 4px;
      padding: 2px 8px;
      cursor: pointer;
      font-size: 0.78rem;
      white-space: nowrap;
    }
    .remove-btn {
      background: none;
      border: none;
      color: #f44336;
      cursor: pointer;
      font-size: 1rem;
      padding: 0 4px;
    }
  `;

  private _addAreaSensor() {
    if (!this._aEntityId.trim()) return;
    const newSensor: AreaSensor = {
      id: `area_${Date.now()}`,
      entity_id: this._aEntityId.trim(),
      battery_entity_id: this._aBatteryId.trim() || undefined,
      grid_x: 0,
      grid_y: 0,
      facing_angle: this._aFacing,
      fov_angle: this._aFov,
      max_range: this._aRange,
    };
    this._fireConfigChange({
      area_sensors: [...this.config.area_sensors, newSensor],
    });
    this._aEntityId = '';
    this._aBatteryId = '';
  }

  private _removeAreaSensor(id: string) {
    this._fireConfigChange({
      area_sensors: this.config.area_sensors.filter(s => s.id !== id),
    });
  }

  private _addPointSensor() {
    if (!this._pEntityId.trim()) return;
    const newSensor: PointSensor = {
      id: `point_${Date.now()}`,
      entity_id: this._pEntityId.trim(),
      battery_entity_id: this._pBatteryId.trim() || undefined,
      tile_x: this._pX,
      tile_y: this._pY,
      tile_type: this._pTileType,
    };
    this._fireConfigChange({
      point_sensors: [...this.config.point_sensors, newSensor],
    });
    this._pEntityId = '';
    this._pBatteryId = '';
  }

  private _removePointSensor(id: string) {
    this._fireConfigChange({
      point_sensors: this.config.point_sensors.filter(s => s.id !== id),
    });
  }

  private _fireConfigChange(patch: Partial<HspatConfig>) {
    this.dispatchEvent(new CustomEvent('config-changed', {
      bubbles: true,
      composed: true,
      detail: { config: { ...this.config, ...patch } },
    }));
  }

  private _startPlacement(id: string, sensorType: 'area' | 'point') {
    this.dispatchEvent(new CustomEvent('place-sensor', {
      bubbles: true,
      composed: true,
      detail: { id, sensorType },
    }));
  }

  render() {
    return html`
      <div class="tabs">
        <button class=${this._tab === 'area' ? 'active' : ''} @click=${() => { this._tab = 'area'; }}>
          Area Sensors
        </button>
        <button class=${this._tab === 'point' ? 'active' : ''} @click=${() => { this._tab = 'point'; }}>
          Point Sensors
        </button>
      </div>
      <p class="hint">
        ${this._tab === 'area'
          ? 'Area sensors (motion detectors, cameras) watch a cone of space. Fill in the entity ID, then click "Place on map" to position the sensor on the floor plan.'
          : 'Point sensors (door/window contacts) are attached to a single tile. Fill in the entity ID, choose the type, then click "Place on map" to position it.'}
      </p>

      ${this._tab === 'area' ? this._renderAreaForm() : this._renderPointForm()}
    `;
  }

  private _renderAreaForm() {
    return html`
      <label>Entity ID (motion/camera)
        <input .value=${this._aEntityId} @input=${(e: Event) => { this._aEntityId = (e.target as HTMLInputElement).value; }} placeholder="binary_sensor.motion_hall" />
      </label>
      <label>Battery Entity ID (optional)
        <input .value=${this._aBatteryId} @input=${(e: Event) => { this._aBatteryId = (e.target as HTMLInputElement).value; }} placeholder="sensor.camera_battery" />
      </label>
      <label>Facing Angle (0=East, 90=South)
        <input type="number" min="0" max="359" .value=${String(this._aFacing)}
          @change=${(e: Event) => { this._aFacing = parseInt((e.target as HTMLInputElement).value, 10); }} />
      </label>
      <label>FOV Angle (degrees)
        <input type="number" min="1" max="360" .value=${String(this._aFov)}
          @change=${(e: Event) => { this._aFov = parseInt((e.target as HTMLInputElement).value, 10); }} />
      </label>
      <label>Max Range (tiles)
        <input type="number" min="1" max="50" .value=${String(this._aRange)}
          @change=${(e: Event) => { this._aRange = parseInt((e.target as HTMLInputElement).value, 10); }} />
      </label>
      <button class="add-btn" @click=${this._addAreaSensor}>Add Area Sensor</button>

      <div class="sensor-list">
        ${this.config.area_sensors.map(s => html`
          <div class="sensor-item">
            <span>${s.entity_id} — ${s.fov_angle}° FOV @ (${s.grid_x},${s.grid_y})</span>
            <button class="place-btn" @click=${() => this._startPlacement(s.id, 'area')}>Place on map</button>
            <button class="remove-btn" @click=${() => this._removeAreaSensor(s.id)}>×</button>
          </div>
        `)}
      </div>
    `;
  }

  private _renderPointForm() {
    return html`
      <label>Entity ID (door/window contact)
        <input .value=${this._pEntityId} @input=${(e: Event) => { this._pEntityId = (e.target as HTMLInputElement).value; }} placeholder="binary_sensor.door_contact" />
      </label>
      <label>Battery Entity ID (optional)
        <input .value=${this._pBatteryId} @input=${(e: Event) => { this._pBatteryId = (e.target as HTMLInputElement).value; }} placeholder="sensor.door_battery" />
      </label>
      <label>Sensor Type
        <select @change=${(e: Event) => { this._pTileType = parseInt((e.target as HTMLSelectElement).value, 10) as TileType.Door | TileType.Window; }}>
          <option value=${TileType.Door} ?selected=${this._pTileType === TileType.Door}>Door</option>
          <option value=${TileType.Window} ?selected=${this._pTileType === TileType.Window}>Window</option>
        </select>
      </label>
      <label>Tile X
        <input type="number" min="0" .value=${String(this._pX)}
          @change=${(e: Event) => { this._pX = parseInt((e.target as HTMLInputElement).value, 10); }} />
      </label>
      <label>Tile Y
        <input type="number" min="0" .value=${String(this._pY)}
          @change=${(e: Event) => { this._pY = parseInt((e.target as HTMLInputElement).value, 10); }} />
      </label>
      <button class="add-btn" @click=${this._addPointSensor}>Add Point Sensor</button>

      <div class="sensor-list">
        ${this.config.point_sensors.map(s => html`
          <div class="sensor-item">
            <span>${s.entity_id} — ${s.tile_type === TileType.Door ? 'Door' : 'Window'} @ (${s.tile_x},${s.tile_y})</span>
            <button class="place-btn" @click=${() => this._startPlacement(s.id, 'point')}>Place on map</button>
            <button class="remove-btn" @click=${() => this._removePointSensor(s.id)}>×</button>
          </div>
        `)}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'hspat-sensor-form': SensorForm;
  }
}
