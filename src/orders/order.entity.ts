import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Product } from '../products/product.entity';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.id)
  user: User;

  @Column()
  status: string; // 'placed', 'shipped', 'delivered', 'cancelled', 'returned'

  @Column('decimal')
  total: number;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => OrderItem, orderItem => orderItem.order, { cascade: true })
  items: OrderItem[];
}

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, order => order.items)
  order: Order;

  @ManyToOne(() => Product, product => product.id)
  product: Product;

  @Column('int')
  quantity: number;

  @Column('decimal')
  price: number;
}
