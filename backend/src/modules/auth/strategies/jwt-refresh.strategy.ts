import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { PrismaService } from '../../../prisma/prisma.service';
import { JwtRefreshPayload } from '../../../shared/interfaces/jwt-payload.interface';
import { compareTokens } from '../../../shared/utils/hash.util';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('jwt.secret'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtRefreshPayload) {
    const refreshToken = req.body?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not provided');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Access denied: invalid refresh token');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is deactivated');
    }

    const refreshTokenMatches = await compareTokens(refreshToken, user.refreshToken);

    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Access denied: refresh token mismatch');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, refreshToken: _rt, ...result } = user;
    return { ...result, refreshToken };
  }
}
