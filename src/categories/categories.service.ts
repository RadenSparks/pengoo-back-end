import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
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
        const category = await this.findById(id);
        if (!category) {
            throw new NotFoundException('Category not found');
        }
        await this.categoriesRepository.remove(category);
    }
}

