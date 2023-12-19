import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';

import { sharedStyles } from '@/styles/shared';
import { SideNavMenuItem } from '@/types';
import { createEvent } from '@/utils';

@customElement('sn-menu-list')
export class SideNavMenuList extends LitElement {
  static styles = [
    sharedStyles,
    css`
      .folder-list {
        display: flex;
        flex-direction: column;
        gap: var(--sl-spacing-x-small);

        :is(li) {
          display: flex;
          align-items: center;

          &:is(.selected) {
            background-color: var(--sl-color-sky-300);
          }

          :is(button) {
            line-height: 1rem;
            padding: var(--sl-spacing-x-small) var(--sl-spacing-small);
            display: flex;
            align-items: center;
            gap: var(--sl-spacing-small);
            width: 100%;
            cursor: pointer;
            color: var(--sl-color-neutral-800);
            font-size: var(--sl-font-size-medium);
          }
        }
      }
    `,
  ];

  @property({ attribute: false }) items?: SideNavMenuItem[];

  render() {
    return html`
      <ul class="reset-ul folder-list">
        ${this.items?.map(
          item => html`
            <li class=${item.selected ? 'selected' : ''}>
              <button class="reset-button" @click=${() => this.handleClick(item)}>
                <ion-icon
                  icon=${ifDefined(item.selected ? item.iconSelected : item.icon)}
                  class="folder-icon"
                ></ion-icon>
                <span>${item.label}</span>
              </button>
            </li>
          `
        )}
      </ul>
    `;
  }

  private handleClick(item: SideNavMenuItem) {
    this.dispatchEvent(createEvent('sn-menu-clicked', { item }));
  }
}
