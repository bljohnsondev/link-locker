import { UserDto } from '@/common/dto/user.dto';

export class LoginResponseDto {
  user: UserDto;
  token: string;
}
