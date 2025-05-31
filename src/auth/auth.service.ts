import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/user.entity';
import { SignInResponseDto } from '../dto/signin-response.dto';
import { TokenPayloadDto } from 'src/dto/token-payload.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(validatedUser: User, pass: string) {
    const isPasswordMatched = await bcrypt.compare(pass, validatedUser.password);
    if(!isPasswordMatched){
      throw new UnauthorizedException('Wrong username or password');
    }
  }

  async signin(username: string, password: string) : Promise<SignInResponseDto> {
    try{
      const user = await this.usersService.findByUsername(username);
      if(!user){
        throw new UnauthorizedException('User not found');
      }
  
      await this.validateUser(user, password);
  
      const payload : TokenPayloadDto = { email: user.email, sub: user.id, role: user.role, username: user.username };
      return new SignInResponseDto(this.jwtService.sign(payload), user.username, user.role);
    }catch (error) {
      throw new InternalServerErrorException('User not found');
    }    
  }

  async verify(token: string): Promise<any> {
    try {
      const decoded = await this.jwtService.verify(token);
      return decoded;
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }
}
