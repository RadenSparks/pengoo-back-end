import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
export declare class TagsController {
    private readonly tagsService;
    constructor(tagsService: TagsService);
    create(dto: CreateTagDto): Promise<import("./entities/tag.entity").Tag>;
    findAll(type?: string): Promise<import("./entities/tag.entity").Tag[]>;
    findOne(id: string): Promise<import("./entities/tag.entity").Tag>;
    update(id: string, dto: UpdateTagDto): Promise<import("./entities/tag.entity").Tag>;
    remove(id: string): Promise<void>;
    restore(id: number): Promise<{
        message: string;
    }>;
}
