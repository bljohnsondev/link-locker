import { Body, Controller, Delete, Get, HttpException, HttpStatus, Logger, Param, Post, Req } from '@nestjs/common';
import { Request } from 'express';

import { CurrentUser } from '@/common/decorators';
import { LinkDto, UserDto } from '@/common/dto';
import { LinkMapper } from '@/common/mapper';

import { AddLinkDto } from './dto/add-link.dto';
import { EditLinkDto } from './dto/edit-link.dto';
import { UploadLinksDto } from './dto/upload-links.dto';
import { UploadResponseDto } from './dto/upload-response.dto';
import { LinkService } from './link.service';

@Controller('/api/link')
export class LinkController {
  private readonly logger = new Logger(LinkController.name);

  constructor(
    private readonly linkService: LinkService,
    private readonly linkMapper: LinkMapper
  ) {}

  /**
   * folderId: undefined = show unsorted links
   * folderId: "all"     = show all links
   * folderId: number    = show links in a folder
   */
  @Get('list')
  async list(@CurrentUser() user: UserDto): Promise<LinkDto[]> {
    return await this.linkService.listUnsorted(user.id);
  }

  @Get('list/all')
  async listAll(@CurrentUser() user: UserDto): Promise<LinkDto[]> {
    const links = await this.linkService.listAll(user.id);
    return this.linkMapper.toDtoArray(links);
  }

  @Get('list/:id')
  async listFolder(@CurrentUser() user: UserDto, @Param('id') folderId: number): Promise<LinkDto[]> {
    return await this.linkService.listFolder(user.id, folderId);
  }

  @Get('tag/unsorted')
  async listByTagUnsorted(@CurrentUser() user: UserDto): Promise<LinkDto[]> {
    return await this.linkService.listByTag(user.id);
  }

  @Get('tag/:id')
  async listByTag(@CurrentUser() user: UserDto, @Param('id') tagId: number): Promise<LinkDto[]> {
    return await this.linkService.listByTag(user.id, tagId);
  }

  @Post('add')
  async add(@CurrentUser() user: UserDto, @Body() addLinkDto: AddLinkDto): Promise<LinkDto> {
    const existing = await this.linkService.findByUrl(user.id, addLinkDto.url);

    if (existing) {
      throw new HttpException(
        `Link already added in ${existing.folder ? `"${existing.folder.name}"` : 'unsorted'}`,
        HttpStatus.OK
      );
    }

    return await this.linkService.add(user.id, addLinkDto.url, addLinkDto.folder);
  }

  @Delete('delete/:id')
  async delete(@CurrentUser() user: UserDto, @Param('id') linkId: number): Promise<object> {
    await this.linkService.delete(user.id, linkId);
    return { success: true };
  }

  @Post('edit')
  async edit(@CurrentUser() user: UserDto, @Body() editLinkDto: EditLinkDto) {
    const link = await this.linkService.editLink(user.id, editLinkDto.link);

    if (link) {
      return link;
    } else {
      throw new HttpException('Link not found', HttpStatus.BAD_REQUEST);
    }
  }

  @Post('upload')
  async upload(@CurrentUser() user: UserDto, @Body() uploadLinkDto: UploadLinksDto) {
    const result: UploadResponseDto = await this.linkService.uploadLinkDtos(user.id, uploadLinkDto.links);
    return result;
  }

  @Get('search')
  async search(@CurrentUser() user: UserDto, @Req() req: Request): Promise<LinkDto[]> {
    const terms = req.query?.terms as string | undefined;

    if (terms) {
      const links = await this.linkService.search(user.id, terms.split(' '));
      return this.linkMapper.toDtoArray(links);
    } else {
      return [];
    }
  }
}
