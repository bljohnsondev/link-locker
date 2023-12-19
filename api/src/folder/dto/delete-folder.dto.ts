import { IsNumber } from 'class-validator';

export class DeleteFolderDto {
  @IsNumber()
  id: number;

  includeLinks?: boolean = false;
}
