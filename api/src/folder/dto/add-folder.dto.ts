import { IsNotEmpty } from 'class-validator';

export class AddFolderDto {
  @IsNotEmpty()
  name: string;
}
