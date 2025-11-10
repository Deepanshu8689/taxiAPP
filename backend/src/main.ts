import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
const cookieParser = require('cookie-parser')
import * as dotenv from 'dotenv';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  dotenv.config();
  app.use('/payment/webhook', express.raw({type: 'application/json'}))
  // console.log("port: ", process.env.PORT)
  app.use(cookieParser())
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true
  }))
  app.enableCors({
    origin: "http://localhost:5173", // React dev server
    credentials: true,
  });

  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));
  await app.listen(process.env.PORT ?? 4000);
  console.log("Server started on port: ", process.env.PORT ?? 4000)
}
bootstrap();
