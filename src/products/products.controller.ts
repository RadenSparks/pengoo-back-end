import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Put,
  UploadedFiles,
  UseInterceptors,
  Query,
  NotFoundException
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './create-product.dto';
import { UpdateProductDto } from './update-product.dto';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Public } from '../auth/public.decorator'; // adjust path if needed
import { In } from 'typeorm';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: CreateProductDto,
    examples: {
      default: {
        summary: 'Example product',
        value: {
          product_name: "Sample Product",
          description: "A great product for testing.",
          features: [
            { title: "Feature 1", content: "First feature description" },
            { title: "Feature 2", content: "Second feature description" }
          ],
          product_price: 99.99,
          discount: 10,
          slug: "sample-product",
          meta_title: "Sample Product Meta Title",
          meta_description: "Meta description for SEO.",
          quantity_sold: 0,
          quantity_stock: 100,
          category_ID: 1,
          publisherID: 1,
          status: "active",
          tags: ["electronics", "gadget"]
        }
      }
    }
  })
  @Post()
  @Public()
  @UseInterceptors(AnyFilesInterceptor())
  async create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    // Map files by fieldname
    const mainImage = files.find(f => f.fieldname === 'mainImage');
    const detailImages = files.filter(f => f.fieldname === 'detailImages');
    const featureImages = files.filter(f => f.fieldname === 'featureImages');

    // Parse features if sent as string
    const features = typeof createProductDto.featured === 'string'
      ? JSON.parse(createProductDto.featured)
      : createProductDto.featured;
    console.log(featureImages)
    if (!mainImage) {
      throw new Error('Main image is required');
    }
    return this.productsService.create(
      createProductDto,
      mainImage,
      detailImages,
      features,
      featureImages,
    );
  }

  @Get()
  @Public()
  async findAll(
    @Query('name') name?: string,
    @Query('category') category_ID?: number,
    @Query('tags') tags?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('publisher') publisherId?: number,
    @Query('status') status?: string,
    @Query('sort') sort?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const filter = {
      name,
      category_ID,
      tags: tags ? tags.split(',') : undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      publisherId: publisherId ? Number(publisherId) : undefined,
      status,
      sort,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 50,
    };
    const result = await this.productsService.paginatedSearchAndFilter(filter);
    // Map publisher_ID to publisherID for each product
    result.data = result.data.map(p => ({
      ...p,
      publisherID: p.publisher_ID
        ? { id: p.publisher_ID.id, name: p.publisher_ID.name }
        : null,
      // Optionally remove publisher_ID from response
      // ...other fields
    }));
    return result;
  }

  @Get(':id')
  @Public()
  async findById(@Param('id') id: number) {
    const product = await this.productsService.findById(id);
    return {
      ...product,
      publisherID: product.publisher_ID
        ? { id: product.publisher_ID.id, name: product.publisher_ID.name }
        : null,
      // Optionally remove publisher_ID from response
    };
  }

  @Get('slug/:slug')
  @Public()
  async findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @Put(':id')
  @Public()
  @UseInterceptors(AnyFilesInterceptor())

  async update(
    @Param('id') id: number,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    // Map files by fieldname
    const mainImage: Express.Multer.File | undefined = files?.find(f => f.fieldname === 'mainImage');
    const detailImages = files?.filter(f => f.fieldname === 'detailImages') || [];
    const featureImages = files?.filter(f => f.fieldname === 'featureImages') || [];

    // Parse features if sent as string
    const features = typeof updateProductDto.featured === 'string'
      ? JSON.parse(updateProductDto.featured)
      : updateProductDto.featured;
    const deleteImages = typeof updateProductDto.deleteImages === 'string'
      ? JSON.parse(updateProductDto.deleteImages)
      : updateProductDto.deleteImages;
    console.log(featureImages)
    const product = await this.productsService.update(
      id,
      updateProductDto,
      mainImage,
      detailImages,
      features,
      featureImages,
      deleteImages
    );
    return {
      ...product,
      publisherID: product.publisher_ID
        ? { id: product.publisher_ID.id, name: product.publisher_ID.name }
        : null,
    };
  }

  @Delete(':id')
  @Public()
  remove(@Param('id') id: number) {
    return this.productsService.remove(id);
  }

  @Get(':id/cms-content')
  async getCmsContent(@Param('id') id: number) {
    let product = await this.productsService.findOneWithCmsContent(Number(id));
    if (!product) throw new NotFoundException('Product not found');
    if (!product.cmsContent) {
      // Create a blank CmsContent if missing
      product = await this.productsService.createCmsContentForProduct(Number(id));
    }
    // Remove circular reference before returning
    const { product: _omit, ...cmsContentWithoutProduct } = product.cmsContent as any;
    return cmsContentWithoutProduct;
  }

  @Put(':id/cms-content')
  async updateCmsContent(@Param('id') id: number, @Body() body: any) {
    const updated = await this.productsService.updateCmsContent(Number(id), body);
    if (!updated) throw new NotFoundException('CMS content not found');
    return updated;
  }

  @Put(':id/restore')
  @Public()
  async restore(@Param('id') id: number) {
    await this.productsService.restore(id);
    return { message: 'Product restored successfully.' };
  }

  @Get('all')
  async findAllWithDeleted(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('name') name?: string,
  ) {
    // Use withDeleted: true to include soft-deleted products
    const [data, total] = await this.productsService.findAllWithDeleted({
      relations: [
        'category_ID',
        'publisher_ID',
        'tags',
        'images',
        'collection',
      ],
      withDeleted: true,
      where: name ? { product_name: In([name]) } : {},
      skip: ((page || 1) - 1) * (limit || 50),
      take: limit || 50,
    });

    // Map publisher_ID to publisherID for each product
    const mappedData = data.map(p => ({
      ...p,
      publisherID: p.publisher_ID
        ? { id: p.publisher_ID.id, name: p.publisher_ID.name }
        : null,
    }));

    return {
      data: mappedData,
      total,
      page: page || 1,
      limit: limit || 50,
    };
  }
}