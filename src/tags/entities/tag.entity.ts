import { Product } from "src/products/product.entity";
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('tag')
export class Tag {
      @PrimaryGeneratedColumn()
      id: number;
      @Column()
      name: string;

      @ManyToMany(() => Product, (product) => product.tags)
      products: Product[];
}
