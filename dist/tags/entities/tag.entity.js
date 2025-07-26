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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tag = void 0;
const class_transformer_1 = require("class-transformer");
const product_entity_1 = require("../../products/product.entity");
const typeorm_1 = require("typeorm");
let Tag = class Tag {
    id;
    name;
    type;
    products;
};
exports.Tag = Tag;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Tag.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Tag.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'defaultType' }),
    __metadata("design:type", String)
], Tag.prototype, "type", void 0);
__decorate([
    (0, class_transformer_1.Exclude)(),
    (0, typeorm_1.ManyToMany)(() => product_entity_1.Product, (product) => product.tags, {
        eager: false,
    }),
    __metadata("design:type", Array)
], Tag.prototype, "products", void 0);
exports.Tag = Tag = __decorate([
    (0, typeorm_1.Entity)('tag')
], Tag);
//# sourceMappingURL=tag.entity.js.map