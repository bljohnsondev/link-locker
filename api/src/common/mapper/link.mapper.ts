import { forwardRef, Inject, Injectable } from '@nestjs/common';

import { LinkDto } from '@/common/dto';
import { Link } from '@/common/entity';
import { Mapper } from '@/common/interfaces/mapper.interface';

import { FolderMapper } from './folder.mapper';
import { TagMapper } from './tag.mapper';
import { UserMapper } from './user.mapper';

@Injectable()
export class LinkMapper implements Mapper<Link, LinkDto> {
  constructor(
    // NOTE: forwardRef is needed to prevent circular dependencies
    // see https://docs.nestjs.com/fundamentals/circular-dependency
    @Inject(forwardRef(() => FolderMapper))
    private readonly folderMapper: FolderMapper,
    private readonly tagMapper: TagMapper,
    private readonly userMapper: UserMapper
  ) {}

  public toDto(link: Link): LinkDto | undefined {
    return link
      ? {
          id: link.id,
          title: link.title,
          url: link.url,
          folder: this.folderMapper.toDto(link.folder),
          tags: this.tagMapper.toDtoArray(link.tags),
          owner: this.userMapper.toDto(link.owner),
          createdAt: link.createdAt,
        }
      : undefined;
  }

  public toDtoArray(links: Link[]): LinkDto[] | undefined {
    return links ? links.map(link => this.toDto(link)) : undefined;
  }
}
