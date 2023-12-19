import '@shoelace-style/shoelace/dist/components/menu/menu';
import '@shoelace-style/shoelace/dist/components/menu-item/menu-item';
import '@shoelace-style/shoelace/dist/components/dropdown/dropdown';
import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { sharedStyles } from '@/styles/shared';
import { FolderDto } from '@/types';
import { createEvent } from '@/utils';

@customElement('folder-menu')
export class FolderMenu extends LitElement {
  static styles = [sharedStyles, css``];

  @property({ attribute: false }) folder?: FolderDto;

  handleSelectItem(event: CustomEvent) {
    const action = event.detail.item?.value;

    if (action === 'delete') {
      if (this.folder) {
        this.dispatchEvent(createEvent('delete-folder'));
      }
    } else if (action === 'rename') {
      this.dispatchEvent(createEvent('rename-folder'));
    }
  }

  render() {
    return this.folder
      ? html`
          <div class="dropdown-selection">
            <sl-dropdown @sl-select=${this.handleSelectItem}>
              <sl-button slot="trigger" caret size="small">Edit</sl-button>
              <sl-menu>
                <sl-menu-item value="rename">Rename Folder</sl-menu-item>
                <sl-menu-item value="delete">Delete Folder</sl-menu-item>
              </sl-menu>
            </sl-dropdown>
          </div>
        `
      : null;
  }
}
