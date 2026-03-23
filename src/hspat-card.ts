import { LitElement, html, css, PropertyValues } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { TileType } from './types.js';
import type { Floor } from './types.js';
import { decodeRLE, unflatten, encodeRLE, flatten } from './modules/rle.js';
import { takeSnapshot } from './modules/ha-snapshot.js';
import { buildCostMatrix } from './modules/state-resolver.js';
import { computeAllFov, applyAreaSensorCosts, addPointSensorCoverage } from './modules/shadowcast.js';
import { generateInsights } from './modules/insights.js';
import { paintGrid, pixelToTile } from './modules/grid-painter.js';
import type { PlacingState } from './modules/grid-painter.js';
import { migrateToMultiFloor } from './modules/config-migration.js';
import { TILE_COLOURS, STAIR_COST } from './constants.js';
import { buildReciprocalStair, upsertStairTile } from './modules/stair-utils.js';
import { UndoManager } from './modules/undo-manager.js';
import type { GridSnapshot } from './modules/undo-manager.js';
import {
  DEFAULT_GRID_COLS, DEFAULT_GRID_ROWS, SIMULATION_ITERS, DEFAULT_SHOW_GRID,
} from './constants.js';
import type {
  HspatConfig, HomeAssistant, AuditResult, SensorSnapshot,
  WorkerRequest, WorkerResponse,
  MultiFloorWorkerRequest, MultiFloorWorkerResponse,
  StairConnection, FloorPoint,
} from './types.js';
import type { PaintMode, BrushType } from './components/toolbar.js';
import type { StairModalResult } from './components/stair-modal.js';

import './components/disclaimer-modal.js';
import './components/toolbar.js';
import './components/sensor-form.js';
import './components/results-panel.js';
import './components/stair-modal.js';

/** Minimal HA Lovelace card interface */
interface LovelaceCard extends HTMLElement {
  hass: HomeAssistant;
  setConfig(config: HspatConfig): void;
  getCardSize?(): number;
}

@customElement('hspat-card')
export class HspatCard extends LitElement implements LovelaceCard {
  @state() private _config!: HspatConfig;
  @state() private _hass!: HomeAssistant;
  @state() private _mode: PaintMode = 'setup';
  @state() private _brush: BrushType = TileType.Open;
  @state() private _auditResult: AuditResult | null = null;
  @state() private _running = false;
  @state() private _placing: PlacingState = null;
  @state() private _activeFloorId = '';
  @state() private _showGrid = DEFAULT_SHOW_GRID;
  @state() private _showStairModal = false;
  @state() private _pendingStairCoords = { x: 0, y: 0 };
  @state() private _hoverTile: { x: number; y: number } | null = null;

  private _grid: number[][] = [];
  private _canvas: HTMLCanvasElement | null = null;
  private _ctx: CanvasRenderingContext2D | null = null;
  private _floorplanImg: HTMLImageElement | null = null;
  private _paintActive = false;
  private _gridDirty = false;
  private _worker: Worker | null = null;
  private _resizeObserver: ResizeObserver | null = null;
  private _undoManager = new UndoManager();

  static styles = css`
    :host {
      display: block;
      position: relative;
      font-family: var(--paper-font-body1_-_font-family, sans-serif);
      min-width: 600px;
      max-width: 1200px;
    }
    @media (max-width: 600px) {
      :host {
        min-width: 100%;
      }
    }
    ha-card {
      overflow: hidden;
    }
    .card-header {
      padding: 12px 16px 0;
      font-size: 1.1rem;
      font-weight: 500;
      color: var(--primary-text-color);
    }
    .canvas-wrapper {
      position: relative;
      width: 100%;
      touch-action: none;
    }
    canvas {
      display: block;
      width: 100%;
      touch-action: none;
      cursor: crosshair;
    }
    .panel {
      padding: 12px;
    }
    .setup-panel {
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .setup-section {
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 6px;
      padding: 12px;
    }
    .setup-section h4 {
      margin: 0 0 10px;
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--primary-text-color);
    }
    .setup-field {
      margin-bottom: 10px;
    }
    .setup-field:last-child {
      margin-bottom: 0;
    }
    .setup-field label {
      display: block;
      font-size: 0.82rem;
      color: var(--secondary-text-color, #666);
      margin-bottom: 3px;
    }
    .setup-field input {
      width: 100%;
      padding: 6px 8px;
      border: 1px solid var(--divider-color, #ccc);
      border-radius: 4px;
      box-sizing: border-box;
      font-size: 0.9rem;
    }
    .setup-field .hint {
      font-size: 0.75rem;
      color: var(--secondary-text-color, #888);
      margin-top: 3px;
    }
    .floorplan-preview {
      margin-top: 6px;
      width: 100%;
      height: auto;
      display: block;
      object-fit: contain;
      border-radius: 4px;
      border: 1px solid var(--divider-color, #ccc);
    }
    .status-bar {
      padding: 4px 10px;
      font-size: 0.75rem;
      color: var(--secondary-text-color, #888);
      background: var(--card-background-color, #fff);
      border-top: 1px solid var(--divider-color, #e0e0e0);
      min-height: 1.5em;
    }
    .setup-grid-row {
      display: flex;
      gap: 10px;
    }
    .setup-grid-row .setup-field {
      flex: 1;
    }
    .content-row {
      display: block;
    }
    .side-panel {
      width: 100%;
      border-top: 1px solid var(--divider-color, #e0e0e0);
    }
  `;

  set hass(hass: HomeAssistant) {
    this._hass = hass;
    if (this._mode === 'audit' && this._auditResult) {
      this._redraw();
    }
  }

  setConfig(config: HspatConfig): void {
    if (config.disclaimer_accepted === undefined) {
      throw new Error('Invalid HSPAT config');
    }
    const withDefaults: HspatConfig = {
      ...config,
      grid_cols: config.grid_cols ?? DEFAULT_GRID_COLS,
      grid_rows: config.grid_rows ?? DEFAULT_GRID_ROWS,
      grid_rle: config.grid_rle ?? '',
      area_sensors: config.area_sensors ?? [],
      point_sensors: config.point_sensors ?? [],
      valuables: config.valuables ?? [],
      perimeter: config.perimeter ?? [],
      disclaimer_accepted: config.disclaimer_accepted ?? false,
    };
    this._config = migrateToMultiFloor(withDefaults);
    this._activeFloorId = this._config.active_floor_id ?? this._config.floors?.[0]?.id ?? '';
    this._showGrid = this._config.show_grid ?? DEFAULT_SHOW_GRID;
    this._rebuildGrid();
    const floor = this._activeFloor;
    if (floor?.floorplan_url) {
      this._loadFloorplan(floor.floorplan_url);
    } else if (config.floorplan_url) {
      this._loadFloorplan(config.floorplan_url);
    }
  }

  getCardSize() { return 6; }

  getLayoutOptions() {
    return { grid_columns: 4, grid_min_columns: 3, grid_rows: 'auto' };
  }

  // ─── Active floor helpers ──────────────────────────────────────────────────

  private get _activeFloor(): Floor | undefined {
    return this._config?.floors?.find(f => f.id === this._activeFloorId);
  }

  private _rebuildGrid() {
    const floor = this._activeFloor;
    if (!floor) {
      // Legacy fallback — no floors array
      const { grid_cols, grid_rows, grid_rle } = this._config;
      const flat = grid_rle
        ? decodeRLE(grid_rle)
        : new Array(grid_cols * grid_rows).fill(TileType.Open);
      this._grid = unflatten(flat, grid_cols);
      while (this._grid.length < grid_rows) {
        this._grid.push(new Array(grid_cols).fill(TileType.Open));
      }
      return;
    }
    const flat = floor.grid_rle
      ? decodeRLE(floor.grid_rle)
      : new Array(floor.grid_cols * floor.grid_rows).fill(TileType.Open);
    this._grid = unflatten(flat, floor.grid_cols);
    while (this._grid.length < floor.grid_rows) {
      this._grid.push(new Array(floor.grid_cols).fill(TileType.Open));
    }
  }

  /** Encodes current in-memory grid back to RLE and updates the active floor. Does NOT emit. */
  private _saveGridToFloor() {
    const floor = this._activeFloor;
    if (!floor || !this._config.floors) return;
    const rle = encodeRLE(flatten(this._grid));
    const updatedFloor: Floor = { ...floor, grid_rle: rle };
    const floors = this._config.floors.map(f => f.id === floor.id ? updatedFloor : f);
    this._config = { ...this._config, floors, grid_rle: rle };
  }

  private _emitConfigChanged() {
    this.dispatchEvent(new CustomEvent('config-changed', {
      bubbles: true, composed: true, detail: { config: this._config },
    }));
  }

  /**
   * Syncs top-level area_sensors / point_sensors / valuables / perimeter
   * back into the active floor object so that both views stay consistent.
   */
  private _syncSensorsToActiveFloor() {
    const floor = this._activeFloor;
    if (!floor || !this._config.floors) return;
    const updatedFloor: Floor = {
      ...floor,
      area_sensors: this._config.area_sensors,
      point_sensors: this._config.point_sensors,
      valuables: this._config.valuables,
      perimeter: this._config.perimeter,
    };
    const floors = this._config.floors.map(f => f.id === floor.id ? updatedFloor : f);
    this._config = { ...this._config, floors };
  }

  private _loadFloorplan(url: string) {
    const img = new Image();
    img.onload = () => {
      this._floorplanImg = img;
      this._redraw();
    };
    img.src = url;
  }

  protected firstUpdated(_changed: PropertyValues) {
    this._canvas = this.shadowRoot!.querySelector('canvas');
    if (!this._canvas) return;
    this._ctx = this._canvas.getContext('2d');
    this._resizeCanvas();

    this._resizeObserver = new ResizeObserver(() => {
      this._resizeCanvas();
      this._redraw();
    });
    this._resizeObserver.observe(this);

    // Undo/redo keyboard shortcuts
    this.addEventListener('keydown', (e: Event) => this._onKeyDown(e as KeyboardEvent));
    this.setAttribute('tabindex', '0');
  }

  private _resizeCanvas() {
    if (!this._canvas) return;
    const floor = this._activeFloor;
    const cols = floor?.grid_cols ?? this._config?.grid_cols ?? DEFAULT_GRID_COLS;
    const rows = floor?.grid_rows ?? this._config?.grid_rows ?? DEFAULT_GRID_ROWS;
    const w = Math.min(this._canvas.offsetWidth, 1200);
    const h = Math.round(w * rows / cols);
    this._canvas.width = w;
    this._canvas.height = h;
    this._canvas.style.height = `${h}px`;
  }

  private _redraw() {
    if (!this._ctx || !this._config) return;
    // Prefer per-floor audit data for the active floor so switching floors
    // after an audit shows the correct coverage + heatmap.
    const floorAudit = this._auditResult?.per_floor.get(this._activeFloorId);
    const coverage = floorAudit?.coverage_tiles ?? this._auditResult?.coverage_tiles ?? new Set<string>();
    const heatmap = floorAudit?.heatmap ?? this._auditResult?.heatmap ?? new Map<string, number>();
    paintGrid(
      this._ctx,
      this._config,
      this._grid,
      coverage,
      heatmap,
      this._floorplanImg,
      this._placing,
      this._showGrid,
      this._hoverTile,
    );
  }

  // ─── Floor management ─────────────────────────────────────────────────────

  private _switchFloor(id: string) {
    if (!this._config.floors || id === this._activeFloorId) return;
    // Persist current grid before switching
    this._saveGridToFloor();
    this._activeFloorId = id;
    this._config = { ...this._config, active_floor_id: id };
    // Sync top-level arrays from the new floor
    const floor = this._activeFloor;
    if (floor) {
      this._config = {
        ...this._config,
        area_sensors: floor.area_sensors,
        point_sensors: floor.point_sensors,
        valuables: floor.valuables,
        perimeter: floor.perimeter,
        grid_cols: floor.grid_cols,
        grid_rows: floor.grid_rows,
        grid_rle: floor.grid_rle,
      };
      if (floor.floorplan_url) {
        this._loadFloorplan(floor.floorplan_url);
      } else {
        this._floorplanImg = null;
      }
    }
    this._rebuildGrid();
    this._resizeCanvas();
    // Phase 3: update top-level audit data to the new floor's per-floor data
    if (this._auditResult?.per_floor) {
      const floorData = this._auditResult.per_floor.get(id);
      if (floorData) {
        this._auditResult = {
          ...this._auditResult,
          coverage_tiles: floorData.coverage_tiles,
          heatmap: floorData.heatmap,
        };
      }
    }
    this._redraw();
    this._emitConfigChanged();
  }

  private _addFloor() {
    if (!this._config.floors) return;
    this._saveGridToFloor();
    const currentFloor = this._activeFloor;
    const groundFloor = this._config.floors[0];
    const newId = `floor-${Date.now()}`;
    const newFloor: Floor = {
      id: newId,
      name: `Floor ${this._config.floors.length + 1}`,
      grid_cols: groundFloor?.grid_cols ?? currentFloor?.grid_cols ?? DEFAULT_GRID_COLS,
      grid_rows: groundFloor?.grid_rows ?? currentFloor?.grid_rows ?? DEFAULT_GRID_ROWS,
      grid_rle: groundFloor?.grid_rle ?? '',
      area_sensors: [],
      point_sensors: [],
      valuables: [],
      perimeter: [],
      stair_tiles: [],
      svg_shapes: [],
    };
    this._config = { ...this._config, floors: [...this._config.floors, newFloor] };
    this._switchFloor(newId);
  }

  private _deleteFloor(id: string) {
    if (!this._config.floors || this._config.floors.length <= 1) return;
    const floors = this._config.floors.filter(f => f.id !== id);
    const switchTo = id === this._activeFloorId ? floors[0]!.id : this._activeFloorId;
    this._config = { ...this._config, floors };
    // _switchFloor handles active_floor_id, top-level sync, grid rebuild and emit
    this._activeFloorId = ''; // force re-switch even if switchTo === current
    this._switchFloor(switchTo);
  }

  // ─── Undo / Redo ─────────────────────────────────────────────────────────

  private _captureSnapshot(): GridSnapshot {
    const floor = this._activeFloor;
    return {
      grid_rle: encodeRLE(flatten(this._grid)),
      perimeter: floor?.perimeter ?? this._config.perimeter ?? [],
      valuables: floor?.valuables ?? this._config.valuables ?? [],
    };
  }

  private _applySnapshot(snapshot: GridSnapshot) {
    const floor = this._activeFloor;
    if (!floor || !this._config.floors) return;
    const flat = snapshot.grid_rle ? decodeRLE(snapshot.grid_rle) : new Array(floor.grid_cols * floor.grid_rows).fill(TileType.Open);
    this._grid = unflatten(flat, floor.grid_cols);
    const updatedFloor: Floor = {
      ...floor,
      grid_rle: snapshot.grid_rle,
      perimeter: snapshot.perimeter,
      valuables: snapshot.valuables,
    };
    const floors = this._config.floors.map(f => f.id === floor.id ? updatedFloor : f);
    this._config = {
      ...this._config,
      floors,
      grid_rle: snapshot.grid_rle,
      perimeter: snapshot.perimeter,
      valuables: snapshot.valuables,
    };
  }

  private _undo() {
    const current = this._captureSnapshot();
    const prev = this._undoManager.undo(current);
    if (!prev) return;
    this._applySnapshot(prev);
    this._emitConfigChanged();
    this._redraw();
    this.requestUpdate();
  }

  private _redo() {
    const current = this._captureSnapshot();
    const next = this._undoManager.redo(current);
    if (!next) return;
    this._applySnapshot(next);
    this._emitConfigChanged();
    this._redraw();
    this.requestUpdate();
  }

  private _onKeyDown(e: KeyboardEvent) {
    if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      this._undo();
    } else if (e.ctrlKey && (e.key === 'Z' || (e.shiftKey && e.key === 'z'))) {
      e.preventDefault();
      this._redo();
    }
  }

  // ─── Paint mode event handlers ───────────────────────────────────────────

  private _onPointerDown(e: PointerEvent) {
    if (this._mode === 'hardware' && this._placing) {
      this._placeSelectedSensor(e);
      return;
    }
    if (this._mode !== 'paint') return;

    if (this._brush === TileType.Stair) {
      const { x, y } = this._canvasTile(e);
      this._undoManager.push(this._captureSnapshot());
      this._pendingStairCoords = { x, y };
      this._showStairModal = true;
      return;
    }

    this._undoManager.push(this._captureSnapshot());
    this._paintActive = true;
    this._applyBrush(e);
  }

  private _onPointerMove(e: PointerEvent) {
    if (this._mode === 'hardware') {
      this._hoverTile = this._canvasTile(e);
      this._redraw();
      return;
    }
    if (!this._paintActive || this._mode !== 'paint') return;
    this._applyBrush(e);
  }

  private _onPointerUp() {
    if (this._paintActive && this._gridDirty) {
      this._gridDirty = false;
      this._saveGridToFloor();
      this._emitConfigChanged();
    }
    this._paintActive = false;
    this.requestUpdate(); // update undo/redo button state
  }

  private _onPointerLeave() {
    this._hoverTile = null;
    this._onPointerUp();
  }

  // ─── Phase 2: Right-click sensor deletion ─────────────────────────────────

  private _onContextMenu(e: MouseEvent) {
    if (this._mode !== 'hardware') return;
    e.preventDefault();
    const { x, y } = this._canvasTile(e as unknown as PointerEvent);
    this._tryDeleteSensorAt(x, y);
  }

  private _tryDeleteSensorAt(x: number, y: number) {
    const areaSensor = this._config.area_sensors.find(s => s.grid_x === x && s.grid_y === y);
    if (areaSensor) {
      if (!window.confirm(`Delete sensor "${areaSensor.entity_id}" at (${x}, ${y})?`)) return;
      this._config = {
        ...this._config,
        area_sensors: this._config.area_sensors.filter(s => s.id !== areaSensor.id),
      };
      this._syncSensorsToActiveFloor();
      this._emitConfigChanged();
      this._redraw();
      return;
    }
    const pointSensor = this._config.point_sensors.find(s => s.tile_x === x && s.tile_y === y);
    if (pointSensor) {
      if (!window.confirm(`Delete sensor "${pointSensor.entity_id}" at (${x}, ${y})?`)) return;
      this._config = {
        ...this._config,
        point_sensors: this._config.point_sensors.filter(s => s.id !== pointSensor.id),
      };
      this._syncSensorsToActiveFloor();
      this._emitConfigChanged();
      this._redraw();
    }
  }

  private _canvasTile(e: PointerEvent): { x: number; y: number } {
    const rect = this._canvas!.getBoundingClientRect();
    const floor = this._activeFloor;
    return pixelToTile(
      e.clientX - rect.left, e.clientY - rect.top,
      rect.width, rect.height,
      floor?.grid_cols ?? this._config.grid_cols,
      floor?.grid_rows ?? this._config.grid_rows,
    );
  }

  private _applyBrush(e: PointerEvent) {
    if (!this._canvas) return;
    const { x, y } = this._canvasTile(e);
    const tile = this._brush as number;

    if (tile <= TileType.Wall) {
      // Structural tile — write to grid, will persist on pointerup
      if (this._grid[y]) this._grid[y]![x] = tile;
      this._gridDirty = true;
    } else if (tile === TileType.Perimeter) {
      // Bug 1 fix: toggle perimeter overlay
      this._toggleOverlay('perimeter', x, y);
    } else if (tile === TileType.Valuable) {
      // Bug 1 fix: toggle valuable overlay
      this._toggleOverlay('valuables', x, y);
    }
    // Stair is handled in _onPointerDown — skip here
    this._redraw();
  }

  private _toggleOverlay(key: 'perimeter' | 'valuables', x: number, y: number) {
    const floor = this._activeFloor;
    if (floor && this._config.floors) {
      // Per-floor storage
      const list = (floor[key] as Array<{ x: number; y: number }>);
      const idx = list.findIndex(t => t.x === x && t.y === y);
      const updated = idx >= 0 ? list.filter((_, i) => i !== idx) : [...list, { x, y }];
      const updatedFloor: Floor = { ...floor, [key]: updated };
      const floors = this._config.floors.map(f => f.id === floor.id ? updatedFloor : f);
      // Mirror to top-level for legacy audit pipeline
      this._config = { ...this._config, floors, [key]: updated };
    } else {
      // Legacy path
      const list = (this._config[key] as Array<{ x: number; y: number }>);
      const idx = list.findIndex(t => t.x === x && t.y === y);
      const updated = idx >= 0 ? list.filter((_, i) => i !== idx) : [...list, { x, y }];
      this._config = { ...this._config, [key]: updated };
    }
    this._emitConfigChanged();
  }

  // ─── Stair modal handlers ─────────────────────────────────────────────────

  private _onStairConfigured(e: CustomEvent<StairModalResult>) {
    const { stairTile, fromFloorId } = e.detail;
    if (!this._config.floors) return;
    const floor = this._config.floors.find(f => f.id === fromFloorId);
    if (!floor) return;

    // Paint the stair tile in the in-memory grid
    if (this._grid[stairTile.tile_y]) {
      this._grid[stairTile.tile_y]![stairTile.tile_x] = TileType.Stair;
    }

    // Upsert the stair record and persist grid_rle atomically
    const rle = encodeRLE(flatten(this._grid));
    const updatedFloor: Floor = {
      ...floor,
      grid_rle: rle,
      stair_tiles: upsertStairTile(floor.stair_tiles, stairTile),
    };

    let floors = this._config.floors.map(f => f.id === fromFloorId ? updatedFloor : f);

    // Auto-create the reciprocal stair on the target floor so pathfinding is
    // bi-directional without the user having to manually configure both ends.
    if (stairTile.target_floor_id !== undefined
      && stairTile.target_tile_x !== undefined
      && stairTile.target_tile_y !== undefined) {
      const targetFloor = floors.find(f => f.id === stairTile.target_floor_id);
      if (targetFloor) {
        const reciprocal = buildReciprocalStair(stairTile, fromFloorId);
        const updatedTarget: Floor = {
          ...targetFloor,
          stair_tiles: upsertStairTile(targetFloor.stair_tiles, reciprocal),
        };
        floors = floors.map(f => f.id === stairTile.target_floor_id ? updatedTarget : f);
      }
    }

    this._config = { ...this._config, floors, grid_rle: rle };
    this._emitConfigChanged();
    this._showStairModal = false;
    this._redraw();
  }

  private _onStairCancelled() {
    this._showStairModal = false;
  }

  // ─── Hardware mode sensor placement ──────────────────────────────────────

  private _onPlaceSensor(e: CustomEvent) {
    this._placing = e.detail as PlacingState;
    this._redraw();
  }

  private _placeSelectedSensor(e: PointerEvent) {
    if (!this._canvas || !this._placing) return;
    const { x, y } = this._canvasTile(e);
    const { id, sensorType } = this._placing;

    if (sensorType === 'area') {
      this._config = {
        ...this._config,
        area_sensors: this._config.area_sensors.map(s =>
          s.id === id ? { ...s, grid_x: x, grid_y: y } : s
        ),
      };
    } else {
      this._config = {
        ...this._config,
        point_sensors: this._config.point_sensors.map(s =>
          s.id === id ? { ...s, tile_x: x, tile_y: y } : s
        ),
      };
    }
    this._syncSensorsToActiveFloor();
    this._placing = null;
    this._emitConfigChanged();
    this._redraw();
  }

  // ─── Audit ────────────────────────────────────────────────────────────────

  private _buildAuditBaseline(snapshots: SensorSnapshot[]): {
    costMatrix: number[][];
    coverageTiles: Set<string>;
  } {
    const costMatrix = buildCostMatrix(this._grid, this._hass, this._config, snapshots);
    applyAreaSensorCosts(costMatrix, this._grid, this._config.area_sensors, snapshots);
    const coverageTiles = computeAllFov(this._grid, this._config.area_sensors, snapshots);
    addPointSensorCoverage(this._config.point_sensors, snapshots, coverageTiles);
    return { costMatrix, coverageTiles };
  }

  private async _runMultiFloorAudit(
    snapshots: SensorSnapshot[],
    coverageTiles: Set<string>,
  ): Promise<{ heatmap: Map<string, number>; perFloor: Map<string, { coverage_tiles: Set<string>; heatmap: Map<string, number> }> }> {
    const floors = this._config.floors!;
    const matrices: Record<string, number[][]> = {};
    const perFloor = new Map<string, { coverage_tiles: Set<string>; heatmap: Map<string, number> }>();

    for (const floor of floors) {
      const floorGrid = unflatten(decodeRLE(floor.grid_rle), floor.grid_cols);
      const floorMatrix = buildCostMatrix(floorGrid, this._hass, { ...this._config, point_sensors: floor.point_sensors }, snapshots);
      applyAreaSensorCosts(floorMatrix, floorGrid, floor.area_sensors, snapshots);
      matrices[floor.id] = floorMatrix;
      const floorCoverage = computeAllFov(floorGrid, floor.area_sensors, snapshots);
      addPointSensorCoverage(floor.point_sensors, snapshots, floorCoverage);
      perFloor.set(floor.id, { coverage_tiles: floorCoverage, heatmap: new Map() });
    }

    const rawHeatmap = await this._runMultiFloorWorker({
      type: 'multi_floor',
      floors: matrices,
      stair_connections: this._buildStairConnections(floors),
      perimeter: floors.flatMap(f => f.perimeter.map(p => ({ floor_id: f.id, x: p.x, y: p.y }))),
      valuables: floors.flatMap(f => f.valuables.map(v => ({ floor_id: f.id, x: v.x, y: v.y }))),
      iterations: SIMULATION_ITERS,
    }).catch(() => new Map<string, number>());

    for (const [k, count] of rawHeatmap) {
      const colonIdx = k.indexOf(':');
      if (colonIdx < 0) continue;
      const bucket = perFloor.get(k.slice(0, colonIdx));
      if (bucket) bucket.heatmap.set(k.slice(colonIdx + 1), count);
    }

    const heatmap = perFloor.get(this._activeFloorId)?.heatmap ?? new Map<string, number>();
    return { heatmap, perFloor };
  }

  private async _runSingleFloorAudit(
    costMatrix: number[][],
    coverageTiles: Set<string>,
  ): Promise<{ heatmap: Map<string, number>; perFloor: Map<string, { coverage_tiles: Set<string>; heatmap: Map<string, number> }> }> {
    const heatmap = await this._runWorker({
      cost_matrix: costMatrix,
      perimeter: this._config.perimeter,
      valuables: this._config.valuables,
      iterations: SIMULATION_ITERS,
    }).catch(() => new Map<string, number>());
    const perFloor = new Map([[this._activeFloorId, { coverage_tiles: coverageTiles, heatmap }]]);
    return { heatmap, perFloor };
  }

  private async _runAudit() {
    if (!this._hass || this._running) return;
    this._running = true;
    this.requestUpdate();

    try {
      this._syncSensorsToActiveFloor();
      const snapshots: SensorSnapshot[] = takeSnapshot(this._hass, this._config.area_sensors, this._config.point_sensors);
      const { costMatrix, coverageTiles } = this._buildAuditBaseline(snapshots);

      const isMultiFloor = (this._config.floors?.length ?? 0) > 1;
      const { heatmap, perFloor } = isMultiFloor
        ? await this._runMultiFloorAudit(snapshots, coverageTiles)
        : await this._runSingleFloorAudit(costMatrix, coverageTiles);

      this._auditResult = {
        coverage_tiles: coverageTiles,
        heatmap,
        per_floor: perFloor,
        sensor_snapshots: snapshots,
        blind_spots: [],
        insights: generateInsights(coverageTiles, heatmap),
      };
    } finally {
      this._running = false;
      this._redraw();
      this.requestUpdate();
    }
  }

  /** Build directed StairConnection[] from all floors' stair_tiles. */
  private _buildStairConnections(floors: Floor[]): StairConnection[] {
    const conns: StairConnection[] = [];
    for (const floor of floors) {
      for (const s of floor.stair_tiles) {
        // Skip unconnected stairs (target not yet configured)
        if (s.target_floor_id === undefined
          || s.target_tile_x === undefined
          || s.target_tile_y === undefined) continue;
        conns.push({
          from_floor: floor.id,
          from_x: s.tile_x,
          from_y: s.tile_y,
          to_floor: s.target_floor_id,
          to_x: s.target_tile_x,
          to_y: s.target_tile_y,
          cost: s.traversal_cost ?? STAIR_COST,
        });
      }
    }
    return conns;
  }

  // Bug 5: stop button handler
  private _stopAudit() {
    this._worker?.terminate();
    this._worker = null;
    this._running = false;
    this.requestUpdate();
  }

  private _runWorker(req: WorkerRequest): Promise<Map<string, number>> {
    return new Promise((resolve, reject) => {
      try {
        const workerUrl = new URL('./workers/simulation.worker.js', import.meta.url);
        this._worker = new Worker(workerUrl, { type: 'module' });
        this._worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
          resolve(new Map(Object.entries(e.data.heatmap)));
          this._worker?.terminate();
          this._worker = null;
        };
        // Bug 3 fix: handle worker errors so the promise doesn't hang forever
        this._worker.onerror = () => {
          this._worker?.terminate();
          this._worker = null;
          // Fall back to inline execution
          import('./modules/dijkstra.js').then(({ monteCarloHeatmap }) => {
            resolve(monteCarloHeatmap(req.cost_matrix, req.perimeter, req.valuables, req.iterations));
          }).catch(reject);
        };
        this._worker.postMessage(req);
      } catch {
        // Worker constructor unavailable — run inline
        import('./modules/dijkstra.js').then(({ monteCarloHeatmap }) => {
          resolve(monteCarloHeatmap(req.cost_matrix, req.perimeter, req.valuables, req.iterations));
        }).catch(reject);
      }
    });
  }

  private _runMultiFloorWorker(req: MultiFloorWorkerRequest): Promise<Map<string, number>> {
    return new Promise((resolve, reject) => {
      try {
        const workerUrl = new URL('./workers/simulation.worker.js', import.meta.url);
        const worker = new Worker(workerUrl, { type: 'module' });
        worker.onmessage = (e: MessageEvent<MultiFloorWorkerResponse>) => {
          resolve(new Map(Object.entries(e.data.heatmap)));
          worker.terminate();
        };
        worker.onerror = () => {
          worker.terminate();
          import('./modules/dijkstra.js').then(({ multiFloorMonteCarloHeatmap }) => {
            resolve(multiFloorMonteCarloHeatmap(req.floors, req.stair_connections, req.perimeter, req.valuables, req.iterations));
          }).catch(reject);
        };
        worker.postMessage(req);
      } catch {
        import('./modules/dijkstra.js').then(({ multiFloorMonteCarloHeatmap }) => {
          resolve(multiFloorMonteCarloHeatmap(req.floors, req.stair_connections, req.perimeter, req.valuables, req.iterations));
        }).catch(reject);
      }
    });
  }

  // ─── Config persistence ───────────────────────────────────────────────────

  private _onConfigChanged(e: CustomEvent) {
    const newConfig = e.detail.config as HspatConfig;
    if (newConfig.floors && this._activeFloorId) {
      // Sync updated top-level sensor arrays back into the active floor
      const floors = newConfig.floors.map(f => {
        if (f.id !== this._activeFloorId) return f;
        return {
          ...f,
          area_sensors: newConfig.area_sensors,
          point_sensors: newConfig.point_sensors,
          valuables: newConfig.valuables,
          perimeter: newConfig.perimeter,
        };
      });
      this._config = { ...newConfig, floors };
    } else {
      this._config = newConfig;
    }
    this._rebuildGrid();
    this._redraw();
    this.dispatchEvent(new CustomEvent('config-changed', {
      bubbles: true,
      composed: true,
      detail: { config: this._config },
    }));
  }

  // ─── Setup panel handlers ─────────────────────────────────────────────────

  private _onFloorNameChange(value: string) {
    const floor = this._activeFloor;
    if (!floor || !this._config.floors) return;
    const updatedFloor: Floor = { ...floor, name: value };
    const floors = this._config.floors.map(f => f.id === floor.id ? updatedFloor : f);
    this._config = { ...this._config, floors };
    this._emitConfigChanged();
    this.requestUpdate();
  }

  private _onGridColsChange(value: string) {
    const cols = Math.max(1, Math.min(200, parseInt(value, 10) || 1));
    const floor = this._activeFloor;
    if (!floor || !this._config.floors) return;
    const updatedFloor: Floor = { ...floor, grid_cols: cols };
    const floors = this._config.floors.map(f => f.id === floor.id ? updatedFloor : f);
    this._config = { ...this._config, floors, grid_cols: cols };
    this._rebuildGrid();
    this._resizeCanvas();
    this._redraw();
    this._emitConfigChanged();
  }

  private _onGridRowsChange(value: string) {
    const rows = Math.max(1, Math.min(200, parseInt(value, 10) || 1));
    const floor = this._activeFloor;
    if (!floor || !this._config.floors) return;
    const updatedFloor: Floor = { ...floor, grid_rows: rows };
    const floors = this._config.floors.map(f => f.id === floor.id ? updatedFloor : f);
    this._config = { ...this._config, floors, grid_rows: rows };
    this._rebuildGrid();
    this._resizeCanvas();
    this._redraw();
    this._emitConfigChanged();
  }

  /** Only allow http/https/absolute-path URLs to prevent javascript: URI injection. */
  private _isValidFloorplanUrl(url: string): boolean {
    return /^https?:\/\//i.test(url) || url.startsWith('/');
  }

  private _onFloorplanUrlChange(value: string) {
    const floor = this._activeFloor;
    if (!floor || !this._config.floors) return;
    const raw = value.trim();
    if (raw && !this._isValidFloorplanUrl(raw)) return;
    const url = raw || undefined;
    const updatedFloor: Floor = { ...floor, floorplan_url: url };
    const floors = this._config.floors.map(f => f.id === floor.id ? updatedFloor : f);
    this._config = { ...this._config, floors };
    if (url) {
      this._loadFloorplan(url);
    } else {
      this._floorplanImg = null;
      this._redraw();
    }
    this._emitConfigChanged();
  }

  private _onModeChange(e: CustomEvent) {
    this._mode = e.detail as PaintMode;
    this.requestUpdate();
  }

  private _onBrushChange(e: CustomEvent) {
    this._brush = e.detail as BrushType;
  }

  private _onGridToggle(e: CustomEvent) {
    this._showGrid = e.detail as boolean;
    this._config = { ...this._config, show_grid: this._showGrid };
    this._redraw();
    this._emitConfigChanged();
  }

  render() {
    if (!this._config) return html`<ha-card>Loading…</ha-card>`;

    const showDisclaimer = !this._config.disclaimer_accepted;

    return html`
      <ha-card>
        <div class="card-header">Home Security Posture &amp; Auditing Tool</div>

        <hspat-toolbar
          .mode=${this._mode}
          .brush=${this._brush}
          .floors=${this._config.floors ?? []}
          .activeFloorId=${this._activeFloorId}
          .showGrid=${this._showGrid}
          .canUndo=${this._undoManager.canUndo}
          .canRedo=${this._undoManager.canRedo}
          @mode-change=${this._onModeChange}
          @brush-change=${this._onBrushChange}
          @floor-change=${(e: CustomEvent) => this._switchFloor(e.detail as string)}
          @floor-add=${this._addFloor}
          @floor-delete=${(e: CustomEvent) => this._deleteFloor(e.detail as string)}
          @grid-toggle=${this._onGridToggle}
          @undo-action=${this._undo}
          @redo-action=${this._redo}
        ></hspat-toolbar>

        <div class="content-row">
          <div class="canvas-wrapper">
            <canvas
              role="application"
              aria-label="Floor plan grid — use Draw Floor Plan mode to paint tiles"
              @pointerdown=${this._onPointerDown}
              @pointermove=${this._onPointerMove}
              @pointerup=${this._onPointerUp}
              @pointerleave=${this._onPointerLeave}
              @contextmenu=${this._onContextMenu}
            ></canvas>

            ${showDisclaimer ? html`
              <hspat-disclaimer-modal
                .config=${this._config}
                @config-changed=${this._onConfigChanged}
              ></hspat-disclaimer-modal>
            ` : ''}
          </div>
        </div>

        ${this._mode === 'hardware' || this._mode === 'audit' ? html`
          <div class="side-panel">
            ${this._mode === 'hardware' ? this._renderHardwarePanel() : ''}
            ${this._mode === 'audit' ? this._renderAuditPanel() : ''}
          </div>
        ` : ''}

        <!-- Status bar -->
        <div class="status-bar">${this._renderStatusBar()}</div>

        ${this._showStairModal ? html`
          <hspat-stair-modal
            .floors=${this._config.floors ?? []}
            .fromFloorId=${this._activeFloorId}
            .tileX=${this._pendingStairCoords.x}
            .tileY=${this._pendingStairCoords.y}
            @stair-configured=${this._onStairConfigured}
            @stair-cancelled=${this._onStairCancelled}
          ></hspat-stair-modal>
        ` : ''}

        ${this._mode === 'setup' ? this._renderSetupPanel() : ''}
      </ha-card>
    `;
  }

  private _renderStatusBar() {
    const sensorCount = (this._config.area_sensors?.length ?? 0) + (this._config.point_sensors?.length ?? 0);
    if (this._mode === 'hardware') {
      const coords = this._hoverTile ? ` | Tile (${this._hoverTile.x}, ${this._hoverTile.y})` : '';
      return `Sensors: ${sensorCount}${coords} | Right-click sensor to delete`;
    }
    if (this._mode === 'paint') {
      const brushNames: Record<number, string> = {
        0: 'Open', 3: 'Wall', 2: 'Door', 1: 'Window', 4: 'Perimeter', 5: 'Valuable', 6: 'Stairs',
      };
      const brushName = brushNames[this._brush as number] ?? 'Unknown';
      const coords = this._hoverTile ? ` | Tile (${this._hoverTile.x}, ${this._hoverTile.y})` : '';
      return `Brush: ${brushName}${coords}`;
    }
    if (this._mode === 'audit') {
      return `Sensors: ${sensorCount}`;
    }
    return '';
  }

  private _renderSetupPanel() {
    return html`
      <div class="setup-panel">
        <div class="setup-section">
          <h4>Floor settings</h4>
          <div class="setup-field">
            <label>Floor name</label>
            <input
              type="text"
              .value=${this._activeFloor?.name ?? ''}
              placeholder="e.g. Ground Floor, First Floor"
              @change=${(e: Event) => this._onFloorNameChange((e.target as HTMLInputElement).value)}
            />
          </div>
          <div class="setup-grid-row">
            <div class="setup-field">
              <label>Grid columns</label>
              <input type="number" min="1" max="200"
                .value=${String(this._activeFloor?.grid_cols ?? this._config.grid_cols)}
                @change=${(e: Event) => this._onGridColsChange((e.target as HTMLInputElement).value)}
              />
              <div class="hint">Number of horizontal tiles.</div>
            </div>
            <div class="setup-field">
              <label>Grid rows</label>
              <input type="number" min="1" max="200"
                .value=${String(this._activeFloor?.grid_rows ?? this._config.grid_rows)}
                @change=${(e: Event) => this._onGridRowsChange((e.target as HTMLInputElement).value)}
              />
              <div class="hint">Number of vertical tiles.</div>
            </div>
          </div>
        </div>
        <div class="setup-section">
          <h4>Background floorplan image</h4>
          <div class="setup-field">
            <label>Image URL</label>
            <input
              type="url"
              .value=${this._activeFloor?.floorplan_url ?? ''}
              placeholder="/local/floorplan/ground-floor.svg"
              @change=${(e: Event) => this._onFloorplanUrlChange((e.target as HTMLInputElement).value)}
            />
            <div class="hint">
              URL of an SVG or image file hosted in Home Assistant (e.g.
              <code>/local/floorplan/ground.svg</code>). Use this to show a realistic
              floor plan drawn in Inkscape or exported from Floorplanner as the background.
              The tile grid overlay will appear on top so you can mark walls, doors, sensors
              and other elements. Leave blank to use the plain tile grid only.
            </div>
          </div>
          ${this._activeFloor?.floorplan_url ? html`
            <img class="floorplan-preview"
              src=${this._activeFloor.floorplan_url}
              alt="Floorplan preview"
              @error=${(e: Event) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          ` : ''}
        </div>
      </div>
    `;
  }

  private _renderHardwarePanel() {
    return html`
      <div class="panel">
        ${this._placing ? html`
          <p style="margin:0 0 8px;padding:8px;background:var(--primary-color,#03a9f4);color:#fff;border-radius:4px;font-size:0.85rem;">
            Click anywhere on the map above to place the sensor, then it will snap to that tile.
            <button @click=${() => { this._placing = null; this._redraw(); }}
              style="margin-left:8px;background:none;border:1px solid #fff;color:#fff;border-radius:4px;padding:2px 8px;cursor:pointer;">
              Cancel
            </button>
          </p>
        ` : ''}
        <hspat-sensor-form
          .config=${this._config}
          @config-changed=${this._onConfigChanged}
          @place-sensor=${this._onPlaceSensor}
        ></hspat-sensor-form>
      </div>
    `;
  }

  private _renderAuditPanel() {
    return html`
      <div class="panel">
        ${this._running ? html`
          <button
            @click=${this._stopAudit}
            style="padding:8px 16px;background:#f44336;color:#fff;border:none;border-radius:4px;cursor:pointer;margin-bottom:12px;"
          >Stop</button>
          <span style="margin-left:8px;font-size:0.85rem;color:var(--secondary-text-color);">Running simulation…</span>
        ` : html`
          <button
            @click=${this._runAudit}
            style="padding:8px 16px;background:var(--primary-color,#03a9f4);color:#fff;border:none;border-radius:4px;cursor:pointer;margin-bottom:12px;"
          >Run Audit</button>
        `}
        <hspat-results-panel
          .result=${this._auditResult}
          .floors=${this._config.floors ?? []}
        ></hspat-results-panel>
      </div>
    `;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._resizeObserver?.disconnect();
    this._worker?.terminate();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'hspat-card': HspatCard;
  }
}
