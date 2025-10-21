import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { InterviewsController } from './interviews.controller';
import { NotificationsController } from './notifications.controller';
import { InterviewSchedulerController } from './interview-scheduler.controller';
import { InterviewsService } from './interviews.service';
import { NotificationsService } from './notifications.service';
import { InterviewSchedulerService } from './interview-scheduler.service';
import { GoogleMeetService } from './google-meet.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [InterviewSchedulerController, NotificationsController, InterviewsController],
  providers: [InterviewsService, NotificationsService, InterviewSchedulerService, GoogleMeetService],
  exports: [InterviewsService, NotificationsService, InterviewSchedulerService, GoogleMeetService],
})
export class InterviewsModule {}
