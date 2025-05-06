import { Entity, ManyToOne, OneToMany } from 'typeorm';
import { Column } from 'typeorm/decorator/columns/Column';

import { BaseEntity } from 'src/common/entities/base.entity';
import { CategoryEntity } from './category.entity';
import { DiscountEntity } from './discount.entity';

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
}
