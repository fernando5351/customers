import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCustomerTaxRoleInput } from '../dto/customer.dto';
import { TaxRolesRepository } from '../../infrastructure/repositories/tax-roles.repository';

@Injectable()
export class CustomerTaxRoleCatalogValidator {
  constructor(private readonly taxRoles: TaxRolesRepository) {}

  async validate(roles: CreateCustomerTaxRoleInput[]): Promise<void> {
    const ids = [...new Set(roles.map((role) => role.taxRoleId))];
    if (!ids.length) return;

    const existingIds = await this.taxRoles.findExistingIds(ids);
    const missingIds = ids.filter((id) => !existingIds.includes(id));
    if (missingIds.length) {
      throw new BadRequestException({
        message: 'Algunos roles fiscales no existen o no están activos.',
        details: missingIds.map((id) => ({
          path: 'taxRoles.taxRoleId',
          message: `Tax role ${id} was not found or is inactive`,
        })),
      });
    }
  }
}
