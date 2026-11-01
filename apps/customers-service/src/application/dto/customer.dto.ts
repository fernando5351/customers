import {
  CustomerIdentificationType,
  CustomerNature,
  CustomerTaxRoleStatus,
  InstitutionalSector,
  PublicEntityType,
  TaxpayerCategory,
  VatStatus,
} from '../../domain/entities';
import { TaxRoleResponse } from './tax-role.dto';

export type CreateCustomerIdentificationInput = {
  type: CustomerIdentificationType;
  value: string;
  normalizedValue?: string | null;
  countryId?: string | null;
  isPrimary?: boolean | null;
  verifiedAt?: string | null;
};

export type CreateCustomerTaxProfileInput = {
  vatStatus: VatStatus;
  taxpayerCategory?: TaxpayerCategory | null;
  economicActivityId?: string | null;
  economicActivityDescription?: string | null;
  verifiedAt?: string | null;
  verificationSource?: string | null;
  notes?: string | null;
};

export type CreateCustomerTaxRoleInput = {
  taxRoleId: string;
  status?: CustomerTaxRoleStatus | null;
  rate?: number | null;
  resolutionNumber?: string | null;
  validFrom?: string | null;
  validUntil?: string | null;
  verificationSource?: string | null;
  verifiedAt?: string | null;
  notes?: string | null;
};

export type CreateCustomerCompanyInput = {
  companyId: string;
};

export type CreateCustomerInput = {
  nature: CustomerNature;
  institutionalSector?: InstitutionalSector | null;
  publicEntityType?: PublicEntityType | null;
  legalName: string;
  tradeName?: string | null;
  countryId?: string | null;
  departmentId?: string | null;
  municipalityId?: string | null;
  addressComplement?: string | null;
  phone?: string | null;
  email?: string | null;
  identifications?: CreateCustomerIdentificationInput[] | null;
  taxProfile?: CreateCustomerTaxProfileInput | null;
  taxRoles?: CreateCustomerTaxRoleInput[] | null;
  companies?: CreateCustomerCompanyInput[] | null;
};

export type UpdateCustomerInput = Partial<CreateCustomerInput> & {
  id: string;
};

export type GetCustomerByIdInput = {
  id: string;
};

export type ListCustomersInput = {
  companyId?: string | null;
  search?: string | null;
  nature?: CustomerNature | null;
  isActive?: boolean | null;
  page?: number | null;
  limit?: number | null;
  includeInactive?: boolean | null;
};

export type NormalizedListCustomersInput = {
  companyId: string;
  search: string | null;
  nature: CustomerNature | null;
  isActive: boolean | null;
  page: number;
  limit: number;
  includeInactive: boolean;
};

export type CustomerIdentificationResponse = {
  id: string;
  type: CustomerIdentificationType;
  value: string;
  normalizedValue: string;
  countryId: string;
  isPrimary: boolean;
  verifiedAt: string | null;
};

export type CustomerTaxProfileResponse = {
  id: string;
  vatStatus: VatStatus;
  taxpayerCategory: TaxpayerCategory;
  economicActivityId: string | null;
  economicActivityDescription: string | null;
  verifiedAt: string | null;
  verificationSource: string | null;
  notes: string | null;
};

export type CustomerTaxRoleResponse = {
  id: string;
  taxRoleId: string;
  taxRole: TaxRoleResponse | null;
  status: CustomerTaxRoleStatus;
  rate: number | null;
  resolutionNumber: string | null;
  validFrom: string | null;
  validUntil: string | null;
  verificationSource: string | null;
  verifiedAt: string | null;
  notes: string | null;
};

export type CustomerCompanyResponse = {
  id: string;
  companyId: string;
};

export type CustomerResponse = {
  id: string;
  nature: CustomerNature;
  institutionalSector: InstitutionalSector;
  publicEntityType: PublicEntityType | null;
  legalName: string;
  tradeName: string | null;
  countryId: string;
  departmentId: string | null;
  municipalityId: string | null;
  addressComplement: string | null;
  phone: string | null;
  email: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
  identifications: CustomerIdentificationResponse[];
  taxProfile: CustomerTaxProfileResponse | null;
  taxRoles: CustomerTaxRoleResponse[];
  companies: CustomerCompanyResponse[];
};

export type ListCustomersResponse = {
  data: CustomerResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type CustomersHealthResponse = {
  status: 'ok';
  service: 'customers-service';
  totalCustomers: number;
  timestamp: string;
};
