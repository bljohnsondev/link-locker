import { serialize } from '@shoelace-style/shoelace/dist/utilities/form.js';
import '@shoelace-style/shoelace/dist/components/dialog/dialog';
import '@shoelace-style/shoelace/dist/components/input/input';
import '@shoelace-style/shoelace/dist/components/option/option';
import '@shoelace-style/shoelace/dist/components/select/select';
import { Router } from '@vaadin/router';
import { addCircleOutline } from 'ionicons/icons';
import { css, html, LitElement } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { object, string, ObjectSchema } from 'yup';

import { FormValidator } from '@/components/form/form-validator';
import { FolderDto } from '@/types';
import { createEvent, initializeFormEvents, toastEvent } from '@/utils';

import '@/components/form/form-error-message';
import { deleteFolder } from '../../home-api';

export interface DeleteFolderFormValues {
  linkaction?: string;
}

const deleteFolderSchema: ObjectSchema<DeleteFolderFormValues> = object({
  linkaction: string().required('Link Action is required'),
});

@customElement('delete-folder-dialog')
export class DeleteFolderDialog extends LitElement {
  static styles = css`
    .delete-text {
      margin-bottom: var(--sl-spacing-medium);
    }
  `;

  formValidator: FormValidator<DeleteFolderFormValues> = new FormValidator(deleteFolderSchema);

  @query('sl-dialog') dialog!: HTMLFormElement;
  @query('form') deleteForm!: HTMLFormElement;

  @state() loading: boolean = false;

  @property({ attribute: false }) folder?: FolderDto;
  @property({ type: Boolean }) open!: boolean;

  async handleSubmit() {
    if (!this.loading) {
      if (this.deleteForm) {
        const data = serialize(this.deleteForm) as DeleteFolderFormValues;
        if (this.formValidator.validate(data) && this.folder?.id && data.linkaction) {
          deleteFolder(this.folder.id, data.linkaction)
            .then(() => {
              this.dispatchEvent(createEvent('update-folders'));
              this.dispatchEvent(createEvent('update-tags'));
              this.dispatchEvent(
                toastEvent({
                  variant: 'success',
                  title: 'Folder deleted',
                  message: `Deleted ${this.folder?.name}`,
                })
              );
              Router.go('/');
            })
            .catch(err => {
              this.dispatchEvent(
                toastEvent({
                  variant: 'danger',
                  title: 'Error deleting folder',
                  message: err.message,
                })
              );
            });
        }
      }
    }
  }

  handleCancel() {
    this.dispatchEvent(createEvent('sl-hide'));
  }

  handleHide(event: Event) {
    // don't handle the sl-hide event when triggered from a child element of the dialog
    if (event.target === this.dialog) {
      this.resetForm();
      this.dispatchEvent(createEvent('delete-folder-close'));
    } else {
      // if the sl-hide happened somewhere other than the dialog stop it from propogating
      event.stopPropagation();
    }
  }

  handleNoAutoClose(event: Event) {
    if (this.loading) event.preventDefault();
  }

  render() {
    return this.folder
      ? html`
          <sl-dialog
            id="delete-dialog"
            label="Delete Folder"
            ?open=${this.open}
            class="delete-dialog"
            @sl-hide=${this.handleHide}
            @sl-request-close=${this.handleNoAutoClose}
          >
            <form id="delete-form">
              <div class="delete-text">Are you sure you want to delete the folder "${this.folder.name}"?</div>
              <div>
                <sl-select name="linkaction" label="Link Action" value="unsorted" hoist>
                  <sl-option value="unsorted">Move to Unsorted</sl-option>
                  <sl-option value="delete">Delete Links in Folder</sl-option>
                </sl-select>
              </div>
            </form>
            <sl-button slot="footer" type="submit" form="delete-form" variant="primary" ?loading=${this.loading}>
              <ion-icon slot="prefix" icon=${addCircleOutline} class="add-icon"></ion-icon>
              Delete
            </sl-button>
            <sl-button slot="footer" ?loading=${this.loading} @click=${this.handleCancel}>Cancel</sl-button>
          </sl-dialog>
        `
      : null;
  }

  resetForm() {
    this.formValidator.reset();
    this.deleteForm.reset();
  }

  firstUpdated() {
    if (this.deleteForm) initializeFormEvents(this.deleteForm, () => this.handleSubmit());
  }
}
