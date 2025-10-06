import {
  Body,
  Controller,
  HttpCode,
  Post,
  Put,
  Delete,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import type { LoginDto, RegisterDto } from './auth.service';
import { Public } from './public.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @Public()
  login(@Body() body: LoginDto) {
    return this.auth.login(body);
  }

  @Post('register')
  @HttpCode(201)
  @Public()
  register(@Body() body: RegisterDto) {
    return this.auth.register(body);
  }

  @Put('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  changePassword(
    @Request() req: any,
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    return this.auth.changePassword(
      req.user.id,
      body.currentPassword,
      body.newPassword,
    );
  }

  @Delete('delete-account')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  deleteAccount(@Request() req: any, @Body() body: { password: string }) {
    return this.auth.deleteAccount(req.user.id, body.password);
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  refreshToken(@Request() req: any) {
    return this.auth.refreshToken(req.user.sub, req.user.email, req.user.role);
  }
}


