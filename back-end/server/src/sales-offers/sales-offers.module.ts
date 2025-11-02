import { Module } from '@nestjs/common';
import { SalesOffersController } from './sales-offers.controller';
import { SalesOffersService } from './sales-offers.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SalesOffersController],
  providers: [SalesOffersService],
  exports: [SalesOffersService],
})
export class SalesOffersModule {}

