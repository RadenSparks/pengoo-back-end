import { ProductsService } from './products.service';
import { CreateProductDto } from './create-product.dto';
import { UpdateProductDto } from '../products/update-product.dto';
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
    findById(id: number): Promise<import("./product.entity").Product>;
    findBySlug(slug: string): Promise<import("./product.entity").Product>;
    update(id: number, updateProductDto: UpdateProductDto, files: Express.Multer.File[]): Promise<import("./product.entity").Product>;
    remove(id: number): Promise<void>;
    getCmsContent(id: number): Promise<any>;
    updateCmsContent(id: number, body: any): Promise<import("../cms-content/cms-content.entity").CmsContent>;
}
