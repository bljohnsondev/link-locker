import '@shoelace-style/shoelace/dist/components/button/button';
import '@shoelace-style/shoelace/dist/components/button-group/button-group';
import { consume } from '@lit/context';
import { Router } from '@vaadin/router';
import { addCircleOutline, folderOutline, folder } from 'ionicons/icons';
import { css, html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { homeContext, HomeStore } from '@/features/home';
import { sharedStyles } from '@/styles/shared';
import { FolderDto } from '@/types';
import { createEvent } from '@/utils';

import '@/components/sn-menu';
import '@/components/sn-menu-list';
import '@/components/sn-menu-title';
import '@/layout/side-nav';

import './dialogs/add-folder-dialog';

@customElement('folder-nav')
export class FolderNav extends LitElement {
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
    `,
  ];

  @consume({ context: homeContext, subscribe: true })
  @property({ attribute: false })
  public homeStore?: HomeStore;

  @state() addFolderOpen: boolean = false;

  @property({ attribute: false }) selectedFolder?: FolderDto;

  render() {
    const folders: FolderDto[] = [{ name: 'Unsorted Links' }, ...(this.homeStore?.folders ?? [])];
    return html`
      <side-nav>
        <sl-button-group class="button-group">
          <sl-button variant="primary">Folders</sl-button>
          <sl-button
            ?disabled=${!this.homeStore?.tags || this.homeStore.tags.length < 1}
            @click=${this.handleNavigateTags}
            >Tags</sl-button
          >
        </sl-button-group>
        <sn-menu @sn-menu-clicked=${this.handleSelectFolder}>
          <sn-menu-title position="top">
            Folders
            <div slot="right-content">
              <button class="reset-button add-button" @click=${this.handleOpenAddFolder}>
                <ion-icon icon=${addCircleOutline} class="add-icon"></ion-icon>
              </button>
            </div>
          </sn-menu-title>
          <sn-menu-list
            .items=${folders.map(item => ({
              id: item.id,
              label: item.name ?? 'Unknown',
              icon: folderOutline,
              iconSelected: folder,
              selected:
                (!this.selectedFolder && !item.id) || (this.selectedFolder && this.selectedFolder.id === item.id),
            }))}
          ></sn-menu-list>
        </sn-menu>
      </side-nav>
      <add-folder-dialog
        ?open=${this.addFolderOpen}
        @sl-hide=${this.handleCloseAddFolder}
        @folder-added=${this.updateFolders}
      ></add-folder-dialog>
    `;
  }
  //@folder-added=${this.updateFolders}

  private handleOpenAddFolder() {
    this.addFolderOpen = true;
  }

  private handleCloseAddFolder() {
    this.addFolderOpen = false;
  }

  private updateFolders() {
    this.dispatchEvent(createEvent('update-folders'));
  }

  private handleNavigateTags() {
    Router.go('/tag');
  }

  private handleSelectFolder(event: CustomEvent) {
    if (event.detail?.item?.id) Router.go(`/folder/${event.detail.item.id}`);
    else Router.go('/');
  }
}
