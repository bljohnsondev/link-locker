import { consume } from '@lit/context';
import '@shoelace-style/shoelace/dist/components/input/input';
import { serialize } from '@shoelace-style/shoelace/dist/utilities/form.js';
import { Router } from '@vaadin/router';
import { css, html, LitElement } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { object, string, ObjectSchema } from 'yup';

import { FormValidator } from '@/components/form';
import { ApiError } from '@/lib/api-error';
import { appContext } from '@/stores/app-context';
import { AppStore } from '@/types';
import { changeUserEvent, initializeFormEvents, storage } from '@/utils';

import { apiLogin } from './auth-api';

interface LoginFormValues {
  username?: string;
  password?: string;
}

const loginSchema: ObjectSchema<LoginFormValues> = object({
  username: string().required('Username is required'),
  password: string().required('Password is required'),
});

@customElement('login-page')
export class LoginPage extends LitElement {
  static styles = css`
    .login-root {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
    }

    .login-container {
      width: 400px;
    }

    .login-title {
      text-align: center;
      font-weight: var(--sl-font-weight-semibold);
      font-size: var(--sl-font-size-x-large);
      margin: var(--sl-spacing-medium) 0;
    }

    .login-box {
      background-color: var(--sl-color-neutral-200);
      color: var(--sl-color-neutral-700);
      border-radius: var(--sl-border-radius-large);
      padding: var(--sl-spacing-large);
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: var(--sl-spacing-medium);
    }

    .login-input:invalid {
      border: 1px solid red;
    }

    .login-input::part(base) {
      border: 1px solid var(--sl-color-neutral-400);
    }

    .login-input::part(input) {
      background-color: var(--sl-color-neutral-300);
      color: var(--sl-color-neutral-800);
    }

    .form-error {
      font-size: var(--sl-font-size-small);
      color: var(--sl-color-red-500);
      padding-top: var(--sl-spacing-x-small);
    }

    .auth-error {
      background-color: var(--sl-color-red-800);
      padding: var(--sl-spacing-small);
      color: var(--sl-color-red-300);
      text-align: center;
      border-radius: var(--sl-border-radius-medium);
      border: 1px solid var(--sl-color-red-700);
    }
  `;

  private formValidator: FormValidator<LoginFormValues> = new FormValidator(loginSchema);

  @consume({ context: appContext, subscribe: true })
  appStore?: AppStore;

  @query('form') loginForm!: HTMLFormElement;

  @property({ attribute: false })
  authError?: string;

  handleSubmit() {
    const data = serialize(this.loginForm) as LoginFormValues;

    if (this.formValidator.validate(data) && data.username && data.password) {
      this.formValidator.reset();
      apiLogin(data.username, data.password)
        .then(response => {
          if (response.user && response.token) {
            storage.setToken(response.token);
            this.dispatchEvent(changeUserEvent(response.user));
            Router.go('/');
          }
        })
        .catch(error => {
          if (error instanceof ApiError && error.statusCode === 401) {
            this.authError = 'Incorrect username or password';
          } else if (error instanceof ApiError && error.message) {
            this.authError = error.message;
          } else {
            this.authError = 'An unknown error has occurred';
          }
          this.requestUpdate();
        });
    } else {
      this.requestUpdate();
    }
  }

  render() {
    return html`
      <div class="login-root">
        <div class="login-container">
          <div class="login-title">Link Locker</div>
          <div class="login-box">
            <form class="login-form">
              <div>
                <sl-input name="username" label="Username" autofocus class="login-input"></sl-input>
                <form-error-message for="username" .errors=${this.formValidator.errors}></form-error-message>
              </div>
              <div>
                <sl-input
                  name="password"
                  label="Password"
                  autocomplete="off"
                  type="password"
                  class="login-input"
                ></sl-input>
                <form-error-message for="password" .errors=${this.formValidator.errors}></form-error-message>
              </div>
              <sl-button variant="primary" type="submit">Login</sl-button>
              ${this.authError && html`<div class="auth-error">${this.authError}</div>`}
            </form>
          </div>
        </div>
      </div>
    `;
  }

  firstUpdated() {
    initializeFormEvents(this.loginForm, () => this.handleSubmit());
  }
}
