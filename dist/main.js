"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("./auth/jwt-auth.guard");
const core_2 = require("@nestjs/core");
let cachedServer;
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
                'https://pengoo-admin.vercel.app',
                'http://103.173.227.176:4000/',
                'http://118.68.84.29:4000/',
                'http://118.68.84.29:3001/',
                'https://pengoo.store/',
            ];
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            }
            else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
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
async function handler(req, res) {
    if (!cachedServer) {
        const app = await core_1.NestFactory.create(app_module_1.AppModule, { bodyParser: false });
        await app.init();
        cachedServer = app.getHttpServer();
    }
    const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:4000',
        'https://pengoo.vercel.app',
        'https://pengoo-admin.vercel.app',
        'http://103.173.227.176:4000/',
        'http://118.68.84.29:4000/',
        'http://118.68.84.29:3001/',
        'https://pengoo.store/',
    ];
    const origin = req.headers.origin;
    if (!origin || allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin || '*');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', req.headers['access-control-request-headers'] || '*');
        if (req.method === 'OPTIONS') {
            res.statusCode = 204;
            res.end();
            return;
        }
    }
    cachedServer.emit('request', req, res);
}
bootstrap();
//# sourceMappingURL=main.js.map