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

  /**
   * Shift orders of posts in the same catalogue to ensure unique, gapless order values.
   * If updating, skip the current post.
   */
  private async adjustOrdersOnCreateOrUpdate(
    catalogueId: number,
    newOrder: number,
    postIdToSkip?: number
  ) {
    // Get all posts in the catalogue, sorted by order
    const posts = await this.postsRepository.find({
      where: { catalogue: { id: catalogueId } },
      order: { order: "ASC" },
    });

    // Remove the post being updated (if any)
    const filteredPosts = postIdToSkip
      ? posts.filter(p => p.id !== postIdToSkip)
      : posts;

    // Insert a placeholder for the new/updated post at the desired order
    filteredPosts.splice(newOrder - 1, 0, null as any);

    // Reassign orders
    let order = 1;
    for (const post of filteredPosts) {
      if (!post) {
        order++;
        continue;
      }
      if (post.order !== order) {
        post.order = order;
        await this.postsRepository.save(post);
      }
      order++;
    }
  }

  async create(dto: CreatePostDto): Promise<Post> {
    const catalogue = await this.cataloguesRepository.findOne({ where: { id: dto.catalogueId } });
    if (!catalogue) {
      throw new Error('Catalogue not found');
    }
    // Sanitize canonical before saving
    if (dto.canonical) {
      dto.canonical = sanitizeCanonical(dto.canonical);
    }
    // Adjust orders before creating
    await this.adjustOrdersOnCreateOrUpdate(dto.catalogueId, dto.order ?? 1);
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
    // Adjust orders before updating
    const catalogueId = dto.catalogueId ?? post.catalogue.id;
    const newOrder = dto.order ?? post.order ?? 1;
    await this.adjustOrdersOnCreateOrUpdate(catalogueId, newOrder, id);
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
