import { consume } from '@lit/context';
import '@shoelace-style/shoelace/dist/components/badge/badge';
import { Router } from '@vaadin/router';
import dayjs from 'dayjs';
import { folderOutline, linkOutline } from 'ionicons/icons';
import { css, html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { deleteLink, homeContext, HomeStore } from '@/features/home';
import { sharedStyles } from '@/styles/shared';
import { Endpoint, FolderDto, LinkDto, TagDto } from '@/types';
import { createEvent, toastEvent } from '@/utils';

import './dialogs/edit-link-dialog';
import './link-menu';

@customElement('links-list')
export class LinksList extends LitElement {
  static styles = [
    sharedStyles,
    css`
      .link-list {
        display: grid;
        grid-template-columns: repeat(1, minmax(0, 1fr));
        gap: var(--sl-spacing-small);

        @media only screen and (min-width: 1024px) {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        @media only screen and (min-width: 1280px) {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
      }

      .link-root {
        display: flex;
        flex-direction: column;
        gap: var(--sl-spacing-x-small);
        color: var(--sl-color-neutral-800);
        background-color: var(--sl-color-neutral-200);
        border: 1px solid var(--sl-color-neutral-400);
        border-radius: var(--sl-border-radius-medium);
        padding: var(--sl-spacing-small);
      }

      .title-container {
        display: flex;
        align-items: flex-start;
        width: 100%;
      }

      .link-title {
        display: block;
        color: var(--sl-color-neutral-950);
        font-weight: var(--sl-font-weight-semibold);
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }

      .link-url {
        display: flex;
        align-items: center;
        gap: var(--sl-spacing-x-small);
        color: var(--sl-color-neutral-600);
        text-decoration: none;
        margin-bottom: var(--sl-spacing-x-small);
        font-size: var(--sl-font-size-medium);
      }

      .right-section {
        margin-left: auto;
      }

      .content-container {
        display: flex;
        align-items: flex-end;
      }

      .favicon-container {
        margin-left: auto;
      }

      .favicon {
        border-radius: var(--sl-border-radius-medium);
      }

      .empty {
        /* margin-top: var(--sl-spacing-medium); */
        color: var(--sl-color-neutral-800);
      }

      .tags-container {
        display: flex;
        align-items: center;
        gap: var(--sl-spacing-x-small);
      }
    `,
  ];

  @consume({ context: homeContext, subscribe: true })
  @property({ attribute: false })
  public homeStore?: HomeStore;

  @state() editingLink?: LinkDto;
  @property({ type: String }) emptyMessage: string = 'No links found with that criteria';
  @property({ attribute: false }) links?: LinkDto[];
  @property({ attribute: false }) endpoint?: Endpoint;

  render() {
    if (!this.links) {
      return null;
    } else if (this.links && this.links.length === 0) {
      return html`<div class="link-root empty">${this.emptyMessage}</div>`;
    } else {
      return html`
        <div class="link-list">
          ${this.links.map((link: LinkDto) => {
            const icon = `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${link.url}&size=32`;

            return link.url && link.title
              ? html`
                  <section class="link-root">
                    <div class="title-container">
                      <a class="link-title" href="${link.url}" target="_blank">${link.title}</a>
                      <div class="right-section">
                        <link-menu
                          .link=${link}
                          @edit-link=${this.handleEditLink}
                          @delete-link=${this.handleDeleteLink}
                        ></link-menu>
                      </div>
                    </div>
                    <div class="content-container">
                      <div>
                        <a class="link-url" href="${link.url}" target="_blank">
                          <ion-icon icon=${linkOutline}></ion-icon>
                          <div>${this.getHostFromUrl(link.url)}</div>
                        </a>
                        ${link.folder
                          ? html`
                              <button
                                class="reset-button folder-button link-url"
                                @click=${() => this.handleClickFolder(link.folder)}
                              >
                                <ion-icon icon=${folderOutline}></ion-icon>
                                <div>${link.folder.name}</div>
                              </button>
                            `
                          : null}
                        <div>${dayjs(link.createdAt).format('MMM D, YYYY')}</div>
                      </div>
                      <div class="favicon-container">
                        <img src=${icon} class="favicon" />
                      </div>
                    </div>
                    ${link.tags &&
                    html`
                      <div class="tags-container">
                        ${link.tags.map((tag: TagDto) => html`<sl-badge variant="primary" pill>${tag.name}</sl-badge>`)}
                      </div>
                    `}
                    ${this.editingLink &&
                    html`
                      <edit-link-dialog
                        open
                        .link=${this.editingLink}
                        .folders=${this.homeStore?.folders}
                        @edit-link-saved=${this.handleClose}
                        @sl-hide=${this.handleClose}
                      ></edit-link-dialog>
                    `}
                  </section>
                `
              : null;
          })}
        </div>
      `;
    }
  }

  handleClose() {
    this.editingLink = undefined;
  }

  handleClickFolder(folder?: FolderDto) {
    if (folder) Router.go(`/folder/${folder.id}`);
  }

  handleEditLink(event: CustomEvent) {
    const link: LinkDto | undefined = event.detail.link;

    if (link) {
      this.editingLink = link;
    }
  }

  async handleDeleteLink(event: CustomEvent) {
    const link: LinkDto | undefined = event.detail.link;

    if (link && link.id) {
      await deleteLink(link.id);
      this.dispatchEvent(toastEvent({ variant: 'success', message: 'Successfully deleted link' }));
      this.dispatchEvent(createEvent('link-deleted'));
    }
  }

  private getHostFromUrl(url: string): string {
    return new URL(url).hostname.replace('www.', '');
  }

  /* this is just for testing so the edit dialog opens by default on the first link
  willUpdate() {
    if (this.links && this.links.length > 0) this.editingLink = this.links[0];
  }
  */
}
