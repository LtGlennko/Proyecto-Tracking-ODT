import { Controller, Get, Post, UseGuards, Query, BadRequestException } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { AuthService } from './auth.service';

@ApiTags('auth')
@ApiBearerAuth('azure-ad-b2c')
@Controller('v1/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Perfil del usuario autenticado' })
  async getMe(@CurrentUser() user: any) {
    return this.authService.getMe(user.oid);
  }

  @UseGuards(JwtAuthGuard)
  @Post('sync')
  @ApiOperation({ summary: 'Sincroniza usuario desde claims JWT' })
  async sync(@CurrentUser() user: any) {
    return this.authService.syncUser(user);
  }

  @Public()
  @Get('microsoft/login')
  @ApiOperation({ summary: 'Obtiene la URL de inicio de sesión de Microsoft' })
  async login(): Promise<{ url: string }> {
    const url = await this.authService.getMicrosoftLoginUrl();
    return { url };
  }

  @Public()
  @Get('microsoft/callback')
  @ApiOperation({ summary: 'Genera tokens a partir del código de Microsoft' })
  async callback(@Query() query: Record<string, string | string[] | undefined>): Promise<unknown> {
    const error = typeof query.error === 'string' ? query.error : null;
    const errorDescription = typeof query.error_description === 'string' ? query.error_description : null;
    if (error) {
      throw new BadRequestException({ error, errorDescription });
    }

    const code = typeof query.code === 'string' ? query.code : null;
    if (!code) throw new BadRequestException('Missing "code"');
    return this.authService.exchangeMicrosoftCode(code);
  }

  @Public()
  @Get('microsoft/logout')
  @ApiOperation({ summary: 'Obtiene la URL de cierre de sesión de Microsoft' })
  async logout(): Promise<{ url: string }> {
    const url = this.authService.getMicrosoftLogoutUrl();
    return { url };
  }
}
