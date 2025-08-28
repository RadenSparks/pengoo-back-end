import { Exclude } from 'class-transformer';
import { Product } from '../products/entities/product.entity';
import { Coupon } from '../coupons/coupon.entity';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    DeleteDateColumn
} from 'typeorm';

@Entity()
export class Collection {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'varchar', length: 255 })
    slug: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    image_url: string;

    @Column({ type: 'boolean', default: false })
    hasSpecialCoupon: boolean;

    @Column({ type: 'int', default: 10 })
    baseDiscountPercent: number;

    @Column({ type: 'int', default: 5 })
    incrementPerExpansion: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn({ nullable: true })
    deletedAt?: Date;

    @Exclude()
    @OneToMany(() => Product, (product) => product.collection)
    products: Product[];

    @OneToMany(() => Coupon, coupon => coupon.collection)
    specialCoupons: Coupon[];
}

