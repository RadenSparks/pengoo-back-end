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
exports.PermissionsGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const permissions_decorator_1 = require("../auth/permissions.decorator");
const typeorm_1 = require("@nestjs/typeorm");
const role_permission_entity_1 = require("../roles/role-permission.entity");
const typeorm_2 = require("typeorm");
const role_entity_1 = require("../roles/role.entity");
let PermissionsGuard = class PermissionsGuard {
    reflector;
    rolePermissionRepo;
    roleRepo;
    constructor(reflector, rolePermissionRepo, roleRepo) {
        this.reflector = reflector;
        this.rolePermissionRepo = rolePermissionRepo;
        this.roleRepo = roleRepo;
    }
    async canActivate(context) {
        const requiredPermissions = this.reflector.getAllAndOverride(permissions_decorator_1.PERMISSIONS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredPermissions || requiredPermissions.length === 0) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user || !user.role) {
            throw new common_1.ForbiddenException('Không tìm thấy người dùng hoặc vai trò');
        }
        let roleEntity;
        if (typeof user.role === 'string') {
            roleEntity = (await this.roleRepo.findOne({ where: [{ name: user.role }, { canonical: user.role }] })) || undefined;
        }
        else if (typeof user.role === 'object' && 'id' in user.role) {
            roleEntity = user.role;
        }
        if (!roleEntity) {
            throw new common_1.ForbiddenException('Không tìm thấy vai trò');
        }
        const rolePermissions = await this.rolePermissionRepo.find({
            where: { role: { id: roleEntity.id } },
            relations: ['permission'],
        });
        const userPermissions = rolePermissions.map(rp => rp.permission.name);
        const hasPermission = requiredPermissions.every(p => userPermissions.includes(p));
        if (!hasPermission) {
            throw new common_1.ForbiddenException('Không đủ quyền');
        }
        return true;
    }
};
exports.PermissionsGuard = PermissionsGuard;
exports.PermissionsGuard = PermissionsGuard = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(role_permission_entity_1.RolePermission)),
    __param(2, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __metadata("design:paramtypes", [core_1.Reflector,
        typeorm_2.Repository,
        typeorm_2.Repository])
], PermissionsGuard);
//# sourceMappingURL=permissions.guard.js.map