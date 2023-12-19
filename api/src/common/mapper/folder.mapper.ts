import { forwardRef, Inject, Injectable } from '@nestjs/common';

import { FolderDto } from '@/common/dto';
import { Folder } from '@/common/entity';
import { Mapper } from '@/common/interfaces/mapper.interface';

import { LinkMapper } from './link.mapper';
import { UserMapper } from './user.mapper';

@Injectable()
export class FolderMapper implements Mapper<Folder, FolderDto> {
  constructor(
    @Inject(forwardRef(() => LinkMapper))
    private readonly linkMapper: LinkMapper,
    private readonly userMapper: UserMapper
  ) {}

  public toDto(folder: Folder): FolderDto | undefined {
    return folder
      ? {
          id: folder.id,
          name: folder.name,
          links: this.linkMapper.toDtoArray(folder.links),
          owner: this.userMapper.toDto(folder.owner),
          createdAt: folder.createdAt,
        }
      : undefined;
  }

  public toDtoArray(folders: Folder[]): FolderDto[] | undefined {
    return folders ? folders.map(folder => this.toDto(folder)) : undefined;
  }
}
