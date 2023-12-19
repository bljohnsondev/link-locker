import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';

import { createEvent } from '@/utils';

import '@shoelace-style/shoelace/dist/components/drawer/drawer.js';

@customElement('menu-drawer')
export class MenuDrawer extends LitElement {
  @property({ type: String }) label?: string;
  @property({ type: Boolean }) open = false;

  constructor() {
    super();
    this.addEventListener('sl-hide', () => {
      this.dispatchEvent(createEvent('drawer-closed'));
    });
  }
  render() {
    return html`
      <sl-drawer
        label=${ifDefined(this.label)}
        placement="start"
        ?open=${this.open}
        class="drawer-overview"
        @sl-after-hide=${this.handleHide}
      >
        <slot></slot>
        <sl-button slot="footer" variant="primary" @click=${this.handleHide}>Close</sl-button>
      </sl-drawer>
    `;
  }

  handleHide() {
    this.dispatchEvent(createEvent('drawer-open', { open: false }));
  }
}
