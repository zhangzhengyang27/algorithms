import { Module } from '@nestjs/common';
import { ProblemsController } from './problems.controller';
import { ProblemsService } from './problems.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [ProblemsController],
  providers: [ProblemsService, PrismaService],
})
export class ProblemsModule {}
