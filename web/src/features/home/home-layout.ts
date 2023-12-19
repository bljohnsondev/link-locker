import { consume } from '@lit/context';
import { css, html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { sharedStyles } from '@/styles/shared';
import { FolderDto } from '@/types';

import { homeContext, HomeStore } from './store/home-context';
import { HomeLayoutTitle } from './types/home-layout-title';

import '@/layout/app-layout';
import '@/layout/menu-drawer';

import './components/dialogs/add-link-dialog';
import './components/links-list';

@customElement('home-layout')
export class HomeLayout extends LitElement {
  static styles = [
    sharedStyles,
    css`
      .show-sidenav {
        display: none;
        @media only screen and (min-width: 1024px) {
          display: block;
        }
      }

      .home-content {
        width: 100%;
      }

      .title-container {
        display: flex;
        align-items: center;
        gap: var(--sl-spacing-medium);
        color: var(--sl-color-neutral-800);
        font-size: var(--sl-font-size-medium);
        margin-bottom: var(--sl-spacing-x-small);
        line-height: var(--sl-input-height-medium);
      }

      .title {
        display: flex;
        align-items: center;
        gap: var(--sl-spacing-medium);
        color: var(--sl-color-neutral-800);
        font-size: var(--sl-font-size-medium);
      }
    `,
  ];

  @consume({ context: homeContext, subscribe: true })
  @property({ attribute: false })
  public homeStore?: HomeStore;

  @property({ attribute: false }) pageTitle?: HomeLayoutTitle;
  @property({ attribute: false }) selectedFolder?: FolderDto;

  @state() drawerOpen: boolean = false;
  @state() dialogAddLinkOpen: boolean = false;

  render() {
    return html`
      <app-layout
        @add-link-open=${this.handleOpenAddLink}
        @drawer-open=${this.handleToggleDrawer}
        @drawer-closed=${this.handleToggleDrawer}
      >
        <nav>
          <div class="show-sidenav"><slot name="sidenav"></slot></div>
          <menu-drawer ?open=${this.drawerOpen}>
            <slot name="sidenav-drawer"></slot>
          </menu-drawer>
        </nav>
        <section class="home-content">
          ${this.pageTitle
            ? html`
                <div class="title-container">
                  <div class="title">
                    ${this.pageTitle.icon ? html`<ion-icon icon=${this.pageTitle.icon}></ion-icon>` : null}
                    <span>${this.pageTitle.title}</span>
                  </div>
                  <slot name="title-suffix"></slot>
                </div>
              `
            : null}
          <div>
            <slot name="page-content"></slot>
          </div>
          <add-link-dialog
            ?open=${this.dialogAddLinkOpen}
            .folders=${this.homeStore?.folders}
            .selectedFolder=${this.selectedFolder}
            @add-link-close=${this.handleCloseAddLink}
          ></add-link-dialog>
        </section>
      </app-layout>
    `;
  }

  private handleOpenAddLink() {
    this.dialogAddLinkOpen = true;
  }

  private handleCloseAddLink() {
    this.dialogAddLinkOpen = false;
  }

  private handleToggleDrawer(event: CustomEvent) {
    this.drawerOpen = event.detail?.open === true;
  }
}
