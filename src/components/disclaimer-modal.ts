import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { HspatConfig } from '../types.js';

@customElement('hspat-disclaimer-modal')
export class DisclaimerModal extends LitElement {
  @property({ attribute: false }) config!: HspatConfig;

  static styles = css`
    :host {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.6);
      z-index: 100;
    }
    .modal {
      background: var(--card-background-color, #fff);
      border-radius: 8px;
      padding: 24px;
      max-width: 480px;
      width: 90%;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    }
    h2 {
      margin: 0 0 12px;
      font-size: 1.1rem;
      color: var(--primary-text-color, #000);
    }
    p {
      font-size: 0.9rem;
      color: var(--secondary-text-color, #555);
      line-height: 1.5;
      margin: 0 0 16px;
    }
    button {
      background: var(--primary-color, #03a9f4);
      color: #fff;
      border: none;
      border-radius: 4px;
      padding: 10px 20px;
      font-size: 0.95rem;
      cursor: pointer;
      width: 100%;
    }
    button:hover { opacity: 0.9; }
  `;

  private _accept() {
    this.dispatchEvent(new CustomEvent('config-changed', {
      bubbles: true,
      composed: true,
      detail: { config: { ...this.config, disclaimer_accepted: true } },
    }));
  }

  render() {
    return html`
      <div class="modal">
        <h2>Home Security Posture &amp; Auditing Tool</h2>
        <p>
          This tool is for <strong>educational and planning purposes only</strong>.
          It provides a theoretical simulation of security coverage gaps based on your
          floor plan and sensor configuration.
        </p>
        <p>
          Results are <strong>not a guarantee</strong> of actual security performance.
          No real-time threat detection is performed. The simulated intrusion paths
          shown are theoretical illustrations to help identify potential coverage gaps.
        </p>
        <p>
          Always consult a qualified security professional for safety-critical decisions.
        </p>
        <button @click=${this._accept}>I Understand</button>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'hspat-disclaimer-modal': DisclaimerModal;
  }
}
