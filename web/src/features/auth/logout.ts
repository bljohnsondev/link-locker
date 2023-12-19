import { Commands, Context } from '@vaadin/router';

import { storage } from '@/utils';

export const logout = async (_context: Context, commands: Commands) => {
  storage.clearToken();
  return commands.redirect('/login');
};
