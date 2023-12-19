import '@shoelace-style/shoelace/dist/components/menu/menu';
import '@shoelace-style/shoelace/dist/components/menu-item/menu-item';
import '@shoelace-style/shoelace/dist/components/dropdown/dropdown';
import { ellipsisHorizontalOutline } from 'ionicons/icons';
import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { LinkDto } from '@/types';
import { createEvent } from '@/utils';

@customElement('link-menu')
export class LinkMenu extends LitElement {
  static styles = css`
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
  `;

  @property({ attribute: false }) link!: LinkDto;

  handleSelectItem(event: CustomEvent) {
    const action = event.detail.item?.value;

    if (action === 'edit') {
      this.dispatchEvent(createEvent('edit-link', { link: this.link }));
    } else if (action === 'delete') {
      this.dispatchEvent(createEvent('delete-link', { link: this.link }));
    }
  }

  render() {
    return this.link
      ? html`
          <div class="dropdown-selection">
            <sl-dropdown placement="bottom-end" @sl-select=${this.handleSelectItem}>
              <button slot="trigger" class="menu-button">
                <ion-icon icon=${ellipsisHorizontalOutline} class="menu-link"></ion-icon>
              </button>
              <sl-menu class="rounded-menu">
                <sl-menu-item value="edit">Edit</sl-menu-item>
                <sl-menu-item value="delete">Delete</sl-menu-item>
              </sl-menu>
            </sl-dropdown>
          </div>
        `
      : null;
  }
}
