import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ValidationPipe,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ContractsService } from './contracts.service';
import {
  CreateContractDto,
  UpdateContractDto,
  ContractQueryDto,
  ContractStatus,
} from './dto/contract.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/dto/user.dto';

@Controller('contracts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  /**
   * إنشاء عقد جديد
   * POST /api/contracts
   */
  @Post()
  @Roles(UserRole.ADMIN, UserRole.SALES, UserRole.HR)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body(ValidationPipe) createContractDto: CreateContractDto) {
    return this.contractsService.create(createContractDto);
  }

  /**
   * الحصول على جميع العقود مع البحث والفلترة
   * GET /api/contracts
   */
  @Get()
  @Roles(UserRole.ADMIN, UserRole.SALES, UserRole.HR, UserRole.APPLICANT)
  async findAll(@Query(ValidationPipe) query: ContractQueryDto) {
    return this.contractsService.findAll(query);
  }

  /**
   * ردّ المتقدم على العقد (قبول/رفض)
   * PATCH /api/contracts/:id/applicant-response
   */
  @Patch(':id/applicant-response')
  @Roles(UserRole.APPLICANT)
  async applicantRespond(
    @Param('id') id: string,
    @Body('action') action: 'ACCEPT' | 'REJECT',
    @Body('notes') notes?: string,
  ) {
    return this.contractsService.applicantRespond(id, action, notes);
  }

  /**
   * الحصول على إحصائيات العقود
   * GET /api/contracts/stats
   */
  @Get('stats')
  @Roles(UserRole.ADMIN, UserRole.SALES, UserRole.HR)
  async getStats() {
    return this.contractsService.getStats();
  }

  /**
   * الحصول على عقد واحد بالمعرف
   * GET /api/contracts/:id
   */
  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.SALES, UserRole.HR, UserRole.CLIENT, UserRole.APPLICANT)
  async findOne(@Param('id') id: string) {
    return this.contractsService.findOne(id);
  }

  /**
   * تحديث عقد
   * PATCH /api/contracts/:id
   */
  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SALES)
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateContractDto: UpdateContractDto,
  ) {
    return this.contractsService.update(id, updateContractDto);
  }

  /**
   * حذف عقد
   * DELETE /api/contracts/:id
   */
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    return this.contractsService.remove(id);
  }

  /**
   * تحديث حالة العقد
   * PATCH /api/contracts/:id/status
   */
  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.SALES)
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: ContractStatus,
  ) {
    return this.contractsService.updateStatus(id, status);
  }

  /**
   * تحديث تقدم العقد
   * PATCH /api/contracts/:id/progress
   */
  @Patch(':id/progress')
  @Roles(UserRole.ADMIN, UserRole.SALES)
  async updateProgress(
    @Param('id') id: string,
    @Body('progress') progress: number,
  ) {
    return this.contractsService.updateProgress(id, progress);
  }

  /**
   * الحصول على عقود عميل معين
   * GET /api/contracts/client/:clientId
   */
  @Get('client/:clientId')
  @Roles(UserRole.ADMIN, UserRole.SALES, UserRole.HR)
  async getClientContracts(
    @Param('clientId') clientId: string,
    @Query(ValidationPipe) query: ContractQueryDto,
  ) {
    return this.contractsService.getClientContracts(clientId, query);
  }
}
