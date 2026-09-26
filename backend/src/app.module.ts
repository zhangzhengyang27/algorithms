import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './modules/auth/auth.module';
import { ProblemsModule } from './modules/problems/problems.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ProgressModule } from './modules/progress/progress.module';
import { NotesModule } from './modules/notes/notes.module';
import { CommentsModule } from './modules/comments/comments.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // 全局限流：默认 60 次/分钟/IP。具体端点（如 auth/login）用 @Throttle() 装饰器单独放宽/收紧。
    ThrottlerModule.forRoot([{
      ttl: 60_000,
      limit: 60,
    }]),
    AuthModule,
    ProblemsModule,
    CategoriesModule,
    ProgressModule,
    NotesModule,
    CommentsModule,
  ],
  providers: [
    PrismaService,
    // 让 ThrottlerGuard 作为全局守卫生效，无需在每个 controller 手动加 @UseGuards(ThrottlerGuard)
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
  exports: [PrismaService],
})
export class AppModule {}
