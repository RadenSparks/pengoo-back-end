"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectionsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const collections_service_1 = require("./collections.service");
const collections_controller_1 = require("./collections.controller");
const collection_entity_1 = require("./collection.entity");
const product_entity_1 = require("../products/entities/product.entity");
const coupons_module_1 = require("../coupons/coupons.module");
let CollectionsModule = class CollectionsModule {
};
exports.CollectionsModule = CollectionsModule;
exports.CollectionsModule = CollectionsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([collection_entity_1.Collection, product_entity_1.Product]),
            coupons_module_1.CouponsModule,
        ],
        providers: [collections_service_1.CollectionsService],
        controllers: [collections_controller_1.CollectionsController],
        exports: [collections_service_1.CollectionsService],
    })
], CollectionsModule);
//# sourceMappingURL=collections.module.js.map