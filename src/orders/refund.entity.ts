import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';
import { PaymentMethod } from 'src/services/payment/payment.types';
import { RefundRequest } from './refund-request.entity';

enum RefundStatus {
    PROCESSING = 'PROCESSING',
    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED',
}
@Entity('refunds')
export class Refund {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => RefundRequest, (refundRequest) => refundRequest.refund, { eager: true })
    refundRequest: RefundRequest;


    @Column('decimal')
    amount: number;



    @Column('varchar', { length: 255 })
    transaction_id: string;

    @Column({
        type: 'varchar', length: 255,
        default: 'PENDING',
    })
    status: RefundStatus;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
