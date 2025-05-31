import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) { }

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      const newUser = new User();

      newUser.username = createUserDto.username;
      newUser.full_name = createUserDto.full_name;
      newUser.password = hashedPassword;
      newUser.email = createUserDto.email;
      newUser.phone_number = createUserDto.phone_number;
      newUser.avatar_url = createUserDto.avatar_url;
      newUser.address = createUserDto.address;
      newUser.role = createUserDto.role || 'USER';
      newUser.status = true;
      return this.usersRepository.save(newUser);
    } catch (error) {
      throw new InternalServerErrorException('User registration failed');
    }
  }

  async findByUsername(accountUsername: string): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { username: accountUsername } });
  }

  async findById(userId: number): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { id: userId } });
  }

  // async update(id: number, updateUserDto: UpdateUserDto): Promise<void> {
  //   const { password, profile } = updateUserDto;
  //   const hashedPassword = password
  //     ? await bcrypt.hash(password, 10)
  //     : undefined;
  //   await this.usersRepository.update(id, {
  //     ...(password && { password: hashedPassword }),
  //     ...(profile && { profile }),
  //   });
  // }

  // async remove(id: number): Promise<void> {
  //   await this.usersRepository.delete(id);
  // }
}
