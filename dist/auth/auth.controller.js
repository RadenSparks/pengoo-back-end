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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const swagger_1 = require("@nestjs/swagger");
const signin_request_dto_1 = require("../dto/signin-request.dto");
const verify_request_dto_1 = require("../dto/verify-request.dto");
const users_service_1 = require("../users/users.service");
const notifications_service_1 = require("../notifications/notifications.service");
const jwt_auth_guard_1 = require("./jwt-auth.guard");
const roles_guard_1 = require("./roles.guard");
const public_decorator_1 = require("./public.decorator");
let AuthController = class AuthController {
    authService;
    usersService;
    notificationsService;
    constructor(authService, usersService, notificationsService) {
        this.authService = authService;
        this.usersService = usersService;
        this.notificationsService = notificationsService;
    }
    async signin(body) {
        if (!body.email)
            throw new common_1.BadRequestException('Vui lòng nhập email');
        if (!body.password)
            throw new common_1.BadRequestException('Vui lòng nhập mật khẩu');
        return this.authService.signinWithEmailMfa(body.email, body.password);
    }
    async verifyMfa(body) {
        if (!body.email || !body.code)
            throw new common_1.BadRequestException('Vui lòng nhập email và mã xác thực');
        return this.authService.verifyMfaCode(body.email, body.code);
    }
    async verify(body) {
        try {
            const decoded = await this.authService.verify(body.token);
            return { isValid: true, decoded };
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Thông tin xác thực không hợp lệ');
        }
    }
    async forgotPassword(email) {
        const user = await this.usersService.setResetToken(email);
        if (user) {
            await this.notificationsService.sendPasswordReset(user.email, user.resetPasswordToken);
        }
        return { message: 'Nếu email đã đăng ký, liên kết đặt lại mật khẩu đã được gửi.' };
    }
    async resetPassword(body) {
        const success = await this.usersService.resetPassword(body.token, body.newPassword);
        if (!success)
            throw new common_1.BadRequestException('Token không hợp lệ hoặc đã hết hạn');
        return { message: 'Mật khẩu đã được đặt lại thành công.' };
    }
    async googleLogin(body) {
        if (!body.idToken)
            throw new common_1.BadRequestException('Thiếu idToken');
        return this.authService.googleLogin(body.idToken, !!body.skipMfa);
    }
    async facebookLogin(body) {
        if (!body.accessToken)
            throw new common_1.BadRequestException('Thiếu accessToken');
        return this.authService.facebookLogin(body.accessToken, !!body.skipMfa);
    }
    async simpleLogin(body) {
        if (!body.email)
            throw new common_1.BadRequestException('Vui lòng nhập email');
        if (!body.password)
            throw new common_1.BadRequestException('Vui lòng nhập mật khẩu');
        return this.authService.signin(body.email, body.password);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('signin'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiBody)({
        type: signin_request_dto_1.SignInRequestDto,
        examples: {
            default: {
                summary: 'Đăng nhập bằng email và mật khẩu',
                value: {
                    email: 'user@example.com',
                    password: 'yourPassword123',
                },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [signin_request_dto_1.SignInRequestDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signin", null);
__decorate([
    (0, common_1.Post)('verify-mfa'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiBody)({
        schema: {
            example: {
                email: 'user@example.com',
                code: '123456'
            }
        }
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyMfa", null);
__decorate([
    (0, common_1.Post)('verify'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiBody)({
        type: verify_request_dto_1.VerifyRequestDto,
        examples: {
            default: {
                summary: 'Xác thực mã JWT',
                value: {
                    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verify_request_dto_1.VerifyRequestDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verify", null);
__decorate([
    (0, common_1.Post)('forgot-password'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiBody)({
        schema: {
            example: {
                email: 'user@example.com',
            },
        },
    }),
    __param(0, (0, common_1.Body)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, common_1.Post)('reset-password'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiBody)({
        schema: {
            example: {
                token: 'reset-token-from-email',
                newPassword: 'newSecurePassword123',
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Post)('google'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiBody)({
        schema: {
            example: { idToken: 'firebase-id-token', skipMfa: true }
        }
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "googleLogin", null);
__decorate([
    (0, common_1.Post)('facebook'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiBody)({
        schema: {
            example: { accessToken: 'facebook-access-token', skipMfa: true }
        }
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "facebookLogin", null);
__decorate([
    (0, common_1.Post)('simple-login'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiBody)({
        schema: {
            example: {
                email: 'user@example.com',
                password: 'yourPassword123',
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "simpleLogin", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('api/auth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        users_service_1.UsersService,
        notifications_service_1.NotificationsService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map