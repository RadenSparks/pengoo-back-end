import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { CreateProductDto, FeatureDto } from './create-product.dto';
import { UpdateProductDto } from './update-product.dto';
import { CategoriesService } from '../categories/categories.service';
import { CloudinaryService } from '../services/cloudinary/cloudinary.service';
import { Tag } from '../tags/entities/tag.entity';
import { PublishersService } from '../publishers/publishers.service';
import { TagsService } from '../tags/tags.service';
import { Image } from '../images/entities/image.entity';
import { CmsContentService } from '../cms-content/cms-content.service';
import { CmsContent } from '../cms-content/cms-content.entity';
export declare class FilterProductDto {
    name?: string;
    category_ID?: number;
    tags?: string[];
    minPrice?: number;
    maxPrice?: number;
    publisherId?: number;
    status?: string;
    sort?: string;
    page?: number;
    limit?: number;
}
export declare class ProductsService {
    private productsRepository;
    private readonly publishersService;
    private readonly categoriesService;
    private readonly cloudinaryService;
    private tagsService;
    private tagRepo;
    private imageRepository;
    private readonly cmsContentService;
    private cmsContentRepository;
    constructor(productsRepository: Repository<Product>, publishersService: PublishersService, categoriesService: CategoriesService, cloudinaryService: CloudinaryService, tagsService: TagsService, tagRepo: Repository<Tag>, imageRepository: Repository<Image>, cmsContentService: CmsContentService, cmsContentRepository: Repository<CmsContent>);
    create(createProductDto: CreateProductDto, mainImage: Express.Multer.File, detailImages: Express.Multer.File[], features: FeatureDto[], featureImages: Express.Multer.File[]): Promise<Product>;
    searchAndFilter(filter: FilterProductDto): Promise<Product[]>;
    paginatedSearchAndFilter(filter: FilterProductDto): Promise<{
        data: Product[];
        total: number;
        page: number;
        limit: number;
    }>;
    findById(id: number): Promise<Product>;
    findBySlug(slug: string): Promise<Product>;
    findOneWithCmsContent(id: number): Promise<Product | null>;
    update(id: number, updateProductDto: UpdateProductDto, mainImage?: Express.Multer.File, detailImages?: Express.Multer.File[], features?: FeatureDto[], featureImages?: Express.Multer.File[], deleteImages?: number[]): Promise<Product>;
    remove(id: number): Promise<void>;
    updateCmsContent(id: number, data: Partial<CmsContent>): Promise<CmsContent | null>;
    createCmsContentForProduct(id: number): Promise<Product>;
    restore(id: number): Promise<void>;
}
export declare function isBaseGame(product: Product): boolean;
export declare function isExpansion(product: Product): boolean;
export declare function getBaseSlug(slug: string): string;
export declare function findExpansionsForBaseGame(products: Product[], baseSlug: string): Product[];
