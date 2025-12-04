import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { InterviewsController } from './interviews.controller';
import { NotificationsController } from './notifications.controller';
import { InterviewSchedulerController } from './interview-scheduler.controller';
import { InterviewsService } from './interviews.service';
import { NotificationsService } from './notifications.service';
import { InterviewSchedulerService } from './interview-scheduler.service';
import { GoogleMeetService } from './google-meet.service';
import { ZoomService } from './zoom.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule, 
    ConfigModule.forRoot({
      isGlobal: false, // Use module-level config
      envFilePath: '.env',
    }),
  ],
  controllers: [InterviewSchedulerController, NotificationsController, InterviewsController],
  providers: [InterviewsService, NotificationsService, InterviewSchedulerService, /*GoogleMeetService,*/ ZoomService],
  exports: [InterviewsService, NotificationsService, InterviewSchedulerService, /*GoogleMeetService,*/ ZoomService],
})
export class InterviewsModule {}
