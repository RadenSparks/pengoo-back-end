import { Cart } from 'src/cart/cart.entity';
import { Review } from 'src/reviews/review.entity';
import { Wishlist } from 'src/wishlist/wishlist.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true, nullable: false })
  username: string;

  @Column({ length: 100, nullable: false })
  full_name: string;

  @Column({ type: 'text', nullable: false })
  password: string;

  @Column({ length: 100, unique: true, nullable: false })
  email: string;

  @Column({ length: 50, nullable: false, default: 'USER' })
  role: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone_number: string;

  @Column({ type: 'text', nullable: true })
  avatar_url: string;

  @Column({ nullable: false, default: true })
  status: boolean;

  @Column({ type: 'text', nullable: true })
  address: string;

  @OneToMany(() => Review, review => review.user)
  reviews: Review[];

  @OneToMany(() => Wishlist, wishlist => wishlist.user)
  wishlists: Wishlist[];

  @OneToMany(() => Cart, cart => cart.user)
  carts: Cart[];
}