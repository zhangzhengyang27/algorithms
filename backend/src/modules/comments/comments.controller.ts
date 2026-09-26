import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('comments')
@Controller('comments')
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  /** 获取某题的评论列表（公开） */
  @Get()
  findByProblem(
    @Query('problemId') problemId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    if (!problemId) throw new BadRequestException('problemId is required');
    const pageNum = page ? parseInt(page, 10) : 1;
    const pageSizeNum = pageSize ? parseInt(pageSize, 10) : 20;
    if (!Number.isInteger(pageNum) || pageNum < 1) {
      throw new BadRequestException('page must be a positive integer');
    }
    if (!Number.isInteger(pageSizeNum) || pageSizeNum < 1 || pageSizeNum > 200) {
      throw new BadRequestException('pageSize must be between 1 and 200');
    }
    return this.commentsService.findByProblem(problemId, pageNum, pageSizeNum);
  }

  /** 发表评论 / 打卡（需登录） */
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(@CurrentUser() user: any, @Body() data: { problemId: string; content: string }) {
    if (!data.problemId || !data.content?.trim()) throw new BadRequestException('problemId and content are required');
    if (data.content.length > 5000) throw new BadRequestException('content is too long (max 5000 chars)');
    return this.commentsService.create(user.id, data.problemId, data.content.trim());
  }

  /** 删除自己的评论（需登录） */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.commentsService.remove(user.id, id);
  }
}
