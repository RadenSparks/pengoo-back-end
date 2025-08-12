"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("./auth/jwt-auth.guard");
const core_2 = require("@nestjs/core");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const reflector = app.get(core_2.Reflector);
    app.useGlobalGuards(new jwt_auth_guard_1.JwtAuthGuard(reflector));
    app.enableCors({
        origin: (origin, callback) => {
            const allowedOrigins = [
                'http://localhost:3000',
                'http://localhost:3001',
                'http://localhost:4000',
                'https://pengoo.vercel.app',
                'https://pg-dashboard-chi.vercel.app',
                'https://pengoo.store',
            ];
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            }
            else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    });
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Swagger API')
        .setDescription('UI for API testing')
        .setVersion('1.0')
        .addTag('Playmaker')
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
    }, 'jwt')
        .build();
    const documentFactory = () => swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('swagger-api', app, documentFactory);
    await app.listen(process.env.PORT ?? 3000);
    console.log("-------------------------------------------");
    console.log("---| http://localhost:3000/swagger-api |---");
    console.log("-------------------------------------------");
}
bootstrap();
//# sourceMappingURL=main.js.map