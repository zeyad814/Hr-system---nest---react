import { Module } from '@nestjs/common';
import { InterviewsController } from './interviews.controller';
import { NotificationsController } from './notifications.controller';
import { AgoraController } from './agora.controller';
import { InterviewsService } from './interviews.service';
import { NotificationsService } from './notifications.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AgoraModule } from '../agora/agora.module';

@Module({
  imports: [PrismaModule, AgoraModule],
  controllers: [InterviewsController, NotificationsController, AgoraController],
  providers: [InterviewsService, NotificationsService],
  exports: [InterviewsService, NotificationsService],
})
export class InterviewsModule {}
