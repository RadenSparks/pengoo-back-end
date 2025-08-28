"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_jwt_1 = require("passport-jwt");
const users_service_1 = require("../users/users.service");
const config_1 = require("@nestjs/config");
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy) {
    usersService;
    configService;
    constructor(usersService, configService) {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get("JWT_SECRET"),
        });
        this.usersService = usersService;
        this.configService = configService;
    }
    async validate(payload) {
        console.log('JWT payload:', payload);
        const user = await this.usersService.findById(payload.sub);
        console.log('User found:', user);
        if (!user) {
            console.log('User not found!');
            throw new common_1.UnauthorizedException("Thông tin xác thực không hợp lệ");
        }
        if (user.role != payload.role) {
            console.log('Role mismatch:', user.role, payload.role);
        }
        if (user.email != payload.email) {
            console.log('Email mismatch:', user.email, payload.email);
        }
        if (user.id != payload.sub) {
            console.log('ID mismatch:', user.id, payload.sub);
        }
        if (user.role != payload.role || user.email != payload.email || user.id != payload.sub) {
            console.log('User data mismatch!', user, payload);
            throw new common_1.UnauthorizedException('Thông tin xác thực không hợp lệ');
        }
        return user;
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService, config_1.ConfigService])
], JwtStrategy);
//# sourceMappingURL=jwt.strategy.js.map