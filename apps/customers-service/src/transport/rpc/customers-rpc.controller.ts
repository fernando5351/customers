import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MESSAGE_PATTERNS } from '@takumi/common';
import { CustomersService } from '../../application/customers.service';
import {
  CreateCustomerInput,
  GetCustomerByIdInput,
  ListCustomersInput,
  UpdateCustomerInput,
} from '../../application/dto/customer.dto';

type CompanyScopedPayload<T> = {
  data: T;
  companyId?: string | null;
};

@Controller()
export class CustomersRpcController {
  constructor(private readonly customers: CustomersService) {}

  @MessagePattern(MESSAGE_PATTERNS.customers.health)
  health() {
    return this.customers.health();
  }

  @MessagePattern(MESSAGE_PATTERNS.customers.create)
  create(@Payload() payload: CompanyScopedPayload<CreateCustomerInput>) {
    return this.customers.create(payload.data, payload.companyId);
  }

  @MessagePattern(MESSAGE_PATTERNS.customers.update)
  update(@Payload() payload: CompanyScopedPayload<UpdateCustomerInput>) {
    return this.customers.update(payload.data, payload.companyId);
  }

  @MessagePattern(MESSAGE_PATTERNS.customers.findById)
  findById(@Payload() payload: CompanyScopedPayload<GetCustomerByIdInput>) {
    return this.customers.findById(payload.data, payload.companyId);
  }

  @MessagePattern(MESSAGE_PATTERNS.customers.internalById)
  internalById(@Payload() payload: GetCustomerByIdInput) {
    return this.customers.findByIdInternal(payload);
  }

  @MessagePattern(MESSAGE_PATTERNS.customers.list)
  list(@Payload() payload: CompanyScopedPayload<ListCustomersInput>) {
    return this.customers.list(payload.data, payload.companyId);
  }
}
