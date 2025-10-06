import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Request,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ApplicantsService } from './applicants.service';
import type {
  CreateApplicantDto,
  UpdateApplicantDto,
  ApplyToJobDto,
  UpdateApplicantStatusDto,
  UpdateApplicantRatingDto,
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

@Controller('applicants')
@UseGuards(JwtAuthGuard)
export class ApplicantsController {
  constructor(private readonly applicantsService: ApplicantsService) {}

  @Post('profile')
  @Roles('APPLICANT')
  async createOrUpdateProfile(
    @Request() req: any,
    @Body() createApplicantDto: CreateApplicantDto,
  ) {
    return this.applicantsService.createProfile({
      ...createApplicantDto,
      userId: req.user.sub,
    });
  }

  @Get('profile')
  @Roles('APPLICANT')
  async getMyProfile(@Request() req: any) {
    return this.applicantsService.getProfile(req.user.sub);
  }

  @Put('profile')
  @Roles('APPLICANT')
  async updateProfile(
    @Request() req: any,
    @Body() updateApplicantDto: UpdateApplicantDto,
  ) {
    return this.applicantsService.updateProfile(
      req.user.sub,
      updateApplicantDto,
    );
  }

  @Post('apply')
  @Roles('APPLICANT')
  async applyToJob(@Request() req: any, @Body() applyToJobDto: ApplyToJobDto) {
    return this.applicantsService.applyToJob(req.user.sub, applyToJobDto);
  }

  @Get('applications')
  @Roles('APPLICANT')
  async getMyApplications(@Request() req: any) {
    return this.applicantsService.getMyApplications(req.user.sub);
  }

  @Patch('applications/:id/withdraw')
  @Roles('APPLICANT')
  async withdrawApplication(
    @Request() req: any,
    @Param('id') applicationId: string,
  ) {
    return this.applicantsService.withdrawApplication(
      req.user.sub,
      applicationId,
    );
  }

  // HR and Admin endpoints
  @Get('all')
  @Roles('HR', 'ADMIN')
  async getAllApplicants(
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.applicantsService.getAllApplicants(status, search);
  }

  @Post('recommend')
  @Roles('HR', 'ADMIN')
  async recommendApplicant(
    @Body() body: { applicantId: string; clientId: string; notes?: string },
  ) {
    return this.applicantsService.recommendApplicant(
      body.applicantId,
      body.clientId,
      body.notes,
    );
  }

  @Get(':userId/profile')
  @Roles('HR', 'ADMIN', 'CLIENT')
  async getApplicantProfile(@Param('userId') userId: string) {
    return this.applicantsService.getProfile(userId);
  }

  @Get('profile/:applicantId')
  @Roles('HR', 'ADMIN', 'CLIENT')
  async getApplicantProfileById(@Param('applicantId') applicantId: string) {
    return this.applicantsService.getProfileById(applicantId);
  }

  @Patch(':userId/status')
  @Roles('HR', 'ADMIN')
  async updateApplicantStatus(
    @Param('userId') userId: string,
    @Body() updateStatusDto: UpdateApplicantStatusDto,
  ) {
    return this.applicantsService.updateApplicantStatus(
      userId,
      updateStatusDto,
    );
  }

  @Patch(':userId/rating')
  @Roles('HR', 'ADMIN')
  async updateApplicantRating(
    @Param('userId') userId: string,
    @Body() updateRatingDto: UpdateApplicantRatingDto,
  ) {
    return this.applicantsService.updateApplicantRating(
      userId,
      updateRatingDto,
    );
  }

  @Get('stats')
  @Roles('HR', 'ADMIN')
  async getApplicantsStats() {
    return this.applicantsService.getApplicantsStats();
  }

  // Experience endpoints
  @Post('experiences')
  @Roles('APPLICANT')
  async addExperience(
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
  @Post('educations')
  @Roles('APPLICANT')
  async addEducation(
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
  @Post('projects')
  @Roles('APPLICANT')
  async addProject(
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
  @Post('qualifications')
  @Roles('APPLICANT')
  async addQualification(
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

  // Top Candidates Endpoints
  @Get('top-candidates')
  @Roles('HR', 'ADMIN', 'CLIENT')
  async getTopCandidates(
    @Query('limit') limit?: string,
    @Query('jobId') jobId?: string,
  ) {
    const candidateLimit = limit ? parseInt(limit, 10) : 10;
    return this.applicantsService.getTopCandidates(candidateLimit, jobId);
  }

  @Get('candidates/by-rating')
  @Roles('HR', 'ADMIN', 'CLIENT')
  async getCandidatesByRating(
    @Query('minRating') minRating?: string,
    @Query('limit') limit?: string,
  ) {
    const rating = minRating ? parseFloat(minRating) : 4;
    const candidateLimit = limit ? parseInt(limit, 10) : 10;
    return this.applicantsService.getCandidatesByRating(rating, candidateLimit);
  }

  @Get('candidates/recent')
  @Roles('HR', 'ADMIN', 'CLIENT')
  async getRecentCandidates(
    @Query('days') days?: string,
    @Query('limit') limit?: string,
  ) {
    const dayLimit = days ? parseInt(days, 10) : 7;
    const candidateLimit = limit ? parseInt(limit, 10) : 10;
    return this.applicantsService.getRecentCandidates(dayLimit, candidateLimit);
  }

  @Get('candidates/for-job/:jobId')
  @Roles('HR', 'ADMIN', 'CLIENT')
  async getCandidatesForJob(
    @Param('jobId') jobId: string,
    @Query('status') status?: string,
    @Query('limit') limit?: string,
  ) {
    const candidateLimit = limit ? parseInt(limit, 10) : 10;
    return this.applicantsService.getCandidatesForJob(jobId, status, candidateLimit);
  }

  @Post('upload-cv')
  @Roles('APPLICANT')
  @UseInterceptors(
    FileInterceptor('cv', {
      storage: diskStorage({
        destination: './uploads/cvs',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          const ext = extname(file.originalname);
          callback(null, `cv-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        // Allow only document files
        const allowedMimes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
        ];
        
        if (allowedMimes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(new BadRequestException('Only document files (PDF, DOC, DOCX, TXT) are allowed'), false);
        }
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
    }),
  )
  async uploadCV(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return this.applicantsService.updateResumeUrl(req.user.sub, `http://localhost:3000/uploads/cvs/${file.filename}`);
  }
}
