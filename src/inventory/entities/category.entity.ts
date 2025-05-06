import { Column, Entity, OneToMany } from "typeorm";
import { BaseEntity } from "../../common/entities/base.entity";
import { ProductEntity } from "./product.entity";

@Entity({ name: 'category' })
export class CategoryEntity extends BaseEntity {

    @Column({ type: 'varchar', length: 150, nullable: false })
    name: string;

    @Column({ type: 'boolean', default: true, nullable: false })
    is_active: boolean;

    @OneToMany(() => ProductEntity, (p) => p.category, { onDelete: 'CASCADE', nullable: false })
    products: ProductEntity[];

}