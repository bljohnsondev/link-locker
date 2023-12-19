import { FolderDto } from './folder.dto';
import { TagDto } from './tag.dto';
import { UserDto } from './user.dto';

export class LinkDto {
  id?: number;
  url?: string;
  title?: string;
  folder?: FolderDto;
  tags?: TagDto[];
  owner?: UserDto;
  createdAt?: Date;
}
