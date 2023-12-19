import SlAlert from '@shoelace-style/shoelace/dist/components/alert/alert.js';
import {
  alertCircleOutline,
  checkmarkCircleOutline,
  informationCircleOutline,
  settingsOutline,
  warningOutline,
} from 'ionicons/icons';
import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import { ToastMessage } from '@/types';

import '@/components/dialogs/import-dialog';

import './top-header';

const icons = {
  primary: informationCircleOutline,
  success: checkmarkCircleOutline,
  neutral: settingsOutline,
  warning: warningOutline,
  danger: alertCircleOutline,
};

@customElement('app-layout')
export class AppLayout extends LitElement {
  constructor() {
    super();

    this.addEventListener('toast', event => {
      const { toast } = (event as CustomEvent).detail;
      this.toastMessage(toast);
    });
  }

  static styles = css`
    .content {
      display: flex;
      align-items: flex-start;
      margin-left: var(--sl-spacing-medium);
      margin-right: var(--sl-spacing-medium);

      @media only screen and (min-width: 1024px) {
        gap: var(--sl-spacing-medium);
      }
    }
  `;

  @state() dialogImportOpen: boolean = false;

  render() {
    return html`
      <main @open-import=${this.handleOpenImport} @close-import=${this.handleCloseImport}>
        <div id="toast-container"></div>
        <header>
          <top-header></top-header>
        </header>
        <div class="content">
          <slot></slot>
        </div>
        <import-dialog ?open=${this.dialogImportOpen}></import-dialog>
      </main>
    `;
  }

  private handleOpenImport() {
    this.dialogImportOpen = true;
  }

  private handleCloseImport() {
    this.dialogImportOpen = false;
  }

  toastMessage(toast?: ToastMessage) {
    if (toast) {
      const variant = toast.variant ?? 'primary';

      const alert = Object.assign(document.createElement('sl-alert'), {
        variant,
        closable: true,
        duration: 3000,
        innerHTML: `
          <ion-icon slot="icon" icon="${icons[variant]}" class="toast-icon"></ion-icon>
          ${toast.title ? `<strong>${toast.title}</strong>` : ''}
          ${this.escapeHtml(toast.message)}
        `,
      }) as SlAlert;

      const container = this.renderRoot.querySelector('#toast-container');

      if (container) {
        container.append(alert);
        alert.toast();
      }
    }
  }

  escapeHtml(html: string) {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  }
}
