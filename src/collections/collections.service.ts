import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Collection } from './collection.entity';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { Product } from '../products/entities/product.entity';
import { isBaseGame, isExpansion, getBaseSlug, findExpansionsForBaseGame } from '../products/products.service';
import { CouponsService } from '../coupons/coupons.service'; // Add this import

@Injectable()
export class CollectionsService {
  constructor(
    @InjectRepository(Collection)
    private collectionsRepo: Repository<Collection>,
    @InjectRepository(Product)
    private productsRepo: Repository<Product>,
    private readonly couponsService: CouponsService, // Inject CouponsService
  ) { }

  findAll() {
    return this.collectionsRepo.createQueryBuilder('collection')
      .leftJoinAndSelect('collection.products', 'product')
      .leftJoinAndSelect('product.images', 'image')
      .leftJoinAndSelect('product.category_ID', 'category') // <-- Add this line
      .getMany();
  }
  findOne(slug: string) {
    return this.collectionsRepo.createQueryBuilder('collection')
      .where('collection.slug = :slug', { slug })
      .leftJoinAndSelect('collection.products', 'product')
      .leftJoinAndSelect('product.images', 'image')
      .leftJoinAndSelect('product.tags', 'tag')
      .leftJoinAndSelect('product.category_ID', 'category')
      .leftJoinAndSelect('collection.specialCoupon', 'specialCoupon') // <-- add this
      .getOne();
  }

  async create(dto: CreateCollectionDto) {
    const collection = this.collectionsRepo.create(dto);
    if (dto.productIds && dto.productIds.length) {
      collection.products = await this.productsRepo.findBy({ id: In(dto.productIds) });
    } else {
      collection.products = [];
    }
    // --- Special coupon assignment logic ---
    if (dto.specialCouponId) {
      collection.specialCoupon = { id: dto.specialCouponId } as any;
      collection.specialCouponId = dto.specialCouponId;
      // Set the voucher's collectionId to this collection
      await this.couponsService.updateCouponCollectionId(dto.specialCouponId, collection.id);
    }
    return this.collectionsRepo.save(collection);
  }

  async update(id: number, dto: UpdateCollectionDto) {
    const collection = await this.collectionsRepo.findOne({ where: { id }, relations: ['products'] });
    if (!collection) return null;
    Object.assign(collection, dto);
    if (dto.productIds) {
      collection.products = await this.productsRepo.findBy({ id: In(dto.productIds) });
    }
    // --- Special coupon assignment logic ---
    if (dto.specialCouponId !== undefined) {
      // If removing the special coupon, clear the old voucher's collectionId
      if (!dto.specialCouponId && collection.specialCouponId) {
        await this.couponsService.updateCouponCollectionId(collection.specialCouponId, null);
      }
      // If assigning a new special coupon, update its collectionId
      if (dto.specialCouponId) {
        await this.couponsService.updateCouponCollectionId(dto.specialCouponId, collection.id);
      }
      collection.specialCoupon = dto.specialCouponId ? { id: dto.specialCouponId } as any : null;
      collection.specialCouponId = dto.specialCouponId ?? null;
    }
    return this.collectionsRepo.save(collection);
  }

  async remove(id: number) {
    // Unassign all coupons from this collection before deleting
    await this.couponsService.unassignCouponsFromCollection(id);
    await this.collectionsRepo.softDelete(id);
    return { deleted: true };
  }

  async restore(id: number) {
    await this.collectionsRepo.restore(id);
    return { restored: true };
  }

  async createBoardGameCollection(baseSlug: string) {
    const allProducts = await this.productsRepo.find({ relations: ['category_ID'] });
    const baseGame = allProducts.find(p => p.slug === baseSlug && isBaseGame(p));
    if (!baseGame) throw new Error('Base game not found');
    const expansions = findExpansionsForBaseGame(allProducts, baseSlug);

    const collection = this.collectionsRepo.create({
      name: `${baseGame.product_name} Collection`,
      slug: `${baseGame.slug}-collection`,
      products: [baseGame, ...expansions],
    });
    return this.collectionsRepo.save(collection);
  }
}