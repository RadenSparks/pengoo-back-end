"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CouponsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const coupon_entity_1 = require("./coupon.entity");
const coupons_service_1 = require("./coupons.service");
const coupons_controller_1 = require("./coupons.controller");
const product_entity_1 = require("../products/entities/product.entity");
const user_entity_1 = require("../users/user.entity");
const user_coupon_entity_1 = require("./user-coupon.entity");
let CouponsModule = class CouponsModule {
};
exports.CouponsModule = CouponsModule;
exports.CouponsModule = CouponsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([coupon_entity_1.Coupon, product_entity_1.Product, user_entity_1.User, user_coupon_entity_1.UserCoupon])],
        providers: [coupons_service_1.CouponsService],
        controllers: [coupons_controller_1.CouponsController],
        exports: [coupons_service_1.CouponsService],
    })
], CouponsModule);
//# sourceMappingURL=coupons.module.js.map