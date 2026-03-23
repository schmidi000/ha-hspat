# HSPAT — Home Security Posture & Auditing Tool

A 100% client-side [Home Assistant](https://www.home-assistant.io/) Custom Lovelace Card for visualising and auditing your home's theoretical security coverage.

> **Disclaimer:** This tool is for educational and planning purposes only. Results are theoretical simulations — not a guarantee of actual security performance. No real-time threat detection is performed. Always consult a qualified security professional for safety-critical decisions.

---

## Features

- **Floor-plan grid editor** — paint your home layout tile-by-tile (walls, doors, windows, open space)
- **Sensor placement** — configure area sensors (cameras, motion) with directional FOV cones and point sensors (door/window contacts)
- **Live HA state integration** — sensor health is derived from Home Assistant entity states and battery levels in real time
- **FOV shadowcasting** — precise 360° sweep using rot.js `PreciseShadowcasting`, filtered to each sensor's directional cone
- **Monte Carlo simulation** — 150 randomised pathfinding iterations (weighted Dijkstra with ±15% noise) to model simulated intrusion paths from perimeter tiles to valuable tiles
- **Heatmap overlay** — colour gradient (yellow → dark red) showing theoretical traversal frequency
- **Insights panel** — neutral, non-alarmist analysis identifying unmonitored high-traffic zones
- **HACS compatible** — single-file distribution, installable via the Home Assistant Community Store

---

## Installation

### Via HACS (recommended)

1. Open HACS in your Home Assistant instance
2. Go to **Frontend** → **Custom repositories**
3. Add this repository URL and select category **Lovelace**
4. Search for **HSPAT** and install
5. Add the resource in **Settings → Dashboards → Three dots in the top right corner → Resources** (HACS may do this automatically)

### Manual

1. Download `dist/hspat-card.js`
2. Copy it to your Home Assistant `/config/www/` directory
3. Add the resource in **Settings → Dashboards → Three dots in the top right corner → Resources**:
   ```
   URL: /local/hspat-card.js
   Type: JavaScript module
   ```
4. Restart Home Assistant or Hard-Reload page

---

## Configuration

### Adding the card to a dashboard

The default **Overview** page in Home Assistant 2024+ is auto-generated and does not support custom cards. Create a dedicated dashboard instead:

1. Go to **Settings → Dashboards**
2. Click **⋮ (three dots)** in the top-right → **Resources → + Add resource**
   - URL: `/local/hspat-card.js`
   - Type: `JavaScript module`
   - Save, then hard-refresh your browser (Ctrl+Shift+R)
3. Back in **Settings → Dashboards**, click **+ Add dashboard**, give it a name, and click **Create**
4. Open the new dashboard from the sidebar
5. Click the **pencil (edit) icon** → **+ Add Card** → scroll to **Manual**
6. Paste the YAML below (replacing entity IDs with your own) and click **Save**

```yaml
type: custom:hspat-card
grid_cols: 20
grid_rows: 15
grid_rle: ""
floorplan_url: /local/floorplan/home.svg   # optional background image, stored in the www directory of home assistant
disclaimer_accepted: false
area_sensors:
  - id: area_1
    entity_id: binary_sensor.motion_hallway
    battery_entity_id: sensor.motion_hallway_battery   # optional
    grid_x: 5
    grid_y: 3
    facing_angle: 90    # degrees: 0=East, 90=South, 180=West, 270=North
    fov_angle: 110      # total cone width in degrees
    max_range: 8        # in grid tiles
point_sensors:
  - id: point_1
    entity_id: binary_sensor.front_door
    tile_x: 0
    tile_y: 7
    tile_type: 2        # 1=Window, 2=Door
valuables:
  - { x: 10, y: 5 }
perimeter:
  - { x: 0, y: 0 }
  - { x: 19, y: 0 }
```

### Configuration Reference

| Key | Type | Description |
|-----|------|-------------|
| `grid_cols` | `number` | Grid width in tiles (default: 50) |
| `grid_rows` | `number` | Grid height in tiles (default: 50) |
| `grid_rle` | `string` | RLE-encoded floor plan (managed by the card UI) |
| `floorplan_url` | `string` | Optional background image URL |
| `area_sensors` | `AreaSensor[]` | Directional sensors (cameras, motion detectors) |
| `point_sensors` | `PointSensor[]` | Door/window contact sensors |
| `valuables` | `{x,y}[]` | Tiles representing high-value targets |
| `perimeter` | `{x,y}[]` | Tiles representing entry points |
| `disclaimer_accepted` | `boolean` | Set to `true` after accepting the disclaimer |

### Sensor Health

A sensor is marked **offline** (and excluded from analysis) when:
- Its HA entity state is `unavailable` or `unknown`
- Its battery entity reads below **5%**, or is `unavailable`/`unknown`

---

## Tutorial

### Step 1 — Setup

Open the card and switch to the **⚙ Setup** tab. Configure your floor's grid dimensions (columns × rows) and optionally paste a background floorplan image URL (e.g. `/local/floorplan/ground-floor.svg`). The image will be drawn behind the tile grid so you can trace your walls accurately.

If you have multiple floors, use **+ Floor** to add them. When a new floor is added, the Ground Floor's wall layout is copied as a starting point — delete the interior room walls and keep the outer shell.

![Setup tab](screenshots/tutorial-1-setup.png)
*Background floorplan used from [ha-floorplan](https://github.com/ExperienceLovelace/ha-floorplan) (Apache 2.0)*

---

### Step 2 — Draw

Switch to the **✏ Draw** tab. Select a brush from the toolbar and click (or drag) on the canvas to paint tiles:

| Brush | Use for |
|-------|---------|
| **Open** | Walkable interior space — rooms, corridors |
| **Wall** | Solid, impassable surfaces |
| **Door** | Passable openings with higher traversal cost |
| **Window** | Breach points easier to enter than a door |
| **Perimeter** | Exterior boundary — potential entry points for the simulation |
| **Valuable** | High-value targets the simulation routes intruders towards |
| **Stairs** | Cross-floor connection tile |

Use **Undo / Redo** (or Ctrl+Z / Ctrl+Shift+Z) to correct mistakes. Toggle the **Grid: ON/OFF** button to check the floorplan image underneath without the overlay.

![Draw tab](screenshots/tutorial-2-draw.png)
*Background floorplan used from [ha-floorplan](https://github.com/ExperienceLovelace/ha-floorplan) (Apache 2.0)*

---

### Step 3 — Sensors

Switch to the **📡 Sensors** tab. Use the form on the right to add sensors:

- **Area sensors** (cameras, PIR motion detectors) — specify the Home Assistant entity ID, the tile the sensor is mounted on, its facing angle (0° = East, 90° = South) and field-of-view cone width. Click **Place** to position it on the canvas.
- **Point sensors** (door/window contacts) — specify the entity ID and the door or window tile it monitors.

Right-click any sensor on the canvas to delete it. Sensor health (online/offline) is derived live from HA entity states and battery levels.

![Sensors tab](screenshots/tutorial-3-sensors.png)
*Background floorplan used from [ha-floorplan](https://github.com/ExperienceLovelace/ha-floorplan) (Apache 2.0)*

---

### Step 4 — Audit

Switch to the **🛡 Audit** tab and click **Run Audit**. The card will:

1. Snapshot all sensor states from Home Assistant
2. Compute sensor FOV coverage using shadowcasting
3. Run 150 Monte Carlo pathfinding iterations from every **Perimeter** tile to every **Valuable** tile
4. Render a heatmap overlay (yellow → dark red = high traversal frequency)
5. Display an insights panel highlighting unmonitored high-traffic zones

Tiles never reached by any sensor's FOV are marked as blind spots. Use the results to reposition sensors or add new ones, then re-run the audit.

![Audit tab](screenshots/tutorial-4-audit.png)
*Background floorplan used from [ha-floorplan](https://github.com/ExperienceLovelace/ha-floorplan) (Apache 2.0)*

---

## Modes

| Mode | Description |
|------|-------------|
| **Setup** | Overview of current configuration |
| **Paint** | Draw your floor plan — select a tile type and paint on the canvas |
| **Hardware** | Add/remove area sensors and point sensors via form |
| **Audit** | Run the Monte Carlo simulation and view the heatmap + insights |

---

## Tile Types

| Tile | Cost | Description |
|------|------|-------------|
| Open | 1 | Passable open floor |
| Window | 10 | Higher traversal cost (partial barrier) |
| Door | 30 | Higher cost; reduced to 1 if contact sensor reports open |
| Wall | ∞ | Impassable |
| Perimeter | — | Entry point overlay (not a structural tile) |
| Valuable | — | High-value target overlay (not a structural tile) |

When a door/window contact sensor is active and reports **closed**, `SENSOR_PENALTY` (100) is added to the base cost — making that path more expensive in the simulation.

---

## Architecture

```
src/
├── hspat-card.ts              # Main Lit element — card entry point
├── types.ts                   # TypeScript interfaces & enums
├── constants.ts               # Traversal costs, tile colours, defaults
│
├── components/
│   ├── disclaimer-modal.ts    # First-use disclaimer (Lit element)
│   ├── toolbar.ts             # Mode + brush selector
│   ├── sensor-form.ts         # Sensor CRUD forms
│   └── results-panel.ts       # Audit results display
│
├── modules/
│   ├── rle.ts                 # Run-Length Encoding (grid serialisation)
│   ├── grid-painter.ts        # Canvas paint loop, pixel→tile conversion
│   ├── ha-snapshot.ts         # HA entity state snapshot & health check
│   ├── state-resolver.ts      # Dynamic traversal cost matrix builder
│   ├── shadowcast.ts          # rot.js FOV + directional angle mask
│   ├── dijkstra.ts            # Weighted Dijkstra + Monte Carlo runner
│   └── insights.ts            # Blind-spot detection, heatColour()
│
└── workers/
    └── simulation.worker.ts   # Monte Carlo simulation (Web Worker)
```

### Key algorithms

**FOV (shadowcast.ts)**
Uses `rot.js PreciseShadowcasting` for a full 360° sweep from each sensor origin, then applies a post-processing directional mask using `Math.atan2`. Angle convention: 0° = East, 90° = South (matches canvas y-axis increasing downward).

**Monte Carlo (dijkstra.ts)**
Runs `SIMULATION_ITERS` (150) iterations. Each iteration picks a random perimeter tile as spawn and a random valuable tile as target, then finds the lowest-cost path using weighted Dijkstra with ±15% per-edge noise. Accumulated visit counts form the heatmap.

**RLE grid encoding (rle.ts)**
The flat tile array is serialised as run-length encoded strings (`"50x0,3x3"`) for compact storage in Lovelace YAML config.

---

## Development

### Prerequisites

- Node.js 18+
- npm 9+

### Setup

```bash
npm install
```

### Commands

```bash
npm run build          # Compile to dist/hspat-card.js
npm test               # Run unit tests (vitest)
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Run tests with coverage report
```

### Test coverage

```
94 tests across 7 test files — 81.7% statement coverage
```

Modules with full unit test suites:

- `rle.ts` — 24 tests
- `ha-snapshot.ts` — 17 tests
- `state-resolver.ts` — 9 tests
- `shadowcast.ts` — 12 tests
- `dijkstra.ts` — 12 tests
- `insights.ts` — 11 tests
- `grid-painter.ts` — 9 tests

---

## License

MIT
