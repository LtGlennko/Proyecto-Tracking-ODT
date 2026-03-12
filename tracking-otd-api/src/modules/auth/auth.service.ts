import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { Usuario } from '../usuario/usuario.entity';
import { ConfidentialClientApplication, Configuration, LogLevel } from '@azure/msal-node';
import { BYPASS_JWT_SECRET } from './jwt.strategy';

type MicrosoftAuthConfig = {
  tenantId: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
  authority: string;
  postLogoutRedirectUri?: string;
  bypassEnabled?: boolean;
  bypassOid?: string;
  bypassEmail?: string;
  bypassName?: string;
};

@Injectable()
export class AuthService {
  private readonly msalClient: ConfidentialClientApplication | null;
  private readonly config: MicrosoftAuthConfig;

  constructor(
    @InjectRepository(Usuario)
    private usuarioRepo: Repository<Usuario>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    this.config = this.loadMicrosoftConfig();
    this.msalClient = this.config.bypassEnabled
      ? null
      : new ConfidentialClientApplication(
          this.buildMsalConfiguration(this.config),
        );
  }

  private buildMsalConfiguration(cfg: MicrosoftAuthConfig): Configuration {
    return {
      auth: {
        clientId: cfg.clientId,
        authority: cfg.authority,
        clientSecret: cfg.clientSecret,
      },
      system: {
        loggerOptions: {
          loggerCallback: () => undefined,
          piiLoggingEnabled: false,
          logLevel: LogLevel.Warning,
        },
      },
    };
  }

  private loadMicrosoftConfig(): MicrosoftAuthConfig {
    const tenantId = this.configService.get<string>('AZURE_AD_TENANT_ID')?.trim();
    const clientId = this.configService.get<string>('AZURE_AD_CLIENT_ID')?.trim();
    const clientSecret = this.configService.get<string>('AZURE_AD_CLIENT_SECRET')?.trim();
    const redirectUri = this.configService.get<string>('AZURE_AD_REDIRECT_URI')?.trim();

    const scopesRaw = this.configService.get<string>('AZURE_AD_SCOPES') ?? 'openid,profile,email';
    const scopes = scopesRaw.split(',').map((s) => s.trim()).filter(Boolean);

    const authority =
      this.configService.get<string>('AZURE_AD_AUTHORITY')?.trim() ||
      (tenantId ? `https://login.microsoftonline.com/${tenantId}` : '');

    const postLogoutRedirectUri = this.configService.get<string>('AZURE_AD_POST_LOGOUT_REDIRECT_URI')?.trim();

    const bypassEnabled = this.configService.get<string>('AUTH_BYPASS_ENABLED') === 'true';
    const bypassOid = this.configService.get<string>('AUTH_BYPASS_USER_OID') || '00000000-0000-4000-8000-000000000001';
    const bypassEmail = this.configService.get<string>('AUTH_BYPASS_USER_EMAIL') || 'dev@local.local';
    const bypassName = this.configService.get<string>('AUTH_BYPASS_USER_NAME') || 'Bypass User';

    const missing = [
      !bypassEnabled && !tenantId && 'AZURE_AD_TENANT_ID',
      !bypassEnabled && !clientId && 'AZURE_AD_CLIENT_ID',
      !bypassEnabled && !clientSecret && 'AZURE_AD_CLIENT_SECRET',
      !bypassEnabled && !redirectUri && 'AZURE_AD_REDIRECT_URI',
      !bypassEnabled && !authority && 'AZURE_AD_AUTHORITY',
    ].filter(Boolean) as string[];

    if (missing.length) {
      throw new BadRequestException(`Missing Microsoft auth env vars: ${missing.join(', ')}`);
    }

    return {
      tenantId: tenantId ?? '',
      clientId: clientId ?? '',
      clientSecret: clientSecret ?? '',
      redirectUri: redirectUri ?? '',
      scopes,
      authority,
      postLogoutRedirectUri: postLogoutRedirectUri || undefined,
      bypassEnabled,
      bypassOid,
      bypassEmail,
      bypassName
    };
  }

  async getMicrosoftLoginUrl(): Promise<string> {
    if (this.config.bypassEnabled) {
      // Simulate external login redirect by immediately redirecting back to callback with a fake code
      const url = new URL(this.config.redirectUri);
      url.searchParams.set('code', 'bypass-fake-code');
      return url.toString();
    }

    return this.msalClient!.getAuthCodeUrl({
      redirectUri: this.config.redirectUri,
      scopes: this.config.scopes,
      prompt: 'select_account',
    });
  }

  async exchangeMicrosoftCode(code: string) {
    if (!code?.trim()) {
      throw new BadRequestException('Missing "code"');
    }

    if (this.config.bypassEnabled && code === 'bypass-fake-code') {
      const tokenPayload = {
        oid: this.config.bypassOid,
        email: this.config.bypassEmail,
        name: this.config.bypassName,
        sub: this.config.bypassOid,
      };
      const idToken = this.jwtService.sign(tokenPayload, {
        secret: BYPASS_JWT_SECRET,
        algorithm: 'HS256',
        expiresIn: '1h',
      });

      return {
        accessToken: idToken,
        idToken,
        expiresOn: new Date(Date.now() + 3600000).toISOString(),
        account: {
          homeAccountId: 'bypass-id',
          username: this.config.bypassEmail,
          name: this.config.bypassName,
          tenantId: 'bypass-tenant',
          environment: 'local',
        },
        scopes: this.config.scopes,
        tokenType: 'Bearer',
      };
    }

    const result = await this.msalClient!.acquireTokenByCode({
      code,
      redirectUri: this.config.redirectUri,
      scopes: this.config.scopes,
    });
    if (!result) {
      throw new BadRequestException('Failed to acquire token by code');
    }
    return {
      accessToken: result.accessToken,
      idToken: result.idToken,
      expiresOn: result.expiresOn?.toISOString() ?? null,
      account: result.account
        ? {
            homeAccountId: result.account.homeAccountId,
            username: result.account.username,
            name: result.account.name,
            tenantId: result.account.tenantId,
            environment: result.account.environment,
          }
        : null,
      scopes: result.scopes ?? [],
      tokenType: result.tokenType ?? null,
    };
  }

  getMicrosoftLogoutUrl(): string {
    if (this.config.bypassEnabled) {
      return this.config.postLogoutRedirectUri ?? this.config.redirectUri;
    }
    const base = `${this.config.authority.replace(/\/+$/, '')}/oauth2/v2.0/logout`;
    const postLogout = this.config.postLogoutRedirectUri ?? this.config.redirectUri;
    const url = new URL(base);
    url.searchParams.set('post_logout_redirect_uri', postLogout);
    return url.toString();
  }

  async syncUser(jwtUser: any): Promise<Usuario> {
    let usuario = await this.usuarioRepo.findOne({
      where: { azureAdOid: jwtUser.oid },
      relations: ['empresas'],
    });
    if (!usuario) {
      usuario = this.usuarioRepo.create({
        azureAdOid: jwtUser.oid,
        email: jwtUser.email,
        nombre: jwtUser.nombre,
        perfil: jwtUser.perfil || 'asesor_comercial',
        activo: true,
      });
    } else {
      usuario.email = jwtUser.email;
      usuario.nombre = jwtUser.nombre;
      // Never overwrite perfil for existing users — admin assigns roles
    }
    return this.usuarioRepo.save(usuario);
  }

  async getMe(oid: string): Promise<Usuario> {
    return this.usuarioRepo.findOne({
      where: { azureAdOid: oid },
      relations: ['empresas'],
    });
  }
}
