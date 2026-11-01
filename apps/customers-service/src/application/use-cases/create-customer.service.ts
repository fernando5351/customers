import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCustomerInput } from '../dto/customer.dto';
import { CustomerEntity } from '../../domain/entities';
import { CustomerFiscalValidator } from '../../domain/validators/customer-fiscal.validator';
import { CustomersRepository } from '../../infrastructure/repositories/customers.repository';
import { CustomerTaxRoleCatalogValidator } from '../validation/customer-tax-role-catalog.validator';

@Injectable()
export class CreateCustomerService {
  constructor(
    private readonly customers: CustomersRepository,
    private readonly taxRoles: CustomerTaxRoleCatalogValidator,
    private readonly fiscalValidator: CustomerFiscalValidator,
  ) {}

  async execute(input: CreateCustomerInput, companyId: string): Promise<CustomerEntity> {
    if (!companyId?.trim()) {
      throw new BadRequestException('Se requiere una empresa para registrar el cliente.');
    }

    this.fiscalValidator.validate(input);
    await this.taxRoles.validate(input.taxRoles ?? []);

    return this.customers.create(input, companyId);
  }
}
