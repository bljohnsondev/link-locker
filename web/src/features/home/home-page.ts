import { provide } from '@lit/context';
import { RouterLocation } from '@vaadin/router';
import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { sharedStyles } from '@/styles/shared';

import { getFolderList, getTagList } from './home-api';
import { homeContext, HomeStore } from './store/home-context';

import '@/stores/app-provider';

@customElement('home-page')
export class HomePage extends LitElement {
  static styles = [sharedStyles, css``];

  @property({ type: Object }) location?: RouterLocation;

  @provide({ context: homeContext })
  homeStore: HomeStore = {};

  render() {
    return html`
      <slot
        @update-folders=${this.handleUpdateFolders}
        @update-tags=${this.handleUpdateTags}
        @search-results=${this.handleSearchResults}
      ></slot>
    `;
  }

  private handleSearchResults(event: CustomEvent) {
    this.homeStore = { ...this.homeStore, searchResults: event.detail?.results };
  }

  private async handleUpdateFolders(): Promise<void> {
    const folders = await getFolderList();
    this.homeStore = { ...this.homeStore, folders };
  }

  private async handleUpdateTags(): Promise<void> {
    const tags = await getTagList();
    this.homeStore = { ...this.homeStore, tags };
  }

  willUpdate() {
    // this should be called on router location change so clear the search results
    this.homeStore = { ...this.homeStore, searchResults: undefined };
  }

  async connectedCallback(): Promise<void> {
    super.connectedCallback();
    const folders = await getFolderList();
    const tags = await getTagList();
    this.homeStore = { folders, tags };
  }
}
