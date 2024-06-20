/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { repl } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  await repl(AppModule);
}
bootstrap();
