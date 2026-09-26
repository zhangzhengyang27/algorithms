import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProgressStatus } from '@prisma/client';
import { UpsertProgressDto } from './dto/upsert-progress.dto';

@Injectable()
export class ProgressService {
  constructor(private prisma: PrismaService) {}

  async findAllForUser(userId: string) {
    return this.prisma.progress.findMany({
      where: { userId },
      include: { problem: { include: { category: true } } },
      orderBy: { updatedAt: 'desc' },
    });
  }

  /**
   * 原子化 upsert：使用 Prisma 原生 upsert + 事务，避免并发触发 P2002。
   * 当首次状态改为 COMPLETED 时，设置 completedAt = now()。
   */
  async upsert(userId: string, dto: UpsertProgressDto) {
    const shouldSetCompletedAt = dto.status === 'COMPLETED';
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.progress.findUnique({
        where: { userId_problemId: { userId, problemId: dto.problemId } },
      });

      return tx.progress.upsert({
        where: { userId_problemId: { userId, problemId: dto.problemId } },
        update: {
          ...(dto.status !== undefined && { status: dto.status }),
          ...(dto.code !== undefined && { code: dto.code }),
          ...(dto.notes !== undefined && { notes: dto.notes }),
          // 状态从 COMPLETED 降级时清空完成时间，避免残留过期时间
          ...(dto.status !== undefined && !shouldSetCompletedAt && { completedAt: null }),
          ...(shouldSetCompletedAt && !existing?.completedAt && { completedAt: new Date() }),
        },
        create: {
          userId,
          problemId: dto.problemId,
          status: dto.status ?? ProgressStatus.NOT_STARTED,
          code: dto.code,
          notes: dto.notes,
          completedAt: shouldSetCompletedAt ? new Date() : null,
        },
      });
    });
  }

  async getStats(userId: string) {
    const stats = await this.prisma.progress.groupBy({
      by: ['status'],
      where: { userId },
      _count: true,
    });

    return {
      total: stats.reduce((acc, s) => acc + s._count, 0),
      completed: stats.find(s => s.status === 'COMPLETED')?._count || 0,
      attempting: stats.find(s => s.status === 'ATTEMPTING')?._count || 0,
      notStarted: stats.find(s => s.status === 'NOT_STARTED')?._count || 0,
    };
  }
}
