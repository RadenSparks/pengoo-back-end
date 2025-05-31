import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInRequestDto } from 'src/dto/signin-request.dto';
import { VerifyRequestDto } from 'src/dto/verify-request.dto';

@Controller('api/auth')
export class AuthController {

    constructor(private readonly authService: AuthService) { }

    @Post('signin')
    async signin(@Body() body: SignInRequestDto) {
        return this.authService.signin(body.username, body.password);
    }

    @Post('verify')
    async verify(@Body() body: VerifyRequestDto) {
        try {
            const decoded = await this.authService.verify(body.token);
            return { isValid: true, decoded };
        } catch (error) {
            throw new UnauthorizedException('Invalid credentials');
        }
    }
}
