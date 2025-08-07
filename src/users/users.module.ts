import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloudinaryService } from 'src/services/cloudinary/cloudinary.service';

@Module({
  providers: [UsersService, CloudinaryService],
  controllers: [UsersController],
  imports: [TypeOrmModule.forFeature([User])],
  exports: [UsersService]
})
export class UsersModule { }
