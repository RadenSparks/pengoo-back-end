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
    private readonly publishersRepository: Repository<Publisher>,
  ) { }

  async create(createPublisherDto: CreatePublisherDto): Promise<Publisher> {
    const publisher = this.publishersRepository.create(createPublisherDto);
    return await this.publishersRepository.save(publisher);
  }

  async findAll(): Promise<Publisher[]> {
    return await this.publishersRepository.find({ relations: ['products'] });
  }

  async findOne(id: number): Promise<Publisher> {
    const publisher = await this.publishersRepository.findOne({
      where: { id },
      relations: ['products'],
    });
    if (!publisher) throw new NotFoundException('Publisher not found');
    return publisher;
  }

  async update(id: number, updateDto: UpdatePublisherDto): Promise<Publisher> {
    const publisher = await this.findOne(id);
    Object.assign(publisher, updateDto);
    return await this.publishersRepository.save(publisher);
  }

  async remove(id: number): Promise<void> {
    const publisher = await this.findOne(id);
    await this.publishersRepository.remove(publisher);
  }
}
