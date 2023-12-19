import '@shoelace-style/shoelace/dist/components/button/button';
import '@shoelace-style/shoelace/dist/components/button-group/button-group';
import { consume } from '@lit/context';
import { Router } from '@vaadin/router';
import { pricetagOutline, pricetag } from 'ionicons/icons';
import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { homeContext, HomeStore } from '@/features/home';
import { sharedStyles } from '@/styles/shared';
import { TagDto } from '@/types';

import '@/components/sn-menu';
import '@/components/sn-menu-list';
import '@/components/sn-menu-title';
import '@/layout/side-nav';

@customElement('tag-nav')
export class TagNav extends LitElement {
  static styles = [
    sharedStyles,
    css`
      .button-group {
        display: block;
        width: 100%;
        margin-bottom: var(--sl-spacing-x-small);

        :is(sl-button) {
          width: 50%;
        }
      }

      .add-button {
        display: flex;
        align-items: center;
      }

      .add-icon {
        font-size: var(--sl-font-size-large);
        color: var(--sl-color-neutral-600);
        &:hover {
          color: var(--sl-color-neutral-700);
        }
      }

      .menu-message {
        font-size: var(--sl-font-size-small);
        padding-left: var(--sl-spacing-medium);
        color: var(--sl-color-neutral-700);
      }
    `,
  ];

  @consume({ context: homeContext, subscribe: true })
  @property({ attribute: false })
  public homeStore?: HomeStore;

  @property({ attribute: false }) selectedTag?: TagDto;

  render() {
    const tags: TagDto[] = this.homeStore?.tags ?? [];
    return html`
      <side-nav>
        <sl-button-group class="button-group">
          <sl-button @click=${this.handleNavigateFolders}>Folders</sl-button>
          <sl-button variant="primary">Tags</sl-button>
        </sl-button-group>
        <sn-menu @sn-menu-clicked=${this.handleSelectTag}>
          <sn-menu-title position="top">Tags</sn-menu-title>
          ${tags && tags.length > 0
            ? html`
                <sn-menu-list
                  .items=${tags.map(item => ({
                    id: item.id,
                    label: item.name ?? 'Unknown',
                    icon: pricetagOutline,
                    iconSelected: pricetag,
                    selected: (!this.selectedTag && !item.id) || (this.selectedTag && this.selectedTag.id === item.id),
                  }))}
                ></sn-menu-list>
              `
            : html`<div class="menu-message">No tags added</div>`}
        </sn-menu>
      </side-nav>
    `;
  }

  private handleNavigateFolders() {
    Router.go('/');
  }

  private handleSelectTag(event: CustomEvent) {
    if (event.detail?.item?.id) Router.go(`/tag/${event.detail.item.id}`);
    else Router.go('/tag');
  }
}
