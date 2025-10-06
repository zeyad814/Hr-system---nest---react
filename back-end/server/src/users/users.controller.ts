import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
  Request,
  Put,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  CreateUserDto,
  UpdateUserDto,
  UserQueryDto,
  UpdateUserStatusDto,
  UserResponseDto,
  PaginatedUsersResponseDto,
  UserStatsResponseDto,
} from './dto/user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './dto/user.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.HR, UserRole.SALES)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.HR, UserRole.SALES)
  async findAll(
    @Query() query: UserQueryDto,
  ): Promise<PaginatedUsersResponseDto> {
    return this.usersService.findAll(query);
  }

  @Get('stats')
  @Roles(UserRole.ADMIN, UserRole.HR, UserRole.SALES)
  async getUserStats(): Promise<UserStatsResponseDto> {
    return this.usersService.getUserStats();
  }

  @Get('departments')
  @Roles(UserRole.ADMIN, UserRole.HR, UserRole.SALES)
  async getDepartments(): Promise<string[]> {
    return this.usersService.getDepartments();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.HR, UserRole.SALES)
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.HR, UserRole.SALES)
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.update(id, updateUserDto);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.HR, UserRole.SALES)
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateUserStatusDto,
  ): Promise<UserResponseDto> {
    return this.usersService.updateStatus(id, updateStatusDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.usersService.remove(id);
  }

  // Profile endpoints
  @Get('profile')
  @Roles(UserRole.ADMIN, UserRole.HR, UserRole.SALES, UserRole.SALES, UserRole.CLIENT, UserRole.APPLICANT)
  async getProfile(@Request() req: any): Promise<UserResponseDto> {
    return this.usersService.findOne(req.user.sub);
  }

  @Put('profile')
  @Roles(UserRole.ADMIN, UserRole.HR, UserRole.SALES, UserRole.SALES, UserRole.CLIENT, UserRole.APPLICANT)
  async updateProfile(
    @Request() req: any,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.updateProfile(req.user.sub, updateUserDto);
  }
}
