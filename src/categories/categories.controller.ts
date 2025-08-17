import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { UpdateCategoryDto } from './update-category.dto';
import { CreateCategoryDto } from './create-category.dto';
import { CategoriesService } from './categories.service';
import { Public } from '../auth/public.decorator'; // adjust path if needed

@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) {}
    
    @Post()
    @Public()
    createCategory(@Body() createCategoryDto: CreateCategoryDto) {
        return this.categoriesService.create(createCategoryDto);
    }

    @Get()
    @Public()
    findAllCategories() {
        return this.categoriesService.findAll();
    }

    @Get(':id')
    @Public()
    findCategoryById(@Param('id') id: number) {
        return this.categoriesService.findById(id);
    }

    @Put(':id')
    @Public()
    updateCategory(
        @Param('id') id: number,
        @Body() updateCategoryDto: UpdateCategoryDto,
    ) {
        return this.categoriesService.update(id, updateCategoryDto);
    }

    @Delete(':id')
    @Public()
    removeCategory(@Param('id') id: number) {
        return this.categoriesService.remove(id);
    }    

    @Put(':id/restore')
    async restore(@Param('id') id: number) {
      await this.categoriesService.restore(id);
      return { message: 'Category restored successfully.' };
    }
}

