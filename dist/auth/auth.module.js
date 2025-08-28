"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const auth_service_1 = require("./auth.service");
const users_module_1 = require("../users/users.module");
const jwt_strategy_1 = require("./jwt.strategy");
const auth_controller_1 = require("./auth.controller");
const notifications_module_1 = require("../notifications/notifications.module");
const typeorm_1 = require("@nestjs/typeorm");
const role_permission_entity_1 = require("../roles/role-permission.entity");
const permission_entity_1 = require("../roles/permission.entity");
const role_entity_1 = require("../roles/role.entity");
const permissions_guard_1 = require("../auth/permissions.guard");
const config_1 = require("@nestjs/config");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            users_module_1.UsersModule,
            passport_1.PassportModule,
            notifications_module_1.NotificationsModule,
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: async (configService) => ({
                    secret: configService.get('JWT_SECRET'),
                    signOptions: { expiresIn: '600h' },
                }),
            }),
            typeorm_1.TypeOrmModule.forFeature([role_permission_entity_1.RolePermission, permission_entity_1.Permission, role_entity_1.Role]),
        ],
        providers: [auth_service_1.AuthService, jwt_strategy_1.JwtStrategy, permissions_guard_1.PermissionsGuard],
        exports: [auth_service_1.AuthService, permissions_guard_1.PermissionsGuard],
        controllers: [auth_controller_1.AuthController],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map