import { Injectable } from '@nestjs/common';

import { TagDto } from '@/common/dto';
import { Tag } from '@/common/entity';
import { Mapper } from '@/common/interfaces/mapper.interface';

import { UserMapper } from './user.mapper';

@Injectable()
export class TagMapper implements Mapper<Tag, TagDto> {
  constructor(private readonly userMapper: UserMapper) {}

  public toDto(tag: Tag): TagDto | undefined {
    return tag
      ? {
          id: tag.id,
          name: tag.name,
          owner: this.userMapper.toDto(tag.owner),
          createdAt: tag.createdAt,
        }
      : undefined;
  }

  public toDtoArray(tags: Tag[]): TagDto[] | undefined {
    return tags ? tags.map(tag => this.toDto(tag)) : undefined;
  }
}
