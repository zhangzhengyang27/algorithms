import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateNoteDto, UpdateNoteDto } from './dto/note.dto';

@Injectable()
export class NotesService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, problemId?: string) {
    return this.prisma.note.findMany({
      where: { userId, ...(problemId && { problemId }) },
      include: { problem: true },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const note = await this.prisma.note.findFirst({
      where: { id, userId },
      include: { problem: true },
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    return note;
  }

  async create(userId: string, data: CreateNoteDto) {
    // 校验 problemId 存在，避免外键 P2003 直接抛 500
    if (data.problemId) {
      const problem = await this.prisma.problem.findUnique({ where: { id: data.problemId } });
      if (!problem) {
        throw new NotFoundException('Problem not found');
      }
    }
    const title = data.title || this.extractTitle(data.content);
    return this.prisma.note.create({
      data: { userId, title, content: data.content, problemId: data.problemId },
    });
  }

  /** 从 Markdown 内容提取第一个 # 标题，无则截取前 50 字符 */
  private extractTitle(content: string): string {
    const match = content.match(/^#\s+(.+)$/m);
    if (match) return match[1].trim();
    const plain = content.replace(/[#*_`>\-\[\]]/g, '').trim();
    return plain.slice(0, 50) || '未命名笔记';
  }

  async update(userId: string, id: string, data: UpdateNoteDto) {
    await this.findOne(userId, id);
    return this.prisma.note.update({
      where: { id },
      data,
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.note.delete({ where: { id } });
  }
}
