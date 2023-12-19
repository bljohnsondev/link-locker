import { serialize } from '@shoelace-style/shoelace/dist/utilities/form.js';
import '@shoelace-style/shoelace/dist/components/dialog/dialog';
import '@shoelace-style/shoelace/dist/components/input/input';
import { addCircleOutline } from 'ionicons/icons';
import { css, html, LitElement } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { object, string, ObjectSchema } from 'yup';

import { FormValidator } from '@/components/form/form-validator';
import { FolderDto } from '@/types';
import { createEvent, initializeFormEvents, toastEvent } from '@/utils';

import '@/components/form/form-error-message';
import { editFolder } from '../../home-api';

export interface RenameFolderFormValues {
  name?: string;
}

const renameFolderSchema: ObjectSchema<RenameFolderFormValues> = object({
  name: string().required('Folder Name is required'),
});

@customElement('rename-folder-dialog')
export class RenameFolderDialog extends LitElement {
  static styles = css``;

  formValidator: FormValidator<RenameFolderFormValues> = new FormValidator(renameFolderSchema);

  @query('sl-dialog') dialog!: HTMLFormElement;
  @query('form') renameForm!: HTMLFormElement;

  @state() loading: boolean = false;

  @property({ attribute: false }) folder?: FolderDto;
  @property({ type: Boolean }) open!: boolean;

  handleSubmit(event: Event) {
    if (!this.loading) {
      const form = event.target as HTMLFormElement;

      if (form) {
        const data = serialize(form) as RenameFolderFormValues;

        if (this.formValidator.validate(data) && this.folder?.id && data.name) {
          this.loading = true;
          editFolder(this.folder?.id, data.name?.trim())
            .then(() => {
              this.loading = false;
              this.dispatchEvent(createEvent('update-folders'));
              this.dispatchEvent(new Event('sl-hide'));
              /*
              // this is to ensure the selectedFolder in context gets updated with the new name
              this.dispatchEvent(createEvent('folder-selected', { item: editedFolder }));
              */
              this.resetForm();
            })
            .catch(err => {
              this.loading = false;
              this.dispatchEvent(
                toastEvent({
                  variant: 'danger',
                  title: 'Error renaming folder',
                  message: err.message,
                })
              );
            });
        } else {
          this.requestUpdate();
        }
      }
    }
  }

  handleClose(event: Event) {
    // don't handle the sl-hide event when triggered from a child element of the dialog
    if (event.target === this.dialog) {
      this.resetForm();
      this.dispatchEvent(createEvent('rename-folder-close'));
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
            id="rename-dialog"
            label="Rename Folder"
            ?open=${this.open}
            class="rename-dialog"
            @sl-hide=${this.handleClose}
            @sl-request-close=${this.handleNoAutoClose}
          >
            <form id="rename-form">
              <sl-input
                id="name-input"
                name="name"
                label="Folder Name *"
                value=${ifDefined(this.folder.name)}
                ?disabled=${this.loading}
                ?autofocus=${this.open}
              ></sl-input>
              <form-error-message for="name" .errors=${this.formValidator.errors}></form-error-message>
            </form>
            <sl-button slot="footer" type="submit" form="rename-form" variant="primary" ?loading=${this.loading}>
              <ion-icon slot="prefix" icon=${addCircleOutline} class="add-icon"></ion-icon>
              Save
            </sl-button>
          </sl-dialog>
        `
      : null;
  }

  resetForm() {
    this.formValidator.reset();
    this.renameForm.reset();
  }

  firstUpdated() {
    if (this.renameForm) initializeFormEvents(this.renameForm, event => this.handleSubmit(event));
  }
}
