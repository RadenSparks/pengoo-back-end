export class SignInResponseDto {
    access_token: string;
    username: string;
    role: string;

    constructor(access_token: string, username: string, role: string) {
        this.access_token = access_token;
        this.username = username;
        this.role = role;
    }   
}