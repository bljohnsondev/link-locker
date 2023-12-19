import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { Folder, User } from '@/common/entity';
import { FolderMapper } from '@/common/mapper';
import { TagService } from '@/tag/tag.service';

@Injectable()
export class FolderService {
  private readonly logger = new Logger(FolderService.name);

  constructor(
    private readonly folderMapper: FolderMapper,
    private readonly tagService: TagService,
    private readonly dataSource: DataSource,
    @InjectRepository(Folder) private folderRepository: Repository<Folder>,
    @InjectRepository(User) private userRepository: Repository<User>
  ) {}

  async listAll(userId: string): Promise<Folder[]> {
    return this.folderRepository.find({
      select: {
        id: true,
        name: true,
      },
      where: {
        owner: {
          id: userId,
        },
      },
      order: {
        name: 'ASC',
      },
    });
  }

  async findByName(userId: string, name: string): Promise<Folder | null> {
    return await this.folderRepository
      .createQueryBuilder('folder')
      .innerJoin('folder.owner', 'owner')
      .where('owner.id = :ownerId', { ownerId: userId })
      .andWhere('LOWER(folder.name) = :folderName', { folderName: name.trim() })
      .getOne();
  }

  async view(userId: string, folderId: number): Promise<Folder | null> {
    return this.folderRepository.findOne({
      where: {
        id: folderId,
        owner: {
          id: userId,
        },
      },
    });
  }

  async add(userId: string, folderName: string): Promise<Folder | null> {
    const user = await this.userRepository.findOneBy({ id: userId });

    const existing = await this.folderRepository.findOneBy({
      owner: { id: userId },
      name: folderName,
    });

    if (existing) throw new HttpException(`Folder already exists: ${folderName}`, HttpStatus.BAD_REQUEST);

    const folder = new Folder();
    folder.owner = user;
    folder.name = folderName;
    return await this.dataSource.manager.save(folder);
  }

  async rename(userId: string, folderId: number, folderName: string): Promise<Folder | undefined> {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (user && folderName && folderName.trim()) {
      const folder = await this.folderRepository.findOneBy({ owner: { id: userId }, id: folderId });
      if (folder) {
        folder.name = folderName.trim();
        return await this.dataSource.manager.save(folder);
      }
    }
  }

  async delete(userId: string, folderId: number, includeLinks: boolean = false): Promise<void> {
    const folder = await this.folderRepository.findOneBy({
      owner: {
        id: userId,
      },
      id: folderId,
    });

    if (!folder) throw new HttpException('Folder not found', HttpStatus.BAD_REQUEST);

    if (!includeLinks) {
      // by default links are set up to cascade delete when a folder is deleted so relocate them to unsorted
      folder.links = [];
      await this.dataSource.manager.save(folder);
    }

    await this.folderRepository.remove(folder);

    if (includeLinks) {
      // if the links were deleted clean up any unused tags
      await this.tagService.removeUnusedTags(userId);
    }
  }
}
