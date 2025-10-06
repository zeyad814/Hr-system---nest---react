import { Controller, Get } from '@nestjs/common';

@Controller('api/test-admin')
export class TestAdminController {
  @Get('hello')
  getHello() {
    return { message: 'Test admin controller working!' };
  }
}
