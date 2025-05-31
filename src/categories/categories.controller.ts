import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { UpdateCategoryDto } from './update-category.dto';
import { CreateCategoryDto } from './create-category.dto';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) {}
    
    @Post()
    createCategory(@Body() createCategoryDto: CreateCategoryDto) {
        return this.categoriesService.create(createCategoryDto);
    }

    @Get()
    findAllCategories() {
        return this.categoriesService.findAll();
    }

    @Get(':id')
    findCategoryById(@Param('id') id: number) {
        return this.categoriesService.findById(id);
    }

    @Put(':id')
    updateCategory(
        @Param('id') id: number,
        @Body() updateCategoryDto: UpdateCategoryDto,
    ) {
        return this.categoriesService.update(id, updateCategoryDto);
    }

    @Delete('categories/:id')
    removeCategory(@Param('id') id: number) {
        return this.categoriesService.remove(id);
    }    
}

