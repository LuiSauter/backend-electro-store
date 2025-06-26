import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { ProductOutputEntity } from './product-output.entity';
import { UsersEntity } from 'src/users/entities/users.entity';

@Entity({ name: 'output' })
export class OutputEntity extends BaseEntity {
  @Column({ type: 'varchar', nullable: false })
  date: string;

  @Column({ type: 'varchar', nullable: false })
  time: string;

  @Column({ type: 'varchar', nullable: false, length: 500 })
  reason: string;

  @Column({ type: 'varchar', nullable: true, length: 500 })
  destination: string;

  @Column({ type: 'varchar', nullable: true, length: 500 })
  additionalNotes: string;

  @ManyToOne(() => UsersEntity, (user) => user.outputs, {
    nullable: false,
    onDelete: 'CASCADE'
  })
  user: UsersEntity;

  @OneToMany(() => ProductOutputEntity, (productOutput) => productOutput.output, { cascade: true })
  productOutput: ProductOutputEntity[];
}