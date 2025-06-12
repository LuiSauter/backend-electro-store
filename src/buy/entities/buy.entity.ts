import { UsersEntity } from 'src/users/entities/users.entity';
import { Column, Entity, ManyToOne, OneToMany} from 'typeorm';
import { ProviderEntity } from './providers.entity';
import { ProductEntity } from 'src/inventory/entities/product.entity';
import { BaseEntity } from 'src/common/entities/base.entity';

@Entity({ name: 'buy' })
export class BuyEntity extends BaseEntity {

  @Column({ type: 'int', nullable: false, unique: true, generated: 'increment' })
  code: number;

  @Column({ type: 'float', nullable: false })
  totalAmount: number;

  @Column({ type: 'varchar', nullable: false })
  date: string;

  @Column({ type: 'varchar', nullable: false })
  time: string;

  @ManyToOne(() => UsersEntity, user => user.buys, { nullable: false, onDelete: 'CASCADE' })
  user: UsersEntity;

  @ManyToOne(() => ProviderEntity, provider => provider.buys, { nullable: true, onDelete: 'CASCADE' })
  provider: ProviderEntity;

  @OneToMany(() => BuyDetailEntity, buyDetail => buyDetail.buy, { nullable: true, onDelete: 'CASCADE' })
  buyDetails: BuyDetailEntity[];

}

@Entity({ name: 'buy_detail' })
export class BuyDetailEntity extends BaseEntity {

  @Column({ type: 'int', nullable: false })
  amount: number;

  @Column({ type: 'float', nullable: false })
  price: number;

  @Column({ type: 'float', nullable: false })
  subTotal: number;

  @ManyToOne(() => BuyEntity, buyNote => buyNote.buyDetails, { nullable: false, onDelete: 'CASCADE' })
  buy: BuyEntity;

  @ManyToOne(() => ProductEntity, product => product.buyDetails, { nullable: false, onDelete: 'CASCADE' })
  product: ProductEntity;

}