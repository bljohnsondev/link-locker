import { css } from 'lit';

export const sharedStyles = css`
  .reset-button {
    border: 0;
    padding: 0;
    margin: 0;
    background-color: transparent;
    cursor: pointer;
    line-height: 0;
  }

  .reset-ul {
    padding: 0;
    margin: 0;
    list-style: none;
  }

  .error-message {
    color: var(--sl-color-red-500);
    font-size: var(--sl-font-size-small);
  }
`;
