import { Commands, Context } from '@vaadin/router';

import { AuthorizationService } from './authorization-service';

export const authGuard = async (context: Context, commands: Commands) => {
  const isAuthenticated = await new AuthorizationService().isAuthorized();

  if (!isAuthenticated) {
    console.warn('User not authorized', context.pathname);
    return commands.redirect('/login');
  }

  return undefined;
};
