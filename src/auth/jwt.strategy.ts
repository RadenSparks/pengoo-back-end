import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import { TokenPayloadDto } from '../dto/token-payload.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService, private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("JWT_SECRET"),
    });
  }

  async validate(payload: TokenPayloadDto) {
    console.log('JWT payload:', payload);
    // FIX: Use findById instead of findByUsername
    const user = await this.usersService.findById(payload.sub);
    console.log('User found:', user);
    if (!user) {
      console.log('User not found!');
      throw new UnauthorizedException("Thông tin xác thực không hợp lệ");
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
      throw new UnauthorizedException('Thông tin xác thực không hợp lệ');
    }
    return user;
  }
}
