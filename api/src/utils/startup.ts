import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrpyt from 'bcrypt';
import { nanoid } from 'nanoid';
import { DataSource, Repository } from 'typeorm';

import { User } from '@/common/entity';

const DEFAULT_SALT_ROUNDS = 10;

@Injectable()
export class StartupService implements OnApplicationBootstrap {
  private readonly logger = new Logger(StartupService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
    @InjectRepository(User) private userRepository: Repository<User>
  ) {}

  async onApplicationBootstrap() {
    const userCount = await this.userRepository.count();

    if (userCount === 0) {
      this.logger.warn('no users have been created - creating initial admin user');
      const initUsername = this.configService.get('ADMIN_USER');
      const initPassword = this.configService.get('ADMIN_PASS');

      if (!initUsername || !initPassword) {
        this.logger.error('could not find config settings for ADMIN_USER and ADMIN_PASS');
      } else {
        const saltRounds: number = this.configService.get('SALT_ROUNDS')
          ? parseInt(this.configService.get('SALT_ROUNDS'))
          : DEFAULT_SALT_ROUNDS;

        if (isNaN(saltRounds)) {
          this.logger.error('SALT_ROUNDS env variable is not an integer! user creation cancelled');
        } else {
          const user = new User();
          user.id = nanoid();
          user.username = initUsername;
          user.password = await bcrpyt.hash(initPassword, saltRounds);
          this.dataSource.manager.save(user);
          this.logger.log(`created initial admin user: ${initUsername}`);
        }
      }
    }
  }
}
