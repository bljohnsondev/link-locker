import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';

import { sharedStyles } from '@/styles/shared';

@customElement('side-nav')
export class SideNav extends LitElement {
  static styles = [
    sharedStyles,
    css`
      .sidenav-root {
        width: 100%;

        @media only screen and (min-width: 1024px) {
          width: 13rem;
        }
      }
    `,
  ];

  render() {
    return html`
      <nav class="sidenav-root">
        <slot></slot>
      </nav>
    `;
  }
}
