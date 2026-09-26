import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Difficulty, Prisma } from '@prisma/client';
import { CreateProblemDto } from './dto/create-problem.dto';
import { UpdateProblemDto } from './dto/update-problem.dto';

@Injectable()
export class ProblemsService {
  constructor(private prisma: PrismaService) {}

  async findAll(categoryId?: string, difficulty?: Difficulty, page?: number, pageSize?: number, search?: string, tag?: string) {
    const where: any = {
      ...(categoryId && { categoryId }),
      ...(difficulty && { difficulty }),
      ...(tag && { tags: { has: tag } }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { slug: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    // 如果传了分页参数，返回分页结果
    if (page && pageSize) {
      const [items, total] = await Promise.all([
        this.prisma.problem.findMany({
          where,
          orderBy: { title: 'asc' },
          include: { category: true },
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        this.prisma.problem.count({ where }),
      ]);
      return { items, total, page, pageSize };
    }

    return this.prisma.problem.findMany({
      where,
      orderBy: { title: 'asc' },
      include: { category: true },
    });
  }

  async findOne(slug: string) {
    const problem = await this.prisma.problem.findUnique({
      where: { slug },
      include: { category: true },
    });

    if (!problem) {
      throw new NotFoundException('Problem not found');
    }

    return problem;
  }

  async count(categoryId?: string) {
    return this.prisma.problem.count({
      where: categoryId ? { categoryId } : undefined,
    });
  }

  /** 聚合所有题目标签及其出现次数，供前端标签筛选器渲染 */
  async allTags() {
    const rows = await this.prisma.problem.findMany({
      select: { tags: true },
    });
    const freq = new Map<string, number>();
    for (const row of rows) {
      for (const t of row.tags ?? []) {
        freq.set(t, (freq.get(t) ?? 0) + 1);
      }
    }
    return Array.from(freq.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
  }

  async create(data: CreateProblemDto) {
    // 外键校验：categoryId 必须指向已存在的分类
    const category = await this.prisma.category.findUnique({
      where: { id: data.categoryId },
    });
    if (!category) {
      throw new NotFoundException(`Category "${data.categoryId}" not found`);
    }

    try {
      return await this.prisma.problem.create({
        data: {
          categoryId: data.categoryId,
          title: data.title,
          slug: data.slug,
          difficulty: data.difficulty ?? Difficulty.MEDIUM,
          descriptionMd: data.descriptionMd,
          examples: data.examples ?? [],
          solutions: data.solutions ?? {},
          hints: data.hints ?? [],
          timeLimit: data.timeLimit ?? 2000,
          memoryLimit: data.memoryLimit ?? 256,
        },
      });
    } catch (err: unknown) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException(`Problem slug "${data.slug}" already exists`);
      }
      throw err;
    }
  }

  async update(id: string, data: UpdateProblemDto) {
    const existing = await this.prisma.problem.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Problem not found');
    }

    // 外键校验：只有当要变更分类时才检查
    if (data.categoryId && data.categoryId !== existing.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: data.categoryId },
      });
      if (!category) {
        throw new NotFoundException(`Category "${data.categoryId}" not found`);
      }
    }

    try {
      return await this.prisma.problem.update({
        where: { id },
        data: data as Prisma.ProblemUncheckedUpdateInput,
      });
    } catch (err: unknown) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException('Problem slug already exists');
      }
      throw err;
    }
  }

  async remove(id: string) {
    const problem = await this.prisma.problem.findUnique({ where: { id } });
    if (!problem) {
      throw new NotFoundException('Problem not found');
    }
    // 显式级联删除关联记录（进度 / 笔记 / 评论），避免外键冲突 P2003。
    // 使用事务保证原子性：任一步失败则全部回滚。
    return this.prisma.$transaction(async (tx) => {
      await tx.progress.deleteMany({ where: { problemId: id } });
      await tx.note.deleteMany({ where: { problemId: id } });
      await tx.comment.deleteMany({ where: { problemId: id } });
      return tx.problem.delete({ where: { id } });
    });
  }
}
