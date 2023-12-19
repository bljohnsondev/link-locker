import { consume } from '@lit/context';
import { serialize } from '@shoelace-style/shoelace/dist/utilities/form.js';
import { Router } from '@vaadin/router';
import { addCircleOutline, menu, moon, sunny } from 'ionicons/icons';
import { css, html, LitElement } from 'lit';
import { customElement, query } from 'lit/decorators.js';

import { appContext } from '@/stores/app-context';
import { sharedStyles } from '@/styles/shared';
import { AppStore } from '@/types';
import { changeUserEvent, createEvent, storage } from '@/utils';
import { searchLinks } from '@/utils/common-api';

import '@/components/profile-menu';

interface SearchFormValues {
  terms?: string;
}

@customElement('top-header')
export class TopHeader extends LitElement {
  static styles = [
    sharedStyles,
    css`
      .header {
        display: flex;
        flex-direction: column;
        gap: var(--sl-spacing-large);
        margin: var(--sl-spacing-large);
        align-items: center;

        @media only screen and (min-width: 1024px) {
          flex-direction: row;
        }
      }

      .left-section {
        display: flex;
        align-items: center;
        gap: var(--sl-spacing-small);
      }

      .mid-section {
        flex-grow: 1;

        :is(sl-input) {
          width: 100%;
          margin: 0 auto;
          @media only screen and (min-width: 1024px) {
            width: 50%;
          }
        }
      }

      .right-section {
        display: flex;
        align-items: center;
        gap: var(--sl-spacing-medium);

        @media only screen and (min-width: 1024px) {
          margin-left: auto;
        }
      }

      .show-menu {
        display: block;
        @media only screen and (min-width: 1024px) {
          display: none;
        }
      }

      .menu-icon {
        height: 24px;
        width: 24px;
      }

      .logo {
        height: 40px;
        width: 40px;
        margin-right: 0.75rem;
      }

      .title {
        flex-grow: 1;
        font-weight: var(--sl-font-weight-semibold);
        font-size: var(--sl-font-size-large);

        :is(a) {
          display: flex;
          align-items: center;
          color: var(--sl-color-blue-900);
          cursor: pointer;
        }

        @media only screen and (min-width: 1024px) {
          margin-left: var(--sl-spacing-small);
        }
      }

      .right-icon {
        height: 20px;
        width: 20px;
      }

      .theme-icon {
        height: 24px;
        width: 24px;
        color: var(--sl-color-neutral-800);
      }

      .search-input {
        width: 100%;
      }
    `,
  ];

  @consume({ context: appContext, subscribe: true })
  appStore?: AppStore;

  @query('form') searchForm?: HTMLFormElement;

  render() {
    return html`
      <header class="header">
        <div class="left-section">
          <button class="show-menu reset-button" @click=${this.handleOpenMenu}>
            <ion-icon icon=${menu} class="menu-icon"></ion-icon>
          </button>
          <div class="title">
            <a @click=${this.handleHome}>
              <img src="/images/logo1.png" alt="Link Locker Logo" class="logo" />
              Link Locker
            </a>
          </div>
        </div>
        <div class="mid-section">
          <form>
            <sl-input
              name="terms"
              placeholder="Search"
              clearable
              @sl-clear=${this.handleClear}
              class="search-input"
            ></sl-input>
          </form>
        </div>
        ${this.appStore &&
        this.appStore.user &&
        html`
          <div class="right-section">
            <button class="reset-button" @click=${this.handleToggleTheme}>
              <ion-icon icon=${this.appStore?.theme === 'dark' ? sunny : moon} class="theme-icon"></ion-icon>
            </button>
            <sl-button variant="primary" size="medium" pill @click=${this.handleOpen}>
              <ion-icon slot="prefix" icon=${addCircleOutline} class="right-icon"></ion-icon>
              Add Link
            </sl-button>
            <profile-menu @logout=${this.handleLogout}></profile-menu>
          </div>
        `}
      </header>
    `;
  }

  handleOpen() {
    this.dispatchEvent(createEvent('add-link-open'));
  }

  handleHome() {
    Router.go('/');
  }

  handleOpenMenu() {
    this.dispatchEvent(createEvent('drawer-open', { open: true }));
  }

  handleLogout() {
    storage.clearToken();
    this.dispatchEvent(changeUserEvent(undefined));
    Router.go('/login');
  }

  handleToggleTheme() {
    this.dispatchEvent(createEvent('toggle-theme'));
  }

  handleClear() {
    this.dispatchEvent(createEvent('search-results', {}));
  }

  async handleSubmit(event: SubmitEvent) {
    event.preventDefault();

    if (this.searchForm) {
      const data = serialize(this.searchForm) as SearchFormValues;
      if (data.terms && data.terms.trim()) {
        const links = await searchLinks(data.terms.trim());
        this.dispatchEvent(createEvent('search-results', { results: links }));
      } else {
        this.handleClear();
      }
    }
  }

  firstUpdated() {
    this.searchForm?.addEventListener('submit', event => this.handleSubmit(event));
  }
}
