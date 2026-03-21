import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { Floor, StairTile } from '../types.js';

export interface StairModalResult {
  stairTile: StairTile;
  fromFloorId: string;
}

/**
 * Modal dialog for configuring a stair connection.
 * Fires 'stair-configured' with StairModalResult when the user confirms,
 * or 'stair-cancelled' when dismissed.
 */
@customElement('hspat-stair-modal')
export class StairModal extends LitElement {
  @property({ type: Array }) floors: Floor[] = [];
  @property() fromFloorId = '';
  @property({ type: Number }) tileX = 0;
  @property({ type: Number }) tileY = 0;

  @state() private _targetFloorId = '';
  @state() private _targetX = 0;
  @state() private _targetY = 0;
  @state() private _cost = 50;

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
      min-width: 320px;
      box-shadow: 0 4px 32px rgba(0,0,0,0.3);
    }
    h3 { margin: 0 0 16px; font-size: 1rem; }
    label { display: block; margin-bottom: 12px; font-size: 0.85rem; }
    label span { display: block; margin-bottom: 4px; color: var(--secondary-text-color, #666); }
    input, select {
      width: 100%;
      padding: 6px 8px;
      border: 1px solid var(--divider-color, #ccc);
      border-radius: 4px;
      box-sizing: border-box;
      font-size: 0.9rem;
    }
    .actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 16px; }
    .actions button { padding: 8px 16px; border-radius: 4px; border: none; cursor: pointer; font-size: 0.85rem; }
    .confirm { background: var(--primary-color, #03a9f4); color: #fff; }
    .cancel  { background: transparent; border: 1px solid var(--divider-color, #ccc) !important; }
  `;

  willUpdate() {
    // Default target floor to the first floor that isn't the source
    if (!this._targetFloorId) {
      const other = this.floors.find(f => f.id !== this.fromFloorId);
      if (other) this._targetFloorId = other.id;
    }
  }

  private _confirm() {
    if (!this._targetFloorId) return;
    const stairTile: StairTile = {
      tile_x: this.tileX,
      tile_y: this.tileY,
      target_floor_id: this._targetFloorId,
      target_tile_x: this._targetX,
      target_tile_y: this._targetY,
      traversal_cost: this._cost,
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
    const otherFloors = this.floors.filter(f => f.id !== this.fromFloorId);

    return html`
      <div class="modal">
        <h3>Configure Stair Connection</h3>
        <p style="font-size:0.85rem;margin:0 0 12px;color:var(--secondary-text-color,#666)">
          Tile (${this.tileX}, ${this.tileY}) on this floor connects to:
        </p>

        <label>
          <span>Target floor</span>
          <select @change=${(e: Event) => { this._targetFloorId = (e.target as HTMLSelectElement).value; }}>
            ${otherFloors.map(f => html`<option value=${f.id}>${f.name}</option>`)}
          </select>
        </label>

        <label>
          <span>Target tile X</span>
          <input type="number" min="0" .value=${String(this._targetX)}
            @input=${(e: Event) => { this._targetX = Number((e.target as HTMLInputElement).value); }}>
        </label>

        <label>
          <span>Target tile Y</span>
          <input type="number" min="0" .value=${String(this._targetY)}
            @input=${(e: Event) => { this._targetY = Number((e.target as HTMLInputElement).value); }}>
        </label>

        <label>
          <span>Traversal cost (default 50)</span>
          <input type="number" min="1" .value=${String(this._cost)}
            @input=${(e: Event) => { this._cost = Number((e.target as HTMLInputElement).value); }}>
        </label>

        <div class="actions">
          <button class="cancel" @click=${this._cancel}>Cancel</button>
          <button class="confirm" ?disabled=${!this._targetFloorId || otherFloors.length === 0}
            @click=${this._confirm}>Connect</button>
        </div>

        ${otherFloors.length === 0 ? html`
          <p style="color:#f44336;font-size:0.8rem;margin:8px 0 0">
            Add at least one other floor before placing stairs.
          </p>
        ` : ''}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'hspat-stair-modal': StairModal;
  }
}
