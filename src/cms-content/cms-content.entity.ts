import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Product } from '../products/entities/product.entity';

@Entity()
export class CmsContent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  heroTitle: string;

  @Column({ nullable: true })
  heroSubtitle: string;

  @Column({ type: 'jsonb', nullable: true })
  heroImages: string[];

  @Column({ nullable: true })
  aboutTitle: string;

  @Column({ type: 'text', nullable: true })
  aboutText: string;

  @Column({ type: 'jsonb', nullable: true })
  aboutImages: string[];

  @Column({ type: 'jsonb', nullable: true })
  sliderImages: string[];

  @Column({ nullable: true })
  detailsTitle: string;

  @Column({ type: 'text', nullable: true })
  detailsContent: string;

  @Column({ type: 'jsonb', nullable: true })
  tabs: { title: string; content: string; images: string[] }[];

  @Column({ nullable: true })
  fontFamily: string;

  @Column({ nullable: true })
  fontSize: string;

  @Column({ nullable: true })
  textColor: string;

  @Column({ nullable: true })
  bgColor: string;

  @Column({ type: 'jsonb', nullable: true })
  featuredSections: Array<{
    title: string;
    description: string;
    imageSrc: string;
    imageAlt?: string;
    textBgColor?: string;
    isImageRight?: boolean;
  }>;

  @OneToOne(() => Product, product => product.cmsContent, { onDelete: 'CASCADE' })
  @JoinColumn()
  product: Product;
}