import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Link, Tag, User } from '@/common/entity';
import { TagMapper, UserMapper } from '@/common/mapper';

import { TagController } from './tag.controller';
import { TagService } from './tag.service';

@Module({
  imports: [TypeOrmModule.forFeature([Link, Tag, User])],
  controllers: [TagController],
  providers: [TagMapper, TagService, UserMapper],
})
export class TagModule {}
