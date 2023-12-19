import { axios } from '@/lib/axios';
import { LinkDto, UploadLinkDto } from '@/types';

export interface UploadLinksResponseDto {
  success: number;
  failed: number;
}

export const uploadLinks = async (links: UploadLinkDto[]): Promise<UploadLinksResponseDto> => {
  const response: UploadLinksResponseDto = await axios.post('/link/upload', { links });
  return response;
};

export const searchLinks = async (terms: string): Promise<LinkDto[]> => {
  return await axios.get('/link/search', {
    params: {
      terms,
    },
  });
};
