import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { TileType } from '../types.js';
import type { Floor } from '../types.js';

export type PaintMode = 'setup' | 'paint' | 'hardware' | 'audit';
export type BrushType = TileType.Open | TileType.Wall | TileType.Door | TileType.Window | TileType.Perimeter | TileType.Valuable | TileType.Stair;
/** @deprecated Vector mode has been removed. Only 'pixel' is used. */
export type DrawMode = 'pixel' | 'vector';
/** @deprecated Vector shapes have been removed. */
export type VectorShapeType = 'line' | 'rect';

@customElement('hspat-toolbar')
export class Toolbar extends LitElement {
  @property() mode: PaintMode = 'setup';
  @property({ type: Number }) brush: BrushType = TileType.Open;
  @property({ type: Array }) floors: Floor[] = [];
  @property() activeFloorId = '';
  @property({ type: Boolean }) showGrid = true;
  @property({ type: Boolean }) canUndo = false;
  @property({ type: Boolean }) canRedo = false;

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      background: var(--card-background-color, #fff);
      border-bottom: 1px solid var(--divider-color, #e0e0e0);
    }
    .row {
      display: flex;
      gap: 8px;
      align-items: center;
      padding: 8px;
      flex-wrap: wrap;
    }
    .row + .row {
      padding-top: 0;
      border-top: 1px solid var(--divider-color, #e0e0e0);
    }
    .mode-tabs {
      display: flex;
      gap: 4px;
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
    button.active {
      background: var(--primary-color, #03a9f4);
      color: #fff;
    }
    button.danger {
      border-color: #f44336;
      color: #f44336;
    }
    button.danger:hover {
      background: #f44336;
      color: #fff;
    }
    .brush-row {
      display: flex;
      gap: 4px;
      margin-left: 8px;
    }
    .brush-btn {
      padding: 4px 8px;
      border-radius: 4px;
      border: 2px solid transparent;
      cursor: pointer;
      font-size: 0.75rem;
      font-weight: 600;
      color: #fff;
      text-shadow: 0 1px 2px rgba(0,0,0,0.5);
      white-space: nowrap;
    }
    .brush-btn.selected {
      border-color: #000;
      box-shadow: 0 0 0 2px rgba(0,0,0,0.3);
    }
    .brush-legend {
      font-size: 0.72rem;
      color: var(--secondary-text-color, #888);
      margin-left: 4px;
      align-self: center;
    }
    .floor-tabs {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
      align-items: center;
    }
    .floor-tab {
      padding: 4px 10px;
      border: 1px solid var(--primary-color, #03a9f4);
      border-radius: 4px;
      background: transparent;
      color: var(--primary-color, #03a9f4);
      cursor: pointer;
      font-size: 0.82rem;
    }
    .floor-tab.active {
      background: var(--primary-color, #03a9f4);
      color: #fff;
    }
    .separator {
      width: 1px;
      height: 20px;
      background: var(--divider-color, #e0e0e0);
      margin: 0 4px;
    }
    .toggle-btn {
      padding: 4px 10px;
      border-radius: 4px;
      border: 1px solid var(--divider-color, #ccc);
      background: transparent;
      cursor: pointer;
      font-size: 0.78rem;
      color: var(--secondary-text-color, #666);
    }
    .toggle-btn.on {
      border-color: var(--primary-color, #03a9f4);
      color: var(--primary-color, #03a9f4);
    }
    .brush-tooltip {
      font-size: 0.72rem;
      color: var(--secondary-text-color, #888);
      margin-top: 4px;
      padding: 2px 4px;
      line-height: 1.35;
    }
    .undo-row {
      display: flex;
      gap: 4px;
    }
  `;

  private _setMode(m: PaintMode) {
    this.mode = m;
    this.dispatchEvent(new CustomEvent('mode-change', { detail: m, bubbles: true, composed: true }));
  }

  private _setBrush(b: BrushType) {
    this.brush = b;
    this.dispatchEvent(new CustomEvent('brush-change', { detail: b, bubbles: true, composed: true }));
  }

  private _switchFloor(id: string) {
    this.activeFloorId = id;
    this.dispatchEvent(new CustomEvent('floor-change', { detail: id, bubbles: true, composed: true }));
  }

  private _addFloor() {
    this.dispatchEvent(new CustomEvent('floor-add', { bubbles: true, composed: true }));
  }

  private _deleteFloor() {
    if (this.floors.length <= 1) return;
    this.dispatchEvent(new CustomEvent('floor-delete', { detail: this.activeFloorId, bubbles: true, composed: true }));
  }

  private _toggleGrid() {
    const next = !this.showGrid;
    this.showGrid = next;
    this.dispatchEvent(new CustomEvent('grid-toggle', { detail: next, bubbles: true, composed: true }));
  }

  private _undo() {
    this.dispatchEvent(new CustomEvent('undo-action', { bubbles: true, composed: true }));
  }

  private _redo() {
    this.dispatchEvent(new CustomEvent('redo-action', { bubbles: true, composed: true }));
  }

  private get _brushes(): Array<{ type: BrushType; label: string; colour: string; tip: string }> {
    return [
      { type: TileType.Open,      label: 'Open',      colour: 'rgba(0,160,0,0.7)',    tip: 'Interior walkable space (e.g. rooms, corridors). Intruders can move freely through these tiles.' },
      { type: TileType.Wall,      label: 'Wall',      colour: 'rgba(50,50,50,0.85)',  tip: 'Solid wall — impassable to intruders and blocks sensor line-of-sight.' },
      { type: TileType.Door,      label: 'Door',      colour: 'rgba(255,140,0,0.85)', tip: 'Door tile — a passage point that costs more to move through. Attach a door sensor here.' },
      { type: TileType.Window,    label: 'Window',    colour: 'rgba(0,100,255,0.75)', tip: 'Window tile — a breach point, easier to enter than a door. Attach a window sensor here.' },
      { type: TileType.Perimeter, label: 'Perimeter', colour: 'rgba(200,0,0,0.8)',    tip: 'Exterior boundary tile — marks where an intruder could enter from outside (e.g. an exterior wall face, garden edge). Unlike Open, these are potential starting points for the intruder simulation.' },
      { type: TileType.Valuable,  label: 'Valuable',  colour: 'rgba(200,160,0,0.85)', tip: "High-value target tile (e.g. safe, server, jewellery). The simulation models intruders heading here from Perimeter tiles." },
      { type: TileType.Stair,     label: 'Stairs',    colour: 'rgba(139,92,246,0.85)', tip: 'Staircase — connects this floor to another floor. After placing, link it to a stair on another floor.' },
    ];
  }

  private readonly _modeLabels: Record<PaintMode, string> = {
    setup:    '\u2699 Setup',
    paint:    '\u270F Draw',
    hardware: '\uD83D\uDCE1 Sensors',
    audit:    '\uD83D\uDEE1 Audit',
  };

  render() {
    const modes: PaintMode[] = ['setup', 'paint', 'hardware', 'audit'];
    return html`
      <!-- Row 1: mode tabs + grid toggle -->
      <div class="row">
        <div class="mode-tabs">
          ${modes.map(m => html`
            <button class=${m === this.mode ? 'active' : ''} @click=${() => this._setMode(m)}>
              ${this._modeLabels[m]}
            </button>
          `)}
        </div>
        <div class="separator"></div>
        <button
          class="toggle-btn ${this.showGrid ? 'on' : ''}"
          title="Toggle grid overlay"
          @click=${this._toggleGrid}
        >Grid: ${this.showGrid ? 'ON' : 'OFF'}</button>
      </div>

      <!-- Row 2: floor tabs (always shown) -->
      <div class="row">
        <div class="floor-tabs">
          ${this.floors.map(f => html`
            <button
              class="floor-tab ${f.id === this.activeFloorId ? 'active' : ''}"
              @click=${() => this._switchFloor(f.id)}
            >${f.name}</button>
          `)}
          <button @click=${this._addFloor} title="Add a new floor">+ Floor</button>
          ${this.floors.length > 1 ? html`
            <button class="danger" @click=${this._deleteFloor} title="Delete current floor">Delete</button>
          ` : ''}
        </div>
      </div>

      <!-- Row 3: brush row (paint mode only) -->
      ${this.mode === 'paint' ? html`
        <div class="row">
          <div class="undo-row">
            <button
              title="Undo (Ctrl+Z)"
              ?disabled=${!this.canUndo}
              @click=${this._undo}
            >&#8617; Undo</button>
            <button
              title="Redo (Ctrl+Shift+Z)"
              ?disabled=${!this.canRedo}
              @click=${this._redo}
            >&#8618; Redo</button>
          </div>
          <div class="separator"></div>
          <div class="brush-row">
            ${this._brushes.map(b => html`
              <button
                class="brush-btn ${b.type === this.brush ? 'selected' : ''}"
                title=${b.tip}
                style="background:${b.colour}"
                @click=${() => this._setBrush(b.type)}
              >${b.label}</button>
            `)}
          </div>
        </div>
        <div class="row">
          <span class="brush-tooltip">
            ${this._brushes.find(b => b.type === this.brush)?.tip ?? ''}
          </span>
        </div>
      ` : ''}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'hspat-toolbar': Toolbar;
  }
}
