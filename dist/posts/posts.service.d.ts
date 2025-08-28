import { Repository } from 'typeorm';
import { Post } from './posts.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostCatalogue } from './post-catalogue.entity';
export declare class PostsService {
    private postsRepository;
    private cataloguesRepository;
    constructor(postsRepository: Repository<Post>, cataloguesRepository: Repository<PostCatalogue>);
    private adjustOrdersOnCreateOrUpdate;
    create(dto: CreatePostDto): Promise<Post>;
    findAll(): Promise<Post[]>;
    findOne(id: number): Promise<Post>;
    update(id: number, dto: UpdatePostDto): Promise<Post>;
    remove(id: number): Promise<void>;
    findByCanonical(canonical: string): Promise<Post | null>;
    findBySlugOrId(slugOrId: string): Promise<Post | undefined>;
}
