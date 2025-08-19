import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Product } from '../../products/product.entity';

@Entity()
export class Image {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  folder?: string;

  @Column({ nullable: true, type: 'int' })
  ord?: number;

  @ManyToOne(() => Product, (product) => product.images, { nullable: true, onDelete: 'CASCADE' })
  product?: Product;
}