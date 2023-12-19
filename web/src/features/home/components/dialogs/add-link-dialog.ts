import { serialize } from '@shoelace-style/shoelace/dist/utilities/form.js';
import '@shoelace-style/shoelace/dist/components/dialog/dialog';
import '@shoelace-style/shoelace/dist/components/input/input';
import { addCircleOutline } from 'ionicons/icons';
import { css, html, LitElement } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { object, string, ObjectSchema } from 'yup';

import { FormValidator } from '@/components/form';
import { addLink } from '@/features/home';
import { FolderDto } from '@/types';
import { createEvent, initializeFormEvents, parseNumber, toastEvent, urlRegex } from '@/utils';

import '@/components/form/form-error-message';

export interface AddLinkFormValues {
  url?: string;
  folder?: string;
}

const addLinkSchema: ObjectSchema<AddLinkFormValues> = object({
  url: string().required('URL is required').matches(urlRegex, { message: 'URL must match a valid url' }),
  folder: string(),
});

@customElement('add-link-dialog')
export class AddLinkDialog extends LitElement {
  static styles = css`
    .add-dialog::part(panel) {
      width: 100vw;
    }

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
      flex-direction: column;
      align-items: center;
      gap: var(--sl-spacing-medium);

      :is(div) {
        width: 100%;
      }
    }

    .input-ct {
      flex-grow: 1;
    }

    .url-input {
      width: 100%;
    }

    @media only screen and (min-width: 1024px) {
      .add-dialog::part(panel) {
        width: 80vw;
      }

      .form-elements {
        flex-direction: row;

        :is(div) {
          width: auto;
        }
      }
    }

    @media only screen and (min-width: 1280px) {
      .add-dialog::part(panel) {
        width: 50vw;
      }
    }
  `;

  formValidator: FormValidator<AddLinkFormValues> = new FormValidator(addLinkSchema);

  @state() loading = false;

  @query('form') addForm!: HTMLFormElement;

  @property({ type: Boolean }) open: boolean = false;
  @property({ attribute: false }) folders?: FolderDto[];
  @property({ attribute: false }) selectedFolder?: FolderDto;

  render() {
    return html`
      <sl-dialog
        label="Add Link"
        ?open=${this.open}
        class="add-dialog"
        @sl-hide=${this.handleClose}
        @sl-request-close=${this.handleNoAutoClose}
      >
        <form id="add-form">
          <div class="form-elements">
            <div class="input-ct">
              <sl-input
                id="url-input"
                name="url"
                label="Address *"
                ?disabled=${this.loading}
                ?autofocus=${this.open}
              ></sl-input>
            </div>
            <div>
              <sl-select
                id="folder"
                name="folder"
                label="Folder"
                ?disabled=${this.loading}
                value=${ifDefined(this.selectedFolder?.id)}
                hoist
              >
                <sl-option value="">Unsorted</sl-option>
                ${this.folders?.map(item => html` <sl-option value=${ifDefined(item.id)}>${item.name}</sl-option> `)}
              </sl-select>
            </div>
          </div>
          <form-error-message for="url" .errors=${this.formValidator.errors}></form-error-message>
        </form>
        <sl-button slot="footer" type="submit" form="add-form" variant="primary" ?loading=${this.loading}>
          <ion-icon slot="prefix" icon=${addCircleOutline} class="add-icon"></ion-icon>
          Add
        </sl-button>
      </sl-dialog>
    `;
  }

  /**
   * When the form is submitted and the loading flag is changed as a part of the submit it throws an error:
   *
   * "Element sl-input scheduled an update (generally because a property was set) after an update completed,
   * causing a new update to be scheduled. This is inefficient and should be avoided unless the next update
   * can only be scheduled as a side effect of the previous update."
   *
   * This has something to do with the disabled flag on the input.  If I remove the disabled flag then the
   * error isn't thrown.  If I remove the this.loading change in the submit it works.
   *
   * Also note - if the user clicks the submit button this warning isn't throw.  It's only when the form is
   * submitted by hitting the enter key.
   */
  handleSubmit(event: Event) {
    if (!this.loading) {
      const form = event.target as HTMLFormElement;

      if (form) {
        const data = serialize(form) as AddLinkFormValues;

        if (this.formValidator.validate(data) && data.url) {
          this.addLinkFromSubmit(data.url, data.folder);
        } else {
          this.requestUpdate();
        }
      }
    }
  }

  handleClose(event: Event) {
    // don't handle the sl-hide event when triggered from a child element of the dialog
    if (event.target === event.currentTarget) {
      this.resetForm();
      this.dispatchEvent(createEvent('add-link-close'));
    }
  }

  handleNoAutoClose(event: Event) {
    // prevent the dialog from closing if the API call is still happening
    if (this.loading) event.preventDefault();
  }

  addLinkFromSubmit(url: string, folder?: string) {
    const folderId = parseNumber(folder);

    this.loading = true;
    addLink(url, folderId)
      .then(response => {
        this.loading = false;
        if (response && response.link && response.link.id) {
          // save was successful
          this.resetForm();
          // add-link-close is just to signal that the dialog should be closed
          this.dispatchEvent(createEvent('add-link-close'));
          // link-added should trigger a new fetch of the current folder
          this.dispatchEvent(createEvent('link-added', { link: response.link }));

          this.dispatchEvent(
            toastEvent({
              variant: 'success',
              title: 'Link has been added',
              message: `Added ${response.link.title}`,
            })
          );
        } else if (response && response.message) {
          this.dispatchEvent(
            toastEvent({
              variant: 'danger',
              title: 'Error adding link',
              message: response.message,
            })
          );
        }
      })
      .catch(err => {
        this.loading = false;
        const errorMessage = err instanceof Error ? err.message : 'An unknown error has occurred';
        this.dispatchEvent(toastEvent({ variant: 'danger', title: 'Error adding link', message: errorMessage }));
      });
  }

  resetForm() {
    this.formValidator.reset();
    this.addForm.reset();
  }

  firstUpdated() {
    initializeFormEvents(this.addForm, event => this.handleSubmit(event));
  }
}
