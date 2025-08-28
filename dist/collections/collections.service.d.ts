import { Repository } from 'typeorm';
import { Collection } from './collection.entity';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { Product } from '../products/entities/product.entity';
import { CouponsService } from '../coupons/coupons.service';
export declare class CollectionsService {
    private collectionsRepo;
    private productsRepo;
    private readonly couponsService;
    constructor(collectionsRepo: Repository<Collection>, productsRepo: Repository<Product>, couponsService: CouponsService);
    findAll(): Promise<Collection[]>;
    findOne(slug: string): Promise<Collection | null>;
    create(dto: CreateCollectionDto): Promise<Collection>;
    update(id: number, dto: UpdateCollectionDto): Promise<Collection | null>;
    remove(id: number): Promise<{
        deleted: boolean;
    }>;
    restore(id: number): Promise<{
        restored: boolean;
    }>;
    createBoardGameCollection(baseSlug: string): Promise<Collection>;
}
