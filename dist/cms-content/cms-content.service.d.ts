import { Repository } from 'typeorm';
import { CmsContent } from './cms-content.entity';
import { Product } from '../products/product.entity';
import { CreateCmsContentDto } from './dto/create-cms-content.dto';
import { UpdateCmsContentDto } from './dto/update-cms-content.dto';
export declare class CmsContentService {
    private cmsContentRepo;
    private productRepo;
    constructor(cmsContentRepo: Repository<CmsContent>, productRepo: Repository<Product>);
    create(productId: number, dto: CreateCmsContentDto): Promise<CmsContent>;
    update(productId: number, dto: UpdateCmsContentDto): Promise<CmsContent>;
    findByProduct(productId: number): Promise<CmsContent | null>;
    remove(id: number): Promise<{
        deleted: boolean;
    }>;
    restore(id: number): Promise<{
        restored: boolean;
    }>;
}
