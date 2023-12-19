import { createContext } from '@lit/context';

import { FolderDto, LinkDto, TagDto } from '@/types';

export interface HomeStore {
  folders?: FolderDto[];
  tags?: TagDto[];
  searchResults?: LinkDto[];
}

export const homeContext = createContext<HomeStore>('homeStore');
