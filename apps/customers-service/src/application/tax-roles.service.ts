import { Injectable, NotFoundException } from '@nestjs/common';
import { validatePayload } from '@takumi/common';
import {
  CreateTaxRoleInput,
  GetTaxRoleByIdInput,
  ListTaxRolesInput,
  ListTaxRolesResponse,
  NormalizedListTaxRolesInput,
  TaxRoleResponse,
  UpdateTaxRoleInput,
} from './dto/tax-role.dto';
import { toTaxRoleCatalogResponse } from './mappers/tax-role.mapper';
import {
  createTaxRoleSchema,
  getTaxRoleByIdSchema,
  listTaxRolesSchema,
  updateTaxRoleSchema,
} from './validation/tax-role.schemas';
import { TaxRolesRepository } from '../infrastructure/repositories/tax-roles.repository';

@Injectable()
export class TaxRolesService {
  constructor(private readonly taxRoles: TaxRolesRepository) {}

  async create(payload: CreateTaxRoleInput): Promise<TaxRoleResponse> {
    const input = validatePayload(createTaxRoleSchema, payload, {
      message: 'Invalid tax role payload',
    });
    const taxRole = await this.taxRoles.create(input);

    return toTaxRoleCatalogResponse(taxRole);
  }

  async update(payload: UpdateTaxRoleInput): Promise<TaxRoleResponse> {
    const input = validatePayload(updateTaxRoleSchema, payload, {
      message: 'Invalid tax role update payload',
    });
    const taxRole = await this.taxRoles.update(input);

    if (!taxRole) {
      throw new NotFoundException(`Tax role ${input.id} was not found`);
    }

    return toTaxRoleCatalogResponse(taxRole);
  }

  async findById(payload: GetTaxRoleByIdInput): Promise<TaxRoleResponse> {
    const { id } = validatePayload(getTaxRoleByIdSchema, payload, {
      message: 'Invalid tax role lookup payload',
    });
    const taxRole = await this.taxRoles.findById(id);

    if (!taxRole) {
      throw new NotFoundException(`Tax role ${id} was not found`);
    }

    return toTaxRoleCatalogResponse(taxRole);
  }

  async list(payload: ListTaxRolesInput): Promise<ListTaxRolesResponse> {
    const input = validatePayload(listTaxRolesSchema, payload ?? {}, {
      message: 'Invalid tax roles list payload',
    });
    const query = normalizeListInput(input);
    const { data, total } = await this.taxRoles.list(query);

    return {
      data: data.map(toTaxRoleCatalogResponse),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }
}

function normalizeListInput(input: ListTaxRolesInput): NormalizedListTaxRolesInput {
  return {
    search: input.search || null,
    page: input.page ?? 1,
    limit: input.limit ?? 25,
    includeInactive: input.includeInactive ?? false,
  };
}
