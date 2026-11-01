import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { validatePayload } from '@takumi/common';
import {
  CustomerResponse,
  CustomersHealthResponse,
  CreateCustomerInput,
  GetCustomerByIdInput,
  ListCustomersInput,
  ListCustomersResponse,
  NormalizedListCustomersInput,
  UpdateCustomerInput,
} from './dto/customer.dto';
import { toCustomerResponse } from './mappers/customer.mapper';
import { CustomersRepository } from '../infrastructure/repositories/customers.repository';
import {
  createCustomerSchema,
  getCustomerByIdSchema,
  listCustomersSchema,
  updateCustomerSchema,
} from './validation/customer.schemas';
import { CreateCustomerService } from './use-cases/create-customer.service';
import { UpdateCustomerService } from './use-cases/update-customer.service';

@Injectable()
export class CustomersService {
  constructor(
    private readonly customers: CustomersRepository,
    private readonly createCustomer: CreateCustomerService,
    private readonly updateCustomer: UpdateCustomerService,
  ) {}

  async health(): Promise<CustomersHealthResponse> {
    const totalCustomers = await this.customers.count();

    return {
      status: 'ok',
      service: 'customers-service',
      totalCustomers,
      timestamp: new Date().toISOString(),
    };
  }

  async create(
    payload: CreateCustomerInput,
    companyContextId?: string | null,
  ): Promise<CustomerResponse> {
    const companyId = this.resolveCompanyContext(companyContextId);
    const input = validatePayload(createCustomerSchema, payload, {
      message: 'Invalid customer payload',
    });

    const customer = await this.createCustomer.execute(input, companyId);

    return toCustomerResponse(customer);
  }

  async findById(
    payload: GetCustomerByIdInput,
    companyContextId?: string | null,
  ): Promise<CustomerResponse> {
    const companyId = this.resolveCompanyContext(companyContextId);
    const { id } = validatePayload(getCustomerByIdSchema, payload, {
      message: 'Invalid customer lookup payload',
    });
    const customer = await this.customers.findById(id, companyId);

    if (!customer) {
      throw new NotFoundException(`Customer ${id} was not found`);
    }

    return toCustomerResponse(customer);
  }

  async findByIdInternal(payload: GetCustomerByIdInput): Promise<CustomerResponse> {
    const { id } = validatePayload(getCustomerByIdSchema, payload, {
      message: 'Invalid customer lookup payload',
    });
    const customer = await this.customers.findByIdInternal(id);

    if (!customer) {
      throw new NotFoundException(`Customer ${id} was not found`);
    }

    return toCustomerResponse(customer);
  }

  async update(
    payload: UpdateCustomerInput,
    companyContextId?: string | null,
  ): Promise<CustomerResponse> {
    const companyId = this.resolveCompanyContext(companyContextId);
    const input = validatePayload(updateCustomerSchema, payload, {
      message: 'Invalid customer update payload',
    });

    const customer = await this.updateCustomer.execute(input, companyId);

    return toCustomerResponse(customer);
  }

  async list(
    payload: ListCustomersInput,
    companyContextId?: string | null,
  ): Promise<ListCustomersResponse> {
    const companyId = this.resolveCompanyContext(companyContextId, payload?.companyId);
    const input = validatePayload(
      listCustomersSchema,
      { ...payload, companyId },
      {
        message: 'Invalid customers list payload',
      },
    );
    const query = normalizeListInput(input);
    const { data, total } = await this.customers.list(query);

    return {
      data: data.map(toCustomerResponse),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  private resolveCompanyContext(
    companyContextId?: string | null,
    requestedCompanyId?: string | null,
  ) {
    const contextId = companyContextId?.trim();
    const requestedId = requestedCompanyId?.trim();
    const companyId = contextId || requestedId;
    if (!companyId) {
      throw new BadRequestException(
        'Se requiere companyId o X-Company-Context para acceder a clientes.',
      );
    }
    if (contextId && requestedId && contextId !== requestedId) {
      throw new BadRequestException('companyId debe coincidir con X-Company-Context.');
    }
    return companyId;
  }
}

function normalizeListInput(input: ListCustomersInput): NormalizedListCustomersInput {
  return {
    companyId: input.companyId!,
    search: input.search || null,
    nature: input.nature || null,
    isActive: input.isActive ?? null,
    page: input.page ?? 1,
    limit: input.limit ?? 25,
    includeInactive: input.includeInactive ?? false,
  };
}
