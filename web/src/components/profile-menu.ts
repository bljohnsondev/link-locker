import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

import { sharedStyles } from '@/styles/shared';
import { createEvent } from '@/utils';

import '@shoelace-style/shoelace/dist/components/avatar/avatar';
import '@shoelace-style/shoelace/dist/components/menu/menu';
import '@shoelace-style/shoelace/dist/components/menu-item/menu-item';
import '@shoelace-style/shoelace/dist/components/dropdown/dropdown';

@customElement('profile-menu')
export class ProfileMenu extends LitElement {
  static styles = [
    sharedStyles,
    css`
      .menu-button {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 8px;
        margin: 0;
        border: 0;
        background-color: transparent;
        border-radius: var(--sl-border-radius-large);
        border: 2px solid transparent;

        &:focus {
          border: 2px solid var(--sl-color-neutral-400);
        }
      }

      .menu-link {
        color: var(--sl-color-neutral-950);
      }

      .rounded-menu {
        border-radius: var(--sl-border-radius-large);
      }
    `,
  ];

  handleSelectItem(event: CustomEvent) {
    const action = event.detail.item?.value;

    if (action === 'import') {
      this.dispatchEvent(createEvent('open-import'));
    } else if (action === 'logout') {
      this.dispatchEvent(createEvent('logout'));
    }
  }

  render() {
    return html`
      <sl-dropdown placement="bottom-end" distance="5" @sl-select=${this.handleSelectItem}>
        <button slot="trigger" class="reset-button">
          <sl-avatar shape="circle" label="User" style="--size: 2.5rem"></sl-avatar>
        </button>
        <sl-menu class="rounded-menu">
          <sl-menu-item value="import">Import File</sl-menu-item>
          <sl-menu-item value="logout">Logout</sl-menu-item>
        </sl-menu>
      </sl-dropdown>
    `;
  }
}
