import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.category.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { problems: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        problems: { orderBy: { title: 'asc' } },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async create(data: CreateCategoryDto) {
    try {
      return await this.prisma.category.create({ data });
    } catch (err: unknown) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException(`Category slug "${data.slug}" already exists`);
      }
      throw err;
    }
  }

  async update(id: string, data: UpdateCategoryDto) {
    await this.findOne(id);
    try {
      return await this.prisma.category.update({ where: { id }, data });
    } catch (err: unknown) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException('Category slug already exists');
      }
      throw err;
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    // 显式级联删除：分类下的所有题目（及其进度/笔记/评论）必须一并移除，
    // 否则 Prisma 默认外键策略会报 P2003。使用事务保证原子性。
    return this.prisma.$transaction(async (tx) => {
      const problemIds = (await tx.problem.findMany({
        where: { categoryId: id },
        select: { id: true },
      })).map((p) => p.id);

      if (problemIds.length > 0) {
        await tx.progress.deleteMany({ where: { problemId: { in: problemIds } } });
        await tx.note.deleteMany({ where: { problemId: { in: problemIds } } });
        await tx.comment.deleteMany({ where: { problemId: { in: problemIds } } });
        await tx.problem.deleteMany({ where: { categoryId: id } });
      }

      return tx.category.delete({ where: { id } });
    });
  }
}
