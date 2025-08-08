import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, CreateDateColumn, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Product } from '../products/product.entity';
import { Delivery } from '../delivery/delivery.entity';
import { Review } from '../reviews/review.entity';
import { Wishlist } from '../wishlist/wishlist.entity';

export enum PaymentStatus {
  Paid = 'paid',
  Pending = 'pending', // <-- Add this line
  PendingOnDelivery = 'pending_on_delivery',
  Refunded = 'refunded',
  Success = 'success',
  Canceled = 'canceled',
}

export enum ProductStatus {
  Pending = 'pending',
  Cancelled = 'cancelled',
  Shipped = 'shipped',
  Delivered = 'delivered',
}

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number; // Primary key

  @ManyToOne(() => User, user => user.id, { nullable: false })
  user: User; // User

  @ManyToOne(() => Delivery, { nullable: false })
  @JoinColumn({ name: 'delivery_id' }) // This will use delivery_id as the foreign key
  delivery: Delivery; // Delivery method

  @Column({ type: 'int', nullable: true })
  coupon_id: number | null; // Coupon ID

  // Optionally, keep the code for history:
  @Column({ type: 'varchar', nullable: true })
  coupon_code: string | null;

  @Column({ type: 'varchar', nullable: false })
  payment_type: string; // Payment method

  @CreateDateColumn({ type: 'date', nullable: false })
  order_date: Date; // Order date

  @Column({ type: 'int', nullable: false })
  total_price: number; // Total price

  @Column({ type: 'bigint', nullable: true, default: null })
  order_code: number; // Total price

  @Column({ type: 'varchar', nullable: false })
  shipping_address: string; // Shipping address

  @Column({ type: 'varchar', nullable: true })
  payment_status: PaymentStatus; // Payment status

  @Column({ type: 'varchar', nullable: true })
  productStatus: string; // Product availability status

  @Column({ type: 'varchar', nullable: true })
  paypal_order_id: string | null;

  @OneToMany(() => OrderDetail, orderDetail => orderDetail.order, { cascade: true })
  details: OrderDetail[];

  @OneToMany(() => Review, review => review.order)
  reviews: Review[];

  @OneToMany(() => Wishlist, wishlist => wishlist.movedToOrder)
  wishlistItems: Wishlist[];
}

@Entity()
export class OrderDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, order => order.details)
  order: Order;

  @ManyToOne(() => Product, product => product.id)
  product: Product;

  @Column('int')
  quantity: number;

  @Column('decimal')
  price: number; // price per unit at the time of order

  get total(): number {
    return Number(this.price) * this.quantity;
  }
}
