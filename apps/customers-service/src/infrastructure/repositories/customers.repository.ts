import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, DeepPartial, FindOptionsRelations, FindOptionsWhere, Repository } from 'typeorm';
import {
  CustomerIdentificationType,
  CustomerEntity,
  InstitutionalSector,
  TaxpayerCategory,
  CustomerTaxRoleStatus,
  CustomerIdentificationEntity,
  CustomerTaxProfileEntity,
  CustomerTaxRoleEntity,
  CustomerCompanyEntity,
} from '../../domain/entities';
import {
  CreateCustomerInput,
  CreateCustomerIdentificationInput,
  CreateCustomerTaxProfileInput,
  CreateCustomerTaxRoleInput,
  NormalizedListCustomersInput,
  UpdateCustomerInput,
} from '../../application/dto/customer.dto';

type PaginatedCustomers = {
  data: CustomerEntity[];
  total: number;
};

const customerRelations: FindOptionsRelations<CustomerEntity> = {
  identifications: true,
  taxProfile: true,
  taxRoles: {
    taxRole: true,
  },
  companies: true,
};

@Injectable()
export class CustomersRepository {
  constructor(
    @InjectRepository(CustomerEntity)
    private readonly customers: Repository<CustomerEntity>,
    private readonly dataSource: DataSource,
  ) {}

  count(): Promise<number> {
    return this.customers.count();
  }

  async create(input: CreateCustomerInput): Promise<CustomerEntity> {
    return this.dataSource.transaction(async (manager) => {
      const customerRepository = manager.getRepository(CustomerEntity);
      const customer = customerRepository.create({
        nature: input.nature,
        institutionalSector: input.institutionalSector ?? InstitutionalSector.NOT_APPLICABLE,
        publicEntityType: emptyToNull(input.publicEntityType),
        legalName: input.legalName.trim(),
        tradeName: emptyToNull(input.tradeName?.trim()),
        countryId: input.countryId ?? 'SV',
        departmentId: emptyToNull(input.departmentId),
        municipalityId: emptyToNull(input.municipalityId),
        addressComplement: emptyToNull(input.addressComplement?.trim()),
        phone: emptyToNull(input.phone?.trim()),
        email: emptyToNull(input.email?.trim().toLowerCase()),
        identifications: (input.identifications ?? []).map((identification) =>
          this.toIdentificationEntity(identification),
        ),
        taxProfile: input.taxProfile ? this.toTaxProfileEntity(input.taxProfile) : null,
        taxRoles: (input.taxRoles ?? []).map((taxRole) => this.toTaxRoleEntity(taxRole)),
        companies: (input.companies ?? []).map((company) => ({
          companyId: company.companyId,
        })),
      });

      const saved = await customerRepository.save(customer);
      const created = await customerRepository.findOne({
        where: { id: saved.id },
        relations: customerRelations,
      });

      if (!created) {
        throw new Error(`Customer ${saved.id} was not found after persistence`);
      }

      return created;
    });
  }

  async update(input: UpdateCustomerInput): Promise<CustomerEntity | null> {
    return this.dataSource.transaction(async (manager) => {
      const repository = manager.getRepository(CustomerEntity);
      const customer = await repository.findOne({
        where: { id: input.id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!customer) return null;

      if (input.nature !== undefined) customer.nature = input.nature;
      if (input.institutionalSector !== undefined) {
        customer.institutionalSector = input.institutionalSector ?? InstitutionalSector.NOT_APPLICABLE;
      }
      if (input.publicEntityType !== undefined) customer.publicEntityType = emptyToNull(input.publicEntityType);
      if (input.legalName !== undefined) customer.legalName = input.legalName.trim();
      if (input.tradeName !== undefined) customer.tradeName = emptyToNull(input.tradeName?.trim());
      if (input.countryId !== undefined) customer.countryId = input.countryId ?? 'SV';
      if (input.departmentId !== undefined) customer.departmentId = emptyToNull(input.departmentId);
      if (input.municipalityId !== undefined) customer.municipalityId = emptyToNull(input.municipalityId);
      if (input.addressComplement !== undefined) customer.addressComplement = emptyToNull(input.addressComplement?.trim());
      if (input.phone !== undefined) customer.phone = emptyToNull(input.phone?.trim());
      if (input.email !== undefined) customer.email = emptyToNull(input.email?.trim().toLowerCase());
      await repository.save(customer);

      if (input.identifications !== undefined) {
        const identifications = manager.getRepository(CustomerIdentificationEntity);
        // Release the unique primary-document slot before assigning the new primary.
        await identifications.update({ customerId: customer.id, isPrimary: true }, { isPrimary: false });
        await synchronizeCustomerRelations(
          identifications,
          customer.id,
          (input.identifications ?? []).map((item) => this.toIdentificationEntity(item)),
          (item) => `${item.type}:${item.normalizedValue}:${item.countryId}`,
        );
      }

      if (input.taxProfile !== undefined) {
        const profiles = manager.getRepository(CustomerTaxProfileEntity);
        const existing = await profiles.findOneBy({ customerId: customer.id });
        if (input.taxProfile) {
          await profiles.save(profiles.create({
            ...existing,
            ...this.toTaxProfileEntity(input.taxProfile),
            customerId: customer.id,
          }));
        } else if (existing) {
          await profiles.remove(existing);
        }
      }

      if (input.taxRoles !== undefined) {
        await synchronizeCustomerRelations(
          manager.getRepository(CustomerTaxRoleEntity),
          customer.id,
          (input.taxRoles ?? []).map((item) => this.toTaxRoleEntity(item)),
          (item) => item.taxRoleId!,
        );
      }

      if (input.companies !== undefined) {
        await synchronizeCustomerRelations<CustomerCompanyEntity>(
          manager.getRepository(CustomerCompanyEntity),
          customer.id,
          (input.companies ?? []).map((item) => ({ companyId: item.companyId })),
          (item) => item.companyId!,
        );
      }

      return repository.findOne({ where: { id: customer.id }, relations: customerRelations });
    });
  }

  async findById(id: string): Promise<CustomerEntity | null> {
    return this.customers.findOne({
      where: { id },
      relations: customerRelations,
    });
  }

  async findByIdOrFail(id: string): Promise<CustomerEntity> {
    const customer = await this.findById(id);

    if (!customer) {
      throw new Error(`Customer ${id} was not found after persistence`);
    }

    return customer;
  }

  async list(input: NormalizedListCustomersInput): Promise<PaginatedCustomers> {
    const page = input.page;
    const limit = input.limit;
    const qb = this.customers
      .createQueryBuilder('customer')
      .leftJoinAndSelect('customer.identifications', 'identifications')
      .leftJoinAndSelect('customer.taxProfile', 'taxProfile')
      .leftJoinAndSelect('customer.taxRoles', 'taxRoles')
      .leftJoinAndSelect('taxRoles.taxRole', 'taxRole')
      .leftJoinAndSelect('customer.companies', 'companies')
      .orderBy('customer.legalName', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    if (input.isActive !== null) {
      qb.andWhere('customer.is_active = :isActive', { isActive: input.isActive });
    } else if (!input.includeInactive) {
      qb.andWhere('customer.is_active = :isActive', { isActive: true });
    }

    if (input.nature) {
      qb.andWhere('customer.nature = :nature', { nature: input.nature });
    }

    if (input.companyId) {
      qb.andWhere('companies.company_id = :companyId', { companyId: input.companyId });
    }

    if (input.search) {
      const normalizedSearch = input.search.replace(/[^0-9A-Za-z]/g, '').toLowerCase();
      qb.andWhere(
        `(
          LOWER(customer.legal_name) LIKE :search
          OR LOWER(customer.trade_name) LIKE :search
          OR LOWER(customer.email) LIKE :search
          OR LOWER(customer.phone) LIKE :search
          OR LOWER(identifications.value) LIKE :search
          OR LOWER(identifications.normalized_value) LIKE :normalizedSearch
        )`,
        {
          search: `%${input.search.toLowerCase()}%`,
          normalizedSearch: `%${normalizedSearch}%`,
        },
      );
    }

    const [data, total] = await qb.getManyAndCount();

    return { data, total };
  }

  private toIdentificationEntity(input: CreateCustomerIdentificationInput) {
    return {
      type: input.type,
      value: input.value.trim(),
      normalizedValue:
        input.normalizedValue || normalizeIdentification(input.type, input.value),
      countryId: input.countryId ?? 'SV',
      isPrimary: input.isPrimary ?? false,
      verifiedAt: parseDateTime(input.verifiedAt),
    };
  }

  private toTaxProfileEntity(input: CreateCustomerTaxProfileInput) {
    return {
      vatStatus: input.vatStatus,
      taxpayerCategory: input.taxpayerCategory ?? TaxpayerCategory.NOT_APPLICABLE,
      economicActivityId: emptyToNull(input.economicActivityId),
      economicActivityDescription: emptyToNull(input.economicActivityDescription?.trim()),
      verifiedAt: parseDateTime(input.verifiedAt),
      verificationSource: emptyToNull(input.verificationSource?.trim()),
      notes: emptyToNull(input.notes?.trim()),
    };
  }

  private toTaxRoleEntity(input: CreateCustomerTaxRoleInput) {
    return {
      taxRoleId: input.taxRoleId,
      status: input.status ?? CustomerTaxRoleStatus.PENDING_VERIFICATION,
      rate: input.rate ?? null,
      resolutionNumber: emptyToNull(input.resolutionNumber?.trim()),
      validFrom: emptyToNull(input.validFrom),
      validUntil: emptyToNull(input.validUntil),
      verificationSource: emptyToNull(input.verificationSource?.trim()),
      verifiedAt: parseDateTime(input.verifiedAt),
      notes: emptyToNull(input.notes?.trim()),
    };
  }
}

// Reconcile by business key so retained assignments keep their IDs and audit fields.
async function synchronizeCustomerRelations<
  T extends CustomerIdentificationEntity | CustomerTaxRoleEntity | CustomerCompanyEntity,
>(
  repository: Repository<T>,
  customerId: string,
  values: DeepPartial<T>[],
  key: (value: DeepPartial<T>) => string,
): Promise<void> {
  const existing = await repository.findBy({ customerId } as FindOptionsWhere<T>);
  const retainedKeys = new Set(values.map(key));
  const removed = existing.filter((item) => !retainedKeys.has(key(item)));
  if (removed.length) await repository.softRemove(removed);

  const byKey = new Map(existing.map((item) => [key(item), item]));
  const entities = values.map((value) => repository.create({
    ...byKey.get(key(value)),
    ...value,
    customerId,
  } as DeepPartial<T>));
  if (entities.length) await repository.save(entities);
}

function emptyToNull<T extends string>(value: T | null | undefined): T | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  return value;
}

function parseDateTime(value: string | null | undefined): Date | null {
  if (!value) {
    return null;
  }

  return new Date(value);
}

function normalizeIdentification(type: CustomerIdentificationType, value: string): string {
  const normalized = value.trim().toUpperCase();

  switch (type) {
    case CustomerIdentificationType.DUI:
    case CustomerIdentificationType.NIT:
    case CustomerIdentificationType.NRC:
      return normalized.replace(/[^0-9]/g, '');

    default:
      return normalized.replace(/\s+/g, '');
  }
}
