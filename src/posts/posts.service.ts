import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './posts.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostCatalogue } from './post-catalogue.entity';

function sanitizeCanonical(value: string): string {
  return value
    .replace(/\s+/g, "-")        // spaces to hyphens
    .replace(/[^a-zA-Z0-9\-]/g, "") // remove special chars except hyphen
    .toLowerCase();
}

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    @InjectRepository(PostCatalogue)
    private cataloguesRepository: Repository<PostCatalogue>,
  ) {}

  async create(dto: CreatePostDto): Promise<Post> {
    const catalogue = await this.cataloguesRepository.findOne({ where: { id: dto.catalogueId } });
    if (!catalogue) {
      throw new Error('Catalogue not found');
    }
    // Sanitize canonical before saving
    if (dto.canonical) {
      dto.canonical = sanitizeCanonical(dto.canonical);
    }
    const post = this.postsRepository.create({
      ...dto,
      catalogue,
    });
    return this.postsRepository.save(post);
  }

  async findAll(): Promise<Post[]> {
    return this.postsRepository.find({ relations: ['catalogue'] });
  }

  async findOne(id: number): Promise<Post> {
    const post = await this.postsRepository.findOne({ where: { id }, relations: ['catalogue'] });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async update(id: number, dto: UpdatePostDto): Promise<Post> {
    const post = await this.findOne(id);
    if (dto.catalogueId) {
      const catalogue = await this.cataloguesRepository.findOne({ where: { id: dto.catalogueId } });
      if (!catalogue) throw new NotFoundException('Catalogue not found');
      post.catalogue = catalogue;
    }
    // Sanitize canonical before updating
    if (dto.canonical) {
      dto.canonical = sanitizeCanonical(dto.canonical);
    }
    Object.assign(post, dto);
    return this.postsRepository.save(post);
  }

  async remove(id: number): Promise<void> {
    const post = await this.findOne(id);
    await this.postsRepository.remove(post);
  }

  async findByCanonical(canonical: string) {
    return this.postsRepository.findOne({
      where: { canonical },
      relations: ['catalogue'],
    });
  }

  async findBySlugOrId(slugOrId: string): Promise<Post | undefined> {
    // Try canonical first
    let post = await this.postsRepository.findOne({ where: { canonical: slugOrId } });
    if (!post && !isNaN(Number(slugOrId))) {
      post = await this.postsRepository.findOne({ where: { id: Number(slugOrId) } });
    }
    return post ?? undefined;
  }
}
