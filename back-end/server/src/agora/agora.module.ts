import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AgoraService } from './agora.service';
import { AgoraSettingsService } from './agora-settings.service';
import { AgoraSettingsController } from './agora-settings.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [AgoraSettingsController],
  providers: [AgoraService, AgoraSettingsService],
  exports: [AgoraService, AgoraSettingsService],
})
export class AgoraModule {}