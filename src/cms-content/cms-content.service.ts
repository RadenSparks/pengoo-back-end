import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CmsContent } from './cms-content.entity';
import { Product } from '../products/entities/product.entity';
import { CreateCmsContentDto } from './dto/create-cms-content.dto';
import { UpdateCmsContentDto } from './dto/update-cms-content.dto';

@Injectable()
export class CmsContentService {
  constructor(
    @InjectRepository(CmsContent)
    private cmsContentRepo: Repository<CmsContent>,
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
  ) { }

  async create(productId: number, dto: CreateCmsContentDto) {
    const product = await this.productRepo.findOneBy({ id: productId });
    if (!product) throw new NotFoundException('Không tìm thấy sản phẩm');
    const cms = this.cmsContentRepo.create({ ...dto, product });
    return this.cmsContentRepo.save(cms);
  }

  async update(productId: number, dto: UpdateCmsContentDto) {
    const cms = await this.cmsContentRepo.findOne({ where: { product: { id: productId } } });
    if (!cms) throw new NotFoundException('Không tìm thấy nội dung CMS');
    Object.assign(cms, dto);
    return this.cmsContentRepo.save(cms);
  }

  async findByProduct(productId: number) {
    return this.cmsContentRepo.findOne({ where: { product: { id: productId } } });
  }

  async remove(id: number) {
    await this.cmsContentRepo.softDelete(id);
    return { deleted: true };
  }

  async restore(id: number) {
    await this.cmsContentRepo.restore(id);
    return { restored: true };
  }
}