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
      secretOrKey: configService.getOrThrow<string>('jwt.refreshSecret'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtRefreshPayload) {
    const rawRefreshToken = req.body?.refreshToken as string | undefined;

    if (!rawRefreshToken) {
      throw new UnauthorizedException('Access denied');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Access denied');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Access denied');
    }

    const refreshSecret = this.configService.get<string>('jwt.refreshSecret')!;
    const tokenMatches = compareTokens(rawRefreshToken, user.refreshToken, refreshSecret);

    if (!tokenMatches) {
      throw new UnauthorizedException('Access denied');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, refreshToken: _rt, ...result } = user;
    return { ...result, refreshToken: rawRefreshToken };
  }
}
