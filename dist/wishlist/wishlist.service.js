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
exports.WishlistService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const wishlist_entity_1 = require("./wishlist.entity");
const users_service_1 = require("../users/users.service");
const products_service_1 = require("../products/products.service");
const orders_service_1 = require("../orders/orders.service");
let WishlistService = class WishlistService {
    wishlistRepository;
    usersService;
    productsService;
    ordersService;
    constructor(wishlistRepository, usersService, productsService, ordersService) {
        this.wishlistRepository = wishlistRepository;
        this.usersService = usersService;
        this.productsService = productsService;
        this.ordersService = ordersService;
    }
    async addToWishlist(userId, productId) {
        const existing = await this.wishlistRepository.findOne({ where: { user: { id: userId }, product: { id: productId } } });
        if (existing)
            return existing;
        const user = await this.usersService.findById(userId);
        if (!user)
            throw new common_1.NotFoundException('Không tìm thấy người dùng');
        const product = await this.productsService.findById(productId);
        if (!product)
            throw new common_1.NotFoundException('Không tìm thấy sản phẩm');
        const wishlistItem = this.wishlistRepository.create({ user, product });
        return this.wishlistRepository.save(wishlistItem);
    }
    async removeFromWishlist(userId, productId) {
        const wishlistItem = await this.wishlistRepository.findOne({
            where: { user: { id: userId }, product: { id: productId }, movedToOrder: (0, typeorm_2.IsNull)() },
        });
        if (!wishlistItem)
            throw new common_1.NotFoundException('Không tìm thấy mục danh sách yêu thích');
        await this.wishlistRepository.remove(wishlistItem);
    }
    async viewWishlist(userId) {
        const items = await this.wishlistRepository.find({
            where: { user: { id: userId }, movedToOrder: (0, typeorm_2.IsNull)() },
            relations: ['product', 'product.images'],
            order: { createdAt: 'DESC' },
        });
        return items.map(item => {
            if (item.product && Array.isArray(item.product.images)) {
                item.product.images = item.product.images.filter(img => !img.deletedAt);
            }
            else if (item.product) {
                item.product.images = [];
            }
            return item;
        });
    }
    async moveWishlistToOrder(userId, orderId) {
        const order = await this.ordersService.findById(orderId);
        if (!order)
            throw new common_1.NotFoundException('Không tìm thấy đơn hàng');
        const wishlistItems = await this.wishlistRepository.find({
            where: { user: { id: userId }, movedToOrder: (0, typeorm_2.IsNull)() },
            relations: ['product'],
        });
        for (const item of wishlistItems) {
            item.movedToOrder = order;
            await this.wishlistRepository.save(item);
        }
        return { moved: wishlistItems.length };
    }
    async viewWishlistIds(userId) {
        const items = await this.wishlistRepository.find({
            where: { user: { id: userId }, movedToOrder: (0, typeorm_2.IsNull)() },
            relations: ['product'],
            select: ['product'],
        });
        return items.map(item => item.product.id);
    }
};
exports.WishlistService = WishlistService;
exports.WishlistService = WishlistService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(wishlist_entity_1.Wishlist)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        users_service_1.UsersService,
        products_service_1.ProductsService,
        orders_service_1.OrdersService])
], WishlistService);
//# sourceMappingURL=wishlist.service.js.map