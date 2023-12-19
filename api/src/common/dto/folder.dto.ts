import { LinkDto } from './link.dto';
import { UserDto } from './user.dto';

export class FolderDto {
  id?: number;
  name?: string;
  links?: LinkDto[];
  owner?: UserDto;
  createdAt?: Date;
}
