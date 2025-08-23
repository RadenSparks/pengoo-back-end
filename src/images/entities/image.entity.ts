import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, DeleteDateColumn } from 'typeorm';
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

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date; // <-- Add this line for soft delete support
  }