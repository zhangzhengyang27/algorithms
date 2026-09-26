import { Controller, Get, Post, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ProgressService } from './progress.service';
import { UpsertProgressDto } from './dto/upsert-progress.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('progress')
@Controller('progress')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProgressController {
  constructor(private progressService: ProgressService) {}

  @Get()
  findAll(@CurrentUser() user: { id: string }) {
    return this.progressService.findAllForUser(user.id);
  }

  @Get('stats')
  getStats(@CurrentUser() user: { id: string }) {
    return this.progressService.getStats(user.id);
  }

  @Post()
  upsert(@CurrentUser() user: { id: string }, @Body() dto: UpsertProgressDto) {
    return this.progressService.upsert(user.id, dto);
  }
}
