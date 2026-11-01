import { TaxRoleEntity } from '../../domain/entities';
import { TaxRoleResponse } from '../dto/tax-role.dto';

export function toTaxRoleCatalogResponse(taxRole: TaxRoleEntity): TaxRoleResponse {
  return {
    id: taxRole.id,
    code: taxRole.code,
    name: taxRole.name,
    description: taxRole.description ?? null,
    defaultRate: taxRole.defaultRate ?? null,
    legalBasis: taxRole.legalBasis ?? null,
    isSystem: taxRole.isSystem,
    isActive: taxRole.isActive,
    createdAt: taxRole.createdAt.toISOString(),
    updatedAt: taxRole.updatedAt?.toISOString() ?? null,
  };
}
