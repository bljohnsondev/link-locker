import { FolderDto } from './folder.dto';
import { TagDto } from './tag.dto';

export interface LinkDto {
  id?: number;
  title?: string;
  url?: string;
  folder?: FolderDto;
  tags?: TagDto[];
  createdAt?: Date;
}
