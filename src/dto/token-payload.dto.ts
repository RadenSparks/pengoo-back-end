export class TokenPayloadDto {
    sub: number; // User ID
    email: string; // User email
    role: string; // Array of roles assigned to the user
    username: string; // Username of the user
    provider?: string;
}