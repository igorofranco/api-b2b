import 'dotenv/config';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { configureApp } from './app.setup.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  configureApp(app);

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  console.log(`API no ar em http://localhost:${port}`);
}

await bootstrap();
