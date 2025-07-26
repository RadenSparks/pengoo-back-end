import { UsersService } from './users.service';
import { CreateUserDto } from './create-user.dto';
import { UpdateUserDto } from './update-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    register(createUserDto: CreateUserDto): Promise<import("./user.entity").User>;
    getAll(): Promise<import("./user.entity").User[]>;
    getById(id: number): Promise<import("./user.entity").User | null>;
    update(id: number, updateUserDto: UpdateUserDto): Promise<import("./user.entity").User>;
    remove(id: number): Promise<{
        message: string;
    }>;
    setStatus(id: number, status: boolean): Promise<import("./user.entity").User>;
    adminResetPassword(id: number, newPassword: string): Promise<import("./user.entity").User>;
    updateRole(id: number, role: string): Promise<import("./user.entity").User>;
    updatePassword(req: any, body: {
        oldPassword: string;
        newPassword: string;
    }): Promise<string>;
}
