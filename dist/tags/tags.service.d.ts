import { Repository } from 'typeorm';
import { Tag } from './entities/tag.entity';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
export declare class TagsService {
    private readonly tagRepository;
    constructor(tagRepository: Repository<Tag>);
    create(createTagDto: CreateTagDto): Promise<Tag>;
    findAll(): Promise<Tag[]>;
    findOne(id: number): Promise<Tag>;
    findOneByName(name: string): Promise<any>;
    update(id: number, dto: UpdateTagDto): Promise<Tag>;
    remove(id: number): Promise<void>;
    restore(id: number): Promise<void>;
    findByType(type: string): Promise<Tag[]>;
}
