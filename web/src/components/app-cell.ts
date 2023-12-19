import { LitElement, TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';

import { ApiError } from '@/lib/api-error';
import { axios } from '@/lib/axios';
import { Endpoint } from '@/types/endpoint';

export abstract class AppCell extends LitElement {
  @property({ attribute: false }) abstract endpoint?: Endpoint;
  @property({ attribute: false }) isLoading: boolean = false;
  @property({ attribute: false }) responseJson?: any;
  @property({ attribute: false }) responseError?: ApiError;

  protected abstract failure(error?: ApiError): TemplateResult;

  protected abstract success(): TemplateResult;

  protected loading?(): TemplateResult;

  protected empty?(): TemplateResult;

  fetch() {
    if (this.endpoint) {
      this.isLoading = true;

      const url = this.endpoint.urlParams
        ? this.parseUrl(this.endpoint.url, this.endpoint.urlParams)
        : this.endpoint.url;

      axios
        .get(url, {
          params: this.endpoint.params,
        })
        .then(json => {
          this.isLoading = false;
          this.responseJson = json;
        })
        .catch(error => {
          this.isLoading = false;

          if (error instanceof ApiError) {
            this.responseError = error;
          } else if (error instanceof Error) {
            this.responseError = new Error(error.message);
          } else {
            this.responseError = new Error('An unknown error occurred');
          }
        });
    }
  }

  render() {
    if (this.isLoading) return this.loading ? this.loading() : null;
    else if (this.responseError) return this.failure(this.responseError);
    else if (this.empty && this.responseIsEmpty()) return this.empty();
    else if (this.responseJson) return this.success();
  }

  /**
   * This determines if the response is empty based on the following rules:
   * - If the response is falsey (null, undefined, etc)
   * - If the response is an empty array
   * - If the response is an empty object
   *
   * @returns boolean
   */
  private responseIsEmpty(): boolean {
    return (
      !this.responseError &&
      (!this.responseJson ||
        (this.responseJson instanceof Array && this.responseJson.length === 0) ||
        (this.responseJson instanceof Object && Object.keys(this.responseJson).length === 0))
    );
  }

  private parseUrl(url: string, urlParams?: any): string {
    let newUrl = url;

    if (urlParams) {
      Object.keys(urlParams).forEach(key => {
        newUrl = newUrl.replace(`{${key}}`, urlParams[key]);
      });
    }

    return newUrl;
  }

  connectedCallback() {
    super.connectedCallback();
    this.fetch();
  }
}
