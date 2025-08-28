import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Publisher } from './entities/publisher.entity';
import { CreatePublisherDto } from './dto/create-publisher.dto';
import { UpdatePublisherDto } from './dto/update-publisher.dto';

@Injectable()
export class PublishersService {
  constructor(
    @InjectRepository(Publisher)
    private publishersRepo: Repository<Publisher>,
  ) { }

  async create(createPublisherDto: CreatePublisherDto): Promise<Publisher> {
    const publisher = this.publishersRepo.create(createPublisherDto);
    return await this.publishersRepo.save(publisher);
  }

  async findAll(): Promise<Publisher[]> {
    const publishers = await this.publishersRepo.find({
      relations: [
        'products',
        'products.tags',
        'products.images',
        'products.category_ID',
        'products.publisher_ID'
      ]
    });

    // Map publisher_ID to publisherID for each product in each publisher
    return publishers.map(pub => ({
      ...pub,
      products: pub.products.map(p => ({
        ...p,
        publisherID: p.publisher_ID
          ? { id: p.publisher_ID.id, name: p.publisher_ID.name }
          : null,
      })),
    }));
  }

  async findOne(id: number): Promise<Publisher> {
    const publisher = await this.publishersRepo.findOne({
      where: { id },
      relations: [
        'products',
        'products.tags',
        'products.images',
        'products.category_ID',
        'products.publisher_ID'
      ]
    });
    if (!publisher) throw new NotFoundException('Không tìm thấy nhà xuất bản');
    return {
      ...publisher,
      products: publisher.products.map(p => ({
        ...p,
        publisherID: p.publisher_ID
          ? { id: p.publisher_ID.id, name: p.publisher_ID.name }
          : null,
      })),
    };
  }

  async update(id: number, updateDto: UpdatePublisherDto): Promise<Publisher> {
    const publisher = await this.findOne(id);
    Object.assign(publisher, updateDto);
    return await this.publishersRepo.save(publisher);
  }

  async remove(id: number) {
    await this.publishersRepo.softDelete(id);
    return { deleted: true };
  }

  async restore(id: number) {
    await this.publishersRepo.restore(id);
    return { restored: true };
  }
}
