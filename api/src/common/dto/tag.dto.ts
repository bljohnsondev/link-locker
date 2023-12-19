import { UserDto } from './user.dto';

export class TagDto {
  id?: number;
  name?: string;
  owner?: UserDto;
  createdAt?: Date;
}
