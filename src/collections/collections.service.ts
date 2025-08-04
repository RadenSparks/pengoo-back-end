import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Collection } from './collection.entity';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { Product } from '../products/product.entity';

@Injectable()
export class CollectionsService {
  constructor(
    @InjectRepository(Collection)
    private collectionsRepo: Repository<Collection>,
    @InjectRepository(Product)
    private productsRepo: Repository<Product>,
  ) { }

  findAll() {
    return this.collectionsRepo.createQueryBuilder('collection')
      .leftJoinAndSelect('collection.products', 'product')
      .leftJoinAndSelect('product.images', 'image') // <-- bắt buộc dùng `Select`
      .getMany();
  }
  findOne(slug: string) {
    return this.collectionsRepo.createQueryBuilder('collection')
      .where('collection.slug = :slug', { slug })
      .leftJoinAndSelect('collection.products', 'product')
      .leftJoinAndSelect('product.images', 'image')
      .leftJoinAndSelect('product.tags', 'tag')
      .leftJoinAndSelect('product.category_ID', 'category')
      .getOne();
  }

  async create(dto: CreateCollectionDto) {
    if (!dto) throw new Error('No data received');
    const collection = this.collectionsRepo.create(dto);
    if (dto.productIds && dto.productIds.length) {
      collection.products = await this.productsRepo.findBy({ id: In(dto.productIds) });
    } else {
      collection.products = [];
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
    return this.collectionsRepo.save(collection);
  }

  async remove(id: number) {
    await this.collectionsRepo.delete(id);
    return { deleted: true };
  }
}