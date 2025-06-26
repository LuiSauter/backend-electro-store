import { BaseEntity } from 'src/common/entities/base.entity';
import { Entity, Column, ManyToOne } from 'typeorm';
import { ProductEntity } from './product.entity';

@Entity('notifications')
export class NotificationEntity extends BaseEntity {

  @Column({ type: 'int' })
  currentStock: number;

  @Column({ type: 'int' })
  minStock: number;

  @Column({ type: 'boolean', default: false })
  isRead: boolean;

  @ManyToOne(() => ProductEntity, (product) => product.notifications, { onDelete: 'CASCADE' })
  product: ProductEntity;
}