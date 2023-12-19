export * from './error-handler';
export * from './events';
export * from './storage';

export const urlRegex = new RegExp(
  /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/
);

export const parseNumber = (testNumber?: string) => {
  if (!testNumber) return undefined;
  const num = parseInt(testNumber);
  return isNaN(num) ? undefined : num;
};
