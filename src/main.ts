import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { Reflector } from '@nestjs/core';
import { Server } from 'http';


let cachedServer: Server;
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector));

  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:4000',
        'https://pengoo.vercel.app',
        'https://pg-dashboard-chi.vercel.app',
        'http://103.173.227.176:4000',
        'http://118.68.84.29:4000',
        'http://118.68.84.29:3001',
        'https://pengoo.store',
      ];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, origin); // <-- always reflect the request origin
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Swagger API')
    .setDescription('UI for API testing')
    .setVersion('1.0')
    .addTag('Playmaker')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'jwt', // this name is used later in @ApiBearerAuth('jwt')
    )
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger-api', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);

  console.log("-------------------------------------------");
  console.log("---| http://localhost:3000/swagger-api |---")
  console.log("-------------------------------------------");

}

bootstrap();
