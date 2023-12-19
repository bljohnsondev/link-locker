import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class AddLinkDto {
  @IsNotEmpty()
  url: string;

  @IsOptional()
  @IsNumber()
  folder?: number;
}
