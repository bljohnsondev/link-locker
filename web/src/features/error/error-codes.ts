export interface AppErrorMessage {
  code: string;
  message: string;
}

export const errorMessages: AppErrorMessage[] = [
  { code: 'network', message: 'There was a network issue contacting the server' },
  { code: 'notfound', message: 'The page you requested could not be found' },
];
