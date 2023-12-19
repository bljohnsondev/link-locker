import { provide } from '@lit/context';
import { Router } from '@vaadin/router';
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { getUser } from '@/features/auth';
import { AppStore } from '@/types';
import { storage } from '@/utils';

import { appContext } from './app-context';

@customElement('app-provider')
export class AppProvider extends LitElement {
  @provide({ context: appContext })
  @property({ attribute: false })
  appStore: AppStore = {};

  constructor() {
    super();

    this.addEventListener('change-appstore', event => {
      const updatedAppStore = (event as CustomEvent).detail;
      this.appStore = { ...this.appStore, ...updatedAppStore };
    });

    // set up a listener to watch for color theme changes by the OS
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
      this.setTheme(event.matches ? 'dark' : 'light');
    });

    this.addEventListener('toggle-theme', this.toggleTheme);
  }

  /*
   * from: https://medium.com/@quincarter/understanding-component-state-and-using-lit-element-context-40981e808535
   *
  connectedCallback(): void {
    super.connectedCallback();
    this.shadowRoot?.addEventListener('change-username', event => {
      this.appStore = { username: (event as CustomEvent).detail };
    });
  }
  */

  render() {
    return html`<slot></slot>`;
  }

  async connectedCallback(): Promise<void> {
    super.connectedCallback();

    // initialize the color scheme on load
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.appStore = { ...this.appStore, theme: 'dark' };
      document.documentElement.classList.add('sl-theme-dark');
    } else {
      this.appStore = { ...this.appStore, theme: 'light' };
      document.documentElement.classList.add('sl-theme-light');
    }

    // load the user data
    const user = await getUser();
    if (!user) {
      storage.clearToken();
      Router.go('/login');
    } else {
      this.appStore = { ...this.appStore, user };
    }
  }

  private setTheme(newTheme: string) {
    const root = document.documentElement;
    if (this.appStore?.theme) {
      root.classList.remove(`sl-theme-${this.appStore.theme}`);
    }
    root.classList.add(`sl-theme-${newTheme}`);
    this.appStore = { ...this.appStore, theme: newTheme };
  }

  private toggleTheme() {
    this.setTheme(this.appStore?.theme === 'dark' ? 'light' : 'dark');
  }
}
