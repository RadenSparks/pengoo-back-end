import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './review.entity';
import { CreateReviewDto } from './create-review.dto';
import { UpdateReviewDto } from './update-review.dto';
import { UsersService } from '../users/users.service';
import { ProductsService } from '../products/products.service';
import { Order, ProductStatus } from '../orders/order.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewsRepository: Repository<Review>,
    private usersService: UsersService,
    private productsService: ProductsService,
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
  ) { }

  async addReview(userId: number, productId: number, createReviewDto: CreateReviewDto): Promise<Review> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    const product = await this.productsService.findById(productId);
    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }

    let order: Order | undefined;
    if (createReviewDto.orderId) {
      const foundOrder = await this.ordersRepository.findOne({ where: { id: createReviewDto.orderId } });
      if (!foundOrder || foundOrder.productStatus !== ProductStatus.Delivered) {
        throw new BadRequestException('Bạn có thể để lại đánh giá sau khi đơn hàng được giao.');
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

  async updateReview(userId: number, reviewId: number, updateReviewDto: UpdateReviewDto): Promise<Review> {
    const review = await this.reviewsRepository.findOne({ where: { id: reviewId, user: { id: userId } } });
    if (!review) {
      throw new NotFoundException('Không tìm thấy bài đánh giá');
    }

    review.rating = updateReviewDto.rating;
    review.content = updateReviewDto.content;
    return this.reviewsRepository.save(review);
  }

  async updateReviewStatus(reviewId: number, status: 'Visible' | 'Hidden'): Promise<Review> {
    const review = await this.reviewsRepository.findOne({ where: { id: reviewId } });
    if (!review) {
      throw new NotFoundException('Không tìm thấy bài đánh giá');
    }
    review.status = status;
    return this.reviewsRepository.save(review);
  }

  async deleteReview(userId: number, reviewId: number): Promise<void> {
    const review = await this.reviewsRepository.findOne({ where: { id: reviewId, user: { id: userId } } });
    if (!review) {
      throw new NotFoundException('Không tìm thấy bài đánh giá');
    }

    await this.reviewsRepository.remove(review);
  }

  async getProductReviews(productId: number): Promise<Review[]> {
    return this.reviewsRepository.find({ where: { product: { id: productId } }, relations: ['user'] });
  }

  async getUserReviews(userId: number): Promise<Review[]> {
    return this.reviewsRepository.find({
      where: { user: { id: userId } },
      relations: ['product'],
    });
  }

  async getAllReviews(): Promise<Review[]> {
    return this.reviewsRepository.find({
      relations: ['user', 'product'],
      order: { createdAt: 'ASC' }, // earliest first
    });
  }
}
