import { Injectable } from '@nestjs/common';

import { UserDto } from '@/common/dto/user.dto';
import { User } from '@/common/entity';
import { Mapper } from '@/common/interfaces/mapper.interface';

@Injectable()
export class UserMapper implements Mapper<User, UserDto> {
  public toDto(user: User): UserDto | undefined {
    return user
      ? {
          id: user.id,
          username: user.username,
          createdAt: user.createdAt,
        }
      : undefined;
  }
}
