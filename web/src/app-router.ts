import '@shoelace-style/shoelace/dist/components/button/button';
import '@shoelace-style/shoelace/dist/components/icon/icon';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';
import { Router } from '@vaadin/router';
import { IonIcon } from 'ionicons/components/ion-icon';
import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

import { routes } from './routes';

import './stores/app-provider';
import './index.css';

// Set the base path to the folder you copied Shoelace's assets to
setBasePath('shoelace');

// define the ion-icon element
customElements.define('ion-icon', IonIcon);

@customElement('app-router')
export class AppRouter extends LitElement {
  render() {
    return html`
      <app-provider>
        <div id="router"></div>
      </app-provider>
    `;
  }

  async firstUpdated() {
    const routerElement = this.renderRoot.querySelector('#router');
    const router = new Router(routerElement);
    router.setRoutes(routes);
  }
}
