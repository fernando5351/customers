import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { TakumiConfig } from '@takumi/config';
import { ApiGatewayModule } from './api-gateway.module';

const API_PREFIX = 'api';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);
  const config = app.get(ConfigService<TakumiConfig>);
  const port = config.getOrThrow('port', { infer: true });
  const corsOrigins = config.getOrThrow('corsOrigins', { infer: true });

  app.setGlobalPrefix(API_PREFIX);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.enableCors({
    origin: corsOrigins.length ? corsOrigins : true,
    credentials: true,
  });

  await app.listen(port);
}

void bootstrap();
