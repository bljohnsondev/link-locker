import '@shoelace-style/shoelace/dist/components/dialog/dialog';
import dayjs from 'dayjs';
import { css, html, LitElement } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';

import { UploadLinkDto, UploadResponseDto } from '@/types';
import { createEvent, toastEvent } from '@/utils';
import { uploadLinks } from '@/utils/common-api';

@customElement('import-dialog')
export class ImportDialog extends LitElement {
  static styles = css`
    input[type='file'] {
      font-size: var(--font-size-medium);
    }

    input[type='file']::file-selector-button {
      margin-right: 1rem;
      border: none;
      background-color: var(--sl-color-neutral-500);
      padding: 10px 20px;
      border-radius: var(--sl-border-radius-medium);
      color: #fff;
      cursor: pointer;
    }

    input[type='file']::file-selector-button:hover {
      background-color: var(--sl-color-neutral-400);
    }
  `;

  @query('form') private form?: HTMLFormElement;
  @query('input[type=file]') private fileInput?: HTMLInputElement;

  @state() loading: boolean = false;

  @property({ type: Boolean }) open: boolean = false;

  render() {
    return html`
      <sl-dialog
        label="Import File"
        ?open=${this.open}
        class="import-dialog"
        @sl-hide=${this.handleHide}
        @sl-request-close=${this.handleNoAutoClose}
      >
        <form id="import-form">
          <input
            id="uploaded-file"
            label="File"
            type="file"
            accept=".json"
            class="custom-file-input"
            ?disabled=${this.loading}
          />
        </form>
        <sl-button slot="footer" type="submit" form="import-form" variant="primary" ?loading=${this.loading}
          >Upload</sl-button
        >
        <sl-button slot="footer" @click=${this.handleHide} ?loading=${this.loading}>Cancel</sl-button>
      </sl-dialog>
    `;
  }

  private handleHide() {
    this.form?.reset();
    this.dispatchEvent(createEvent('close-import'));
  }

  handleNoAutoClose(event: Event) {
    // prevent the dialog from closing if the API call is still happening
    if (this.loading) event.preventDefault();
  }

  private handleSubmit(event: Event) {
    event.preventDefault();

    if (this.fileInput && this.fileInput.files && this.fileInput.files.length > 0) {
      this.loading = true;
      const reader = new FileReader();
      reader.addEventListener('load', event => this.processFile(event));
      reader.readAsText(this.fileInput.files[0]);
    }
  }

  private async processFile(event: any) {
    const result = event.target?.result;
    if (this.form && result) {
      try {
        const json = JSON.parse(result);

        if (!(json instanceof Array)) {
          throw new Error('Uploaded file data is not an array');
        }

        const formatErrors: string[] = [];
        const links: UploadLinkDto[] = [];

        for (const item of json) {
          if (!item.title) {
            formatErrors.push(`missing title for item: ${JSON.stringify(item)}`);
          } else if (!item.url) {
            formatErrors.push(`missing url for item: ${JSON.stringify(item)}`);
          } else {
            const link: UploadLinkDto = {
              title: item.title,
              url: item.url,
              createdAt: item.created_at ? dayjs(item.created_at).toDate() : new Date(),
            };

            if (item.folder) link.folder = item.folder;

            links.push(link);
          }
        }

        if (links.length > 0) {
          const result: UploadResponseDto = await uploadLinks(links);
          this.loading = false;
          this.dispatchEvent(createEvent('update-folders'));
          this.dispatchEvent(createEvent('update-tags'));

          this.dispatchEvent(
            toastEvent({
              variant: 'success',
              title: 'Links imported',
              message: `Success: ${result.success ?? 0}, Failure: ${result.failure ?? 0}, Duplicate: ${
                result.duplicate ?? 0
              }`,
            })
          );
        } else {
          this.loading = false;
          this.dispatchEvent(toastEvent({ variant: 'warning', message: 'No valid links found for upload' }));
        }

        this.handleHide();
      } catch (err) {
        this.loading = false;
        if (err && err instanceof Error) {
          this.dispatchEvent(toastEvent({ variant: 'danger', title: 'Error uploading file', message: err.message }));
        }
      }
    }
  }

  firstUpdated() {
    if (this.form) this.form.addEventListener('submit', event => this.handleSubmit(event));
  }
}
