import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/user.entity';
import { SignInResponseDto } from '../dto/signin-response.dto';
import { TokenPayloadDto } from '../dto/token-payload.dto';
import { NotificationsService } from '../notifications/notifications.service';
export declare class AuthService {
    private usersService;
    private jwtService;
    private notificationsService;
    constructor(usersService: UsersService, jwtService: JwtService, notificationsService: NotificationsService);
    validateUser(validatedUser: User, pass: string): Promise<void>;
    signin(email: string, password: string): Promise<SignInResponseDto>;
    verify(token: string): Promise<any>;
    googleLogin(idToken: string, skipMfa?: boolean): Promise<{
        access_token: string;
        user: {
            id: number;
            username: string;
            email: string;
            full_name: string;
            avatar_url: string;
            role: string;
            provider: string;
            phone_number: string;
            address: string;
            points: number;
            minigame_tickets: any;
            status: boolean;
            lastFreeTicketClaim: any;
        };
        mfaRequired: boolean;
    } | {
        mfaRequired: boolean;
        message: string;
    }>;
    signinWithEmailMfa(email: string, password: string): Promise<{
        mfaRequired: boolean;
        message: string;
    }>;
    verifyMfaCode(email: string, code: string): Promise<{
        token: string;
        username: string;
        role: string;
    }>;
    signToken(payload: TokenPayloadDto): string;
    facebookLogin(accessToken: string, skipMfa?: boolean): Promise<{
        access_token: string;
        user: {
            id: number;
            username: string;
            email: string;
            full_name: string;
            avatar_url: string;
            role: string;
            provider: string;
            phone_number: string;
            address: string;
            points: number;
            minigame_tickets: any;
            status: boolean;
            lastFreeTicketClaim: any;
        };
        mfaRequired: boolean;
    } | {
        mfaRequired: boolean;
        message: string;
    }>;
    loginUser(user: User, skipMfa?: boolean): {
        access_token: string;
        user: {
            id: number;
            username: string;
            email: string;
            full_name: string;
            avatar_url: string;
            role: string;
            provider: string;
            phone_number: string;
            address: string;
            points: number;
            minigame_tickets: any;
            status: boolean;
            lastFreeTicketClaim: any;
        };
        mfaRequired: boolean;
    };
}
