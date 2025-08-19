import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,

} from 'typeorm';

import { RefundRequest } from './refund-request.entity';

@Entity('upload_files')
export class UploadFiles {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => RefundRequest, (refundRequest) => refundRequest.uploadFiles, { eager: true })
    refundRequest: RefundRequest;

    @Column({ type: 'varchar', length: 255 })
    type: string;

    @Column({ type: 'varchar', length: 255 })
    url: string;

    @CreateDateColumn()
    created_at: Date;
}
