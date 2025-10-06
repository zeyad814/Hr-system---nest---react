import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { HealthController } from './health.controller';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';

import { HrModule } from './hr/hr.module';
import { SalesModule } from './sales/sales.module';
import { ClientModule } from './client/client.module';
import { ApplicantsModule } from './applicants/applicants.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';

import { JobsModule } from './jobs/jobs.module';
import { TimelineModule } from './timeline/timeline.module';
import { FeedbackModule } from './feedback/feedback.module';
import { InterviewsModule } from './interviews/interviews.module';
import { ReportsModule } from './reports/reports.module';
import { ContractsModule } from './contracts/contracts.module';
import { ActivitiesModule } from './activities/activities.module';
import { SettingsModule } from './settings/settings.module';
import { AgoraModule } from './agora/agora.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    AdminModule,

    HrModule,
    SalesModule,
    ClientModule,
    ApplicantsModule,
    JobsModule,
    ApplicantsModule,
    TimelineModule,
    FeedbackModule,
    InterviewsModule,
    ReportsModule,
    ContractsModule,
    ActivitiesModule,
    SettingsModule,
    AgoraModule,
  ],
  controllers: [AppController, HealthController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
