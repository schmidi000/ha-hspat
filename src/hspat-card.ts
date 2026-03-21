import { LitElement, html, css, PropertyValues } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { TileType } from './types.js';
import type { Floor } from './types.js';
import { decodeRLE, unflatten, encodeRLE, flatten } from './modules/rle.js';
import { takeSnapshot } from './modules/ha-snapshot.js';
import { buildCostMatrix } from './modules/state-resolver.js';
import { computeAllFov, applyAreaSensorCosts } from './modules/shadowcast.js';
import { generateInsights } from './modules/insights.js';
import { paintGrid, pixelToTile } from './modules/grid-painter.js';
import type { PlacingState } from './modules/grid-painter.js';
import { migrateToMultiFloor } from './modules/config-migration.js';
import { rasterizeShape, rasterizeLine, rasterizeRect } from './modules/vector-draw.js';
import type { TileCoord } from './modules/vector-draw.js';
import { TILE_COLOURS, STAIR_COST } from './constants.js';
import {
  DEFAULT_GRID_COLS, DEFAULT_GRID_ROWS, SIMULATION_ITERS, DEFAULT_SHOW_GRID,
} from './constants.js';
import type {
  HspatConfig, HomeAssistant, AuditResult, SensorSnapshot,
  WorkerRequest, WorkerResponse,
  MultiFloorWorkerRequest, MultiFloorWorkerResponse,
  StairConnection, FloorPoint, SvgShape,
} from './types.js';
import type { PaintMode, BrushType, DrawMode } from './components/toolbar.js';
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
  @state() private _drawMode: DrawMode = 'pixel';
  @state() private _showStairModal = false;
  @state() private _pendingStairCoords = { x: 0, y: 0 };

  private _grid: number[][] = [];
  private _canvas: HTMLCanvasElement | null = null;
  private _ctx: CanvasRenderingContext2D | null = null;
  private _floorplanImg: HTMLImageElement | null = null;
  private _paintActive = false;
  private _gridDirty = false;
  private _worker: Worker | null = null;
  private _resizeObserver: ResizeObserver | null = null;

  // Vector drawing state
  private _vectorAnchor: TileCoord | null = null;
  private _vectorPreviewEnd: TileCoord | null = null;
  /** Current vector shape type; toolbar will expose a picker in Phase 7. */
  private _vectorShapeType: 'line' | 'rect' = 'rect';

  static styles = css`
    :host {
      display: block;
      position: relative;
      font-family: var(--paper-font-body1_-_font-family, sans-serif);
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
  }

  private _resizeCanvas() {
    if (!this._canvas) return;
    const floor = this._activeFloor;
    const cols = floor?.grid_cols ?? this._config?.grid_cols ?? DEFAULT_GRID_COLS;
    const rows = floor?.grid_rows ?? this._config?.grid_rows ?? DEFAULT_GRID_ROWS;
    const w = this._canvas.offsetWidth;
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
    );
    if (this._drawMode === 'vector') {
      this._drawVectorPreview();
    }
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
    this._redraw();
    this._emitConfigChanged();
  }

  private _addFloor() {
    if (!this._config.floors) return;
    this._saveGridToFloor();
    const currentFloor = this._activeFloor;
    const newId = `floor-${Date.now()}`;
    const newFloor: Floor = {
      id: newId,
      name: `Floor ${this._config.floors.length + 1}`,
      grid_cols: currentFloor?.grid_cols ?? DEFAULT_GRID_COLS,
      grid_rows: currentFloor?.grid_rows ?? DEFAULT_GRID_ROWS,
      grid_rle: '',
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

  // ─── Paint mode event handlers ───────────────────────────────────────────

  private _onPointerDown(e: PointerEvent) {
    if (this._mode === 'hardware' && this._placing) {
      this._placeSelectedSensor(e);
      return;
    }
    if (this._mode !== 'paint') return;

    if (this._brush === TileType.Stair) {
      const { x, y } = this._canvasTile(e);
      this._pendingStairCoords = { x, y };
      this._showStairModal = true;
      return;
    }

    if (this._drawMode === 'vector') {
      this._vectorAnchor = this._canvasTile(e);
      this._vectorPreviewEnd = { ...this._vectorAnchor };
      this._paintActive = true;
      return;
    }

    this._paintActive = true;
    this._applyBrush(e);
  }

  private _onPointerMove(e: PointerEvent) {
    if (!this._paintActive || this._mode !== 'paint') return;
    if (this._drawMode === 'vector') {
      this._vectorPreviewEnd = this._canvasTile(e);
      this._redraw();
      return;
    }
    this._applyBrush(e);
  }

  private _onPointerUp() {
    if (this._paintActive && this._drawMode === 'vector' && this._vectorAnchor && this._vectorPreviewEnd) {
      this._applyVectorShape(this._vectorAnchor, this._vectorPreviewEnd);
      this._vectorAnchor = null;
      this._vectorPreviewEnd = null;
    } else if (this._paintActive && this._gridDirty) {
      this._gridDirty = false;
      this._saveGridToFloor();
      this._emitConfigChanged();
    }
    this._paintActive = false;
  }

  /**
   * Rasterize the current vector shape (anchor → end) into the grid, then save.
   */
  private _applyVectorShape(a: TileCoord, b: TileCoord) {
    const floor = this._activeFloor;
    const cols = floor?.grid_cols ?? this._config.grid_cols;
    const rows = floor?.grid_rows ?? this._config.grid_rows;
    const tile = this._brush as number;

    const tiles = this._vectorShapeType === 'rect'
      ? rasterizeRect(a.x, a.y, b.x, b.y, false)
      : rasterizeLine(a.x, a.y, b.x, b.y, 1);

    for (const { x, y } of tiles) {
      if (x >= 0 && x < cols && y >= 0 && y < rows) {
        if (this._grid[y]) this._grid[y]![x] = tile;
      }
    }

    // Persist the shape as a SvgShape with normalised [0,1] coords
    const shape: SvgShape = {
      id: `shape-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      type: this._vectorShapeType,
      tile_type: this._brush as TileType,
      points: [
        [a.x / cols, a.y / rows],
        [b.x / cols, b.y / rows],
      ],
      thickness: 1,
    };
    if (floor) {
      floor.svg_shapes = [...(floor.svg_shapes ?? []), shape];
    }

    this._saveGridToFloor();
    this._emitConfigChanged();
    this._redraw();
  }

  /**
   * Draw a semi-transparent preview of the vector shape being dragged.
   * Called after paintGrid so the preview appears on top.
   */
  private _drawVectorPreview() {
    if (!this._ctx || !this._vectorAnchor || !this._vectorPreviewEnd || !this._paintActive) return;
    const { width, height } = this._ctx.canvas;
    const floor = this._activeFloor;
    const cols = floor?.grid_cols ?? this._config.grid_cols;
    const rows = floor?.grid_rows ?? this._config.grid_rows;
    const tileW = width / cols;
    const tileH = height / rows;

    const tiles = this._vectorShapeType === 'rect'
      ? rasterizeRect(this._vectorAnchor.x, this._vectorAnchor.y, this._vectorPreviewEnd.x, this._vectorPreviewEnd.y, false)
      : rasterizeLine(this._vectorAnchor.x, this._vectorAnchor.y, this._vectorPreviewEnd.x, this._vectorPreviewEnd.y, 1);

    this._ctx.save();
    this._ctx.globalAlpha = 0.55;
    this._ctx.fillStyle = TILE_COLOURS[this._brush as TileType] ?? '#888';
    for (const { x, y } of tiles) {
      this._ctx.fillRect(x * tileW, y * tileH, tileW, tileH);
    }
    // Highlight anchor tile
    this._ctx.globalAlpha = 0.9;
    this._ctx.strokeStyle = '#fff';
    this._ctx.lineWidth = 2;
    this._ctx.strokeRect(
      this._vectorAnchor.x * tileW + 1,
      this._vectorAnchor.y * tileH + 1,
      tileW - 2,
      tileH - 2,
    );
    this._ctx.restore();
  }

  /** Bug 2 fix: use getBoundingClientRect so CSS px == canvas px always */
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
    const existingIdx = floor.stair_tiles.findIndex(
      s => s.tile_x === stairTile.tile_x && s.tile_y === stairTile.tile_y
    );
    const updatedStairs = existingIdx >= 0
      ? floor.stair_tiles.map((s, i) => i === existingIdx ? stairTile : s)
      : [...floor.stair_tiles, stairTile];

    const updatedFloor: Floor = { ...floor, grid_rle: rle, stair_tiles: updatedStairs };
    const floors = this._config.floors.map(f => f.id === fromFloorId ? updatedFloor : f);
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

  private async _runAudit() {
    if (!this._hass || this._running) return;
    this._running = true;
    this.requestUpdate();

    try {
      const snapshots: SensorSnapshot[] = takeSnapshot(
        this._hass,
        this._config.area_sensors,
        this._config.point_sensors,
      );

      const costMatrix = buildCostMatrix(this._grid, this._hass, this._config, snapshots);
      applyAreaSensorCosts(costMatrix, this._grid, this._config.area_sensors, snapshots);

      const coverageTiles = computeAllFov(this._grid, this._config.area_sensors, snapshots);

      const floors = this._config.floors;
      const isMultiFloor = floors && floors.length > 1;

      let heatmap: Map<string, number>;
      const perFloor = new Map<string, { coverage_tiles: Set<string>; heatmap: Map<string, number> }>();

      if (isMultiFloor) {
        // Build per-floor cost matrices and collect stair connections
        const matrices: Record<string, number[][]> = {};
        const stairs = this._buildStairConnections(floors!);

        for (const floor of floors!) {
          const floorGrid = unflatten(decodeRLE(floor.grid_rle), floor.grid_cols);
          const floorConfig = { ...this._config, point_sensors: floor.point_sensors };
          const floorMatrix = buildCostMatrix(floorGrid, this._hass, floorConfig, snapshots);
          applyAreaSensorCosts(floorMatrix, floorGrid, floor.area_sensors, snapshots);
          matrices[floor.id] = floorMatrix;

          const floorCoverage = computeAllFov(floorGrid, floor.area_sensors, snapshots);
          perFloor.set(floor.id, { coverage_tiles: floorCoverage, heatmap: new Map() });
        }

        // Build FloorPoint perimeter and valuables across all floors
        const perimeterFP: FloorPoint[] = floors!.flatMap(f =>
          f.perimeter.map(p => ({ floor_id: f.id, x: p.x, y: p.y })),
        );
        const valuablesFP: FloorPoint[] = floors!.flatMap(f =>
          f.valuables.map(v => ({ floor_id: f.id, x: v.x, y: v.y })),
        );

        const rawHeatmap = await this._runMultiFloorWorker({
          type: 'multi_floor',
          floors: matrices,
          stair_connections: stairs,
          perimeter: perimeterFP,
          valuables: valuablesFP,
          iterations: SIMULATION_ITERS,
        }).catch(() => new Map<string, number>());

        // Distribute heatmap entries into per_floor buckets
        for (const [k, count] of rawHeatmap) {
          const colonIdx = k.indexOf(':');
          if (colonIdx < 0) continue;
          const floorId = k.slice(0, colonIdx);
          const tileKey = k.slice(colonIdx + 1); // "x,y"
          const bucket = perFloor.get(floorId);
          if (bucket) bucket.heatmap.set(tileKey, count);
        }

        // Active floor's heatmap for the top-level fields
        heatmap = perFloor.get(this._activeFloorId)?.heatmap ?? new Map();
      } else {
        // Single-floor path
        heatmap = await this._runWorker({
          cost_matrix: costMatrix,
          perimeter: this._config.perimeter,
          valuables: this._config.valuables,
          iterations: SIMULATION_ITERS,
        }).catch(() => new Map<string, number>());
        perFloor.set(this._activeFloorId, { coverage_tiles: coverageTiles, heatmap });
      }

      const insights = generateInsights(coverageTiles, heatmap);

      this._auditResult = {
        coverage_tiles: coverageTiles,
        heatmap,
        per_floor: perFloor,
        sensor_snapshots: snapshots,
        blind_spots: [],
        insights,
      };
    } finally {
      // Bug 3 + Bug 5 fix: always reset running state
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

  private _onDrawModeChange(e: CustomEvent) {
    this._drawMode = e.detail as DrawMode;
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
          .drawMode=${this._drawMode}
          .vectorShapeType=${this._vectorShapeType}
          @mode-change=${this._onModeChange}
          @brush-change=${this._onBrushChange}
          @floor-change=${(e: CustomEvent) => this._switchFloor(e.detail as string)}
          @floor-add=${this._addFloor}
          @floor-delete=${(e: CustomEvent) => this._deleteFloor(e.detail as string)}
          @grid-toggle=${this._onGridToggle}
          @draw-mode-change=${this._onDrawModeChange}
          @vector-shape-change=${(e: CustomEvent) => { this._vectorShapeType = e.detail as 'line' | 'rect'; }}
        ></hspat-toolbar>

        <div class="canvas-wrapper">
          <canvas
            @pointerdown=${this._onPointerDown}
            @pointermove=${this._onPointerMove}
            @pointerup=${this._onPointerUp}
            @pointerleave=${this._onPointerUp}
          ></canvas>

          ${showDisclaimer ? html`
            <hspat-disclaimer-modal
              .config=${this._config}
              @config-changed=${this._onConfigChanged}
            ></hspat-disclaimer-modal>
          ` : ''}
        </div>

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

        ${this._mode === 'hardware' ? html`
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
        ` : ''}

        ${this._mode === 'audit' ? html`
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
        ` : ''}
      </ha-card>
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
