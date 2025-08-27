import { Controller, Get, Post, Body, Param, Delete, Put, Query, BadRequestException } from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { Public } from '../auth/public.decorator';

@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) { }

  @Post()
  @Public()
  create(@Body() dto: CreateTagDto) {
    return this.tagsService.create(dto);
  }

  @Get()
  @Public()
  findAll(@Query('type') type?: string) {
    if (type) {
      return this.tagsService.findByType(type);
    }
    return this.tagsService.findAll();
  }

  @Get('deleted')
  @Public()
  findDeleted() {
    return this.tagsService.findDeleted();
  }

  @Get(':id')
  @Public()
  async getTag(@Param('id') id: string) {
    const tagId = Number(id);
    if (isNaN(tagId)) {
      throw new BadRequestException('Invalid tag id');
    }
    return this.tagsService.findOne(tagId);
  }

  @Put(':id')
  @Public()
  update(@Param('id') id: string, @Body() dto: UpdateTagDto) {
    return this.tagsService.update(+id, dto);
  }

  @Delete(':id')
  @Public()
  remove(@Param('id') id: string) {
    return this.tagsService.remove(+id);
  }

  @Put(':id/restore')
  async restore(@Param('id') id: number) {
    await this.tagsService.restore(id);
    return { message: 'Tag restored successfully.' };
  }
}
