import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaxRoleEntity } from '../../domain/entities';
import {
  CreateTaxRoleInput,
  NormalizedListTaxRolesInput,
  UpdateTaxRoleInput,
} from '../../application/dto/tax-role.dto';

type PaginatedTaxRoles = {
  data: TaxRoleEntity[];
  total: number;
};

@Injectable()
export class TaxRolesRepository {
  constructor(
    @InjectRepository(TaxRoleEntity)
    private readonly taxRoles: Repository<TaxRoleEntity>,
  ) {}

  async create(input: CreateTaxRoleInput): Promise<TaxRoleEntity> {
    const taxRole = this.taxRoles.create({
      code: input.code.trim().toUpperCase(),
      name: input.name.trim(),
      description: emptyToNull(input.description?.trim()),
      defaultRate: input.defaultRate ?? null,
      legalBasis: emptyToNull(input.legalBasis?.trim()),
      isSystem: input.isSystem ?? false,
    });

    return this.taxRoles.save(taxRole);
  }

  findById(id: string): Promise<TaxRoleEntity | null> {
    return this.taxRoles.findOne({ where: { id } });
  }

  async findExistingIds(ids: string[]): Promise<string[]> {
    if (!ids.length) {
      return [];
    }

    const taxRoles = await this.taxRoles
      .createQueryBuilder('taxRole')
      .select('taxRole.id', 'id')
      .where('taxRole.id IN (:...ids)', { ids })
      .andWhere('taxRole.is_active = true')
      .getRawMany<{ id: string }>();

    return taxRoles.map((taxRole) => taxRole.id);
  }

  async list(input: NormalizedListTaxRolesInput): Promise<PaginatedTaxRoles> {
    const qb = this.taxRoles
      .createQueryBuilder('taxRole')
      .orderBy('taxRole.name', 'ASC')
      .skip((input.page - 1) * input.limit)
      .take(input.limit);

    if (!input.includeInactive) {
      qb.andWhere('taxRole.is_active = :isActive', { isActive: true });
    }

    if (input.search) {
      qb.andWhere('(LOWER(taxRole.code) LIKE :search OR LOWER(taxRole.name) LIKE :search)', {
        search: `%${input.search.toLowerCase()}%`,
      });
    }

    const [data, total] = await qb.getManyAndCount();

    return { data, total };
  }

  async update(input: UpdateTaxRoleInput): Promise<TaxRoleEntity | null> {
    const taxRole = await this.findById(input.id);

    if (!taxRole) {
      return null;
    }

    if (input.code !== undefined && input.code !== null) {
      taxRole.code = input.code.trim().toUpperCase();
    }

    if (input.name !== undefined && input.name !== null) {
      taxRole.name = input.name.trim();
    }

    if (input.description !== undefined) {
      taxRole.description = emptyToNull(input.description?.trim());
    }

    if (input.defaultRate !== undefined) {
      taxRole.defaultRate = input.defaultRate;
    }

    if (input.legalBasis !== undefined) {
      taxRole.legalBasis = emptyToNull(input.legalBasis?.trim());
    }

    if (input.isActive !== undefined && input.isActive !== null) {
      taxRole.isActive = input.isActive;
    }

    return this.taxRoles.save(taxRole);
  }
}

function emptyToNull<T extends string>(value: T | null | undefined): T | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  return value;
}
