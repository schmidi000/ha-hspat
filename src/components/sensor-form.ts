import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { TileType } from '../types.js';
import type { HspatConfig, AreaSensor, PointSensor } from '../types.js';

/** Sentinel value meaning "sensor not yet placed on the map". */
const UNPLACED = -1;

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
  @state() private _aError = '';

  // Point sensor draft
  @state() private _pEntityId = '';
  @state() private _pBatteryId = '';
  @state() private _pTileType: TileType.Door | TileType.Window = TileType.Door;
  @state() private _pError = '';

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
    .field-help {
      font-size: 0.75rem;
      color: var(--secondary-text-color, #888);
      margin: -6px 0 8px;
      line-height: 1.35;
    }
    input, select {
      width: 100%;
      padding: 6px;
      border: 1px solid var(--divider-color, #ccc);
      border-radius: 4px;
      margin-bottom: 4px;
      box-sizing: border-box;
      font-size: 0.85rem;
    }
    .error-msg {
      font-size: 0.78rem;
      color: #f44336;
      margin: 0 0 10px;
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
    .numeric-row {
      display: flex;
      gap: 8px;
      margin-bottom: 4px;
    }
    .numeric-row .numeric-field {
      flex: 1;
      min-width: 0;
    }
    .numeric-row label {
      margin-bottom: 2px;
    }
    .numeric-row input {
      margin-bottom: 0;
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
    .sensor-info { flex: 1; min-width: 0; }
    .sensor-name {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .unplaced-badge {
      display: inline-block;
      font-size: 0.7rem;
      background: #ff9800;
      color: #fff;
      border-radius: 3px;
      padding: 1px 5px;
      margin-left: 4px;
    }
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
    if (!this._aEntityId.trim()) {
      this._aError = 'Entity ID is required. Find it in HA under Developer Tools → States.';
      return;
    }
    this._aError = '';
    const newSensor: AreaSensor = {
      id: `area_${Date.now()}`,
      entity_id: this._aEntityId.trim(),
      battery_entity_id: this._aBatteryId.trim() || undefined,
      grid_x: UNPLACED,
      grid_y: UNPLACED,
      facing_angle: this._aFacing,
      fov_angle: this._aFov,
      max_range: this._aRange,
    };
    this._fireConfigChange({
      area_sensors: [...this.config.area_sensors, newSensor],
    });
    // Auto-enter placement mode so the user immediately clicks to place it
    this._startPlacement(newSensor.id, 'area');
    this._aEntityId = '';
    this._aBatteryId = '';
  }

  private _removeAreaSensor(id: string) {
    this._fireConfigChange({
      area_sensors: this.config.area_sensors.filter(s => s.id !== id),
    });
  }

  private _addPointSensor() {
    if (!this._pEntityId.trim()) {
      this._pError = 'Entity ID is required. Find it in HA under Developer Tools → States.';
      return;
    }
    this._pError = '';
    const newSensor: PointSensor = {
      id: `point_${Date.now()}`,
      entity_id: this._pEntityId.trim(),
      battery_entity_id: this._pBatteryId.trim() || undefined,
      tile_x: UNPLACED,
      tile_y: UNPLACED,
      tile_type: this._pTileType,
    };
    this._fireConfigChange({
      point_sensors: [...this.config.point_sensors, newSensor],
    });
    // Auto-enter placement mode
    this._startPlacement(newSensor.id, 'point');
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
          ? 'Area sensors (motion detectors, cameras) watch a cone-shaped zone. After adding, click the map to place the sensor.'
          : 'Point sensors (door/window contacts) are attached to a single door or window tile. After adding, click the map to place the sensor.'}
      </p>

      ${this._tab === 'area' ? this._renderAreaForm() : this._renderPointForm()}
    `;
  }

  private _renderAreaForm() {
    return html`
      <label>Entity ID
        <input .value=${this._aEntityId}
          @input=${(e: Event) => { this._aEntityId = (e.target as HTMLInputElement).value; this._aError = ''; }}
          placeholder="binary_sensor.motion_hallway" />
      </label>
      <p class="field-help">The Home Assistant entity ID of the motion or camera sensor (e.g. <em>binary_sensor.hallway_motion</em>). Find it under Developer Tools → States.</p>

      <label>Battery Entity ID <em style="font-weight:normal;opacity:0.7">(optional)</em>
        <input .value=${this._aBatteryId}
          @input=${(e: Event) => { this._aBatteryId = (e.target as HTMLInputElement).value; }}
          placeholder="sensor.camera_battery" />
      </label>
      <p class="field-help">If set, this sensor is treated as offline during the audit when battery drops below 5%.</p>

      <div class="numeric-row">
        <div class="numeric-field">
          <label>Facing °
            <input type="number" min="0" max="359" .value=${String(this._aFacing)}
              title="Direction the sensor faces: 0°=East, 90°=South, 180°=West, 270°=North"
              @change=${(e: Event) => { this._aFacing = parseInt((e.target as HTMLInputElement).value, 10); }} />
          </label>
        </div>
        <div class="numeric-field">
          <label>FOV °
            <input type="number" min="1" max="360" .value=${String(this._aFov)}
              title="Total cone width. Most PIR sensors are 90°–120°."
              @change=${(e: Event) => { this._aFov = parseInt((e.target as HTMLInputElement).value, 10); }} />
          </label>
        </div>
        <div class="numeric-field">
          <label>Range (tiles)
            <input type="number" min="1" max="50" .value=${String(this._aRange)}
              title="Detection distance in grid tiles (~0.5–1 m each)"
              @change=${(e: Event) => { this._aRange = parseInt((e.target as HTMLInputElement).value, 10); }} />
          </label>
        </div>
      </div>
      <p class="field-help">Facing: 0°=East · 90°=South · FOV: cone width (PIR = 90°–120°) · Range: tiles (~0.5–1 m each)</p>

      ${this._aError ? html`<p class="error-msg">${this._aError}</p>` : ''}
      <button class="add-btn" @click=${this._addAreaSensor}>Add Area Sensor</button>

      <div class="sensor-list">
        ${this.config.area_sensors.map(s => html`
          <div class="sensor-item">
            <div class="sensor-info">
              <div class="sensor-name">
                ${s.entity_id}
                ${s.grid_x < 0 ? html`<span class="unplaced-badge">Not placed</span>` : html`<span style="opacity:0.6;font-size:0.75rem"> (${s.grid_x},${s.grid_y})</span>`}
              </div>
              <div style="opacity:0.6;font-size:0.75rem">${s.fov_angle}° FOV · range ${s.max_range}</div>
            </div>
            <button class="place-btn" @click=${() => this._startPlacement(s.id, 'area')}>Place on map</button>
            <button class="remove-btn" aria-label="Remove sensor ${s.entity_id}" @click=${() => this._removeAreaSensor(s.id)}>×</button>
          </div>
        `)}
      </div>
    `;
  }

  private _renderPointForm() {
    return html`
      <label>Entity ID
        <input .value=${this._pEntityId}
          @input=${(e: Event) => { this._pEntityId = (e.target as HTMLInputElement).value; this._pError = ''; }}
          placeholder="binary_sensor.front_door" />
      </label>
      <p class="field-help">The Home Assistant entity ID of the door/window contact sensor. It reports <em>on</em> when open, <em>off</em> when closed.</p>

      <label>Battery Entity ID <em style="font-weight:normal;opacity:0.7">(optional)</em>
        <input .value=${this._pBatteryId}
          @input=${(e: Event) => { this._pBatteryId = (e.target as HTMLInputElement).value; }}
          placeholder="sensor.front_door_battery" />
      </label>
      <p class="field-help">If set, the sensor is treated as offline during the audit when battery drops below 5%.</p>

      <label>Sensor Type
        <select @change=${(e: Event) => { this._pTileType = parseInt((e.target as HTMLSelectElement).value, 10) as TileType.Door | TileType.Window; }}>
          <option value=${TileType.Door} ?selected=${this._pTileType === TileType.Door}>Door</option>
          <option value=${TileType.Window} ?selected=${this._pTileType === TileType.Window}>Window</option>
        </select>
      </label>
      <p class="field-help">Whether this sensor is attached to a door tile or a window tile on the map.</p>

      ${this._pError ? html`<p class="error-msg">${this._pError}</p>` : ''}
      <button class="add-btn" @click=${this._addPointSensor}>Add Point Sensor</button>

      <div class="sensor-list">
        ${this.config.point_sensors.map(s => html`
          <div class="sensor-item">
            <div class="sensor-info">
              <div class="sensor-name">
                ${s.entity_id}
                ${s.tile_x < 0 ? html`<span class="unplaced-badge">Not placed</span>` : html`<span style="opacity:0.6;font-size:0.75rem"> (${s.tile_x},${s.tile_y})</span>`}
              </div>
              <div style="opacity:0.6;font-size:0.75rem">${s.tile_type === TileType.Door ? 'Door' : 'Window'}</div>
            </div>
            <button class="place-btn" @click=${() => this._startPlacement(s.id, 'point')}>Place on map</button>
            <button class="remove-btn" aria-label="Remove sensor ${s.entity_id}" @click=${() => this._removePointSensor(s.id)}>×</button>
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
