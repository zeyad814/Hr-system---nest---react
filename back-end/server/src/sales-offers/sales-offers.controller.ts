import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/dto/user.dto';
import { SalesOffersService } from './sales-offers.service';
import { CreateSalesOfferDto, ApplicantSalesOfferResponseDto, SalesOfferReviewDto } from './dto/sales-offer.dto';
import { PrismaService } from '../prisma/prisma.service';

@Controller('sales-offers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SalesOffersController {
  constructor(
    private readonly salesOffersService: SalesOffersService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  @Roles(UserRole.SALES)
  async create(@Request() req: any, @Body() createDto: CreateSalesOfferDto) {
    return this.salesOffersService.create(req.user.id || req.user.sub, createDto);
  }

  @Get()
  @Roles(UserRole.SALES)
  async findAll(@Request() req: any) {
    return this.salesOffersService.findAll(req.user.id || req.user.sub);
  }

  @Get('applicant')
  @Roles(UserRole.APPLICANT)
  async getApplicantOffers(@Request() req: any) {
    const applicant = await this.prisma.applicant.findUnique({
      where: { userId: req.user.id || req.user.sub },
    });
    if (!applicant) {
      return [];
    }
    return this.salesOffersService.findApplicantOffers(applicant.id);
  }

  @Post(':id/applicant-response')
  @Roles(UserRole.APPLICANT)
  async applicantRespond(
    @Param('id') id: string,
    @Request() req: any,
    @Body() responseDto: ApplicantSalesOfferResponseDto,
  ) {
    return this.salesOffersService.applicantRespond(id, req.user.id || req.user.sub, responseDto);
  }

  @Get('rejections/pending')
  @Roles(UserRole.SALES)
  async getPendingRejections(@Request() req: any) {
    return this.salesOffersService.getPendingRejections(req.user.id || req.user.sub);
  }

  @Post(':id/review')
  @Roles(UserRole.SALES)
  async reviewRejection(
    @Param('id') id: string,
    @Request() req: any,
    @Body() reviewDto: SalesOfferReviewDto,
  ) {
    return this.salesOffersService.reviewRejection(id, req.user.id || req.user.sub, reviewDto);
  }
}

