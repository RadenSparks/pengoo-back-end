import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Product } from '../products/entities/product.entity';
import { Order } from '../orders/order.entity';

@Entity()
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  rating: number;

  @Column('text')
  content: string; // Review content

  @CreateDateColumn()
  createdAt: Date; // Time created

  @ManyToOne(() => User, user => user.reviews, { nullable: false })
  user: User;

  @ManyToOne(() => Product, product => product.reviews, { onDelete: 'CASCADE' })
  product: Product;

  @ManyToOne(() => Order, order => order.reviews, { nullable: true })
  order: Order; // Optional: link to the order this review is about

  @Column({ type: 'enum', enum: ['Visible', 'Hidden'], default: 'Visible' })
  status: 'Visible' | 'Hidden';
}
