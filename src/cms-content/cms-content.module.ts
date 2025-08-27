import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CmsContent } from './cms-content.entity';
import { Product } from '../products/entities/product.entity';
import { CmsContentService } from './cms-content.service';
import { CmsContentController } from './cms-content.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CmsContent, Product])],
  providers: [CmsContentService],
  controllers: [CmsContentController],
  exports: [CmsContentService],
})
export class CmsContentModule {}