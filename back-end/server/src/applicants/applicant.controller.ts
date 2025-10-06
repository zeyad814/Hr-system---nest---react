import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApplicantsService } from './applicants.service';
import type {
  CreateExperienceDto,
  UpdateExperienceDto,
  CreateEducationDto,
  UpdateEducationDto,
  CreateProjectDto,
  UpdateProjectDto,
  CreateQualificationDto,
  UpdateQualificationDto,
} from './applicants.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('applicant')
@UseGuards(JwtAuthGuard)
export class ApplicantController {
  constructor(private readonly applicantsService: ApplicantsService) {}

  // Experience endpoints
  @Get('experiences')
  @Roles('APPLICANT')
  async getExperiences(@Request() req: any) {
    return this.applicantsService.getExperiences(req.user.sub);
  }

  @Post('experiences')
  @Roles('APPLICANT')
  async createExperience(
    @Request() req: any,
    @Body() createExperienceDto: CreateExperienceDto,
  ) {
    return this.applicantsService.addExperience(req.user.sub, createExperienceDto);
  }

  @Put('experiences/:id')
  @Roles('APPLICANT')
  async updateExperience(
    @Request() req: any,
    @Param('id') experienceId: string,
    @Body() updateExperienceDto: UpdateExperienceDto,
  ) {
    return this.applicantsService.updateExperience(req.user.sub, experienceId, updateExperienceDto);
  }

  @Delete('experiences/:id')
  @Roles('APPLICANT')
  async deleteExperience(
    @Request() req: any,
    @Param('id') experienceId: string,
  ) {
    return this.applicantsService.deleteExperience(req.user.sub, experienceId);
  }

  // Education endpoints
  @Get('educations')
  @Roles('APPLICANT')
  async getEducations(@Request() req: any) {
    return this.applicantsService.getEducations(req.user.sub);
  }

  @Post('educations')
  @Roles('APPLICANT')
  async createEducation(
    @Request() req: any,
    @Body() createEducationDto: CreateEducationDto,
  ) {
    return this.applicantsService.addEducation(req.user.sub, createEducationDto);
  }

  @Put('educations/:id')
  @Roles('APPLICANT')
  async updateEducation(
    @Request() req: any,
    @Param('id') educationId: string,
    @Body() updateEducationDto: UpdateEducationDto,
  ) {
    return this.applicantsService.updateEducation(req.user.sub, educationId, updateEducationDto);
  }

  @Delete('educations/:id')
  @Roles('APPLICANT')
  async deleteEducation(
    @Request() req: any,
    @Param('id') educationId: string,
  ) {
    return this.applicantsService.deleteEducation(req.user.sub, educationId);
  }

  // Project endpoints
  @Get('projects')
  @Roles('APPLICANT')
  async getProjects(@Request() req: any) {
    return this.applicantsService.getProjects(req.user.sub);
  }

  @Post('projects')
  @Roles('APPLICANT')
  async createProject(
    @Request() req: any,
    @Body() createProjectDto: CreateProjectDto,
  ) {
    return this.applicantsService.addProject(req.user.sub, createProjectDto);
  }

  @Put('projects/:id')
  @Roles('APPLICANT')
  async updateProject(
    @Request() req: any,
    @Param('id') projectId: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    return this.applicantsService.updateProject(req.user.sub, projectId, updateProjectDto);
  }

  @Delete('projects/:id')
  @Roles('APPLICANT')
  async deleteProject(
    @Request() req: any,
    @Param('id') projectId: string,
  ) {
    return this.applicantsService.deleteProject(req.user.sub, projectId);
  }

  // Qualification endpoints
  @Get('qualifications')
  @Roles('APPLICANT')
  async getQualifications(@Request() req: any) {
    return this.applicantsService.getQualifications(req.user.sub);
  }

  @Post('qualifications')
  @Roles('APPLICANT')
  async createQualification(
    @Request() req: any,
    @Body() createQualificationDto: CreateQualificationDto,
  ) {
    return this.applicantsService.addQualification(req.user.sub, createQualificationDto);
  }

  @Put('qualifications/:id')
  @Roles('APPLICANT')
  async updateQualification(
    @Request() req: any,
    @Param('id') qualificationId: string,
    @Body() updateQualificationDto: UpdateQualificationDto,
  ) {
    return this.applicantsService.updateQualification(req.user.sub, qualificationId, updateQualificationDto);
  }

  @Delete('qualifications/:id')
  @Roles('APPLICANT')
  async deleteQualification(
    @Request() req: any,
    @Param('id') qualificationId: string,
  ) {
    return this.applicantsService.deleteQualification(req.user.sub, qualificationId);
  }
}
