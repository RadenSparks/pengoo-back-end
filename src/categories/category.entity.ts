import { Entity, Column, PrimaryGeneratedColumn, OneToMany, DeleteDateColumn } from 'typeorm';
import { Product } from '../products/entities/product.entity';

@Entity('category')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ length: 100, nullable: true })
  description: string;

  @OneToMany(() => Product, (product) => product.category_ID)
  products: Product[];

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;
}
