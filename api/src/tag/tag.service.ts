import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, Repository } from 'typeorm';

import { Tag } from '@/common/entity';

@Injectable()
export class TagService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Tag) private tagRepository: Repository<Tag>
  ) {}

  async list(userId: string) {
    return await this.tagRepository.find({
      where: {
        owner: { id: userId },
      },
      order: {
        name: 'ASC',
      },
    });
  }

  async removeUnusedTags(userId: string) {
    const unusedTags = await this.tagRepository.find({
      where: {
        owner: { id: userId },
        links: { id: IsNull() },
      },
      relations: ['links'],
    });

    if (unusedTags && unusedTags.length > 0) await this.tagRepository.remove(unusedTags);
  }
}
