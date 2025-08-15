"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = require("bcrypt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./user.entity");
const crypto_1 = require("crypto");
const cloudinary_service_1 = require("../services/cloudinary/cloudinary.service");
let UsersService = class UsersService {
    usersRepository;
    cloudinaryService;
    constructor(usersRepository, cloudinaryService) {
        this.usersRepository = usersRepository;
        this.cloudinaryService = cloudinaryService;
    }
    async create(createUserDto) {
        try {
            if (!createUserDto.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createUserDto.email)) {
                throw new common_1.InternalServerErrorException('Invalid email format');
            }
            const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
            let baseUsername = createUserDto.email.split('@')[0].trim().toLowerCase();
            let username = baseUsername;
            let counter = 1;
            while (await this.usersRepository.findOne({ where: { username } })) {
                username = `${baseUsername}${counter}`;
                counter++;
            }
            const existingUser = await this.usersRepository.findOne({ where: { email: createUserDto.email } });
            if (existingUser) {
                if (existingUser.provider === 'google' && (!createUserDto.provider || createUserDto.provider === 'local')) {
                    throw new common_1.BadRequestException('An account with this email already exists via Google. Please log in with Google.');
                }
            }
            const newUser = new user_entity_1.User();
            newUser.username = username;
            newUser.full_name = createUserDto.full_name;
            newUser.password = hashedPassword;
            newUser.email = createUserDto.email;
            newUser.phone_number = createUserDto.phone_number;
            newUser.avatar_url = createUserDto.avatar_url;
            newUser.address = createUserDto.address;
            newUser.role = createUserDto.role || 'user';
            newUser.status = true;
            newUser.provider = createUserDto.provider || 'local';
            return this.usersRepository.save(newUser);
        }
        catch (error) {
            console.error('User creation error:', error);
            throw new common_1.InternalServerErrorException('User registration failed');
        }
    }
    async findByUsername(accountUsername) {
        return await this.usersRepository.findOne({ where: { username: accountUsername } });
    }
    async findByEmail(email) {
        return await this.usersRepository.findOne({
            where: { email: email.toLowerCase() }
        });
    }
    async findById(userId) {
        return await this.usersRepository.findOne({ where: { id: userId } });
    }
    async setResetToken(email) {
        const user = await this.usersRepository.findOne({ where: { email } });
        if (!user)
            return null;
        user.resetPasswordToken = (0, crypto_1.randomBytes)(32).toString('hex');
        user.resetPasswordExpires = new Date(Date.now() + 1000 * 60 * 30);
        await this.usersRepository.save(user);
        return user;
    }
    async findByResetToken(token) {
        const user = await this.usersRepository.findOne({ where: { resetPasswordToken: token } });
        if (!user ||
            !user.resetPasswordExpires ||
            user.resetPasswordExpires.getTime() < Date.now()) {
            return null;
        }
        return user;
    }
    async resetPassword(token, newPassword) {
        const user = await this.findByResetToken(token);
        if (!user)
            return false;
        user.password = await bcrypt.hash(newPassword, 10);
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await this.usersRepository.save(user);
        return true;
    }
    async findAll() {
        return this.usersRepository.find();
    }
    async update(id, updateUserDto) {
        const user = await this.usersRepository.findOne({ where: { id } });
        if (!user)
            throw new Error('User not found');
        Object.assign(user, updateUserDto);
        return this.usersRepository.save(user);
    }
    async updateClient(id, updateUserDto, file) {
        const user = await this.usersRepository.findOne({ where: { id } });
        if (!user)
            throw new Error('User not found');
        if (file) {
            updateUserDto.avatar_url = (await this.cloudinaryService.uploadImage(file)).secure_url;
        }
        Object.assign(user, updateUserDto);
        return this.usersRepository.save(user);
    }
    async remove(id) {
        await this.usersRepository.delete(id);
    }
    async updatePassword(userId, dto) {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const isMatch = await bcrypt.compare(dto.oldPassword, user.password);
        if (!isMatch)
            throw new common_1.BadRequestException('Mật khẩu hiện tại không đúng');
        const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
        user.password = hashedPassword;
        await this.usersRepository.save(user);
        return { status: 200, message: "Đổi password thành công" };
    }
    async setStatus(id, status) {
        const user = await this.usersRepository.findOne({ where: { id } });
        if (!user)
            throw new Error('User not found');
        user.status = status;
        return this.usersRepository.save(user);
    }
    async adminResetPassword(id, newPassword) {
        const user = await this.usersRepository.findOne({ where: { id } });
        if (!user)
            throw new Error('User not found');
        user.password = await bcrypt.hash(newPassword, 10);
        return this.usersRepository.save(user);
    }
    async updateRole(id, role) {
        const user = await this.usersRepository.findOne({ where: { id } });
        if (!user)
            throw new Error('User not found');
        user.role = role;
        return this.usersRepository.save(user);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        cloudinary_service_1.CloudinaryService])
], UsersService);
//# sourceMappingURL=users.service.js.map