import { consume } from '@lit/context';
import { Task } from '@lit/task';
import { RouterLocation } from '@vaadin/router';
import { folderOutline } from 'ionicons/icons';
import { html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { sharedStyles } from '@/styles/shared';
import { FolderDto, LinkDto } from '@/types';
import { createEvent, parseNumber } from '@/utils';

import { getLinksByFolder } from '../home-api';
import { homeContext, HomeStore } from '../store/home-context';
import { HomeLayoutTitle } from '../types/home-layout-title';

import '../home-layout';
import '../components/folder-menu';
import '../components/folder-nav';
import '../components/dialogs/delete-folder-dialog';
import '../components/dialogs/rename-folder-dialog';

@customElement('folder-page')
export class FolderPage extends LitElement {
  static styles = [sharedStyles];

  @consume({ context: homeContext, subscribe: true })
  @property({ attribute: false })
  public homeStore?: HomeStore;

  @property({ type: Object }) location?: RouterLocation;

  @state() selectedFolder?: FolderDto;
  @state() renameOpen: boolean = false;
  @state() deleteOpen: boolean = false;

  private linksTask = new Task(this, {
    task: async ([selectedFolder]) => {
      return await this.fetchLinks(selectedFolder);
    },
    args: () => [this.selectedFolder],
  });

  render() {
    const searchResults = this.homeStore?.searchResults;

    const pageTitle: HomeLayoutTitle = {
      title: searchResults
        ? 'Search Results'
        : this.selectedFolder && this.selectedFolder.name
        ? this.selectedFolder.name
        : 'Unsorted Links',
      icon: folderOutline,
    };

    const folderNav = html`<folder-nav .selectedFolder=${this.selectedFolder}></folder-nav>`;

    return html`
      <home-layout
        .pageTitle=${pageTitle}
        .selectedFolder=${this.selectedFolder}
        @link-added=${this.updateLinks}
        @link-deleted=${this.updateLinks}
      >
        <div slot="sidenav">${folderNav}</div>
        <div slot="sidenav-drawer">${folderNav}</div>
        <div slot="title-suffix">
          ${!searchResults
            ? html`
                <div class="folder-button">
                  <folder-menu
                    .folder=${this.selectedFolder}
                    @rename-folder=${this.handleOpenRename}
                    @delete-folder=${this.handleOpenDelete}
                  ></folder-menu>
                </div>
              `
            : null}
        </div>
        <div slot="page-content">
          <div>
            ${searchResults
              ? html`
                  <links-list
                    .links=${searchResults}
                    emptyMessage="No search results found"
                    @edit-link-saved=${this.updateLinks}
                  ></links-list>
                `
              : this.linksTask.render({
                  error: error => html`<div>Oops I got an error fetching links: ${error}</div>`,
                  complete: links =>
                    html`<links-list .links=${links} @edit-link-saved=${this.updateLinks}></links-list>`,
                })}
          </div>
          <div>
            ${this.selectedFolder
              ? html`
                  <rename-folder-dialog
                    ?open=${this.renameOpen}
                    .folder=${this.selectedFolder}
                    @sl-hide=${this.handleCloseRename}
                  ></rename-folder-dialog>
                  <delete-folder-dialog
                    ?open=${this.deleteOpen}
                    .folder=${this.selectedFolder}
                    @sl-hide=${this.handleCloseDelete}
                  ></delete-folder-dialog>
                `
              : null}
          </div>
        </div>
      </home-layout>
    `;
  }

  private handleOpenRename() {
    this.renameOpen = true;
  }

  private handleCloseRename() {
    this.renameOpen = false;
  }

  private handleOpenDelete() {
    this.deleteOpen = true;
  }

  private handleCloseDelete() {
    this.deleteOpen = false;
  }

  private async updateLinks(): Promise<void> {
    this.dispatchEvent(createEvent('update-tags'));
    this.linksTask.run();
  }

  private async fetchLinks(folder?: FolderDto): Promise<LinkDto[]> {
    return await getLinksByFolder(folder?.id);
  }

  willUpdate() {
    const currentId = this.location?.params?.folderId;
    if (currentId) {
      this.selectedFolder = this.homeStore?.folders?.find(folder => folder.id === parseNumber(currentId.toString()));
    }
  }
}
