import { ProductsService } from './products.service';
import { CreateProductDto } from './create-product.dto';
import { UpdateProductDto } from './update-product.dto';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    create(createProductDto: CreateProductDto, files: Express.Multer.File[]): Promise<import("./product.entity").Product>;
    findAll(name?: string, categoryId?: number, tags?: string, minPrice?: number, maxPrice?: number, publisherId?: number, status?: string, sort?: string, page?: number, limit?: number): Promise<{
        data: import("./product.entity").Product[];
        total: number;
        page: number;
        limit: number;
    }>;
    findById(id: number): Promise<{
        publisherID: {
            id: number;
            name: string;
        } | null;
        id: number;
        product_name: string;
        description: string;
        product_price: number;
        slug: string;
        status: string;
        discount: number;
        meta_title: string;
        meta_description: string;
        quantity_sold: number;
        quantity_stock: number;
        category_ID: import("../categories/category.entity").Category;
        publisher_ID: import("../publishers/entities/publisher.entity").Publisher;
        tags: import("../tags/entities/tag.entity").Tag[];
        reviews: import("../reviews/review.entity").Review[];
        wishlists: import("../wishlist/wishlist.entity").Wishlist[];
        images: import("../images/entities/image.entity").Image[];
        collection: import("../collections/collection.entity").Collection | null;
        created_at: Date;
        updated_at: Date;
        cmsContent: import("../cms-content/cms-content.entity").CmsContent;
        deletedAt?: Date;
    }>;
    findBySlug(slug: string): Promise<import("./product.entity").Product>;
    update(id: number, updateProductDto: UpdateProductDto, files: Express.Multer.File[]): Promise<{
        publisherID: {
            id: number;
            name: string;
        } | null;
        id: number;
        product_name: string;
        description: string;
        product_price: number;
        slug: string;
        status: string;
        discount: number;
        meta_title: string;
        meta_description: string;
        quantity_sold: number;
        quantity_stock: number;
        category_ID: import("../categories/category.entity").Category;
        publisher_ID: import("../publishers/entities/publisher.entity").Publisher;
        tags: import("../tags/entities/tag.entity").Tag[];
        reviews: import("../reviews/review.entity").Review[];
        wishlists: import("../wishlist/wishlist.entity").Wishlist[];
        images: import("../images/entities/image.entity").Image[];
        collection: import("../collections/collection.entity").Collection | null;
        created_at: Date;
        updated_at: Date;
        cmsContent: import("../cms-content/cms-content.entity").CmsContent;
        deletedAt?: Date;
    }>;
    remove(id: number): Promise<void>;
    getCmsContent(id: number): Promise<any>;
    updateCmsContent(id: number, body: any): Promise<import("../cms-content/cms-content.entity").CmsContent>;
    restore(id: number): Promise<{
        message: string;
    }>;
}
