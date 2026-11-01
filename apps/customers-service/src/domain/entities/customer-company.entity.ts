import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseAuditEntity, DatabaseSchema } from '@takumi/database';
import { CustomerEntity } from './customer.entity';

@Entity({ schema: DatabaseSchema.CUSTOMERS, name: 'customer_companies' })
@Index('ix_customer_companies_company', ['companyId'])
@Index('uq_customer_companies_customer_company', ['customerId', 'companyId'], {
  unique: true,
  where: '"deleted_at" IS NULL',
})
export class CustomerCompanyEntity extends BaseAuditEntity {
  @Column({ name: 'customer_id', type: 'uuid' })
  customerId: string;

  @ManyToOne(() => CustomerEntity, (customer) => customer.companies, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'customer_id' })
  customer: CustomerEntity;

  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;
}
