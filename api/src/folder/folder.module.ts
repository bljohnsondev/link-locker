import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Folder, Tag, User } from '@/common/entity';
import { FolderMapper } from '@/common/mapper/folder.mapper';
import { LinkMapper } from '@/common/mapper/link.mapper';
import { TagMapper } from '@/common/mapper/tag.mapper';
import { UserMapper } from '@/common/mapper/user.mapper';
import { TagService } from '@/tag/tag.service';

import { FolderController } from './folder.controller';
import { FolderService } from './folder.service';

@Module({
  imports: [TypeOrmModule.forFeature([Folder, Tag, User])],
  controllers: [FolderController],
  providers: [FolderMapper, FolderService, LinkMapper, TagMapper, TagService, UserMapper],
})
export class FolderModule {}
