import { Controller, Post, Body, Get, Param, Put, Delete, UseGuards, Patch, Req, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './create-user.dto';
import { UpdateUserDto } from './update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
// import { Roles } from '../auth/roles.decorator';
// import { RolesGuard } from '../auth/roles.guard';
import { Public } from '../auth/public.decorator';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('users')
// Temporarily remove RolesGuard for dashboard management endpoints
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService
  ) { }

  @Post('register')
  @Public()
  async register(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  // @Roles('admin', 'editor')
  @Public()
  async getAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  // @Roles('admin', 'editor', 'viewer')
  @Public()
  async getById(@Param('id') id: number) {
    return this.usersService.findById(Number(id));
  }

  @Put('update/:id')
  @UseInterceptors(FileInterceptor('avatar_url'))
  @Public()
  async update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto, @UploadedFile() file: Express.Multer.File) {
    return this.usersService.updateClient(Number(id), updateUserDto, file);
  }

  @Delete(':id')
  // @Roles('admin')
  @Public()
  async remove(@Param('id') id: number) {
    await this.usersService.remove(Number(id));
    return { message: 'User deleted' };
  }

  @Patch(':id/status')
  // @Roles('admin', 'editor')
  @Public()
  async setStatus(@Param('id') id: number, @Body('status') status: boolean) {
    return this.usersService.setStatus(Number(id), status);
  }

  @Patch(':id/reset-password')
  // @Roles('admin')
  @Public()
  async adminResetPassword(
    @Param('id') id: number,
    @Body('newPassword') newPassword: string
  ) {
    return this.usersService.adminResetPassword(Number(id), newPassword);
  }

  @Patch(':id/role')
  // @Roles('admin')
  @ApiBody({
    schema: {
      example: {
        role: 'editor'
      }
    },
    description: 'Set the new role for the user. Example roles: admin, editor, viewer, user'
  })
  @Public()
  async updateRole(
    @Param('id') id: number,
    @Body('role') role: string
  ) {
    return this.usersService.updateRole(Number(id), role);
  }

  @Patch('updatePassword')
  @ApiBody({
    schema: {
      example: {
        oldPassword: 'current_password',
        newPassword: 'new_password'
      }
    },
    description: 'Update password: requires oldPassword and newPassword'
  })
  async updatePassword(
    @Req() req,
    @Body() body: { oldPassword: string, newPassword: string }
  ) {
    return this.usersService.updatePassword(req.user.id, body);
  }
}