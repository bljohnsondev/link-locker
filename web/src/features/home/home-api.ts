import { axios } from '@/lib/axios';
import { FolderDto, LinkDto, TagDto } from '@/types';

export type DeleteActionType = 'unsorted' | 'delete';

export interface AddLinkResponseDto {
  link?: LinkDto;
  message?: string;
}

/***** FOLDER OPERATIONS *****/

export const getFolder = async (folderId: number): Promise<FolderDto | undefined> => {
  return await axios.get(`/folder/view/${folderId}`);
};

export const getFolderList = async (): Promise<FolderDto[]> => {
  return await axios.get('/folder/list');
};

export const addFolder = async (folderName: string): Promise<FolderDto | undefined> => {
  return await axios.post('/folder/add', { name: folderName });
};

export const editFolder = async (folderId: number, folderName: string): Promise<FolderDto | undefined> => {
  return await axios.post('/folder/edit', { id: folderId, name: folderName });
};

export const deleteFolder = async (folderId: number, action?: string): Promise<void> => {
  return await axios.post('/folder/delete', { id: folderId, includeLinks: action === 'delete' });
};

/***** TAG OPERATIONS *****/

export const getTagList = async (): Promise<TagDto[]> => {
  return await axios.get('/tag/list');
};

/***** LINK OPERATIONS *****/

export const getLinksByFolder = async (folderId?: number): Promise<LinkDto[]> => {
  return await axios.get(folderId ? `/link/list/${folderId}` : '/link/list');
};

export const getLinksByTag = async (tagId?: number): Promise<LinkDto[]> => {
  return await axios.get(tagId ? `/link/tag/${tagId}` : '/link/tag/unsorted');
};

export const addLink = async (url: string, folder?: number): Promise<AddLinkResponseDto | undefined> => {
  const response: any = await axios.post('/link/add', { url, folder });

  if (response.message) return { message: response.message };
  else return { link: response as LinkDto };
};

export const deleteLink = async (linkId: number): Promise<void> => {
  return await axios.delete(`/link/delete/${linkId}`);
};

export const editLink = async (link: LinkDto): Promise<AddLinkResponseDto | undefined> => {
  const response: any = await axios.post('/link/edit', { link });

  if (response.message) return { message: response.message };
  else return { link: response as LinkDto };
};
