import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthService } from './auth.service';

@ApiTags('auth')
@ApiBearerAuth('azure-ad-b2c')
@UseGuards(JwtAuthGuard)
@Controller('v1/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('me')
  @ApiOperation({ summary: 'Perfil del usuario autenticado' })
  async getMe(@CurrentUser() user: any) {
    return this.authService.getMe(user.oid);
  }

  @Post('sync')
  @ApiOperation({ summary: 'Sincroniza usuario desde claims JWT' })
  async sync(@CurrentUser() user: any) {
    return this.authService.syncUser(user);
  }
}
