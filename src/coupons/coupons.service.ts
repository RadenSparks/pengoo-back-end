import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not, IsNull, ILike } from 'typeorm';
import { Coupon, CouponStatus } from './coupon.entity';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UserCoupon } from './user-coupon.entity';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { User } from '../users/user.entity';
import { Product } from '../products/entities/product.entity';
import { Collection } from '../collections/collection.entity';
import { isBaseGame, isExpansion } from '../products/products.service';

@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(Coupon)
    private couponsRepo: Repository<Coupon>,
    @InjectRepository(UserCoupon)
    private userCouponRepo: Repository<UserCoupon>,
    @InjectRepository(Product)
    private productsRepo: Repository<Product>,
    @InjectRepository(Collection)
    private collectionsRepo: Repository<Collection>,
  ) { }

  async create(dto: CreateCouponDto): Promise<Coupon> {
    const coupon = this.couponsRepo.create(dto);
    if (dto.collectionId) {
      const collection = await this.collectionsRepo.findOne({ where: { id: dto.collectionId } });
      if (!collection) {
        throw new NotFoundException('Collection not found');
      }
      coupon.collection = collection;
    }
    return this.couponsRepo.save(coupon);
  }

  /**
   * Special collection coupon logic:
   * - If order contains at least 1 base game and 1 expansion from the same collection,
   *   apply a special coupon: basePercent + (expansionCount - 1) * incrementPercent
   */
  async getSpecialCollectionDiscount(productIds: number[]) {
    // Load products with their collection and category
    const products = await this.productsRepo.find({
      where: { id: In(productIds) },
      relations: ['collection', 'category_ID'],
    });
    // Group by collection
    const collections = new Map<number, { base: Product[]; expansions: Product[]; config?: Collection }>();
    for (const product of products) {
      if (!product.collection) continue;
      const colId = product.collection.id;
      if (!collections.has(colId)) {
        collections.set(colId, { base: [], expansions: [], config: product.collection });
      }
      if (isBaseGame(product)) collections.get(colId)!.base.push(product);
      if (isExpansion(product)) collections.get(colId)!.expansions.push(product);
    }
    // Find a collection with at least 1 base and 1 expansion and hasSpecialCoupon
    for (const [colId, { base, expansions, config }] of collections.entries()) {
      if (
        base.length > 0 &&
        expansions.length > 0 &&
        config?.hasSpecialCoupon
      ) {
        const basePercent = config.baseDiscountPercent ?? 10;
        const incrementPercent = config.incrementPerExpansion ?? 5;
        const discountPercent = basePercent + (expansions.length - 1) * incrementPercent;
        return { discountPercent, collectionId: colId };
      }
    }
    return { discountPercent: 0, collectionId: null };
  }

  // Override validateAndApply to use special logic
  async validateAndApply(code: string, orderValue: number, userId: number, productIds: number[]): Promise<{ coupon: Coupon, discount: number }> {
    // Special collection coupon logic
    const { discountPercent, collectionId } = await this.getSpecialCollectionDiscount(productIds);
    if (discountPercent > 0) {
      // Return a virtual coupon object for this special case
      const discount = (orderValue * discountPercent) / 100;
      return {
        coupon: {
          id: 0,
          code: 'COLLECTION_SPECIAL',
          minOrderValue: 0,
          maxOrderValue: orderValue,
          startDate: new Date(),
          endDate: new Date(),
          usageLimit: 1,
          usedCount: 0,
          status: 'active',
          discountPercent,
          description: `Special collection coupon for collection ${collectionId}`,
          userCoupons: [],
          milestonePoints: null,
          deletedAt: undefined,
        } as unknown as Coupon,
        discount,
      };
    }

    const coupon = await this.couponsRepo.findOne({
      where: { code: ILike(code) },
      // relations: ['products', 'users'],
    });
    if (!coupon) throw new NotFoundException('Coupon not found');
    const voucherId = coupon.id
    const existing = await this.userCouponRepo.createQueryBuilder("user_coupon")
      .where("user_coupon.userId = :userId", { userId })
      .andWhere("user_coupon.couponId = :voucherId", { voucherId })
      .getOne();
    console.log(userId, coupon)
    // if (!existing) throw new BadRequestException("User hasn't redeem a voucher");
    const now = new Date();
    console.log(now)
    if (coupon.status !== CouponStatus.Active) throw new BadRequestException('Coupon is not active');
    if (now < new Date(coupon.startDate) || now > new Date(coupon.endDate)) throw new BadRequestException('Coupon is not valid at this time');
    if (orderValue < Number(coupon.minOrderValue)) throw new BadRequestException('Order value not eligible for this coupon');
    if (coupon.usedCount >= coupon.usageLimit) throw new BadRequestException('Coupon usage limit reached');

    // If coupon is restricted to certain users
    //     if (coupon.users && coupon.users.length > 0 && !coupon.users.some(u => u.id === userId)) {
    //       throw new BadRequestException('Coupon not valid for this user');
    //     }

    // If coupon is restricted to certain products
    // if (coupon.products && coupon.products.length > 0 && !coupon.products.some(p => productIds.includes(p.id))) {
    //   throw new BadRequestException('Coupon not valid for these products');
    // }


    // Calculate discount
    let discount = (orderValue * Number(coupon.discountPercent)) / 100;
    if (discount > coupon.maxOrderValue) {
      discount = coupon.maxOrderValue
    }
    // Mark as used
    // coupon.usedCount += 1;
    // if (coupon.usedCount >= coupon.usageLimit) {
    //   coupon.status = CouponStatus.Inactive;
    // }
    await this.couponsRepo.save(coupon);

    return { coupon, discount };
  }

  public async findActiveCoupon(): Promise<Coupon | undefined> {
    const coupon = await this.couponsRepo.findOne({
      where: { status: CouponStatus.Active },
      // relations: ['users'],
      order: { id: 'ASC' },
    });
    return coupon ?? undefined;
  }
  public async getAll(): Promise<Coupon[] | undefined> {
    const coupon = await this.couponsRepo.find()
    return coupon ?? undefined;
  }
  async getAllWithCollections() {
    return this.couponsRepo.find({ relations: ['collection'] });
  }

  async getNextAvailableCoupon(userId: number, userPoints: number): Promise<Coupon | null> {
    // Find the next coupon with milestonePoints > userPoints, ordered by milestonePoints ASC
    const nextCoupon = await this.couponsRepo.createQueryBuilder("coupon")
      .where("coupon.milestonePoints > :userPoints", { userPoints })
      .andWhere("coupon.status = :status", { status: CouponStatus.Active })
      .orderBy("coupon.milestonePoints", "ASC")
      .getOne();

    return nextCoupon ?? null;
  }

  async getMilestoneCoupons(): Promise<Coupon[]> {
    return this.couponsRepo.find({
      where: { milestonePoints: Not(IsNull()), status: CouponStatus.Active },
      order: { milestonePoints: 'ASC' },
    });
  }
  async update(id: number, dto: UpdateCouponDto): Promise<Coupon> {
    const coupon = await this.couponsRepo.findOne({
      where: { id }
    });
    if (!coupon) throw new NotFoundException('Coupon not found');

    // If collectionId is being changed, ensure exclusivity
    if (dto.collectionId !== undefined) {
      if (dto.collectionId) {
        // Unassign any other coupon from this collection
        await this.couponsRepo.update(
          { collectionId: dto.collectionId },
          { collectionId: null }
        );
        coupon.collectionId = dto.collectionId;
      } else {
        coupon.collectionId = null;
      }
    }

    Object.assign(coupon, dto);

    return this.couponsRepo.save(coupon);
  }

  // --- Assign a coupon to a collection, ensuring exclusivity ---
  async assignCouponToCollection(couponId: number, collectionId: number | null) {
    // Unassign this coupon from any collection if collectionId is null
    const coupon = await this.couponsRepo.findOne({ where: { id: couponId } });
    if (!coupon) throw new NotFoundException('Coupon not found');

    if (collectionId) {
      // Unassign any other coupon currently assigned to this collection
      await this.couponsRepo.update(
        { collectionId },
        { collectionId: null }
      );
      // Assign this coupon to the collection
      coupon.collectionId = collectionId;
    } else {
      // Unassign from any collection
      coupon.collectionId = null;
    }
    return this.couponsRepo.save(coupon);
  }

  // --- Unassign all coupons from a collection (e.g. when collection is deleted or unlinked) ---
  async unassignCouponsFromCollection(collectionId: number) {
    await this.couponsRepo.update(
      { collectionId },
      { collectionId: null }
    );
  }

  async updateStatus(id: number, status: CouponStatus): Promise<Coupon> {
    const coupon = await this.couponsRepo.findOne({ where: { id } });
    if (!coupon) throw new NotFoundException('Coupon not found');

    coupon.status = status;
    return this.couponsRepo.save(coupon);
  }
  async delete(id: number): Promise<Coupon> {
    const coupon = await this.couponsRepo.findOne({ where: { id } });
    if (!coupon) throw new NotFoundException('Coupon not found');

    return this.couponsRepo.remove(coupon);
  }
  async checkVoucherByUserPoint(user: User, voucherCode: string) {
    const point = user.points
    const isActive = await this.couponsRepo.createQueryBuilder("coupon")
      .where("coupon.milestonePoints <= :point", { point })
      .andWhere("coupon.status = :status", { status: CouponStatus.Active })
      .andWhere("coupon.code = :voucherCode", { voucherCode })
      .getOne();
    if (!isActive) throw new NotFoundException('Coupon not found');
    await this.handleSaveCouponForUser(user.id, isActive.id)
    return await this.getVoucherByUserId(user.id);

  }
  async handleSaveCouponForUser(userId, voucherId) {
    const existing = await this.userCouponRepo.createQueryBuilder("user_coupon")
      .where("user_coupon.userId = :userId", { userId })
      .andWhere("user_coupon.redeemed = :redeemed", { redeemed: true })
      .andWhere("user_coupon.couponId = :voucherId", { voucherId })
      .getOne();
    if (existing) throw new BadRequestException("User has redeem a voucher");
    const userCoupon = this.userCouponRepo.create({
      user: { id: userId },
      coupon: { id: voucherId },
      redeemed: true,
      redeemToken: null,
    });

    return await this.userCouponRepo.save(userCoupon);
  }
  async getVoucherByUserId(id: number) {
    return this.userCouponRepo.find({
      where: {
        user: { id },
        coupon: { status: CouponStatus.Active },
      },
      relations: ['coupon'],
    });
  }

  async remove(id: number) {
    await this.couponsRepo.softDelete(id);
    return { deleted: true };
  }

  async restore(id: number) {
    await this.couponsRepo.restore(id);
    return { restored: true };
  }

  async updateCouponCollectionId(couponId: number, collectionId: number | null) {
    await this.couponsRepo.update(couponId, { collectionId });
  }
}