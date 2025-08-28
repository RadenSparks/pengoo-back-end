import { Controller, Get, Post as HttpPost, Body, Param, Patch, Delete, NotFoundException } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ApiTags, ApiBody, ApiParam, ApiOperation } from '@nestjs/swagger';
import { Public } from '../auth/public.decorator';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) { }

  @HttpPost()
  @Public()
  @ApiOperation({ summary: 'Create a new post' })
  @ApiBody({
    type: CreatePostDto,
    examples: {
      default: {
        summary: 'Create post',
        value: {
          name: 'How to Choose the Best Board Game',
          canonical: 'how-to-choose-the-best-board-game',
          description: 'Tips for choosing board games.',
          content: 'Choosing the right board game can be tough...',
          meta_description: 'Board game tips',
          meta_keyword: 'boardgame, tips',
          meta_title: 'How to Choose the Best Board Game',
          image: 'https://example.com/image.jpg',
          order: 1, // <-- always present and a number
          publish: true,
          catalogueId: 1,
        },
      },
    },
  })
  async create(@Body() dto: CreatePostDto) {
    return this.postsService.create(dto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all posts' })
  async findAll() {
    return this.postsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get post by ID' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  async findOne(@Param('id') id: number) {
    return this.postsService.findOne(+id);
  }

  @Get('slug/:canonical')
  @Public()
  @ApiOperation({ summary: 'Get post by canonical (slug)' })
  @ApiParam({ name: 'canonical', type: String, example: 'how-to-choose-the-best-board-game' })
  async findByCanonical(@Param('canonical') canonical: string) {
    return this.postsService.findByCanonical(canonical);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a post' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiBody({
    type: UpdatePostDto,
    examples: {
      default: {
        summary: 'Update post',
        value: {
          name: 'Updated Title',
          content: 'Updated content...',
          order: 2, // <-- show order can be updated
        },
      },
    },
  })
  async update(@Param('id') id: number, @Body() dto: UpdatePostDto) {
    return this.postsService.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a post' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  async remove(@Param('id') id: number) {
    await this.postsService.remove(+id);
    return { message: 'Post deleted' };
  }

  @Get(':slug')
  async getPostBySlug(@Param('slug') slug: string) {
    // Try to find by canonical first, fallback to id
    const post = await this.postsService.findBySlugOrId(slug);
    if (!post) throw new NotFoundException('Không tìm thấy bài đăng');
    return post;
  }
}
