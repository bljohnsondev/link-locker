import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

import { LinkDto } from '@/common/dto';

export class EditLinkDto {
  @ValidateNested()
  @Type(() => LinkDto)
  link: LinkDto;
}
