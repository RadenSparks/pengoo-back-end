import { Injectable, InternalServerErrorException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/user.entity';
import { SignInResponseDto } from '../dto/signin-response.dto';
import { TokenPayloadDto } from '../dto/token-payload.dto';
import * as admin from 'firebase-admin';
import { NotificationsService, pengooEmailTemplate } from '../notifications/notifications.service';
import fetch from 'node-fetch';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private notificationsService: NotificationsService,
  ) { }

  async validateUser(validatedUser: User, pass: string) {
    const isPasswordMatched = await bcrypt.compare(pass, validatedUser.password);
    if (!isPasswordMatched) {
      throw new UnauthorizedException('Tên người dùng hoặc mật khẩu sai');
    }
  }

  async signin(email: string, password: string): Promise<SignInResponseDto> {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Không tìm thấy người dùng');
    await this.validateUser(user, password);

    const payload: TokenPayloadDto = {
      email: user.email,
      sub: user.id,
      role: user.role,
      username: user.username,
      provider: user.provider
    };

    const token = this.signToken(payload);

    return new SignInResponseDto(token, user.username, user.role);
  }

  async verify(token: string): Promise<any> {
    try {
      const decoded = await this.jwtService.verify(token);
      return decoded;
    } catch (error) {
      throw new UnauthorizedException('Thông tin xác thực không hợp lệ');
    }
  }

  async googleLogin(idToken: string, skipMfa = false) {
    try {
      if (!admin.apps.length) {
        const projectId = process.env.FIREBASE_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
        if (!projectId || !clientEmail || !privateKey) {
          throw new InternalServerErrorException('Thiếu thông tin xác thực của quản trị viên Firebase');
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
        throw new UnauthorizedException('Email tài khoản Google bị thiếu');
      }
      let user = await this.usersService.findByEmail(email);

      if (user) {
        if (user.provider === 'local') {
          return this.loginUser(user, skipMfa);
        }
      } else {
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
      // --- MFA: Gửi mã xác nhận đến email, yêu cầu xác thực ---
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      user.mfaCode = code;
      user.mfaCodeExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 phút
      await this.usersService.update(user.id, user);
      await this.notificationsService.sendEmail(
        user.email,
        'Pengoo - Mã xác nhận đăng nhập',
        `Mã xác nhận của bạn là: ${code}`,
        undefined,
        pengooEmailTemplate({
          title: 'Mã xác nhận đăng nhập',
          message: `Xin chào ${user.full_name || user.email},<br><br>
          Chúng tôi vừa nhận được yêu cầu đăng nhập vào tài khoản Pengoo của bạn. Vui lòng sử dụng mã bên dưới để xác thực đăng nhập.<br><br>
          Mã này sẽ hết hạn sau 5 phút. Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.`,
          code,
        })
      );
      return { mfaRequired: true, message: 'Vui lòng kiểm tra email để lấy mã xác nhận.' };
    } catch (error) {
      throw new UnauthorizedException('Mã thông báo Google không hợp lệ');
    }
  }

  async signinWithEmailMfa(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Không tìm thấy người dùng');
    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if (!isPasswordMatched) throw new UnauthorizedException('Tên người dùng hoặc mật khẩu sai');

    // Tạo mã, lưu vào user, gửi email
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.mfaCode = code;
    user.mfaCodeExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 phút
    await this.usersService.update(user.id, user);
    await this.notificationsService.sendEmail(
      user.email,
      'Pengoo - Mã xác nhận đăng nhập',
      `Mã xác nhận của bạn là: ${code}`,
      undefined,
      pengooEmailTemplate({
        title: 'Mã xác nhận đăng nhập',
        message: `Xin chào ${user.full_name || user.email},<br><br>
        Chúng tôi vừa nhận được yêu cầu đăng nhập vào tài khoản Pengoo của bạn. Vui lòng sử dụng mã bên dưới để xác thực đăng nhập.<br><br>
        Mã này sẽ hết hạn sau 5 phút. Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.`,
        code,
      })
    );
    return { mfaRequired: true, message: 'Vui lòng kiểm tra email để lấy mã xác nhận.' };
  }

  async verifyMfaCode(email: string, code: string) {
    const user = await this.usersService.findByEmail(email);
    if (
      user &&
      user.mfaCode === code &&
      user.mfaCodeExpires &&
      user.mfaCodeExpires > new Date()
    ) {
      user.mfaCode = null;
      user.mfaCodeExpires = null;
      await this.usersService.update(user.id, user);
      const payload: TokenPayloadDto = {
        email: user.email,
        sub: user.id,
        role: user.role,
        username: user.username
      };
      const token = this.signToken(payload);
      return { token, username: user.username, role: user.role };
    }
    throw new UnauthorizedException('Mã không hợp lệ hoặc đã hết hạn');
  }

  signToken(payload: TokenPayloadDto): string {
    return this.jwtService.sign(payload);
  }

  async facebookLogin(accessToken: string, skipMfa = false) {
    try {
      const fbRes = await fetch(`https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`);
      const fbData: any = await fbRes.json();

      if (!fbData.email) {
        throw new UnauthorizedException('Email tài khoản Facebook bị thiếu');
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
      // --- MFA: Gửi mã xác nhận đến email, yêu cầu xác thực ---
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      user.mfaCode = code;
      user.mfaCodeExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 phút
      await this.usersService.update(user.id, user);
      await this.notificationsService.sendEmail(
        user.email,
        'Pengoo - Mã xác nhận đăng nhập',
        `Mã xác nhận của bạn là: ${code}`,
        undefined,
        pengooEmailTemplate({
          title: 'Mã xác nhận đăng nhập',
          message: `Xin chào ${user.full_name || user.email},<br><br>
          Chúng tôi vừa nhận được yêu cầu đăng nhập vào tài khoản Pengoo của bạn. Vui lòng sử dụng mã bên dưới để xác thực đăng nhập.<br><br>
          Mã này sẽ hết hạn sau 5 phút. Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.`,
          code,
        })
      );
      return { mfaRequired: true, message: 'Vui lòng kiểm tra email để lấy mã xác nhận.' };
    } catch (error) {
      throw new UnauthorizedException('Mã thông báo Facebook không hợp lệ');
    }
  }

  loginUser(user: User, skipMfa = false) {
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
        minigame_tickets: (user as any).minigame_tickets ?? 0,
        status: user.status,
        lastFreeTicketClaim: (user as any).lastFreeTicketClaim ?? null,
      },
      mfaRequired: !skipMfa && !!user.mfaCode,
    };
  }
}