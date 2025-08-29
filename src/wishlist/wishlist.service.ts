import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Wishlist } from './wishlist.entity';
import { UsersService } from '../users/users.service';
import { ProductsService } from '../products/products.service';
import { OrdersService } from '../orders/orders.service';


@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(Wishlist)
    private wishlistRepository: Repository<Wishlist>,
    private usersService: UsersService,
    private productsService: ProductsService,
    private ordersService: OrdersService,
  ) { }

  async addToWishlist(userId: number, productId: number): Promise<Wishlist> {
    const existing = await this.wishlistRepository.findOne({ where: { user: { id: userId }, product: { id: productId } } });
    if (existing) return existing; // or just return a success message

    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');

    const product = await this.productsService.findById(productId);
    if (!product) throw new NotFoundException('Không tìm thấy sản phẩm');

    const wishlistItem = this.wishlistRepository.create({ user, product });
    return this.wishlistRepository.save(wishlistItem);
  }

  async removeFromWishlist(userId: number, productId: number): Promise<void> {
    const wishlistItem = await this.wishlistRepository.findOne({
      where: { user: { id: userId }, product: { id: productId }, movedToOrder: IsNull() },
    });
    if (!wishlistItem) throw new NotFoundException('Không tìm thấy mục danh sách yêu thích');
    await this.wishlistRepository.remove(wishlistItem);
  }

  async viewWishlist(userId: number): Promise<Wishlist[]> {
    // Explicitly load product.images relation
    const items = await this.wishlistRepository.find({
      where: { user: { id: userId }, movedToOrder: IsNull() },
      relations: ['product', 'product.images'],
      order: { createdAt: 'DESC' },
    });

    // Defensive: ensure images is always an array
    return items.map(item => {
      if (item.product && !Array.isArray(item.product.images)) {
        item.product.images = [];
      }
      return item;
    });
  }

  async moveWishlistToOrder(userId: number, orderId: number): Promise<{ moved: number }> {
    const order = await this.ordersService.findById(orderId);
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');

    const wishlistItems = await this.wishlistRepository.find({
      where: { user: { id: userId }, movedToOrder: IsNull() },
      relations: ['product'],
    });

    for (const item of wishlistItems) {
      item.movedToOrder = order;
      await this.wishlistRepository.save(item);
    }

    return { moved: wishlistItems.length };
  }

  async viewWishlistIds(userId: number): Promise<number[]> {
    const items = await this.wishlistRepository.find({
      where: { user: { id: userId }, movedToOrder: IsNull() },
      relations: ['product'],
      select: ['product'], // Only fetch product relation
    });
    return items.map(item => item.product.id);
  }
}
