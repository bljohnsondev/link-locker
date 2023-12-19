import { Type } from 'class-transformer';
import { IsNotEmpty, ValidateNested } from 'class-validator';

export class UploadLinkDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  url: string;

  folder?: string;

  createdAt?: Date;
}

export class UploadLinksDto {
  @ValidateNested()
  @Type(() => UploadLinkDto)
  links: UploadLinkDto[];
}
