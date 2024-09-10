import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FormatResponseInterceptor } from './format-response/format-response.interceptor';
import { InvokeRecordInterceptor } from './invoke-record/invoke-record.interceptor';

import { CustomExceptionFilter } from './custom-exception/custom-exception.filter';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // 全局拦截器
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
  // 静态文件目录设置
  app.useStaticAssets('uploads', {
    prefix: '/uploads',
  });

  // 全局统一response
  app.useGlobalInterceptors(new FormatResponseInterceptor());
  app.useGlobalInterceptors(new InvokeRecordInterceptor());
  // 全局统一错误格式
  app.useGlobalFilters(new CustomExceptionFilter());

  const configService = app.get(ConfigService);

  await app.listen(configService.get('NEST_SERVER_PORT'));

  // 设置swagger文档
  const config = new DocumentBuilder()
    .setTitle('管理后台')
    .setDescription('管理后台接口文档')
    .setVersion('1.0')
    .addBasicAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  // 这里转化为json文件，方便自动导入到Apifox中去
  fs.writeFileSync('./swagger.json', JSON.stringify(document));
  SwaggerModule.setup('api', app, document);
}
bootstrap();
