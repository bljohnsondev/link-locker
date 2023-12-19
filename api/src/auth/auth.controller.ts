import { Body, Controller, Get, HttpCode, HttpStatus, Post, Request } from '@nestjs/common';

import { Public } from '@/common/decorators';
import { UserDto } from '@/common/dto/user.dto';
import { User } from '@/common/entity';
import { UserMapper } from '@/common/mapper/user.mapper';

import { AuthService } from './auth.service';
import { LoginResponseDto } from './dto/login-response.dto';
import { LoginDto } from './dto/login.dto';

@Controller('/api/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userMapper: UserMapper
  ) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return await this.authService.login(loginDto.username, loginDto.password);
  }

  @Get('user')
  async currentUser(@Request() req): Promise<UserDto> {
    const user: User | null = await this.authService.findUserById(req.user.id);
    return this.userMapper.toDto(user);
  }
}
