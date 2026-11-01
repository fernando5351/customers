import 'reflect-metadata';
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { tcpMicroserviceOptions } from '@takumi/common';
import { readAppConfig } from '@takumi/config';
import { CustomersModule } from './customers.module';

async function bootstrap() {
  const { http, tcp } = readAppConfig();

  const app = await NestFactory.create(CustomersModule);

  app.connectMicroservice(tcpMicroserviceOptions(tcp.host, tcp.customersPort));

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Customers Service API')
    .setDescription(
      [
        'Own contract documentation for the customers microservice.',
        '',
        'This service owns customer fiscal profiles, identifications, customer-company links and tax role catalog assignments.',
      ].join('\n'),
    )
    .setVersion('0.1.0')
    .addServer('/', 'Customers service')
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('docs', app, swaggerDocument, {
    jsonDocumentUrl: 'docs-json',
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  await app.startAllMicroservices();
  await app.listen(http.customersPort);
}

void bootstrap();
