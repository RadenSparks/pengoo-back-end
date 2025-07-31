import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './create-user.dto';
import { UpdateUserDto } from './update-user.dto';
export declare class UsersService {
    private usersRepository;
    constructor(usersRepository: Repository<User>);
    create(createUserDto: CreateUserDto): Promise<User>;
    findByUsername(accountUsername: string): Promise<User | null>;
    findByEmail(accountUsername: string): Promise<User | null>;
    findById(userId: number): Promise<User | null>;
    setResetToken(email: string): Promise<User | null>;
    findByResetToken(token: string): Promise<User | null>;
    resetPassword(token: string, newPassword: string): Promise<boolean>;
    findAll(): Promise<User[]>;
    update(id: number, updateUserDto: UpdateUserDto): Promise<User>;
    remove(id: number): Promise<void>;
    updatePassword(userId: number, dto: any): Promise<{
        status: number;
        message: string;
    }>;
    setStatus(id: number, status: boolean): Promise<User>;
    adminResetPassword(id: number, newPassword: string): Promise<User>;
    updateRole(id: number, role: string): Promise<User>;
}
