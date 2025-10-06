import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/dto/user.dto';
import { AdminCandidatesService } from './admin-candidates.service';
import type { CandidateSearchFilters, CreateCandidateDto, UpdateCandidateDto } from './admin-candidates.service';

@Controller('admin/candidates')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminCandidatesController {
  constructor(private readonly adminCandidatesService: AdminCandidatesService) {}

  @Get()
  async getAllCandidates(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query() filters: CandidateSearchFilters
  ) {
    try {
      return await this.adminCandidatesService.getAllCandidates(page, limit, filters);
    } catch (error) {
      return {
        candidates: [],
        pagination: { page: 1, limit: 10, total: 0, pages: 0 },
        error: 'Failed to fetch candidates'
      };
    }
  }

  @Get('stats')
  async getCandidateStats() {
    try {
      return await this.adminCandidatesService.getCandidateStats();
    } catch (error) {
      return { total: 0, active: 0, newThisMonth: 0, error: 'Failed to fetch stats' };
    }
  }

  @Get('export')
  async exportCandidates(
    @Query() filters: CandidateSearchFilters
  ) {
    try {
      return await this.adminCandidatesService.exportCandidates(filters);
    } catch (error) {
      return { error: 'Failed to export candidates' };
    }
  }

  @Get(':id')
  async getCandidateById(@Param('id') id: string) {
    try {
      return await this.adminCandidatesService.getCandidateById(id);
    } catch (error) {
      return { error: 'Candidate not found' };
    }
  }

  @Get(':id/applications')
  async getCandidateApplications(@Param('id') id: string) {
    try {
      return await this.adminCandidatesService.getCandidateApplications(id);
    } catch (error) {
      return [];
    }
  }

  @Get(':id/timeline')
  async getCandidateTimeline(@Param('id') id: string) {
    try {
      return await this.adminCandidatesService.getCandidateTimeline(id);
    } catch (error) {
      return [];
    }
  }

  @Post()
  async createCandidate(@Body() createCandidateDto: CreateCandidateDto) {
    return await this.adminCandidatesService.createCandidate(createCandidateDto);
  }

  @Put(':id')
  async updateCandidate(
    @Param('id') id: string,
    @Body() updateCandidateDto: UpdateCandidateDto
  ) {
    try {
      return await this.adminCandidatesService.updateCandidate(id, updateCandidateDto);
    } catch (error) {
      return { error: 'Failed to update candidate' };
    }
  }

  @Delete(':id')
  async deleteCandidate(@Param('id') id: string) {
    try {
      return await this.adminCandidatesService.deleteCandidate(id);
    } catch (error) {
      return { error: 'Failed to delete candidate' };
    }
  }

  @Post(':id/notes')
  async addCandidateNote(
    @Param('id') id: string,
    @Body() body: { content: string; type?: string }
  ) {
    try {
      return await this.adminCandidatesService.addCandidateNote(id, body.content, body.type);
    } catch (error) {
      return { error: 'Failed to add note' };
    }
  }

  @Post(':id/tags')
  async addCandidateTag(
    @Param('id') id: string,
    @Body() body: { tag: string }
  ) {
    try {
      return await this.adminCandidatesService.addCandidateTag(id, body.tag);
    } catch (error) {
      return { error: 'Failed to add tag' };
    }
  }

  @Delete(':id/tags/:tag')
  async removeCandidateTag(
    @Param('id') id: string,
    @Param('tag') tag: string
  ) {
    try {
      return await this.adminCandidatesService.removeCandidateTag(id, tag);
    } catch (error) {
      return { error: 'Failed to remove tag' };
    }
  }

  @Post('bulk-actions')
  async bulkActions(
    @Body() body: { candidateIds: string[]; action: string; data?: any }
  ) {
    try {
      return await this.adminCandidatesService.bulkActions(body.candidateIds, body.action, body.data);
    } catch (error) {
      return { error: 'Failed to perform bulk action' };
    }
  }
}