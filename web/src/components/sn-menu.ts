import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('sn-menu')
export class SideNavMenu extends LitElement {
  static styles = css`
    .sidenav-box {
      border-radius: var(--sl-border-radius-medium);
      background-color: var(--sl-color-neutral-200);
      border: 1px solid var(--sl-color-neutral-300);
      padding-top: var(--sl-spacing-small);
      padding-bottom: var(--sl-spacing-small);
    }
  `;

  render() {
    return html`<div class="sidenav-box"><slot></slot></div>`;
  }
}
