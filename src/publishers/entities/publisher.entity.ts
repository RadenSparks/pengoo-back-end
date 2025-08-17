import { Product } from "../../products/product.entity";
import { Column, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('publisher')
export class Publisher {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @OneToMany(() => Product, (product: Product) => product.publisher_ID)
    products: Product[];

    @DeleteDateColumn({ nullable: true })
    deletedAt?: Date;
}
