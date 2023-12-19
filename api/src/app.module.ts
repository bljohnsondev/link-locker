import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from './auth/auth.module';
import { databaseConfig } from './common/config/db-config';
import { User } from './common/entity';
import { FolderModule } from './folder/folder.module';
import { LinkModule } from './link/link.module';
import { TagModule } from './tag/tag.module';
import { StartupService } from './utils/startup';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: databaseConfig,
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User]),
    AuthModule,
    FolderModule,
    LinkModule,
    TagModule,
  ],
  providers: [StartupService],
})
export class AppModule {}
