import { storage } from '@/utils';

export class AuthorizationService {
  public isAuthorized(): Promise<boolean> {
    const token = storage.getToken();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return new Promise(resolve => {
      resolve(token !== null); // try using resolve(true) for testing
    });
  }
}
