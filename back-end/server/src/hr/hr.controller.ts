import { Controller, Get, Post, Put, Body, UseGuards, Request } from '@nestjs/common';
import { Roles } from '../auth/roles.decorator';
import { HrService } from './hr.service';
import { CreateHRProfileDto, UpdateHRProfileDto } from './dto/hr-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

@Controller('hr')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HrController {
  constructor(private readonly hrService: HrService) {}

  @Get('jobs')
  @Roles('HR')
  listJobs() {
    return { jobs: [] };
  }

  @Get('candidates')
  @Roles('HR')
  listCandidates() {
    return { candidates: [] };
  }

  @Get('profile')
  @Roles('HR')
  async getProfile(@Request() req: any) {
    const userId = req.user.id;
    return await this.hrService.getHRProfile(userId);
  }

  @Post('profile')
  @Roles('HR')
  async createProfile(@Request() req: any, @Body() createProfileDto: CreateHRProfileDto) {
    const userId = req.user.id;
    return await this.hrService.createHRProfile(userId, createProfileDto);
  }

  @Put('profile')
  @Roles('HR')
  async updateProfile(@Request() req: any, @Body() updateProfileDto: UpdateHRProfileDto) {
    const userId = req.user.id;
    return await this.hrService.updateHRProfile(userId, updateProfileDto);
  }
}
