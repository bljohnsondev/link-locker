import { serialize } from '@shoelace-style/shoelace/dist/utilities/form.js';
import '@shoelace-style/shoelace/dist/components/dialog/dialog';
import '@shoelace-style/shoelace/dist/components/input/input';
import { css, html, LitElement } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { object, string, ObjectSchema } from 'yup';

import { FormValidator } from '@/components/form/form-validator';
import { createEvent, initializeFormEvents, toastEvent } from '@/utils';

import { addFolder } from '../../home-api';

import '@/components/form/form-error-message';

export interface AddFolderFormValues {
  folder?: string;
}

const addFolderSchema: ObjectSchema<AddFolderFormValues> = object({
  folder: string().required('Folder name is required'),
});

@customElement('add-folder-dialog')
export class AddFolderDialog extends LitElement {
  static styles = css`
    .add-icon {
      height: 20px;
      width: 20px;
    }

    .form-error {
      font-size: var(--sl-font-size-small);
      color: var(--sl-color-red-500);
      padding-top: var(--sl-spacing-x-small);
    }

    .form-elements {
      display: flex;
      align-items: center;
      gap: var(--sl-spacing-medium);
    }

    .input-ct {
      flex-grow: 1;
    }

    .url-input {
      width: 100%;
    }
  `;

  formValidator: FormValidator<AddFolderFormValues> = new FormValidator(addFolderSchema);

  @query('form') addForm!: HTMLFormElement;

  @property({ type: Boolean }) open: boolean = false;

  handleSubmit() {
    const data = serialize(this.addForm) as AddFolderFormValues;
    if (this.formValidator.validate(data) && data.folder) {
      addFolder(data.folder)
        .then(newFolder => {
          this.resetForm();
          this.dispatchEvent(
            toastEvent({
              variant: 'success',
              title: 'Folder added',
              message: `Added ${newFolder?.name}`,
            })
          );
          this.dispatchEvent(createEvent('folder-added'));
          this.dispatchEvent(new Event('sl-hide'));
        })
        .catch(err => {
          this.dispatchEvent(
            toastEvent({
              variant: 'danger',
              title: 'Error adding folder',
              message: err.message,
            })
          );
        });
    } else {
      this.requestUpdate();
    }
  }

  render() {
    return html`
      <sl-dialog label="Add Folder" ?open=${this.open} class="add-dialog" @sl-hide=${this.resetForm}>
        <form id="add-form">
          <sl-input id="folder-input" name="folder" label="Folder Name *" autofocus></sl-input>
          <form-error-message for="folder" .errors=${this.formValidator.errors}></form-error-message>
        </form>
        <sl-button slot="footer" type="submit" form="add-form" variant="primary">Add</sl-button>
      </sl-dialog>
    `;
  }

  resetForm() {
    this.formValidator.reset();
    this.addForm.reset();
  }

  firstUpdated() {
    initializeFormEvents(this.addForm, () => this.handleSubmit());
  }
}
