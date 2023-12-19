import { IsNotEmpty, IsNumber } from 'class-validator';

export class EditFolderDto {
  @IsNumber()
  id: number;

  @IsNotEmpty()
  name: string;
}
