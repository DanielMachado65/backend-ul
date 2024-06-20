import { INestApplication, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { json } from 'body-parser';
import * as helmet from 'helmet';
import { EnvService } from 'src/infrastructure/framework/env.service';
import * as packageJson from '../package.json';
import { AppModule } from './app.module';
import { statusMapper } from './infrastructure/framework/swagger/status-mapper';
import { setupRabbitMQOptions } from './infrastructure/messaging/rabbit-mq/rabbit-mq.options';

async function bootstrap(): Promise<void> {
  const app: INestApplication = await NestFactory.create<NestExpressApplication>(AppModule, { bodyParser: false });
  const envService: EnvService = app.get(EnvService);

  app.getHttpAdapter().getHttpServer().keepAliveTimeout = 365_000;

  try {
    const rabbitMQOptions: MicroserviceOptions = setupRabbitMQOptions(envService);
    app.connectMicroservice<MicroserviceOptions>(rabbitMQOptions);
  } catch (error) {
    if (envService.isDevEnv()) {
      console.log('RabbitMQ Error: ', error);
    } else {
      throw error;
    }
  }

  const description: string =
    packageJson.description +
    ' </br>' +
    'API nova: http://lb-api-olhonocarro-cluster-1048098859.sa-east-1.elb.amazonaws.com:3310/api </br>' +
    'API legada: http://lb-api-olhonocarro-cluster-1048098859.sa-east-1.elb.amazonaws.com:8080/api';

  const config: Omit<OpenAPIObject, 'paths'> = new DocumentBuilder()
    .setTitle(packageJson.name)
    .setDescription(description)
    .setVersion(packageJson.version)
    .setBasePath('/api')
    .addServer('/api')
    .build();

  const document: OpenAPIObject = SwaggerModule.createDocument(app, config);
  const mappedDocument: OpenAPIObject = statusMapper(document);
  SwaggerModule.setup('docs', app, mappedDocument);

  app.use(helmet());
  app.enableShutdownHooks();
  app.enableCors();
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
  });

  app.use(json({ limit: '5mb' }));

  console.log('Starting Microservices...');
  await app.startAllMicroservices();
  console.log('Microservices Started!');
  await app.listen(process.env.PORT);
}
bootstrap().finally();
