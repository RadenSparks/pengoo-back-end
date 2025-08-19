import { Repository } from 'typeorm';
import { Image } from '../images/entities/image.entity';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
export declare class ImagesService {
    private readonly imageRepo;
    constructor(imageRepo: Repository<Image>);
    create(createImageDto: CreateImageDto): Promise<Image>;
    findAll(): Promise<Image[]>;
    findOne(id: number): Promise<Image>;
    update(id: number, updateImageDto: UpdateImageDto): Promise<Image>;
    remove(id: number): Promise<void>;
    moveImage(id: number, folder: string): Promise<Image>;
    deleteFolder(path: string): Promise<{
        deleted: number;
        deletedFromCloudinary: number;
    }>;
}
