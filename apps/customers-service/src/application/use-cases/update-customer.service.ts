import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCustomerInput, UpdateCustomerInput } from '../dto/customer.dto';
import { toCustomerResponse } from '../mappers/customer.mapper';
import { CustomerEntity } from '../../domain/entities';
import { CustomerFiscalValidator } from '../../domain/validators/customer-fiscal.validator';
import { CustomersRepository } from '../../infrastructure/repositories/customers.repository';
import { CustomerTaxRoleCatalogValidator } from '../validation/customer-tax-role-catalog.validator';

@Injectable()
export class UpdateCustomerService {
  constructor(
    private readonly customers: CustomersRepository,
    private readonly fiscalValidator: CustomerFiscalValidator,
    private readonly taxRoles: CustomerTaxRoleCatalogValidator,
  ) {}

  async execute(input: UpdateCustomerInput, companyId: string): Promise<CustomerEntity> {
    if (!companyId?.trim()) {
      throw new BadRequestException('Se requiere una empresa para actualizar el cliente.');
    }

    const existing = await this.customers.findById(input.id, companyId);
    if (!existing) throw new NotFoundException(`Customer ${input.id} was not found`);

    // PATCH rules must be checked against the resulting customer, including omitted fields.
    const candidate: CreateCustomerInput = { ...toCustomerResponse(existing), ...input };
    this.fiscalValidator.validate(candidate);

    const assignedIds = new Set(existing.taxRoles.map((role) => role.taxRoleId));
    await this.taxRoles.validate(
      (input.taxRoles ?? []).filter((role) => !assignedIds.has(role.taxRoleId)),
    );

    const updated = await this.customers.update(input, companyId);
    if (!updated) throw new NotFoundException(`Customer ${input.id} was not found`);
    return updated;
  }
}
