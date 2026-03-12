import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../usuario/usuario.entity';

export const BYPASS_JWT_SECRET = 'bypass-dev-secret-do-not-use-in-prod';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private usuarioRepo: Repository<Usuario>;

  constructor(
    config: ConfigService,
    @Inject(getRepositoryToken(Usuario)) usuarioRepo: Repository<Usuario>,
  ) {
    const tenantId = config.get('AZURE_TENANT_ID');
    const policy = config.get('AZURE_B2C_POLICY', 'B2C_1_signupsignin');
    const domain = config.get('AZURE_B2C_DOMAIN', 'kaufmann.b2clogin.com');

    const bypassEnabled = config.get('AUTH_BYPASS_ENABLED') === 'true';

    if (bypassEnabled) {
      super({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: BYPASS_JWT_SECRET,
        algorithms: ['HS256'],
        ignoreExpiration: true,
      });
    } else {
      super({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKeyProvider: passportJwtSecret({
          cache: true,
          rateLimit: true,
          jwksRequestsPerMinute: 5,
          jwksUri: `https://${domain}/${tenantId}/${policy}/discovery/v2.0/keys`,
        }),
        issuer: `https://${domain}/${tenantId}/${policy}/v2.0/`,
        algorithms: ['RS256'],
      });
    }

    this.usuarioRepo = usuarioRepo;
  }

  async validate(payload: any) {
    if (!payload.oid && !payload.sub) throw new UnauthorizedException();

    const oid = payload.oid || payload.sub;

    // Look up the real perfil from the database (not from JWT claims)
    const usuario = await this.usuarioRepo.findOne({ where: { azureAdOid: oid } });
    const perfil = usuario?.perfil || payload.extension_perfil || 'asesor_comercial';

    return {
      oid,
      email: payload.emails?.[0] || payload.email,
      nombre: payload.name,
      perfil,
    };
  }
}
