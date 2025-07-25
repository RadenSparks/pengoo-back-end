import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './create-user.dto';
import { UpdateUserDto } from './update-user.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) { }

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      // Validate email format (simple check)
      if (!createUserDto.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createUserDto.email)) {
        throw new InternalServerErrorException('Invalid email format');
      }

      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      let baseUsername = createUserDto.email.split('@')[0].trim().toLowerCase();
      let username = baseUsername;
      let counter = 1;

      // Ensure username uniqueness
      while (await this.usersRepository.findOne({ where: { username } })) {
        username = `${baseUsername}${counter}`;
        counter++;
      }

      const newUser = new User();
      newUser.username = username;
      newUser.full_name = createUserDto.full_name;
      newUser.password = hashedPassword;
      newUser.email = createUserDto.email;
      newUser.phone_number = createUserDto.phone_number;
      newUser.avatar_url = createUserDto.avatar_url;
      newUser.address = createUserDto.address;
      newUser.role = createUserDto.role || 'USER';
      newUser.status = true;
      newUser.provider = createUserDto.provider || 'local'; // <-- Add this line

      return this.usersRepository.save(newUser);
    } catch (error) {
      // Log the actual error for debugging
      console.error('User creation error:', error);
      throw new InternalServerErrorException('User registration failed');
    }
  }

  async findByUsername(accountUsername: string): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { username: accountUsername } });
  }
  async findByEmail(accountUsername: string): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { email: accountUsername } });
  }

  async findById(userId: number): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { id: userId } });
  }

  async setResetToken(email: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) return null;
    user.resetPasswordToken = randomBytes(32).toString('hex');
    user.resetPasswordExpires = new Date(Date.now() + 1000 * 60 * 30); // 30 minutes
    await this.usersRepository.save(user);
    return user;
  }

  async findByResetToken(token: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({ where: { resetPasswordToken: token } });
    if (
      !user ||
      !user.resetPasswordExpires ||
      user.resetPasswordExpires.getTime() < Date.now()
    ) {
      return null;
    }
    return user;
  }

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const user = await this.findByResetToken(token);
    if (!user) return false;
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await this.usersRepository.save(user);
    return true;
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new Error('User not found');
    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }

  async updatePassword(userId: number, dto): Promise<string> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const isMatch = await bcrypt.compare(dto.oldPassword, user.password);
    if (!isMatch) throw new BadRequestException('Mật khẩu hiện tại không đúng');

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    user.password = hashedPassword;
    await this.usersRepository.save(user);

    return 'Password updated successfully';
  }
  async setStatus(id: number, status: boolean): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new Error('User not found');
    user.status = status;
    return this.usersRepository.save(user);
  }

  async adminResetPassword(id: number, newPassword: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new Error('User not found');
    user.password = await bcrypt.hash(newPassword, 10);
    return this.usersRepository.save(user);
  }

  async updateRole(id: number, role: string) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new Error('User not found');
    user.role = role;
    return this.usersRepository.save(user);
  }
}
