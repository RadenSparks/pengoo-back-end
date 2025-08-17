import { PublishersService } from './publishers.service';
import { CreatePublisherDto } from './dto/create-publisher.dto';
import { UpdatePublisherDto } from './dto/update-publisher.dto';
export declare class PublishersController {
    private readonly publishersService;
    constructor(publishersService: PublishersService);
    create(dto: CreatePublisherDto): Promise<import("./entities/publisher.entity").Publisher>;
    findAll(): Promise<import("./entities/publisher.entity").Publisher[]>;
    findOne(id: string): Promise<import("./entities/publisher.entity").Publisher>;
    update(id: string, dto: UpdatePublisherDto): Promise<import("./entities/publisher.entity").Publisher>;
    remove(id: string): Promise<{
        deleted: boolean;
    }>;
}
