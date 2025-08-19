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
exports.Product = void 0;
const typeorm_1 = require("typeorm");
const category_entity_1 = require("../categories/category.entity");
const review_entity_1 = require("../reviews/review.entity");
const wishlist_entity_1 = require("../wishlist/wishlist.entity");
const publisher_entity_1 = require("../publishers/entities/publisher.entity");
const tag_entity_1 = require("../tags/entities/tag.entity");
const image_entity_1 = require("../images/entities/image.entity");
const collection_entity_1 = require("../collections/collection.entity");
const cms_content_entity_1 = require("../cms-content/cms-content.entity");
let Product = class Product {
    id;
    product_name;
    description;
    product_price;
    slug;
    status;
    discount;
    meta_title;
    meta_description;
    quantity_sold;
    quantity_stock;
    category_ID;
    publisher_ID;
    tags;
    reviews;
    wishlists;
    images;
    collection;
    created_at;
    updated_at;
    cmsContent;
    deletedAt;
};
exports.Product = Product;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Product.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", String)
], Product.prototype, "product_name", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: false }),
    __metadata("design:type", String)
], Product.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { nullable: false }),
    __metadata("design:type", Number)
], Product.prototype, "product_price", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", String)
], Product.prototype, "slug", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", String)
], Product.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", Number)
], Product.prototype, "discount", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", String)
], Product.prototype, "meta_title", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", String)
], Product.prototype, "meta_description", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", Number)
], Product.prototype, "quantity_sold", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", Number)
], Product.prototype, "quantity_stock", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => category_entity_1.Category, (category) => category.products),
    __metadata("design:type", category_entity_1.Category)
], Product.prototype, "category_ID", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => publisher_entity_1.Publisher, (publisher) => publisher.products),
    __metadata("design:type", publisher_entity_1.Publisher)
], Product.prototype, "publisher_ID", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => tag_entity_1.Tag, (tag) => tag.products, { cascade: true }),
    (0, typeorm_1.JoinTable)(),
    __metadata("design:type", Array)
], Product.prototype, "tags", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => review_entity_1.Review, review => review.product),
    __metadata("design:type", Array)
], Product.prototype, "reviews", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => wishlist_entity_1.Wishlist, wishlist => wishlist.product),
    __metadata("design:type", Array)
], Product.prototype, "wishlists", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => image_entity_1.Image, (image) => image.product, { cascade: true }),
    __metadata("design:type", Array)
], Product.prototype, "images", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => collection_entity_1.Collection, (collection) => collection.products, { onDelete: 'SET NULL' }),
    __metadata("design:type", Object)
], Product.prototype, "collection", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], Product.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true, default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], Product.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => cms_content_entity_1.CmsContent, cmsContent => cmsContent.product, { cascade: true, eager: true }),
    __metadata("design:type", cms_content_entity_1.CmsContent)
], Product.prototype, "cmsContent", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({ nullable: true }),
    __metadata("design:type", Date)
], Product.prototype, "deletedAt", void 0);
exports.Product = Product = __decorate([
    (0, typeorm_1.Entity)('product')
], Product);
//# sourceMappingURL=product.entity.js.map