import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { NotesService } from './notes.service';
import { CreateNoteDto, UpdateNoteDto } from './dto/note.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('notes')
@Controller('notes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotesController {
  constructor(private notesService: NotesService) {}

  @Get()
  findAll(@CurrentUser() user: { id: string }, @Query('problemId') problemId?: string) {
    return this.notesService.findAll(user.id, problemId);
  }

  @Get(':id')
  findOne(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.notesService.findOne(user.id, id);
  }

  @Post()
  create(@CurrentUser() user: { id: string }, @Body() data: CreateNoteDto) {
    return this.notesService.create(user.id, data);
  }

  @Put(':id')
  update(@CurrentUser() user: { id: string }, @Param('id') id: string, @Body() data: UpdateNoteDto) {
    return this.notesService.update(user.id, id, data);
  }

  @Delete(':id')
  remove(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.notesService.remove(user.id, id);
  }
}
