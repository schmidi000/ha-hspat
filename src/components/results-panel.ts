import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { AuditResult, Floor } from '../types.js';

@customElement('hspat-results-panel')
export class ResultsPanel extends LitElement {
  @property({ attribute: false }) result: AuditResult | null = null;
  @property({ attribute: false }) floors: Floor[] = [];

  static styles = css`
    :host {
      display: block;
      padding: 12px;
      font-size: 0.9rem;
      color: var(--primary-text-color, #000);
    }
    h3 { margin: 0 0 8px; font-size: 1rem; }
    ul { margin: 0; padding-left: 18px; }
    li { margin-bottom: 4px; }
    .sensor-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
    }
    .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .active { background: #4caf50; }
    .offline { background: #f44336; }
    .floor-row {
      display: flex;
      justify-content: space-between;
      padding: 2px 0;
      font-size: 0.85rem;
    }
    .disclaimer {
      margin-top: 12px;
      font-size: 0.78rem;
      color: var(--secondary-text-color, #888);
      border-top: 1px solid var(--divider-color, #e0e0e0);
      padding-top: 8px;
    }
  `;

  render() {
    if (!this.result) {
      return html`<p>Run an audit to see results.</p>`;
    }

    const { coverage_tiles, sensor_snapshots, insights, per_floor } = this.result;
    const isMultiFloor = this.floors.length > 1;

    return html`
      <h3>Audit Results</h3>

      ${isMultiFloor ? html`
        <h3>Per-Floor Coverage</h3>
        <div>
          ${this.floors.map(f => {
            const fd = per_floor.get(f.id);
            const count = fd?.coverage_tiles.size ?? 0;
            return html`
              <div class="floor-row">
                <span>${f.name}</span>
                <span>${count} tile${count === 1 ? '' : 's'}</span>
              </div>
            `;
          })}
        </div>
      ` : html`
        <p><strong>Coverage:</strong> ${coverage_tiles.size} tile${coverage_tiles.size === 1 ? '' : 's'} monitored</p>
      `}

      <h3>Sensor Status</h3>
      <div>
        ${sensor_snapshots.map(s => html`
          <div class="sensor-row">
            <div class="dot ${s.health}"></div>
            <span>${s.sensor_id} — ${s.health}${s.reason ? ` (${s.reason})` : ''}</span>
          </div>
        `)}
      </div>

      ${insights.length > 0 ? html`
        <h3>Insights</h3>
        <ul>
          ${insights.map(i => html`<li>${i}</li>`)}
        </ul>
      ` : ''}

      <p class="disclaimer">
        Simulated Intrusion Path heatmap is displayed on the map above.
        Results are theoretical only — not a guarantee of security performance.
      </p>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'hspat-results-panel': ResultsPanel;
  }
}
