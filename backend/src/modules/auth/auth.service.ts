import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(email: string, password: string, name?: string) {
    const normalizedEmail = email.trim().toLowerCase();
    // 并发安全：直接捕获 create 触发的唯一约束异常（P2002），
    // 而不是“先查后建”的非原子两步，避免并发注册同 email 绕过检查。
    const passwordHash = await bcrypt.hash(password, 12);

    let user;
    try {
      user = await this.prisma.user.create({
        data: { email: normalizedEmail, passwordHash, name },
      });
    } catch (err: unknown) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException('Email already registered');
      }
      throw err;
    }

    const token = this.generateToken(user.id, user.tokenVersion);

    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  async login(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.generateToken(user.id, user.tokenVersion);

    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  async refresh(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const token = this.generateToken(user.id, user.tokenVersion);
    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.sanitizeUser(user);
  }

  private generateToken(userId: string, tokenVersion: number) {
    return this.jwtService.sign({ sub: userId, tv: tokenVersion });
  }

  /**
   * 递增 tokenVersion，使此前签发的所有 JWT 立即失效（策略层逐个比对 tv）。
   * 登出与后续任何「改密/封号」动作都应走这里，否则令牌要等到自然过期才作废。
   */
  async revokeTokens(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { tokenVersion: { increment: 1 } },
    });
    return { success: true };
  }

  /**
   * Cookie lifetime in milliseconds, derived from JWT_EXPIRES_IN so the
   * httpOnly auth cookie and the JWT expire together.
   */
  getCookieMaxAgeMs(): number {
    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN', '7d');
    const match = expiresIn.match(/^(\d+)\s*(s|m|h|d)$/);
    if (!match) return 7 * 24 * 60 * 60 * 1000;
    const value = Number(match[1]);
    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60_000,
      h: 3_600_000,
      d: 86_400_000,
    };
    return value * (multipliers[match[2]] ?? 86_400_000);
  }

  private sanitizeUser(user: any) {
    const { passwordHash, tokenVersion, ...result } = user;
    return result;
  }
}
