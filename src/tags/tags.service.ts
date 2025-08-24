// src/tags/tags.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Tag } from './entities/tag.entity';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
  ) { }

  async create(createTagDto: CreateTagDto): Promise<Tag> {
    const tag = this.tagRepository.create(createTagDto);
    return await this.tagRepository.save(tag);
  }

  async findAll(): Promise<Tag[]> {
    return this.tagRepository.find();
  }

  async findOne(id: number): Promise<Tag> {
    if (typeof id !== 'number' || isNaN(id)) {
      throw new BadRequestException('Invalid tag id');
    }
    const tag = await this.tagRepository.findOne({
      where: { id },
      relations: ['products'],
    });
    if (!tag) throw new NotFoundException('Tag not found');
    return tag;
  }
  async findOneByName(name: string): Promise<any> {
    const tag = await this.tagRepository.findOne({
      where: { name },
      relations: ['products'],
    });
    if (!tag) return false;
    return tag;
  }

  async update(id: number, dto: UpdateTagDto): Promise<Tag> {
    const tag = await this.findOne(id);
    Object.assign(tag, dto);
    return await this.tagRepository.save(tag);
  }

  async remove(id: number): Promise<void> {
    await this.tagRepository.softDelete(id);
  }

  async restore(id: number): Promise<void> {
    await this.tagRepository.restore(id);
  }

  async findByType(type: string): Promise<Tag[]> {
    return this.tagRepository.find({
      where: { type },
      relations: ['products'],
    });
  }

  async findDeleted(): Promise<Tag[]> {
    const { IsNull, Not } = require('typeorm');
    return this.tagRepository.find({
      withDeleted: true,
      where: {
        deletedAt: Not(IsNull()),
      },
      relations: ['products'],
    });
  }
}
