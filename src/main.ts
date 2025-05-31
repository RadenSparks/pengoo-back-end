import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Swagger API')
    .setDescription('UI for API testing')
    .setVersion('1.0')
    .addTag('Dick')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger-api', app, documentFactory);
  

  await app.listen(process.env.PORT ?? 3000);

  console.log("-------------------------------------------");
  console.log("---| http://localhost:3000/swagger-api |---")
  console.log("-------------------------------------------");
  
}
bootstrap();
