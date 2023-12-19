import { consume } from '@lit/context';
import { serialize } from '@shoelace-style/shoelace/dist/utilities/form.js';
import '@shoelace-style/shoelace/dist/components/badge/badge';
import '@shoelace-style/shoelace/dist/components/dialog/dialog';
import '@shoelace-style/shoelace/dist/components/input/input';
import { addCircleOutline, closeOutline } from 'ionicons/icons';
import { css, html, LitElement } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { object, string, ObjectSchema } from 'yup';

import { FormValidator } from '@/components/form/form-validator';
import { homeContext, HomeStore } from '@/features/home';
import { sharedStyles } from '@/styles/shared';
import { LinkDto, TagDto } from '@/types';
import { createEvent, initializeFormEvents, parseNumber, toastEvent } from '@/utils';

import { editLink } from '../../home-api';

import '@/components/form/form-error-message';

export interface EditLinkFormValues {
  title?: string;
  folder?: string;
}

const editLinkSchema: ObjectSchema<EditLinkFormValues> = object({
  title: string().required('Title is required'),
  folder: string(),
});

@customElement('edit-link-dialog')
export class EditLinkDialog extends LitElement {
  static styles = [
    sharedStyles,
    css`
      #edit-dialog::part(panel) {
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

      .title-container {
        margin-bottom: var(--sl-spacing-medium);
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

      .input-container {
        margin-bottom: var(--sl-spacing-medium);
      }

      .tag-title {
        color: var(--sl-input-label-color);
        font-size: var(--sl-input-label-font-size-medium);
        padding-bottom: var(--sl-spacing-3x-small);
      }

      .tag-list {
        margin-top: var(--sl-spacing-small);
        display: flex;
        align-items: center;
        gap: var(--sl-spacing-x-small);
      }

      .tag-close-icon {
        height: 18px;
        width: 18px;
      }

      .no-tags {
        font-size: var(--sl-font-size-small);
        color: var(--sl-color-neutral-700);
      }

      .tag-input-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--sl-spacing-medium);

        :is(div) {
          flex-grow: 1;
          width: 100%;
          @media only screen and (min-width: 1024px) {
            width: auto;
          }
        }

        @media only screen and (min-width: 1024px) {
          flex-direction: row;
        }
      }

      @media only screen and (min-width: 1024px) {
        #edit-dialog::part(panel) {
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
        #edit-dialog::part(panel) {
          width: 50vw;
        }
      }
    `,
  ];

  formValidator: FormValidator<EditLinkFormValues> = new FormValidator(editLinkSchema);

  @consume({ context: homeContext, subscribe: true })
  @property({ attribute: false })
  public homeStore?: HomeStore;

  @query('sl-dialog') dialog!: HTMLFormElement;
  @query('form') addForm!: HTMLFormElement;

  @state() loading: boolean = false;
  @state() newTags?: TagDto[];

  @property({ attribute: false }) link!: LinkDto;
  @property({ type: Boolean }) open!: boolean;

  handleSubmit(event: Event) {
    if (!this.loading) {
      const form = event.target as HTMLFormElement;

      if (form) {
        const data = serialize(form) as EditLinkFormValues;

        if (this.formValidator.validate(data)) {
          this.resetForm();

          if (data.title) {
            const newFolder = this.homeStore?.folders?.find(newFolder => newFolder.id === parseNumber(data.folder));

            const newLink: LinkDto = {
              ...this.link,
              title: data.title,
              folder: newFolder,
              tags: this.newTags,
            };

            this.loading = true;

            editLink(newLink)
              .then(() => {
                this.loading = false;
                this.dispatchEvent(createEvent('edit-link-saved'));
                this.dispatchEvent(
                  toastEvent({
                    variant: 'success',
                    message: 'Link saved',
                  })
                );
              })
              .catch(err => {
                this.loading = false;
                this.dispatchEvent(
                  toastEvent({
                    variant: 'danger',
                    title: 'Error saving link',
                    message: err.message ?? 'Unknown error occurred',
                  })
                );
              });
          }
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
      this.dispatchEvent(createEvent('add-link-close'));
    } else {
      // if the sl-hide happened somewhere other than the dialog stop it from propogating
      event.stopPropagation();
    }
  }

  handleNoAutoClose(event: Event) {
    if (this.loading) event.preventDefault();
  }

  render() {
    const selectedFolderId = this.link?.folder?.id ? this.link.folder.id.toString() : '';
    const unusedTags = this.getUnusedTags();

    return html`
      <sl-dialog
        id="edit-dialog"
        label="Edit Link"
        ?open=${this.open}
        class="add-dialog"
        @sl-hide=${this.handleClose}
        @sl-request-close=${this.handleNoAutoClose}
        style="--width: 50vw;"
      >
        <form id="add-form">
          <div class="title-container">
            <sl-input
              id="title-input"
              name="title"
              label="Title *"
              value=${ifDefined(this.link.title)}
              ?disabled=${this.loading}
            ></sl-input>
            <form-error-message for="title" .errors=${this.formValidator.errors}></form-error-message>
          </div>
          <div class="form-elements input-container">
            <div class="input-ct">
              <sl-input id="url-input" name="url" label="Address" value=${ifDefined(this.link.url)} disabled></sl-input>
            </div>
            <div>
              <sl-select
                id="folder"
                name="folder"
                label="Folder"
                ?disabled=${this.loading}
                value=${selectedFolderId}
                hoist
              >
                <sl-option value="">Unsorted</sl-option>
                ${this.homeStore?.folders?.map(
                  item => html`<sl-option value=${ifDefined(item.id)}>${item.name}</sl-option>`
                )}
              </sl-select>
            </div>
          </div>
          <div class="input-container">
            <div class="tag-title">Tags</div>
            <div class="tag-list">
              ${this.newTags && this.newTags.length > 0
                ? this.newTags.map(
                    tag => html`
                      <sl-button
                        size="small"
                        variant="primary"
                        pill
                        class="tag-button"
                        @click=${() => this.handleRemoveNewTag(tag)}
                      >
                        ${tag.name}
                        <ion-icon slot="suffix" icon=${closeOutline} class="tag-close-icon"></ion-icon>
                      </sl-button>
                    `
                  )
                : html`<span class="no-tags">No tags added</span>`}
            </div>
          </div>
          <div class="tag-input-container">
            <div>
              <sl-select
                label="Add Existing"
                hoist
                ?disabled=${unusedTags.length === 0}
                placeholder=${unusedTags.length === 0 ? 'All tags added' : ''}
                @sl-change=${this.handleSelectNewTag}
              >
                ${unusedTags.map(tag => html`<sl-option value=${ifDefined(tag.id)}>${tag.name}</sl-option>`)}
              </sl-select>
            </div>
            <div>
              <sl-input id="new-tag-input" label="New Tag" @keydown=${this.captureAddCustomTag}></sl-input>
              <div id="new-tag-error" class="error-message"></div>
            </div>
          </div>
          <form-error-message for="folder" .errors=${this.formValidator.errors}></form-error-message>
        </form>
        <sl-button slot="footer" type="submit" form="add-form" variant="primary" ?loading=${this.loading}>
          <ion-icon slot="prefix" icon=${addCircleOutline} class="add-icon"></ion-icon>
          Save
        </sl-button>
        <sl-button slot="footer" @click=${() => this.dispatchEvent(new Event('sl-hide'))}>Close</sl-button>
      </sl-dialog>
    `;
  }

  private captureAddCustomTag(event: Event) {
    const kbEvent = event as KeyboardEvent;

    if (kbEvent.key === 'Enter') {
      kbEvent.preventDefault();

      const input = event.target as HTMLInputElement;
      const name = input.value.trim();
      const errorElement = this.renderRoot.querySelector('#new-tag-error');

      if (errorElement) {
        errorElement.textContent = '';

        if (name) {
          // check if this link already has this tag
          if (this.newTags?.some(tag => tag.name?.toLowerCase() === name.toLowerCase())) {
            errorElement.textContent = 'Tag has already been added';
            return;
          }

          // if the user tried adding a new tag that already exists but hasnt been added just add it
          const existingTag = this.homeStore?.tags?.find(tag => tag.name?.toLowerCase() === name.toLowerCase());
          if (existingTag) {
            this.addNewTag(existingTag);
            input.value = '';
            return;
          }

          // it must be a new tag so add a new one
          const addedTag: TagDto = {
            name: input.value,
            createdAt: new Date(),
          };

          this.addNewTag(addedTag);
          input.value = '';
        }
      }
    }
  }

  private handleSelectNewTag(event: Event) {
    const tagValue = (event.target as HTMLSelectElement)?.value;
    if (tagValue) {
      this.addNewTag(this.homeStore?.tags?.find(tag => tag.id === parseNumber(tagValue)));
    }
  }

  private addNewTag(newTag?: TagDto) {
    if (newTag) this.newTags = [newTag, ...(this.newTags ?? [])];
  }

  private getUnusedTags(): TagDto[] {
    return this.homeStore?.tags?.filter(tag => !this.newTags?.some(newTag => newTag.id === tag.id)) ?? [];
  }

  private handleRemoveNewTag(newTag: TagDto) {
    this.newTags = this.newTags?.filter(tag => tag.id !== newTag.id || tag.name !== newTag.name);
  }

  resetForm() {
    this.formValidator.reset();
    this.addForm.reset();
  }

  firstUpdated() {
    initializeFormEvents(this.addForm, event => this.handleSubmit(event));
    this.newTags = this.link.tags;
  }
}
