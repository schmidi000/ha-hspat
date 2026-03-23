import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { Floor, StairTile } from '../types.js';
import { stairLabel } from '../modules/stair-utils.js';

export interface StairModalResult {
  stairTile: StairTile;
  fromFloorId: string;
}

/**
 * Modal dialog for configuring a stair connection.
 *
 * The user gives the stair a name, sets the traversal cost, and optionally
 * picks which existing stair on another floor this stair connects to.
 * When a connection is selected the reciprocal entry is created automatically
 * by the parent (hspat-card).
 *
 * Fires 'stair-configured' with StairModalResult on confirm,
 * or 'stair-cancelled' when dismissed.
 */
@customElement('hspat-stair-modal')
export class StairModal extends LitElement {
  @property({ type: Array }) floors: Floor[] = [];
  @property() fromFloorId = '';
  @property({ type: Number }) tileX = 0;
  @property({ type: Number }) tileY = 0;

  @state() private _name = '';
  @state() private _cost = 50;
  /** Encoded as "floorId|tileX|tileY" or "" for no connection. */
  @state() private _selectedTarget = '';

  static styles = css`
    :host {
      position: fixed;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0,0,0,0.5);
      z-index: 1000;
    }
    .modal {
      background: var(--card-background-color, #fff);
      border-radius: 8px;
      padding: 24px;
      min-width: 340px;
      max-width: 480px;
      box-shadow: 0 4px 32px rgba(0,0,0,0.3);
    }
    h3 { margin: 0 0 8px; font-size: 1rem; }
    .subtitle {
      font-size: 0.8rem;
      color: var(--secondary-text-color, #888);
      margin: 0 0 16px;
    }
    label { display: block; margin-bottom: 12px; font-size: 0.85rem; }
    label span { display: block; margin-bottom: 4px; color: var(--secondary-text-color, #666); }
    label .hint {
      display: block;
      font-size: 0.75rem;
      color: var(--secondary-text-color, #888);
      margin-top: 2px;
    }
    input, select {
      width: 100%;
      padding: 6px 8px;
      border: 1px solid var(--divider-color, #ccc);
      border-radius: 4px;
      box-sizing: border-box;
      font-size: 0.9rem;
    }
    .no-stairs-hint {
      font-size: 0.8rem;
      color: #ff9800;
      background: rgba(255,152,0,0.1);
      border-radius: 4px;
      padding: 8px;
      margin-bottom: 12px;
    }
    .actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 16px; }
    .actions button {
      padding: 8px 16px;
      border-radius: 4px;
      border: none;
      cursor: pointer;
      font-size: 0.85rem;
    }
    .confirm { background: var(--primary-color, #03a9f4); color: #fff; }
    .cancel  { background: transparent; border: 1px solid var(--divider-color, #ccc) !important; }
  `;

  /** All stair tiles that exist on floors other than the source floor. */
  private get _availableTargets(): Array<{ key: string; label: string }> {
    const targets: Array<{ key: string; label: string }> = [];
    for (const floor of this.floors) {
      if (floor.id === this.fromFloorId) continue;
      for (const stair of floor.stair_tiles) {
        // Don't show the stair that already points back here (already connected)
        if (stair.target_floor_id === this.fromFloorId
          && stair.target_tile_x === this.tileX
          && stair.target_tile_y === this.tileY) continue;

        const key = `${floor.id}|${stair.tile_x}|${stair.tile_y}`;
        targets.push({ key, label: stairLabel(stair, floor) });
      }
    }
    return targets;
  }

  private _confirm() {
    let target: Pick<StairTile, 'target_floor_id' | 'target_tile_x' | 'target_tile_y'> = {};
    if (this._selectedTarget) {
      const [floorId, tx, ty] = this._selectedTarget.split('|');
      target = {
        target_floor_id: floorId,
        target_tile_x: Number(tx),
        target_tile_y: Number(ty),
      };
    }
    const stairTile: StairTile = {
      tile_x: this.tileX,
      tile_y: this.tileY,
      name: this._name.trim() || undefined,
      traversal_cost: this._cost,
      ...target,
    };
    this.dispatchEvent(new CustomEvent<StairModalResult>('stair-configured', {
      detail: { stairTile, fromFloorId: this.fromFloorId },
      bubbles: true,
      composed: true,
    }));
  }

  private _cancel() {
    this.dispatchEvent(new CustomEvent('stair-cancelled', { bubbles: true, composed: true }));
  }

  render() {
    const targets = this._availableTargets;
    const hasOtherFloors = this.floors.some(f => f.id !== this.fromFloorId);

    return html`
      <div class="modal">
        <h3>Configure Staircase</h3>
        <p class="subtitle">
          Stair tile at column ${this.tileX}, row ${this.tileY}
          on ${this.floors.find(f => f.id === this.fromFloorId)?.name ?? 'this floor'}
        </p>

        <label>
          <span>Name <em style="font-weight:normal;opacity:0.7">(optional)</em></span>
          <input
            type="text"
            .value=${this._name}
            placeholder="e.g. Hallway stairs, Basement entrance"
            @input=${(e: Event) => { this._name = (e.target as HTMLInputElement).value; }}
          />
          <span class="hint">A name makes it easier to identify this stair in the connections list.</span>
        </label>

        <label>
          <span>Traversal cost</span>
          <input
            type="number"
            min="1"
            .value=${String(this._cost)}
            @input=${(e: Event) => { this._cost = Number((e.target as HTMLInputElement).value); }}
          />
          <span class="hint">How much extra effort it takes to use this staircase (higher = harder for an intruder). Default is 50.</span>
        </label>

        ${!hasOtherFloors ? html`
          <div class="no-stairs-hint">
            No other floors exist yet. Add another floor first, then place a stair there
            to create a connection.
          </div>
        ` : targets.length === 0 ? html`
          <div class="no-stairs-hint">
            No unconnected stairs found on other floors. Place a stair tile on another
            floor first — it will then appear in this list so you can link them.
          </div>
          <label>
            <span>Connects to</span>
            <select disabled>
              <option>No stairs available on other floors</option>
            </select>
          </label>
        ` : html`
          <label>
            <span>Connects to</span>
            <select @change=${(e: Event) => { this._selectedTarget = (e.target as HTMLSelectElement).value; }}>
              <option value="">— Not connected yet —</option>
              ${targets.map(t => html`
                <option value=${t.key} ?selected=${this._selectedTarget === t.key}>
                  ${t.label}
                </option>
              `)}
            </select>
            <span class="hint">
              Select which stair on another floor this staircase exits on.
              The connection will be created automatically in both directions.
            </span>
          </label>
        `}

        <div class="actions">
          <button class="cancel" @click=${this._cancel}>Cancel</button>
          <button class="confirm" @click=${this._confirm}>Save</button>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'hspat-stair-modal': StairModal;
  }
}
