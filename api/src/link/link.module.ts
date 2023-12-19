import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Folder, Link, Tag, User } from '@/common/entity';
import { FolderMapper, LinkMapper, TagMapper, UserMapper } from '@/common/mapper';
import { FolderService } from '@/folder/folder.service';
import { TagService } from '@/tag/tag.service';

import { LinkController } from './link.controller';
import { LinkService } from './link.service';

@Module({
  imports: [TypeOrmModule.forFeature([Folder, Link, Tag, User])],
  controllers: [LinkController],
  providers: [FolderMapper, FolderService, LinkMapper, LinkService, TagMapper, TagService, UserMapper],
})
export class LinkModule {}
