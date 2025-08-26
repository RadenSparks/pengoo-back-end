import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';
import { User } from 'src/users/user.entity';
import { Order } from 'src/orders/order.entity';
import { UploadFiles } from './file.entity';
import { Refund } from './refund.entity';
import { PaymentMethod } from 'src/services/payment/payment.types';
export enum RefundRequestStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
}
@Entity('refund_requests')
export class RefundRequest {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Order, (order) => order.refundRequests, { eager: true })
    order: Order;

    @ManyToOne(() => User, (user) => user.refundRequests, { eager: true })
    user: User;

    @OneToMany(() => UploadFiles, (uploadFile) => uploadFile.refundRequest)
    uploadFiles: UploadFiles[];

    @OneToMany(() => Refund, (refund) => refund.refundRequest)
    refund: Refund[];

    @Column('decimal', { precision: 15, scale: 2 })
    amount: number;

    @Column('text')
    reason: string;

    @Column('int2')
    times: number;

    @Column({ type: 'varchar', length: 255, default: RefundRequestStatus.PENDING })
    status: RefundRequestStatus;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @Column({ type: 'varchar', length: 255, default: 'cod' })
    paymentMethod: PaymentMethod;
    @Column({ type: 'varchar', length: 255 })
    toAccountNumber: string;
    @Column({ type: 'varchar', length: 255 })
    toBin: string;
    @Column({ type: 'varchar', length: 255 })
    bank: string;
}
