import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { Category } from '../categories/category.entity';
import { CreateProductDto } from './create-product.dto';
import { UpdateProductDto } from '../products/update-product.dto';
import { CreateCategoryDto } from '../categories/create-category.dto';
import { UpdateCategoryDto } from '../categories/update-category.dto';
import { CategoriesService } from 'src/categories/categories.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    private readonly categoriesService: CategoriesService,
  ) { }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const category = await this.categoriesService.findById(createProductDto.categoryId);
    const newProduct = new Product();
    newProduct.name = createProductDto.name;
    newProduct.description = createProductDto.description;
    newProduct.price = createProductDto.price;
    newProduct.sku = createProductDto.sku;
    newProduct.quantity = createProductDto.quantity;
    newProduct.category = category;
    return this.productsRepository.save(newProduct);
  }

  async findAll(): Promise<Product[]> {
    return this.productsRepository.find({ relations: ['category'] });
  }

  async findById(id: number): Promise<Product> {
    const product = await this.productsRepository.findOne({ where: { id: id }, relations: ['category'] });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
    let product = await this.findById(id);
    const { categoryId, ...rest } = updateProductDto;
    const category = categoryId ? await this.categoriesService.findById(categoryId) : null;
    if (category) {
      product.category = category;
    }
    //Option 1
    // Object.assign(product, rest);
    //Option 2
    product.name = updateProductDto.name;
    product.description = updateProductDto.description;
    product.price = updateProductDto.price;
    product.sku = updateProductDto.sku;
    product.quantity = updateProductDto.quantity;
    return this.productsRepository.save(product);
  }

  async remove(id: number): Promise<void> {
    const product = await this.findById(id);
    await this.productsRepository.remove(product);
  }
}
