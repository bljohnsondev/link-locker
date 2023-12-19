import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import { UserDto } from '@/common/dto';
import { User } from '@/common/entity';
import { UserMapper } from '@/common/mapper/user.mapper';

import { LoginResponseDto } from './dto/login-response.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly userMapper: UserMapper
  ) {}

  async findUser(username: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { username },
    });
  }

  async findUserById(id: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id },
    });
  }

  async login(username: string, password: string): Promise<LoginResponseDto> {
    if (!username || !password) {
      throw new UnauthorizedException();
    }

    const user = await this.userRepository.findOneBy({ username });

    if (!user) {
      throw new UnauthorizedException();
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException();
    }

    const userDto: UserDto = this.userMapper.toDto(user);

    return {
      user: userDto,
      token: await this.jwtService.signAsync(userDto),
    };
  }
}
