export const sleep = (millis: number) => new Promise(resolve => setTimeout(resolve, millis));

export const stripHtml = (message: string) => {
  const regex = /(<([^>]+)>)/gi;
  return message?.replace(regex, '');
};
