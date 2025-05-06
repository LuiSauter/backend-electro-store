import { Column, Entity, ManyToOne, OneToMany } from "typeorm";

import { BaseEntity } from "../../common/entities/base.entity";
import { ProductEntity } from "./product.entity";

@Entity({ name: 'descuento' })
export class DiscountEntity extends BaseEntity {

  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string;

  @Column({ type: 'float', nullable: true, default: 0 })
  amount?: number;

  @Column({ type: 'float', nullable: true, default: 0 })
  percent?: number;

  @Column({ type: 'boolean', nullable: false, default: true })
  isActive: boolean;

  @Column({ type: 'date', nullable: false })
  initialDate: string;

  @Column({ type: 'date', nullable: false })
  finalDate: string;

  @ManyToOne(() => ProductEntity, (p) => p.discounts, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  product: ProductEntity;

}
