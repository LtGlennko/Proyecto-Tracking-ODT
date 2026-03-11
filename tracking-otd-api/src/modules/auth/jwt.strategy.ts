import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    const tenantId = config.get('AZURE_TENANT_ID');
    const policy = config.get('AZURE_B2C_POLICY', 'B2C_1_signupsignin');
    const domain = config.get('AZURE_B2C_DOMAIN', 'kaufmann.b2clogin.com');

    super({
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://${domain}/${tenantId}/${policy}/discovery/v2.0/keys`,
      }),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      issuer: `https://${domain}/${tenantId}/${policy}/v2.0/`,
      algorithms: ['RS256'],
    });
  }

  async validate(payload: any) {
    if (!payload.oid && !payload.sub) throw new UnauthorizedException();
    return {
      oid: payload.oid || payload.sub,
      email: payload.emails?.[0] || payload.email,
      nombre: payload.name,
      perfil: payload.extension_perfil || 'asesor_comercial',
    };
  }
}
