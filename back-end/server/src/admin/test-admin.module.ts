import { Module } from '@nestjs/common';
import { TestAdminController } from './test-admin.controller';

@Module({
  controllers: [TestAdminController],
})
export class TestAdminModule {}
