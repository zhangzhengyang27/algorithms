import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

const IS_PROD = process.env.NODE_ENV === 'production';

// `Number('1;2')` 会得到 NaN，proxy-addr 对 NaN 直接抛错（每个请求 500），
// 所以这里只接受「非负整数」，其余一律退回 0（不信任代理头）。
function resolveTrustProxy(): number {
  const raw = process.env.TRUST_PROXY ?? '0';
  const n = Number(raw);
  return Number.isInteger(n) && n >= 0 ? n : 0;
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 反向代理后需正确解析客户端 IP，否则全局限流会按代理 IP 合并
  app.set('trust proxy', resolveTrustProxy());
  app.enableCors({
    origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:4000',
    credentials: true,
  });

  // 手写而非引 helmet：这里只需要 5 个响应头，发布前不想为此新增依赖/锁文件面。
  // 后端只回 JSON，故不给 CSP（Nest 的 Swagger 页要内联脚本，prod 下也已下线）。
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
    next();
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger 会枚举全部路由，公网环境不该无鉴权可达（前端 rewrite 会把 /api/v1/* 透到根）
  if (!IS_PROD) {
    const config = new DocumentBuilder()
      .setTitle('算法可视化学习平台 API')
      .setDescription('支持算法可视化、教程和题解的 API 文档')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = process.env.PORT || 40001;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  if (!IS_PROD) {
    console.log(`Swagger docs available at: http://localhost:${port}/api/docs`);
  }
}

bootstrap();
