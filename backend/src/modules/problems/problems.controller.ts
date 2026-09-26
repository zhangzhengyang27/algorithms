import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ProblemsService } from './problems.service';
import { CreateProblemDto } from './dto/create-problem.dto';
import { UpdateProblemDto } from './dto/update-problem.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Difficulty } from '@prisma/client';

@ApiTags('problems')
@Controller('problems')
export class ProblemsController {
  constructor(private problemsService: ProblemsService) {}

  @Get()
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'difficulty', required: false, enum: ['EASY', 'MEDIUM', 'HARD'] })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'tag', required: false })
  findAll(
    @Query('categoryId') categoryId?: string,
    @Query('difficulty') difficulty?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('search') search?: string,
    @Query('tag') tag?: string,
  ) {
    let parsedDifficulty: Difficulty | undefined;
    if (difficulty) {
      const upper = difficulty.toUpperCase() as Difficulty;
      if (!['EASY', 'MEDIUM', 'HARD'].includes(upper)) {
        throw new BadRequestException(`Invalid difficulty: ${difficulty}`);
      }
      parsedDifficulty = upper;
    }
    const pageNum = page ? parseInt(page, 10) : undefined;
    const pageSizeNum = pageSize ? parseInt(pageSize, 10) : undefined;
    if (pageNum !== undefined && (!Number.isInteger(pageNum) || pageNum < 1)) {
      throw new BadRequestException('page must be a positive integer');
    }
    if (pageSizeNum !== undefined && (!Number.isInteger(pageSizeNum) || pageSizeNum < 1 || pageSizeNum > 200)) {
      throw new BadRequestException('pageSize must be between 1 and 200');
    }
    return this.problemsService.findAll(
      categoryId,
      parsedDifficulty,
      pageNum,
      pageSizeNum,
      search,
      tag,
    );
  }

  @Get('tags')
  tags() {
    return this.problemsService.allTags();
  }

  @Get('count')
  @ApiQuery({ name: 'categoryId', required: false })
  count(@Query('categoryId') categoryId?: string) {
    return this.problemsService.count(categoryId).then((count) => ({ count }));
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.problemsService.findOne(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  create(@Body() data: CreateProblemDto) {
    return this.problemsService.create(data);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() data: UpdateProblemDto) {
    return this.problemsService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.problemsService.remove(id);
  }
}
