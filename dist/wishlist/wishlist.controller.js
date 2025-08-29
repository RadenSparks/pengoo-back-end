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
exports.WishlistController = void 0;
const common_1 = require("@nestjs/common");
const wishlist_service_1 = require("./wishlist.service");
const swagger_1 = require("@nestjs/swagger");
let WishlistController = class WishlistController {
    wishlistService;
    constructor(wishlistService) {
        this.wishlistService = wishlistService;
    }
    addToWishlist(body, productId) {
        const userId = Number(body.userId);
        const prodId = Number(productId);
        if (!body || isNaN(userId) || isNaN(prodId)) {
            throw new common_1.BadRequestException('userId và productId là bắt buộc và phải là số');
        }
        return this.wishlistService.addToWishlist(userId, prodId);
    }
    removeFromWishlist(body, productId) {
        const userId = Number(body.userId);
        if (!body || isNaN(userId)) {
            throw new common_1.BadRequestException('userId là bắt buộc và phải là số');
        }
        return this.wishlistService.removeFromWishlist(userId, Number(productId));
    }
    async viewWishlist(userId) {
        const items = await this.wishlistService.viewWishlist(Number(userId));
        return items.map(item => {
            const product = item.product;
            const imagesArr = Array.isArray(product.images)
                ? product.images.filter((img) => !img.deletedAt)
                : [];
            let mainImage = '';
            if (imagesArr.length > 0) {
                const mainImgObj = imagesArr.find((img) => img.name === 'main');
                mainImage = mainImgObj?.url || imagesArr[0]?.url || '';
            }
            return {
                ...item,
                product: {
                    ...product,
                    image: mainImage,
                    images: imagesArr,
                },
            };
        });
    }
    async moveToOrder(body, orderId) {
        const userId = Number(body.userId);
        if (!body || isNaN(userId)) {
            throw new common_1.BadRequestException('userId là bắt buộc và phải là số');
        }
        return this.wishlistService.moveWishlistToOrder(userId, Number(orderId));
    }
};
exports.WishlistController = WishlistController;
__decorate([
    (0, common_1.Post)(':productId'),
    (0, swagger_1.ApiOperation)({ summary: 'Add product to wishlist' }),
    (0, swagger_1.ApiParam)({ name: 'productId', type: Number, required: true }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                userId: { type: 'number', example: 1 },
            },
            required: ['userId'],
        },
        examples: {
            user: {
                summary: 'Add to wishlist',
                value: { userId: 1 },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Param)('productId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], WishlistController.prototype, "addToWishlist", null);
__decorate([
    (0, common_1.Delete)(':productId'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove product from wishlist' }),
    (0, swagger_1.ApiParam)({ name: 'productId', type: Number, required: true }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                userId: { type: 'number', example: 1 },
            },
            required: ['userId'],
        },
        examples: {
            user: {
                summary: 'Remove from wishlist',
                value: { userId: 1 },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Param)('productId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], WishlistController.prototype, "removeFromWishlist", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'View wishlist' }),
    (0, swagger_1.ApiQuery)({ name: 'userId', type: Number, required: true }),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], WishlistController.prototype, "viewWishlist", null);
__decorate([
    (0, common_1.Post)('move-to-order/:orderId'),
    (0, swagger_1.ApiOperation)({ summary: 'Move wishlist items to order' }),
    (0, swagger_1.ApiParam)({ name: 'orderId', type: Number, required: true }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                userId: { type: 'number', example: 1 },
            },
            required: ['userId'],
        },
        examples: {
            user: {
                summary: 'Move to order',
                value: { userId: 1 },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Param)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], WishlistController.prototype, "moveToOrder", null);
exports.WishlistController = WishlistController = __decorate([
    (0, swagger_1.ApiTags)('Wishlist'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('wishlist'),
    __metadata("design:paramtypes", [wishlist_service_1.WishlistService])
], WishlistController);
//# sourceMappingURL=wishlist.controller.js.map