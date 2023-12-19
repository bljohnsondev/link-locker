import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JSDOM } from 'jsdom';
import { DataSource, IsNull, Repository } from 'typeorm';

import { LinkDto } from '@/common/dto';
import { Folder, Link, Tag, User } from '@/common/entity';
import { FolderService } from '@/folder/folder.service';
import { axios } from '@/lib/axios';
import { TagService } from '@/tag/tag.service';

import { UploadLinkDto } from './dto/upload-links.dto';
import { UploadResponseDto } from './dto/upload-response.dto';

@Injectable()
export class LinkService {
  private readonly logger = new Logger(LinkService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly tagService: TagService,
    private readonly folderService: FolderService,
    @InjectRepository(Folder) private folderRepository: Repository<Folder>,
    @InjectRepository(Link) private linkRepository: Repository<Link>,
    @InjectRepository(Tag) private tagRepository: Repository<Tag>,
    @InjectRepository(User) private userRepository: Repository<User>
  ) {}

  async listUnsorted(userId: string): Promise<Link[]> {
    const queryBuilder = this.linkRepository
      .createQueryBuilder('link')
      .leftJoinAndSelect('link.folder', 'folder')
      .leftJoinAndSelect('link.tags', 'tags')
      .innerJoin('link.owner', 'owner')
      .where('owner.id = :ownerId', { ownerId: userId })
      .andWhere('link.folder is null');

    return await queryBuilder.getMany();
  }
  public async listAll(userId: string): Promise<Link[]> {
    const queryBuilder = this.linkRepository
      .createQueryBuilder('link')
      .leftJoinAndSelect('link.folder', 'folder')
      .leftJoinAndSelect('link.tags', 'tags')
      .innerJoin('link.owner', 'owner')
      .where('owner.id = :ownerId', { ownerId: userId });

    return await queryBuilder.getMany();
  }

  public async listFolder(userId: string, folderId: number): Promise<Link[]> {
    const queryBuilder = this.linkRepository
      .createQueryBuilder('link')
      .innerJoin('link.owner', 'owner')
      .innerJoinAndSelect('link.folder', 'folder')
      .leftJoinAndSelect('link.tags', 'tags')
      .where('owner.id = :ownerId', { ownerId: userId })
      .andWhere('folder.id = :folderId', { folderId });

    return await queryBuilder.getMany();
  }

  public async listByTag(userId: string, tagId?: number): Promise<Link[]> {
    const links = await this.linkRepository.find({
      where: {
        owner: { id: userId },
        tags: {
          id: tagId ?? IsNull(),
        },
      },
      relations: {
        tags: true,
        folder: true,
      },
    });

    return links;
  }

  public async findByUrl(userId: string, url: string): Promise<Link | null> {
    return await this.linkRepository.findOne({
      where: {
        owner: {
          id: userId,
        },
        url,
      },
      relations: {
        folder: true,
      },
    });
  }

  public async add(userId: string, url: string, folderId?: number): Promise<Link | undefined> {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (user) {
      let folder: Folder | null = null;

      if (folderId) {
        folder = await this.folderRepository.findOneBy({ id: folderId, owner: { id: userId } });
        if (!folder) throw new HttpException('Folder not found when adding link', HttpStatus.BAD_REQUEST);
      }

      let title: string | null = null;

      try {
        title = await this.getTitleFromUrl(url);
      } catch (err) {
        // this is most likely because the user entered a bad URL or something similar
        throw new HttpException('Could not retrieve data from specified address', HttpStatus.BAD_REQUEST);
      }

      const link = new Link();
      link.owner = user;
      if (folder) link.folder = folder;
      link.title = title;
      link.url = url;

      await this.dataSource.manager.save(link);
      return link;
    }
  }

  public async delete(userId: string, linkId: number): Promise<void> {
    const link = await this.linkRepository.findOneBy({
      owner: {
        id: userId,
      },
      id: linkId,
    });

    if (!link) throw new HttpException('Link not found', HttpStatus.BAD_REQUEST);

    await this.linkRepository.remove(link);
    await this.tagService.removeUnusedTags(userId);
  }

  public async getTitleFromUrl(url: string) {
    const response: string | undefined = await axios.get(url, { responseType: 'document' });
    const dom = new JSDOM(response);
    const titleElement = dom.window.document.querySelector('head title');
    return titleElement?.textContent ?? url;
  }

  public async editLink(userId: string, linkDto: LinkDto): Promise<Link | undefined> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new HttpException('User not found', HttpStatus.BAD_REQUEST);

    const link = await this.linkRepository.findOneBy({
      owner: { id: userId },
      id: linkDto.id,
    });

    if (!link) throw new HttpException('Link not found', HttpStatus.BAD_REQUEST);

    if (linkDto.title) link.title = (linkDto.title as string).trim();

    if (!linkDto.folder) {
      link.folder = null;
    } else {
      const folder = await this.folderRepository.findOneBy({ id: linkDto.folder.id, owner: { id: userId } });
      if (!folder) throw new HttpException('Folder not found', HttpStatus.BAD_REQUEST);
      else link.folder = folder;
    }

    const newTags: Tag[] = [];

    for (const tagDto of linkDto.tags) {
      if (tagDto.id) {
        // the user added an existing tag
        const tag = await this.tagRepository.findOneBy({ id: tagDto.id, owner: { id: userId } });
        newTags.push(tag);
      } else {
        const tag = new Tag();
        tag.owner = user;
        tag.name = tagDto.name;
        tag.createdAt = new Date();
        newTags.push(tag);
      }
    }

    link.tags = newTags;

    const updatedLink = await this.dataSource.manager.save(link);

    await this.tagService.removeUnusedTags(userId);

    return updatedLink;
  }

  public async linkExists(userId: string, url: string) {
    const count = await this.linkRepository.count({
      where: {
        owner: { id: userId },
        url,
      },
    });

    return count > 0;
  }

  public async uploadLinkDtos(userId: string, linkDtos: UploadLinkDto[]): Promise<UploadResponseDto> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new HttpException('No user found', HttpStatus.BAD_REQUEST);

    const results = new UploadResponseDto();

    for (const uploadedLink of linkDtos) {
      if (uploadedLink.title && uploadedLink.url) {
        const link = new Link();
        link.owner = user;
        link.title = uploadedLink.title;
        link.url = uploadedLink.url;
        if (uploadedLink.createdAt) link.createdAt = uploadedLink.createdAt;

        if (await this.linkExists(userId, uploadedLink.url)) {
          results.duplicate += 1;
        } else {
          if (uploadedLink.folder) {
            let folder = await this.folderService.findByName(userId, uploadedLink.folder);
            if (!folder) {
              folder = new Folder();
              folder.owner = user;
              folder.name = uploadedLink.folder;
              folder.createdAt = new Date();
              folder = await this.dataSource.manager.save(folder);
            }

            link.folder = folder;
          }

          await this.dataSource.manager.save(link);
          results.success += 1;
        }
      } else {
        results.failure += 1;
      }
    }

    return results;
  }

  public async search(userId: string, terms: string[]): Promise<Link[]> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new HttpException('No user found', HttpStatus.BAD_REQUEST);

    const keywords: string[] = [];
    const tagNames: string[] = [];

    for (const term of terms) {
      const trimmedTerm = term.trim();
      if (trimmedTerm.startsWith('#')) {
        tagNames.push(trimmedTerm.substring(1));
      } else {
        keywords.push(trimmedTerm);
      }
    }

    const queryBuilder = this.linkRepository
      .createQueryBuilder('link')
      .innerJoin('link.owner', 'owner')
      .leftJoinAndSelect('link.folder', 'folder')
      .leftJoinAndSelect('link.tags', 'tags')
      .where('owner.id = :ownerId', { ownerId: userId });

    for (let i = 0; i < keywords.length; i++) {
      const keyword = keywords[i];
      queryBuilder.andWhere(`lower(link.title) like lower(:keyword${i})`, { [`keyword${i}`]: `%${keyword}%` });
    }

    if (tagNames && tagNames.length > 0) {
      queryBuilder.andWhere('tags.name in (:...tags)', { tags: tagNames });
    }

    return await queryBuilder.getMany();
  }
}
