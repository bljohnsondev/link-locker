import { Body, Controller, Get, Logger, Param, Post } from '@nestjs/common';

import { CurrentUser } from '@/common/decorators';
import { UserDto } from '@/common/dto';
import { FolderDto } from '@/common/dto/folder.dto';
import { FolderMapper } from '@/common/mapper';

import { AddFolderDto } from './dto/add-folder.dto';
import { DeleteFolderDto } from './dto/delete-folder.dto';
import { EditFolderDto } from './dto/edit-folder.dto';
import { FolderService } from './folder.service';

@Controller('/api/folder')
export class FolderController {
  private readonly logger = new Logger(FolderController.name);

  constructor(
    private readonly folderService: FolderService,
    private readonly folderMapper: FolderMapper
  ) {}

  @Get('list')
  async list(@CurrentUser() user: UserDto): Promise<FolderDto[]> {
    const folders = await this.folderService.listAll(user.id);
    return this.folderMapper.toDtoArray(folders);
  }

  @Get('view/:id')
  async view(@CurrentUser() user: UserDto, @Param('id') folderId: number): Promise<FolderDto | void> {
    const folder = await this.folderService.view(user.id, folderId);
    return this.folderMapper.toDto(folder);
  }

  @Post('add')
  async add(@CurrentUser() user: UserDto, @Body() addFolderDto: AddFolderDto): Promise<FolderDto> {
    const newFolder = await this.folderService.add(user.id, addFolderDto.name);
    return newFolder;
  }

  @Post('delete')
  async delete(@CurrentUser() user: UserDto, @Body() deleteFolderDto: DeleteFolderDto): Promise<object> {
    await this.folderService.delete(user.id, deleteFolderDto.id, deleteFolderDto.includeLinks);
    return { success: true };
  }

  @Post('edit')
  async edit(@CurrentUser() user: UserDto, @Body() editFolderDto: EditFolderDto): Promise<FolderDto> {
    const folder = await this.folderService.rename(user.id, editFolderDto.id, editFolderDto.name);
    return folder;
  }
}
