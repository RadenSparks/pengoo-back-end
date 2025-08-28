import { Controller, Get, Post, Put, Param, Body, NotFoundException } from '@nestjs/common';
import { CmsContentService } from './cms-content.service';
import { CreateCmsContentDto } from './dto/create-cms-content.dto';
import { UpdateCmsContentDto } from './dto/update-cms-content.dto';

@Controller('products/:productId/cms-content')
export class CmsContentController {
  constructor(private readonly cmsService: CmsContentService) { }

  @Get()
  async getCmsContent(@Param('productId') productId: number) {
    const cms = await this.cmsService.findByProduct(productId);
    if (!cms) throw new NotFoundException('Không tìm thấy nội dung CMS');
    return cms;
  }

  @Post()
  async createCmsContent(
    @Param('productId') productId: number,
    @Body() dto: CreateCmsContentDto,
  ) {
    return this.cmsService.create(productId, dto);
  }

  @Put()
  async updateCmsContent(
    @Param('productId') productId: number,
    @Body() dto: UpdateCmsContentDto,
  ) {
    return this.cmsService.update(productId, dto);
  }
}