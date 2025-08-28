import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../auth/permissions.decorator';
import { InjectRepository } from '@nestjs/typeorm';
import { RolePermission } from '../roles/role-permission.entity';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Role } from '../roles/role.entity';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(RolePermission)
    private rolePermissionRepo: Repository<RolePermission>,
    @InjectRepository(Role)
    private roleRepo: Repository<Role>,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: User = request.user;
    if (!user || !user.role) {
      throw new ForbiddenException('Không tìm thấy người dùng hoặc vai trò');
    }

    // If user.role is a string (role name or canonical), fetch the Role entity
    let roleEntity: Role | undefined;
    if (typeof user.role === 'string') {
      roleEntity = (await this.roleRepo.findOne({ where: [{ name: user.role }, { canonical: user.role }] })) || undefined;
    } else if (typeof user.role === 'object' && 'id' in user.role) {
      roleEntity = user.role as Role;
    }

    if (!roleEntity) {
      throw new ForbiddenException('Không tìm thấy vai trò');
    }

    // Get all permissions for the user's role
    const rolePermissions = await this.rolePermissionRepo.find({
      where: { role: { id: roleEntity.id } },
      relations: ['permission'],
    });
    const userPermissions = rolePermissions.map(rp => rp.permission.name);

    const hasPermission = requiredPermissions.every(p => userPermissions.includes(p));
    if (!hasPermission) {
      throw new ForbiddenException('Không đủ quyền');
    }
    return true;
  }
}