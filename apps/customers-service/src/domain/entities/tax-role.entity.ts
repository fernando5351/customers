import { Column, Entity, Index, OneToMany } from 'typeorm';
import { BaseAuditEntity, DatabaseSchema, decimalNumberTransformer } from '@takumi/database';
import { CustomerTaxRoleEntity } from './customer-tax-role.entity';

@Entity({ schema: DatabaseSchema.CUSTOMERS, name: 'tax_roles' })
@Index('ux_tax_roles_code', ['code'], {
  unique: true,
  where: '"deleted_at" IS NULL',
})
@Index('ix_tax_roles_active', ['isActive'])
export class TaxRoleEntity extends BaseAuditEntity {
  @Column({ name: 'code', type: 'varchar', length: 50 })
  code: string;

  @Column({ name: 'name', type: 'varchar', length: 150 })
  name: string;

  @Column({ name: 'description', type: 'varchar', length: 500, nullable: true })
  description?: string | null;

  @Column({
    name: 'default_rate',
    type: 'decimal',
    precision: 8,
    scale: 6,
    nullable: true,
    transformer: decimalNumberTransformer,
  })
  defaultRate?: number | null;

  @Column({ name: 'legal_basis', type: 'varchar', length: 250, nullable: true })
  legalBasis?: string | null;

  @Column({ name: 'is_system', type: 'boolean', default: false })
  isSystem: boolean;

  @OneToMany(() => CustomerTaxRoleEntity, (customerTaxRole) => customerTaxRole.taxRole)
  customerTaxRoles: CustomerTaxRoleEntity[];
}
