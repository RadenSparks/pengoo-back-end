import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository, IsNull } from 'typeorm';
import { Category } from './category.entity';
import { CreateCategoryDto } from './create-category.dto';
import { UpdateCategoryDto } from './update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CategoriesService {

    constructor(
        @InjectRepository(Category)
        private categoriesRepository: Repository<Category>,
      ) {}

    async create(
        createCategoryDto: CreateCategoryDto,
    ): Promise<Category> {
        const category = this.categoriesRepository.create(createCategoryDto);
        return this.categoriesRepository.save(category);
    }

    async findAll(): Promise<Category[]> {
        return this.categoriesRepository.find({ relations: ['products'] });
    }

    async findById(id: number): Promise<Category> {
        if (!id) {
            throw new NotFoundException('Category id empty');
        }
        const category = await this.categoriesRepository.findOne({
            where: { id },
            relations: ['products'],
        });
        if (!category) {
            throw new NotFoundException('Category not found');
        }
        return category;
    }

    async update(
        id: number,
        updateCategoryDto: UpdateCategoryDto,
    ): Promise<Category> {
        const category = await this.findById(id);
        if (!category) {
            throw new NotFoundException('Category not found');
        }
        Object.assign(category, updateCategoryDto);
        return this.categoriesRepository.save(category);
    }

    async remove(id: number): Promise<void> {
      await this.categoriesRepository.softDelete(id);
    }

    async restore(id: number): Promise<void> {
      await this.categoriesRepository.restore(id);
    }

    async findAllDeleted(): Promise<Category[]> {
        return this.categoriesRepository.find({
            withDeleted: true,
            where: {
                deletedAt: IsNull(),
            },
            relations: ['products'],
        });
    }
}

