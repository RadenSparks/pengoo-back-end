import { Body, Controller, Post, BadRequestException, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBody } from '@nestjs/swagger';
import { SignInRequestDto } from '../dto/signin-request.dto';
import { VerifyRequestDto } from '../dto/verify-request.dto';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { Public } from './public.decorator';

@Controller('api/auth')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
  ) { }

  @Post('signin')
  @Public()
  @ApiBody({
    type: SignInRequestDto,
    examples: {
      default: {
        summary: 'Đăng nhập bằng email và mật khẩu',
        value: {
          email: 'user@example.com',
          password: 'yourPassword123',
        },
      },
    },
  })
  async signin(@Body() body: SignInRequestDto) {
    if (!body.email) throw new BadRequestException('Vui lòng nhập email');
    if (!body.password) throw new BadRequestException('Vui lòng nhập mật khẩu');
    // Gửi mã xác thực đến email nếu mật khẩu đúng
    return this.authService.signinWithEmailMfa(body.email, body.password);
  }

  @Post('verify-mfa')
  @Public()
  @ApiBody({
    schema: {
      example: {
        email: 'user@example.com',
        code: '123456'
      }
    }
  })
  async verifyMfa(@Body() body: { email: string; code: string }) {
    if (!body.email || !body.code) throw new BadRequestException('Vui lòng nhập email và mã xác thực');
    return this.authService.verifyMfaCode(body.email, body.code);
  }

  @Post('verify')
  @Public()
  @ApiBody({
    type: VerifyRequestDto,
    examples: {
      default: {
        summary: 'Xác thực mã JWT',
        value: {
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  async verify(@Body() body: VerifyRequestDto) {
    try {
      const decoded = await this.authService.verify(body.token);
      return { isValid: true, decoded };
    } catch (error) {
      throw new UnauthorizedException('Thông tin xác thực không hợp lệ');
    }
  }

  @Post('forgot-password')
  @Public()
  @ApiBody({
    schema: {
      example: {
        email: 'user@example.com',
      },
    },
  })
  async forgotPassword(@Body('email') email: string) {
    const user = await this.usersService.setResetToken(email);
    if (user) {
      await this.notificationsService.sendPasswordReset(user.email, user.resetPasswordToken!);
    }
    // Luôn trả về thành công để tránh dò email
    return { message: 'Nếu email đã đăng ký, liên kết đặt lại mật khẩu đã được gửi.' };
  }

  @Post('reset-password')
  @Public()
  @ApiBody({
    schema: {
      example: {
        token: 'reset-token-from-email',
        newPassword: 'newSecurePassword123',
      },
    },
  })
  async resetPassword(@Body() body: { token: string; newPassword: string }) {
    const success = await this.usersService.resetPassword(body.token, body.newPassword);
    if (!success) throw new BadRequestException('Token không hợp lệ hoặc đã hết hạn');
    return { message: 'Mật khẩu đã được đặt lại thành công.' };
  }

  @Post('google')
  @Public()
  @ApiBody({
    schema: {
      example: { idToken: 'firebase-id-token', skipMfa: true }
    }
  })
  async googleLogin(@Body() body: { idToken: string; skipMfa?: boolean }) {
    if (!body.idToken) throw new BadRequestException('Thiếu idToken');
    return this.authService.googleLogin(body.idToken, !!body.skipMfa);
  }

  @Post('facebook')
  @Public()
  @ApiBody({
    schema: {
      example: { accessToken: 'facebook-access-token', skipMfa: true }
    }
  })
  async facebookLogin(@Body() body: { accessToken: string; skipMfa?: boolean }) {
    if (!body.accessToken) throw new BadRequestException('Thiếu accessToken');
    return this.authService.facebookLogin(body.accessToken, !!body.skipMfa);
  }

  @Post('simple-login')
  @Public()
  @ApiBody({
    schema: {
      example: {
        email: 'user@example.com',
        password: 'yourPassword123',
      },
    },
  })
  async simpleLogin(@Body() body: { email: string; password: string }) {
    if (!body.email) throw new BadRequestException('Vui lòng nhập email');
    if (!body.password) throw new BadRequestException('Vui lòng nhập mật khẩu');
    // Không gửi mã xác thực, chỉ kiểm tra và trả về token
    return this.authService.signin(body.email, body.password);
  }
}