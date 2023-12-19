import { Controller, Get } from '@nestjs/common';

import { CurrentUser } from '@/common/decorators';
import { TagDto, UserDto } from '@/common/dto';
import { TagMapper } from '@/common/mapper';

import { TagService } from './tag.service';

@Controller('/api/tag')
export class TagController {
  constructor(
    private readonly tagService: TagService,
    private readonly tagMapper: TagMapper
  ) {}

  @Get('list')
  async list(@CurrentUser() user: UserDto): Promise<TagDto[]> {
    return this.tagMapper.toDtoArray(await this.tagService.list(user.id));
  }
}
