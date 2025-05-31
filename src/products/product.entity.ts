import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { Category } from '../categories/category.entity';
import { Review } from 'src/reviews/review.entity';
import { Wishlist } from 'src/wishlist/wishlist.entity';

@Entity('product')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

  @Column('text', { nullable: false })
  description: string;

  @Column('decimal', { nullable: false })
  price: number;

  @Column({ nullable: false })
  sku: string;

  @Column({ nullable: false })
  quantity: number;

  @ManyToOne(() => Category, (category) => category.products)
  category: Category;

  
  @OneToMany(() => Review, (review) => review.product)
  reviews: Review[];

  @OneToMany(() => Wishlist, (wishlist) => wishlist.product)
  wishlists: Wishlist[];
}
