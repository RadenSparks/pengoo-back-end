import { UpdateCategoryDto } from './update-category.dto';
import { CreateCategoryDto } from './create-category.dto';
import { CategoriesService } from './categories.service';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    createCategory(createCategoryDto: CreateCategoryDto): Promise<import("./category.entity").Category>;
    findAllCategories(): Promise<import("./category.entity").Category[]>;
    findCategoryById(id: number): Promise<import("./category.entity").Category>;
    updateCategory(id: number, updateCategoryDto: UpdateCategoryDto): Promise<import("./category.entity").Category>;
    removeCategory(id: number): Promise<void>;
    restore(id: number): Promise<{
        message: string;
    }>;
}
