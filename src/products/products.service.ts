import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Product } from './product.entity';
import { CreateProductDto, FeatureDto } from './create-product.dto';
import { UpdateProductDto } from '../products/update-product.dto';
import { CategoriesService } from '../categories/categories.service';
import { CloudinaryService } from '../services/cloudinary/cloudinary.service';
import { Tag } from '../tags/entities/tag.entity';
import { PublishersService } from '../publishers/publishers.service';
import { TagsService } from '../tags/tags.service';
import { Image } from './entities/image.entity';
// import { Featured } from './entities/featured.entity';
import slugify from 'slugify';
import { CmsContentService } from '../cms-content/cms-content.service'; // Add this import
import { CmsContent } from '../cms-content/cms-content.entity'; // <-- Add this line

export class FilterProductDto {
  name?: string;
  categoryId?: number;
  tags?: string[];
  minPrice?: number;
  maxPrice?: number;
  publisherId?: number;
  status?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    // @InjectRepository(Featured)
    // private featuresRepository: Repository<Featured>,
    private readonly publishersService: PublishersService,
    private readonly categoriesService: CategoriesService,
    private readonly cloudinaryService: CloudinaryService,
    private tagsService: TagsService,
    @InjectRepository(Tag)
    private tagRepo: Repository<Tag>,
    @InjectRepository(Image)
    private imageRepository: Repository<Image>,
    private readonly cmsContentService: CmsContentService,
    @InjectRepository(CmsContent) // <-- Add this line
    private cmsContentRepository: Repository<CmsContent>, // <-- Add this line
  ) { }

  async create(
    createProductDto: CreateProductDto,
    mainImage: Express.Multer.File,
    detailImages: Express.Multer.File[],
    features: FeatureDto[],
    featureImages: Express.Multer.File[],
  ): Promise<Product> {
    const category_ID = await this.categoriesService.findById(createProductDto.categoryId);
    const publisher_ID = await this.publishersService.findOne(createProductDto.publisherID);

    const newProduct = new Product();
    const images: Image[] = [];

    // 1. Upload main image
    if (mainImage) {
      const uploadMain = await this.cloudinaryService.uploadImage(mainImage);
      const mainImg = new Image();
      mainImg.url = uploadMain.secure_url;
      mainImg.name = 'main';
      images.push(mainImg);
    }

    // 2. Upload detail images
    if (detailImages && detailImages.length > 0) {
      const detailImageEntities = await Promise.all(
        detailImages.map(async (file) => {
          const result = await this.cloudinaryService.uploadImage(file);
          const img = new Image();
          img.url = result.secure_url;
          img.name = 'detail';
          return img;
        })
      );
      images.push(...detailImageEntities);
    }

    // Ensure features is always an array
    features = Array.isArray(features) ? features : [];

    // Only map if features is not empty
    let featuredImageEntities: Image[] = [];
    if (features.length > 0) {
      featuredImageEntities = await Promise.all(
        features.map(async (f, i) => {
          const imageFile = featureImages[i];
          if (!imageFile?.buffer) {
            throw new BadRequestException(`Missing feature image for feature ${i}`);
          }
          const uploaded = await this.cloudinaryService.uploadImage(imageFile);
          const img = new Image();
          img.url = uploaded.secure_url;
          img.name = 'featured';
          img.ord = f.ord;
          return img;
        })
      );
      images.push(...featuredImageEntities);
    }

    // 3. Handle tags
    let tags: any = [];
    if (createProductDto.tags && typeof createProductDto.tags === 'string') {
      const tag_ID = createProductDto.tags
        .split(' ')
        .map(tag => tag.trim())
        .filter(tag => tag !== '');

      if (tag_ID.length > 0) {

        tags = await Promise.all(tag_ID.map(async (id) => {
          let tag = await this.tagsService.findOne(+(id));
          return tag;
        }));
      }
    }

    // 4. Assign product fields
    newProduct.product_name = createProductDto.product_name;
    newProduct.description = createProductDto.description;
    newProduct.product_price = createProductDto.product_price;
    newProduct.slug = createProductDto.slug || slugify(createProductDto.product_name, { lower: true });
    newProduct.quantity_sold = createProductDto.quantity_sold;
    newProduct.quantity_stock = createProductDto.quantity_stock;
    newProduct.category_ID = category_ID;
    newProduct.publisher_ID = publisher_ID;
    newProduct.discount = createProductDto.discount;
    newProduct.meta_description = createProductDto.meta_description;
    newProduct.meta_title = createProductDto.meta_title;
    newProduct.status = createProductDto.status;
    newProduct.tags = tags;
    newProduct.images = images;
    // REMOVE this line:
    // newProduct.cms_content = createProductDto.cms_content || {};

    // 5. Save product first
    const savedProduct = await this.productsRepository.save(newProduct);

    // 5.1. Create CMS content if provided
    if (createProductDto.cms_content) {
      await this.cmsContentService.create(savedProduct.id, createProductDto.cms_content);
    }

    // 6. Save features (with optional feature images)
    // const featureEntities = features.map((f) =>
    //   this.featuresRepository.create({
    //     title: f.title,
    //     content: f.content,
    //     product: savedProduct,
    //   })
    // );
    // await this.featuresRepository.save(featureEntities);
    return savedProduct;
  }

  async searchAndFilter(filter: FilterProductDto): Promise<Product[]> {
    const query = this.productsRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.category_ID', 'category')
      .leftJoinAndSelect('product.publisher_ID', 'publisher')
      .leftJoinAndSelect('product.tags', 'tags')
      .leftJoinAndSelect('product.images', 'images')
      .leftJoinAndSelect('product.collection', 'collection');

    if (filter.name) {
      query.andWhere('product.product_name ILIKE :name', { name: `%${filter.name}%` });
    }
    if (filter.categoryId) {
      query.andWhere('category.id = :categoryId', { categoryId: filter.categoryId });
    }
    if (filter.tags && filter.tags.length > 0) {
      query.andWhere('tags.name IN (:...tags)', { tags: filter.tags });
    }
    if (filter.minPrice) {
      query.andWhere('product.product_price >= :minPrice', { minPrice: filter.minPrice });
    }
    if (filter.maxPrice) {
      query.andWhere('product.product_price <= :maxPrice', { maxPrice: filter.maxPrice });
    }
    if (filter.publisherId) {
      query.andWhere('publisher.id = :publisherId', { publisherId: filter.publisherId });
    }
    if (filter.status) {
      query.andWhere('product.status = :status', { status: filter.status });
    }

    // Sorting
    switch (filter.sort) {
      case 'price_asc':
        query.orderBy('product.product_price', 'ASC');
        break;
      case 'price_desc':
        query.orderBy('product.product_price', 'DESC');
        break;
      case 'sold_desc':
        query.orderBy('product.quantity_sold', 'DESC');
        break;
      default:
        query.orderBy('product.created_at', 'DESC');
    }

    // Pagination
    const page = filter.page || 1;
    const limit = filter.limit || 50;
    query.skip((page - 1) * limit).take(limit);

    // Only get the array of products, not [items, total]
    const products = await query.getMany();
    return products;
  }

  async paginatedSearchAndFilter(filter: FilterProductDto): Promise<{ data: Product[]; total: number; page: number; limit: number }> {
    const query = this.productsRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.category_ID', 'category')
      .leftJoinAndSelect('product.publisher_ID', 'publisher')
      .leftJoinAndSelect('product.tags', 'tags')
      .leftJoinAndSelect('product.images', 'images')
      .leftJoinAndSelect('product.collection', 'collection');

    if (filter.name) {
      query.andWhere('product.product_name ILIKE :name', { name: `%${filter.name}%` });
    }
    if (filter.categoryId) {
      query.andWhere('category.id = :categoryId', { categoryId: filter.categoryId });
    }
    if (filter.tags && filter.tags.length > 0) {
      query.andWhere('tags.name IN (:...tags)', { tags: filter.tags });
    }
    if (filter.minPrice) {
      query.andWhere('product.product_price >= :minPrice', { minPrice: filter.minPrice });
    }
    if (filter.maxPrice) {
      query.andWhere('product.product_price <= :maxPrice', { maxPrice: filter.maxPrice });
    }
    if (filter.publisherId) {
      query.andWhere('publisher.id = :publisherId', { publisherId: filter.publisherId });
    }
    if (filter.status) {
      query.andWhere('product.status = :status', { status: filter.status });
    }

    // Sorting
    switch (filter.sort) {
      case 'price_asc':
        query.orderBy('product.product_price', 'ASC');
        break;
      case 'price_desc':
        query.orderBy('product.product_price', 'DESC');
        break;
      case 'sold_desc':
        query.orderBy('product.quantity_sold', 'DESC');
        break;
      default:
        query.orderBy('product.created_at', 'DESC');
    }

    // Pagination
    const page = filter.page || 1;
    const limit = filter.limit || 50;
    query.skip((page - 1) * limit).take(limit);

    const [data, total] = await query.getManyAndCount();
    return { data, total, page, limit };
  }

  async findById(id: number): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id: id },
      relations: [
        'category_ID',
        'publisher_ID',
        'tags',
        'images',
        'cmsContent', // 'featured' removed
      ],
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async findBySlug(slug: string): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { slug },
      relations: [
        'category_ID',
        'publisher_ID',
        'tags',
        'images',
        'cmsContent', // 'featured' removed
      ],
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async findOneWithCmsContent(id: number): Promise<Product | null> {
    return this.productsRepository.findOne({
      where: { id },
      relations: ['cmsContent'],
    });
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
    mainImage?: Express.Multer.File,
    detailImages?: Express.Multer.File[],
    features?: FeatureDto[],
    featureImages?: Express.Multer.File[],
    deleteImages?: number[]
  ): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: ['tags', 'category_ID', 'publisher_ID', 'images'], // "featured" removed
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    if (updateProductDto.category_ID) {
      product.category_ID = await this.categoriesService.findById(updateProductDto.category_ID);
    }

    if (updateProductDto.publisherID) {
      product.publisher_ID = await this.publishersService.findOne(updateProductDto.publisherID);
    }
    if (deleteImages?.length) {
      const toRemove = await this.imageRepository.findBy({
        id: In(deleteImages),
        product: { id },
      });
      if (toRemove.length > 0) {
        await this.imageRepository.remove(toRemove);
        product.images = product.images.filter(img => !deleteImages.includes(img.id));
      }
    }

    // If you want to update the main image, update the images array instead.
    if (mainImage) {
      const uploadMain = await this.cloudinaryService.uploadImage(mainImage);

      // Find and remove previous main image
      const prevMainImg = product.images.find(img => img.name === "main");
      if (prevMainImg) {
        await this.imageRepository.remove(prevMainImg);
        product.images = product.images.filter(img => img.id !== prevMainImg.id);
      }

      // Add new main image
      const mainImg = this.imageRepository.create({
        product,
        name: "main",
        url: uploadMain.secure_url,
        ord: 0,
      });

      const savedMainImg = await this.imageRepository.save(mainImg);
      product.images.push(savedMainImg);
    }
    if (detailImages && detailImages.length > 0) {
      const detailImageEntities = await Promise.all(
        detailImages.map(async (file) => {
          const detailUploads = await this.cloudinaryService.uploadImage(file);
          const img = this.imageRepository.create({
            product: product,
            name: "detail",
            url: detailUploads.secure_url,
            ord: 0,
          });
          return await this.imageRepository.save(img);
        })
      );
      product.images.push(...detailImageEntities);
    }
    if (featureImages?.length && features?.length) {
      // Lấy số thứ tự cuối cùng của ảnh featured (nếu có)
      const featuredImages = product.images.filter(i => i.name === 'featured');
      let ordLastImage = featuredImages.length > 0
        ? Math.max(...featuredImages.map(i => i.ord ?? 0))
        : -1;

      const featuredImageEntities = await Promise.all(
        featureImages.map(async (f) => {
          ordLastImage += 1;
          const uploaded = await this.cloudinaryService.uploadImage(f);

          const newImg = this.imageRepository.create({
            url: uploaded.secure_url,
            name: 'featured',
            ord: ordLastImage,
            product,
          });

          return await this.imageRepository.save(newImg);
        })
      );

      product.images.push(...featuredImageEntities);
    }
    // FIX: Update tags
    if (updateProductDto.tags && typeof updateProductDto.tags === 'string') {
      const tagIds = updateProductDto.tags
        .split(' ')
        .map(tag => tag.trim())
        .filter(tag => tag !== '')
        .map(id => Number(id));
      if (tagIds.length > 0) {
        const tags = await this.tagRepo.findBy({ id: In(tagIds) });
        product.tags = tags;
      } else {
        product.tags = [];
      }
    }

    product.product_name = updateProductDto.product_name ?? product.product_name;
    product.description = updateProductDto.description ?? product.description;
    product.product_price = updateProductDto.product_price ?? product.product_price;
    product.slug = updateProductDto.slug ?? product.slug;
    product.quantity_sold = updateProductDto.quantity_sold ?? product.quantity_sold;
    product.quantity_stock = updateProductDto.quantity_stock ?? product.quantity_stock;
    product.discount = updateProductDto.discount ?? product.discount;
    product.meta_description = updateProductDto.meta_description ?? product.meta_description;
    product.meta_title = updateProductDto.meta_title ?? product.meta_title;
    product.status = updateProductDto.status ?? product.status;
    // REMOVE this line:
    // product.cms_content = updateProductDto.cms_content ?? product.cms_content;

    // Instead, update CMS content if provided
    if (updateProductDto.cms_content) {
      await this.cmsContentService.update(product.id, updateProductDto.cms_content);
    }

    const updatedProduct = await this.productsRepository.save(product);

    return updatedProduct;
  }

  async remove(id: number): Promise<void> {
    const product = await this.findById(id);
    await this.productsRepository.remove(product);
  }

  async updateCmsContent(id: number, data: Partial<CmsContent>): Promise<CmsContent | null> {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: ['cmsContent'],
    });
    if (!product || !product.cmsContent) return null;
    Object.assign(product.cmsContent, data);
    await this.cmsContentRepository.save(product.cmsContent);
    return product.cmsContent;
  }

  async createCmsContentForProduct(id: number): Promise<Product> {
    const product = await this.productsRepository.findOne({ where: { id }, relations: ['cmsContent'] });
    if (!product) throw new NotFoundException('Product not found');
    if (!product.cmsContent) {
      const cmsContent = this.cmsContentRepository.create();
      cmsContent.product = product;
      await this.cmsContentRepository.save(cmsContent);
      product.cmsContent = cmsContent;
      await this.productsRepository.save(product);
    }
    return product;
  }
}