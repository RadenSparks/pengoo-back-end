import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Product } from '../products/entities/product.entity';
import { Order } from '../orders/order.entity';

@Entity()
export class Wishlist {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.wishlists, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Product, product => product.wishlists, { onDelete: 'CASCADE' })
  product: Product;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Order, order => order.wishlistItems, { nullable: true })
  movedToOrder: Order | null;
}
