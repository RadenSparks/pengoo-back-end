import { AuthService } from './auth.service';
import { SignInRequestDto } from '../dto/signin-request.dto';
import { VerifyRequestDto } from '../dto/verify-request.dto';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';
export declare class AuthController {
    private readonly authService;
    private readonly usersService;
    private readonly notificationsService;
    constructor(authService: AuthService, usersService: UsersService, notificationsService: NotificationsService);
    signin(body: SignInRequestDto): Promise<{
        mfaRequired: boolean;
        message: string;
    }>;
    verifyMfa(body: {
        email: string;
        code: string;
    }): Promise<{
        token: string;
        username: string;
        role: string;
    }>;
    verify(body: VerifyRequestDto): Promise<{
        isValid: boolean;
        decoded: any;
    }>;
    forgotPassword(email: string): Promise<{
        message: string;
    }>;
    resetPassword(body: {
        token: string;
        newPassword: string;
    }): Promise<{
        message: string;
    }>;
    googleLogin(body: {
        idToken: string;
        skipMfa?: boolean;
    }): Promise<{
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
    facebookLogin(body: {
        accessToken: string;
        skipMfa?: boolean;
    }): Promise<{
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
    simpleLogin(body: {
        email: string;
        password: string;
    }): Promise<import("../dto/signin-response.dto").SignInResponseDto>;
}
