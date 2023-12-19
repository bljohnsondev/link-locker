import { RouterLocation } from '@vaadin/router';
import { css, html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { AppErrorMessage, errorMessages } from './error-codes';

const UNKNOWN_ERROR_MESSAGE = 'An unknown error has occurred';

@customElement('error-page')
export class ErrorPage extends LitElement {
  static styles = css`
    main {
      display: flex;
      justify-content: center;
    }

    .error-message {
      padding: var(--sl-spacing-medium);
      margin-top: var(--sl-spacing-medium);
      width: 800px;
      border: 1px solid var(--sl-color-neutral-400);
      border-radius: var(--sl-border-radius-medium);
      background-color: var(--sl-color-neutral-200);
    }
  `;

  @property({ type: Object }) location?: RouterLocation;

  @state() errorMessage?: AppErrorMessage;

  render() {
    const error = this.errorMessage ? this.errorMessage.message : UNKNOWN_ERROR_MESSAGE;

    return html`
      <main>
        <div class="error-message">${error}</div>
      </main>
    `;
  }

  willUpdate() {
    if (this.location?.params?.errorCode) {
      this.errorMessage = errorMessages.find(err => err.code === this.location?.params.errorCode);
    }
  }
}
