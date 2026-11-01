import {
  CustomerCompanyEntity,
  CustomerEntity,
  CustomerIdentificationEntity,
  CustomerTaxProfileEntity,
  CustomerTaxRoleEntity,
} from '../../domain/entities';
import { toTaxRoleCatalogResponse } from './tax-role.mapper';
import {
  CustomerCompanyResponse,
  CustomerIdentificationResponse,
  CustomerResponse,
  CustomerTaxProfileResponse,
  CustomerTaxRoleResponse,
} from '../dto/customer.dto';

export function toCustomerResponse(customer: CustomerEntity): CustomerResponse {
  return {
    id: customer.id,
    nature: customer.nature,
    institutionalSector: customer.institutionalSector,
    publicEntityType: customer.publicEntityType ?? null,
    legalName: customer.legalName,
    tradeName: customer.tradeName ?? null,
    countryId: customer.countryId,
    departmentId: customer.departmentId ?? null,
    municipalityId: customer.municipalityId ?? null,
    addressComplement: customer.addressComplement ?? null,
    phone: customer.phone ?? null,
    email: customer.email ?? null,
    isActive: customer.isActive,
    createdAt: customer.createdAt.toISOString(),
    updatedAt: customer.updatedAt?.toISOString() ?? null,
    identifications: (customer.identifications ?? []).map(toIdentificationResponse),
    taxProfile: customer.taxProfile ? toTaxProfileResponse(customer.taxProfile) : null,
    taxRoles: (customer.taxRoles ?? []).map(toTaxRoleResponse),
    companies: (customer.companies ?? []).map(toCompanyResponse),
  };
}

function toIdentificationResponse(
  identification: CustomerIdentificationEntity,
): CustomerIdentificationResponse {
  return {
    id: identification.id,
    type: identification.type,
    value: identification.value,
    normalizedValue: identification.normalizedValue,
    countryId: identification.countryId,
    isPrimary: identification.isPrimary,
    verifiedAt: identification.verifiedAt?.toISOString() ?? null,
  };
}

function toTaxProfileResponse(taxProfile: CustomerTaxProfileEntity): CustomerTaxProfileResponse {
  return {
    id: taxProfile.id,
    vatStatus: taxProfile.vatStatus,
    taxpayerCategory: taxProfile.taxpayerCategory,
    economicActivityId: taxProfile.economicActivityId ?? null,
    economicActivityDescription: taxProfile.economicActivityDescription ?? null,
    verifiedAt: taxProfile.verifiedAt?.toISOString() ?? null,
    verificationSource: taxProfile.verificationSource ?? null,
    notes: taxProfile.notes ?? null,
  };
}

function toTaxRoleResponse(taxRole: CustomerTaxRoleEntity): CustomerTaxRoleResponse {
  return {
    id: taxRole.id,
    taxRoleId: taxRole.taxRoleId,
    taxRole: taxRole.taxRole ? toTaxRoleCatalogResponse(taxRole.taxRole) : null,
    status: taxRole.status,
    rate: taxRole.rate ?? null,
    resolutionNumber: taxRole.resolutionNumber ?? null,
    validFrom: taxRole.validFrom ?? null,
    validUntil: taxRole.validUntil ?? null,
    verificationSource: taxRole.verificationSource ?? null,
    verifiedAt: taxRole.verifiedAt?.toISOString() ?? null,
    notes: taxRole.notes ?? null,
  };
}

function toCompanyResponse(company: CustomerCompanyEntity): CustomerCompanyResponse {
  return {
    id: company.id,
    companyId: company.companyId,
  };
}
