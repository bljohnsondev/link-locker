import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('sn-menu-title')
export class SideNavMenuTitle extends LitElement {
  static styles = css`
    .folders-header {
      display: flex;
      align-items: center;
      color: var(--sl-color-neutral-600);
      padding-left: var(--sl-spacing-small);
      padding-right: var(--sl-spacing-small);
      font-size: var(--sl-font-size-medium);
    }

    .folders-right {
      margin-left: auto;
    }

    .position-top {
      margin-bottom: var(--sl-spacing-small);
    }

    .position-middle {
      margin-top: var(--sl-spacing-small);
      margin-bottom: var(--sl-spacing-small);
    }

    .position-bottom {
      margin-top: var(--sl-spacing-small);
    }
  `;

  @property({ type: String }) position: string = 'middle';

  render() {
    return html`
      <div class=${`folders-header position-${this.position}`}>
        <div><slot></slot></div>
        <div class="folders-right"><slot name="right-content"></slot></div>
      </div>
    `;
  }
}
