import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Category } from '../categories/category.entity';
import { Product } from './entities/product.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesService } from '../categories/categories.service';
import { CloudinaryModule } from '../services/cloudinary/cloudinary.module';
import { TagsService } from '../tags/tags.service';
import { PublishersService } from '../publishers/publishers.service';
import { Tag } from '../tags/entities/tag.entity';
import { Publisher } from '../publishers/entities/publisher.entity';
import { Image } from '../images/entities/image.entity';
import { ImagesService } from '../images/images.service';
import { Collection } from '../collections/collection.entity';
import { CmsContentModule } from '../cms-content/cms-content.module';
import { CmsContent } from '../cms-content/cms-content.entity';

@Module({
  providers: [ProductsService, ImagesService, CategoriesService, TagsService, PublishersService],
  controllers: [ProductsController],
  imports: [TypeOrmModule.forFeature([Product, Category, Tag, Publisher, Image, Collection, CmsContent]), CloudinaryModule, CmsContentModule],
  exports: [ProductsService]
})
export class ProductsModule { }
