import { Column, Entity, ManyToOne, OneToMany } from "typeorm";

import { BaseEntity } from "../../common/entities/base.entity";
import { UsersEntity } from "src/users/entities/users.entity";
import { ProductEntity } from "src/inventory/entities/product.entity";

@Entity({ name: 'sale' })
export class SaleEntity extends BaseEntity {

  @Column({ type: 'int', nullable: false, unique: true, generated: 'increment' })
  code: number;

  @Column({ type: 'float', nullable: false })
  amountPaid: number;

  @Column({ type: 'float', nullable: false })
  amountReceivable: number;

  @Column({ type: 'float', nullable: false })
  amountReturned: number;

  @Column({ type: 'varchar', nullable: false })
  date: string;

  @Column({ type: 'varchar', nullable: false })
  time: string;

  @Column({ type: 'varchar', nullable: true })
  paymentMethod: string;

  @Column({ type: 'float', nullable: true, default: 0 })
  discount: number;

  @ManyToOne(() => UsersEntity, user => user.salesSeller, { nullable: false, onDelete: 'CASCADE' })
  seller: UsersEntity

  @ManyToOne(() => UsersEntity, customer => customer.salesCustomer, { nullable: false, onDelete: 'CASCADE' })
  customer: UsersEntity

  @OneToMany(() => SaleDetailEntity, saleDetail => saleDetail.sale, {
    nullable: true,
    onDelete: 'CASCADE'
  })
  saleDetails: SaleDetailEntity[];
}

@Entity({ name: 'sale_detail' })
export class SaleDetailEntity extends BaseEntity {

  @Column({ type: 'int', nullable: false })
  amount: number;

  @Column({ type: 'float', nullable: false })
  price: number;

  @Column({ type: 'float', nullable: false })
  subTotal: number;

  @ManyToOne(() => SaleEntity, saleNote => saleNote.saleDetails, { nullable: false, onDelete: 'CASCADE' })
  sale: SaleEntity;

  @ManyToOne(() => ProductEntity, product => product.saleDetails, { nullable: false, onDelete: 'CASCADE' })
  product: ProductEntity;

}