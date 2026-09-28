import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';
import type { Request } from 'express';

const PLACEHOLDER_SECRET = 'your-super-secret-jwt-key-change-in-production';

const cookieExtractor = (req: Request): string | null => {
  const header = req?.headers?.cookie;
  if (!header) return null;
  const prefix = 'access_token=';
  for (const part of header.split(';')) {
    const cookie = part.trim();
    if (cookie.startsWith(prefix)) {
      return decodeURIComponent(cookie.slice(prefix.length));
    }
  }
  return null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET environment variable must be set');
    }
    if (secret === PLACEHOLDER_SECRET) {
      throw new Error(
        'JWT_SECRET is still the insecure placeholder value. Set a strong random secret before starting the server.',
      );
    }
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        cookieExtractor,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: { sub: string; tv?: number }) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    // 吊销判据：令牌里的 tv 必须等于库里的当前版本。
    // 缺 tv 的旧令牌（本列上线前签发的）一律视为无效——等于「全站重新登录」一次。
    if (payload.tv !== user.tokenVersion) {
      throw new UnauthorizedException();
    }

    const { passwordHash, tokenVersion, ...result } = user;
    return result;
  }
}
