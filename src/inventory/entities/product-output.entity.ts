import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { OutputEntity } from './output.entity';
import { ProductEntity } from './product.entity';

@Entity({ name: 'product_output' })
export class ProductOutputEntity extends BaseEntity {
  @Column({ type: 'float', nullable: false, default: 0 })
  amount: number;

  @ManyToOne(() => OutputEntity, (output) => output.productOutput, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  output: OutputEntity;

  @ManyToOne(() => ProductEntity, (product) => product.productOutput, {
    cascade: true,
  })
  product: ProductEntity;
}