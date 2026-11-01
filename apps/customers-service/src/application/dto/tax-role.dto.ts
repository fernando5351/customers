export type CreateTaxRoleInput = {
  code: string;
  name: string;
  description?: string | null;
  defaultRate?: number | null;
  legalBasis?: string | null;
  isSystem?: boolean | null;
};

export type UpdateTaxRoleInput = {
  id: string;
  code?: string | null;
  name?: string | null;
  description?: string | null;
  defaultRate?: number | null;
  legalBasis?: string | null;
  isActive?: boolean | null;
};

export type GetTaxRoleByIdInput = {
  id: string;
};

export type ListTaxRolesInput = {
  search?: string | null;
  page?: number | null;
  limit?: number | null;
  includeInactive?: boolean | null;
};

export type NormalizedListTaxRolesInput = {
  search: string | null;
  page: number;
  limit: number;
  includeInactive: boolean;
};

export type TaxRoleResponse = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  defaultRate: number | null;
  legalBasis: string | null;
  isSystem: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
};

export type ListTaxRolesResponse = {
  data: TaxRoleResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
