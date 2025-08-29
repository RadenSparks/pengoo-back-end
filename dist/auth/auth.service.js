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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../users/users.service");
const bcrypt = require("bcrypt");
const jwt_1 = require("@nestjs/jwt");
const signin_response_dto_1 = require("../dto/signin-response.dto");
const admin = require("firebase-admin");
const notifications_service_1 = require("../notifications/notifications.service");
const node_fetch_1 = require("node-fetch");
let AuthService = class AuthService {
    usersService;
    jwtService;
    notificationsService;
    constructor(usersService, jwtService, notificationsService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.notificationsService = notificationsService;
    }
    async validateUser(validatedUser, pass) {
        const isPasswordMatched = await bcrypt.compare(pass, validatedUser.password);
        if (!isPasswordMatched) {
            throw new common_1.UnauthorizedException('Tên người dùng hoặc mật khẩu sai');
        }
    }
    async signin(email, password) {
        const user = await this.usersService.findByEmail(email);
        if (!user)
            throw new common_1.UnauthorizedException('Không tìm thấy người dùng');
        await this.validateUser(user, password);
        const payload = {
            email: user.email,
            sub: user.id,
            role: user.role,
            username: user.username,
            provider: user.provider
        };
        const token = this.signToken(payload);
        return new signin_response_dto_1.SignInResponseDto(token, user.username, user.role);
    }
    async verify(token) {
        try {
            const decoded = await this.jwtService.verify(token);
            return decoded;
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Thông tin xác thực không hợp lệ');
        }
    }
    async googleLogin(idToken, skipMfa = false) {
        try {
            if (!admin.apps.length) {
                const projectId = process.env.FIREBASE_PROJECT_ID;
                const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
                const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
                if (!projectId || !clientEmail || !privateKey) {
                    throw new common_1.InternalServerErrorException('Thiếu thông tin xác thực của quản trị viên Firebase');
                }
                admin.initializeApp({
                    credential: admin.credential.cert({
                        projectId,
                        clientEmail,
                        privateKey,
                    }),
                });
            }
            const decoded = await admin.auth().verifyIdToken(idToken);
            const email = decoded.email?.toLowerCase();
            const { name, picture, uid } = decoded;
            if (!email) {
                throw new common_1.UnauthorizedException('Email tài khoản Google bị thiếu');
            }
            let user = await this.usersService.findByEmail(email);
            if (user) {
                if (user.provider === 'local') {
                    return this.loginUser(user, skipMfa);
                }
            }
            else {
                user = await this.usersService.create({
                    username: decoded.uid,
                    password: Math.random().toString(36).slice(-8),
                    full_name: decoded.name ?? email ?? '',
                    email: email,
                    avatar_url: decoded.picture ?? '',
                    phone_number: '',
                    address: '',
                    role: 'user',
                    provider: 'google',
                });
            }
            if (skipMfa) {
                return this.loginUser(user, true);
            }
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            user.mfaCode = code;
            user.mfaCodeExpires = new Date(Date.now() + 5 * 60 * 1000);
            await this.usersService.update(user.id, user);
            await this.notificationsService.sendEmail(user.email, 'Pengoo - Mã xác nhận đăng nhập', `Mã xác nhận của bạn là: ${code}`, undefined, (0, notifications_service_1.pengooEmailTemplate)({
                title: 'Mã xác nhận đăng nhập',
                message: `Xin chào ${user.full_name || user.email},<br><br>
          Chúng tôi vừa nhận được yêu cầu đăng nhập vào tài khoản Pengoo của bạn. Vui lòng sử dụng mã bên dưới để xác thực đăng nhập.<br><br>
          Mã này sẽ hết hạn sau 5 phút. Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.`,
                code,
            }));
            return { mfaRequired: true, message: 'Vui lòng kiểm tra email để lấy mã xác nhận.' };
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Mã thông báo Google không hợp lệ');
        }
    }
    async signinWithEmailMfa(email, password) {
        const user = await this.usersService.findByEmail(email);
        if (!user)
            throw new common_1.UnauthorizedException('Không tìm thấy người dùng');
        const isPasswordMatched = await bcrypt.compare(password, user.password);
        if (!isPasswordMatched)
            throw new common_1.UnauthorizedException('Tên người dùng hoặc mật khẩu sai');
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        user.mfaCode = code;
        user.mfaCodeExpires = new Date(Date.now() + 5 * 60 * 1000);
        await this.usersService.update(user.id, user);
        await this.notificationsService.sendEmail(user.email, 'Pengoo - Mã xác nhận đăng nhập', `Mã xác nhận của bạn là: ${code}`, undefined, (0, notifications_service_1.pengooEmailTemplate)({
            title: 'Mã xác nhận đăng nhập',
            message: `Xin chào ${user.full_name || user.email},<br><br>
        Chúng tôi vừa nhận được yêu cầu đăng nhập vào tài khoản Pengoo của bạn. Vui lòng sử dụng mã bên dưới để xác thực đăng nhập.<br><br>
        Mã này sẽ hết hạn sau 5 phút. Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.`,
            code,
        }));
        return { mfaRequired: true, message: 'Vui lòng kiểm tra email để lấy mã xác nhận.' };
    }
    async verifyMfaCode(email, code) {
        const user = await this.usersService.findByEmail(email);
        if (user &&
            user.mfaCode === code &&
            user.mfaCodeExpires &&
            user.mfaCodeExpires > new Date()) {
            user.mfaCode = null;
            user.mfaCodeExpires = null;
            await this.usersService.update(user.id, user);
            const payload = {
                email: user.email,
                sub: user.id,
                role: user.role,
                username: user.username
            };
            const token = this.signToken(payload);
            return { token, username: user.username, role: user.role };
        }
        throw new common_1.UnauthorizedException('Mã không hợp lệ hoặc đã hết hạn');
    }
    signToken(payload) {
        return this.jwtService.sign(payload);
    }
    async facebookLogin(accessToken, skipMfa = false) {
        try {
            const fbRes = await (0, node_fetch_1.default)(`https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`);
            const fbData = await fbRes.json();
            if (!fbData.email) {
                throw new common_1.UnauthorizedException('Email tài khoản Facebook bị thiếu');
            }
            let user = await this.usersService.findByEmail(fbData.email);
            if (!user) {
                user = await this.usersService.create({
                    username: fbData.id,
                    password: Math.random().toString(36).slice(-8),
                    full_name: fbData.name ?? fbData.email ?? '',
                    email: fbData.email,
                    avatar_url: fbData.picture?.data?.url ?? '',
                    phone_number: '',
                    address: '',
                    role: 'user',
                });
            }
            if (skipMfa) {
                return this.loginUser(user, true);
            }
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            user.mfaCode = code;
            user.mfaCodeExpires = new Date(Date.now() + 5 * 60 * 1000);
            await this.usersService.update(user.id, user);
            await this.notificationsService.sendEmail(user.email, 'Pengoo - Mã xác nhận đăng nhập', `Mã xác nhận của bạn là: ${code}`, undefined, (0, notifications_service_1.pengooEmailTemplate)({
                title: 'Mã xác nhận đăng nhập',
                message: `Xin chào ${user.full_name || user.email},<br><br>
          Chúng tôi vừa nhận được yêu cầu đăng nhập vào tài khoản Pengoo của bạn. Vui lòng sử dụng mã bên dưới để xác thực đăng nhập.<br><br>
          Mã này sẽ hết hạn sau 5 phút. Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.`,
                code,
            }));
            return { mfaRequired: true, message: 'Vui lòng kiểm tra email để lấy mã xác nhận.' };
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Mã thông báo Facebook không hợp lệ');
        }
    }
    loginUser(user, skipMfa = false) {
        const payload = { sub: user.id, email: user.email, role: user.role };
        const access_token = this.jwtService.sign(payload);
        return {
            access_token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                full_name: user.full_name,
                avatar_url: user.avatar_url,
                role: user.role,
                provider: user.provider,
                phone_number: user.phone_number,
                address: user.address,
                points: user.points,
                minigame_tickets: user.minigame_tickets ?? 0,
                status: user.status,
                lastFreeTicketClaim: user.lastFreeTicketClaim ?? null,
            },
            mfaRequired: !skipMfa && !!user.mfaCode,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        notifications_service_1.NotificationsService])
], AuthService);
//# sourceMappingURL=auth.service.js.map