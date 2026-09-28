import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  /** 获取某题的评论列表（按时间倒序），附带用户昵称 */
  async findByProblem(problemId: string, page = 1, pageSize = 20) {
    const where = { problemId };
    const [items, total] = await Promise.all([
      this.prisma.comment.findMany({
        where,
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.comment.count({ where }),
    ]);

    return {
      items: items.map((c) => ({
        ...c,
        // 不回退到 email 的 @ 前缀——那等于把用户名公开在题解页上
        user: { id: c.user.id, name: c.user.name || '学习者' },
      })),
      total,
      page,
      pageSize,
    };
  }

  /** 发表评论（打卡） */
  async create(userId: string, problemId: string, content: string) {
    // 确认题目存在
    const problem = await this.prisma.problem.findUnique({ where: { id: problemId } });
    if (!problem) throw new NotFoundException('Problem not found');

    const comment = await this.prisma.comment.create({
      data: { userId, problemId, content },
      include: { user: { select: { id: true, name: true } } },
    });

    return {
      ...comment,
      user: { id: comment.user.id, name: comment.user.name || '学习者' },
    };
  }

  /** 删除自己的评论 */
  async remove(userId: string, id: string) {
    const comment = await this.prisma.comment.findUnique({ where: { id } });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.userId !== userId) throw new ForbiddenException('Cannot delete others comment');

    await this.prisma.comment.delete({ where: { id } });
    return { success: true };
  }
}
