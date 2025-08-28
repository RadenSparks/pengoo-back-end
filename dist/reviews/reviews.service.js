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
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const review_entity_1 = require("./review.entity");
const users_service_1 = require("../users/users.service");
const products_service_1 = require("../products/products.service");
const order_entity_1 = require("../orders/order.entity");
let ReviewsService = class ReviewsService {
    reviewsRepository;
    usersService;
    productsService;
    ordersRepository;
    constructor(reviewsRepository, usersService, productsService, ordersRepository) {
        this.reviewsRepository = reviewsRepository;
        this.usersService = usersService;
        this.productsService = productsService;
        this.ordersRepository = ordersRepository;
    }
    async addReview(userId, productId, createReviewDto) {
        const user = await this.usersService.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException('Không tìm thấy người dùng');
        }
        const product = await this.productsService.findById(productId);
        if (!product) {
            throw new common_1.NotFoundException('Không tìm thấy sản phẩm');
        }
        let order;
        if (createReviewDto.orderId) {
            const foundOrder = await this.ordersRepository.findOne({ where: { id: createReviewDto.orderId } });
            if (!foundOrder || foundOrder.productStatus !== order_entity_1.ProductStatus.Delivered) {
                throw new common_1.BadRequestException('Bạn có thể để lại đánh giá sau khi đơn hàng được giao.');
            }
            order = foundOrder;
        }
        const review = this.reviewsRepository.create({
            rating: createReviewDto.rating,
            content: createReviewDto.content,
            user,
            product,
            order,
        });
        return this.reviewsRepository.save(review);
    }
    async updateReview(userId, reviewId, updateReviewDto) {
        const review = await this.reviewsRepository.findOne({ where: { id: reviewId, user: { id: userId } } });
        if (!review) {
            throw new common_1.NotFoundException('Không tìm thấy bài đánh giá');
        }
        review.rating = updateReviewDto.rating;
        review.content = updateReviewDto.content;
        return this.reviewsRepository.save(review);
    }
    async updateReviewStatus(reviewId, status) {
        const review = await this.reviewsRepository.findOne({ where: { id: reviewId } });
        if (!review) {
            throw new common_1.NotFoundException('Không tìm thấy bài đánh giá');
        }
        review.status = status;
        return this.reviewsRepository.save(review);
    }
    async deleteReview(userId, reviewId) {
        const review = await this.reviewsRepository.findOne({ where: { id: reviewId, user: { id: userId } } });
        if (!review) {
            throw new common_1.NotFoundException('Không tìm thấy bài đánh giá');
        }
        await this.reviewsRepository.remove(review);
    }
    async getProductReviews(productId) {
        return this.reviewsRepository.find({ where: { product: { id: productId } }, relations: ['user'] });
    }
    async getUserReviews(userId) {
        return this.reviewsRepository.find({
            where: { user: { id: userId } },
            relations: ['product'],
        });
    }
    async getAllReviews() {
        return this.reviewsRepository.find({
            relations: ['user', 'product'],
            order: { createdAt: 'ASC' },
        });
    }
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(review_entity_1.Review)),
    __param(3, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        users_service_1.UsersService,
        products_service_1.ProductsService,
        typeorm_2.Repository])
], ReviewsService);
//# sourceMappingURL=reviews.service.js.map