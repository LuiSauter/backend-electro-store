import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

import { BaseEntity } from 'src/common/entities/base.entity';
import { CategoryEntity } from './category.entity';
import { DiscountEntity } from './discount.entity';
import { BuyDetailEntity } from 'src/buy/entities/buy.entity';
import { SaleDetailEntity } from 'src/sales/entities/sales.entity';

@Entity({ name: 'product' })
export class ProductEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 256, nullable: true })
  description: string;

  @Column({ type: 'int', nullable: false })
  minimum_stock: number;

  @Column({ type: 'varchar', length: 256, nullable: true })
  image_url: string;

  @Column({ type: 'varchar', length: 256, nullable: true })
  image_path: string;

  @Column({ type: 'int', nullable: true, default: 0 })
  stock: number;

  @Column({ type: 'float', nullable: true, default: 0 })
  purchase_price: number;

  @Column({ type: 'float', nullable: true, default: 0 })
  sale_price: number;

  @Column({ type: 'bool', default: true })
  is_active: boolean;

  @ManyToOne(() => CategoryEntity, (c) => c.products, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  category: CategoryEntity;

  @OneToMany(() => DiscountEntity, (d) => d.product, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  discounts: DiscountEntity[];

  @OneToMany(() => BuyDetailEntity, (bd) => bd.product, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  buyDetails: BuyDetailEntity[];

  @OneToMany(() => SaleDetailEntity, (sd) => sd.product, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  saleDetails: SaleDetailEntity[];
}
