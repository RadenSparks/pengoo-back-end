import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';
import { Product } from '../products/product.entity';

@Entity()
export class Wishlist {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.id)
  user: User;

  @ManyToOne(() => Product, product => product.id)
  product: Product;
}
