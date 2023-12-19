import { consume } from '@lit/context';
import { Task } from '@lit/task';
import { RouterLocation } from '@vaadin/router';
import { pricetagOutline } from 'ionicons/icons';
import { html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { sharedStyles } from '@/styles/shared';
import { LinkDto, TagDto } from '@/types';
import { createEvent, parseNumber } from '@/utils';

import { getLinksByTag } from '../home-api';
import { homeContext, HomeStore } from '../store/home-context';
import { HomeLayoutTitle } from '../types/home-layout-title';

import '../components/tag-nav';
import '../home-layout';

@customElement('tag-page')
export class TagPage extends LitElement {
  static styles = [sharedStyles];

  @consume({ context: homeContext, subscribe: true })
  @property({ attribute: false })
  public homeStore?: HomeStore;

  @property({ type: Object }) location?: RouterLocation;

  @state() selectedTag?: TagDto;

  private linksTask = new Task(this, {
    task: async ([selectedTag]) => {
      if (selectedTag) {
        return await this.fetchLinks(selectedTag);
      } else {
        return [];
      }
    },
    args: () => [this.selectedTag],
  });

  render() {
    const pageTitle: HomeLayoutTitle = {
      title: this.homeStore?.searchResults ? 'Search Results' : this.selectedTag?.name ?? 'Unknown Tag',
      icon: pricetagOutline,
    };

    const tagNav = html`<tag-nav .selectedTag=${this.selectedTag}></tag-nav>`;

    return html`
      <home-layout .pageTitle=${pageTitle} @link-added=${this.updateLinks} @link-deleted=${this.updateLinks}>
        <div slot="sidenav">${tagNav}</div>
        <div slot="sidenav-drawer">${tagNav}</div>
        <div slot="page-content">
          <div>
            ${this.homeStore?.searchResults
              ? html`
                  <links-list
                    .links=${this.homeStore.searchResults}
                    emptyMessage="No search results found"
                    @edit-link-saved=${this.updateLinks}
                  ></links-list>
                `
              : this.linksTask.render({
                  error: error => html`<div>Oops I got an error fetching links: ${error}</div>`,
                  complete: links =>
                    html`<links-list
                      .links=${links}
                      emptyMessage="Please select or create a tag"
                      @edit-link-saved=${this.updateLinks}
                    ></links-list>`,
                })}
          </div>
        </div>
      </home-layout>
    `;
  }

  private async updateLinks(): Promise<void> {
    this.dispatchEvent(createEvent('update-tags'));
    this.linksTask.run();
  }

  private async fetchLinks(tag?: TagDto): Promise<LinkDto[]> {
    return await getLinksByTag(tag?.id);
  }

  willUpdate() {
    const currentId = this.location?.params?.tagId;
    if (currentId) {
      this.selectedTag = this.homeStore?.tags?.find(tag => tag.id === parseNumber(currentId.toString()));
    }
  }
}
