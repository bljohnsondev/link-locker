import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

import { Folder, Link, Tag, User } from '@/common/entity';

export const databaseConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  const runningEnv = process.env.NODE_ENV;
  const dbType = configService.get('DB_TYPE');
  const entities = [Folder, Link, Tag, User];

  const initConfig = {
    entities,
    synchronize: runningEnv !== 'production',
  };

  switch (dbType) {
    case 'sqlite':
      return {
        type: 'sqlite',
        database: configService.get('DB_PATH'),
        ...initConfig,
      };
    case 'mysql':
      return {
        type: 'mysql',
        url: configService.get('DB_URL'),
        ...initConfig,
      };
      break;
  }
};
